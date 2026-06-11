/**
 * Retraction propagation.
 *
 * When an event is retracted, every downstream artifact that consumed it
 * must be notified so it can update or withdraw:
 *   - Alerts already fired → send a correction notice
 *   - Reports citing the event → flag the citation as retracted
 *   - Derived/linked events → re-evaluate confidence
 *   - Cached API responses / tiles → invalidate
 *   - Public embeds → show "retracted" badge
 */

export type DownstreamArtifact =
  | "alert"
  | "report"
  | "linked_event"
  | "notebook"
  | "case"
  | "tile_cache"
  | "api_cache"
  | "embed"
  | "webhook";

export interface RetractionNotice {
  retractionId: string;
  eventId: string;
  reason: string;
  retractedBy: string;
  retractedAt: string;
  /** Whether public-facing surfaces must show a correction */
  isPublicCorrection: boolean;
}

export interface PropagationTarget {
  artifact: DownstreamArtifact;
  targetId: string;
  /** What action the downstream owner must take */
  action: "send_correction" | "flag_citation" | "recompute" | "invalidate" | "show_badge";
}

export interface PropagationResult {
  notice: RetractionNotice;
  targets: PropagationTarget[];
  /** Per-artifact dispatch outcome */
  dispatched: Array<{ target: PropagationTarget; ok: boolean; error?: string }>;
}

/** Resolver supplies the downstream artifacts that referenced an event. */
export interface DownstreamResolver {
  alertsFiredFor(eventId: string): Promise<string[]>;
  reportsCiting(eventId: string): Promise<string[]>;
  linkedEvents(eventId: string): Promise<string[]>;
  notebooksReferencing(eventId: string): Promise<string[]>;
  casesContaining(eventId: string): Promise<string[]>;
  webhookSubscribers(eventId: string): Promise<string[]>;
}

/** Map each artifact type to the corrective action it requires. */
function actionFor(artifact: DownstreamArtifact): PropagationTarget["action"] {
  switch (artifact) {
    case "alert": return "send_correction";
    case "report":
    case "notebook":
    case "case": return "flag_citation";
    case "linked_event": return "recompute";
    case "tile_cache":
    case "api_cache": return "invalidate";
    case "embed": return "show_badge";
    case "webhook": return "send_correction";
  }
}

/**
 * Build the full list of propagation targets for a retracted event.
 */
export async function buildPropagationTargets(
  eventId: string,
  resolver: DownstreamResolver,
): Promise<PropagationTarget[]> {
  const [alerts, reports, linked, notebooks, cases, webhooks] = await Promise.all([
    resolver.alertsFiredFor(eventId),
    resolver.reportsCiting(eventId),
    resolver.linkedEvents(eventId),
    resolver.notebooksReferencing(eventId),
    resolver.casesContaining(eventId),
    resolver.webhookSubscribers(eventId),
  ]);

  const targets: PropagationTarget[] = [];
  const add = (artifact: DownstreamArtifact, ids: string[]) =>
    ids.forEach((id) => targets.push({ artifact, targetId: id, action: actionFor(artifact) }));

  add("alert", alerts);
  add("report", reports);
  add("linked_event", linked);
  add("notebook", notebooks);
  add("case", cases);
  add("webhook", webhooks);

  // Always invalidate caches + flag embeds for the event itself
  targets.push({ artifact: "tile_cache", targetId: eventId, action: "invalidate" });
  targets.push({ artifact: "api_cache", targetId: eventId, action: "invalidate" });
  targets.push({ artifact: "embed", targetId: eventId, action: "show_badge" });

  return targets;
}

export type DispatchFn = (target: PropagationTarget, notice: RetractionNotice) => Promise<void>;

/**
 * Propagate a retraction to all downstream artifacts.
 */
export async function propagateRetraction(
  params: { eventId: string; reason: string; retractedBy: string; isPublicCorrection?: boolean },
  resolver: DownstreamResolver,
  dispatch: DispatchFn,
): Promise<PropagationResult> {
  const notice: RetractionNotice = {
    retractionId: `retr-${Date.now()}`,
    eventId: params.eventId,
    reason: params.reason,
    retractedBy: params.retractedBy,
    retractedAt: new Date().toISOString(),
    isPublicCorrection: params.isPublicCorrection ?? false,
  };

  const targets = await buildPropagationTargets(params.eventId, resolver);

  const dispatched = await Promise.all(
    targets.map(async (target) => {
      try {
        await dispatch(target, notice);
        return { target, ok: true };
      } catch (err: unknown) {
        return { target, ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  return { notice, targets, dispatched };
}
