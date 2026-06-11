# DDoS / Abuse Response Runbook

> **Goal: stay online under attack; document patterns for hardening.**
>
> **Golden rule: don't blackhole all traffic — selectively degrade.** A platform
> people rely on during a conflict failing closed is itself a kind of outage.
> The job is to shed the *abusive* traffic while keeping legitimate users (and
> especially humanitarian/defense users) served, even if degraded.

## 0. Roles

- **On-call (primary)** — declares the incident, drives mitigation.
- **Incident Commander** — for sustained/SEV-1 attacks (see incident-response runbook).
- **Comms owner** — status page + customer email.
- **Security lead** — forensics, abuse classification, LE liaison decision.

Declare an incident at the first confirmed signal; don't wait to be sure it's
"really" DDoS.

## 1. Detect & confirm

Signals: traffic spike at the edge, latency/5xx surge, origin CPU/conn
saturation, Cloudflare analytics anomaly, alert from rate-limit thresholds.

Confirm it's an attack vs. organic spike (e.g., a news event driving real
traffic — plausible for us): check geographic/ASN concentration, request-path
uniformity, user-agent anomalies, and whether sessions authenticate. **A
legitimate news-driven spike is handled by scaling, not by shields** — don't
shield away real users reacting to an event.

## 2. Classify the abuse

| Class | Signature | Primary lever |
| --- | --- | --- |
| **Volumetric (L3/L4)** | Huge bandwidth/PPS, often UDP/SYN floods | Cloudflare absorbs at edge; verify Magic Transit/L3-4 protection on |
| **L7 / HTTP flood** | High RPS to expensive endpoints, looks like requests | "Under Attack" mode, WAF rules, rate limits, JS/managed challenge |
| **Scraping** | Steady high-volume crawling of content/API, datacenter ASNs | Bot management, rate limits, API auth enforcement |
| **Credential stuffing** | High POST volume to login, many distinct accounts, high failure rate | Rate-limit auth, lockout/backoff, CAPTCHA/challenge on login, alert security |

Record the classification in the incident channel — it drives which levers below.

## 3. Mitigation playbook (escalating)

Start least-disruptive, escalate as needed. **Selectively degrade, never global
blackhole.**

1. **Cloudflare "Under Attack" / DDoS toggle.** Enable "I'm Under Attack" mode
   for affected zones — interposes a managed challenge on suspicious requests
   while letting clean traffic through. Confirm L3/4 DDoS protection is active.
2. **Tighten rate limits.** Apply the pre-staged stricter rate-limit profile
   (per-IP and per-ASN) to the targeted paths. Keep authenticated + Enterprise
   traffic on a looser bucket so paying/critical users keep working.
3. **Deploy pre-staged WAF rules.** Enable the matching rule group for the attack
   signature (see §4). Block/challenge by ASN, country (only if the attack is
   geographically narrow and we have no legit users there), path, or fingerprint.
4. **Bot management / challenge.** For scraping & L7, raise the bot-score
   challenge threshold; require a managed/JS challenge for unauthenticated
   access to expensive endpoints.
5. **Protect the origin.** Ensure origin only accepts traffic from Cloudflare
   (firewall allowlist / Authenticated Origin Pulls). Shed load on expensive
   endpoints first (serve cached/degraded responses) before the whole origin
   tips over.
6. **Scale where it helps.** For borderline-organic spikes or L7 you can absorb,
   scale out the relevant service rather than shielding.
7. **Last resort, targeted only:** rate-limit or challenge a specific
   country/ASN that is clearly 100% attack. Document the blast radius before
   applying. Never `/0` blackhole.

After each lever, watch 5xx/latency/edge analytics for 2–3 minutes before
escalating further. Note timestamps of every change for the postmortem.

## 4. Pre-staged WAF rule groups

Keep these authored and **disabled** in Cloudflare, ready to flip on. Store the
rule expressions in version control (`infra/` / Cloudflare-as-code) so they're
reviewable and not hand-typed under fire:

- **L7 flood:** rate-limit + challenge on high-RPS unauthenticated hits to
  search/API/render endpoints.
- **Credential stuffing:** strict rate-limit + challenge on `POST /auth/login`,
  block known breached-credential / bad-reputation IPs.
- **Scraping:** challenge datacenter ASNs hitting content/API beyond a threshold;
  enforce API key + per-key quota.
- **Known-bad signatures:** block lists for user-agents, paths, and ASNs seen in
  prior incidents (grow this from each postmortem).

Each rule has a one-line comment: what it targets, expected false-positive risk,
and who approved enabling it.

## 5. Customer & user comms

- **Status page:** post within `[15 minutes]` of declaring — "investigating
  elevated errors / degraded performance." Update at least every 30 min. Don't
  publicly call it a "DDoS attack" until confirmed and comms-approved (naming an
  attack can invite copycats and has contractual/PR implications).
- **Email:** notify affected Enterprise customers per their support tier; for
  broad impact, a single status-page-linked notice.
- **Localize** comms (status + email) for our locales.
- **Internal:** keep the incident channel as the single source of truth; the
  comms owner publishes from there.

## 6. Forensics & log capture

- **Capture logs early** — before TTLs expire: Cloudflare Logpush / edge logs,
  origin access logs, WAF event logs, rate-limit hit logs for the incident
  window. Snapshot to durable storage tagged with the incident ID.
- Record: attack start/end, peak RPS/bandwidth, top ASNs/countries/UAs, targeted
  paths, which levers were applied when, and observed user impact.
- Preserve enough to (a) build hardening rules and (b) support an LE referral if
  it becomes criminal.

## 7. External coordination

- **Cloudflare ops:** if the attack is sustained or exceeds what self-serve
  handles, open a priority ticket / engage the Cloudflare DDoS team
  (Enterprise/Magic Transit support path). Have account ID, zone, incident
  window, and captured signatures ready.
- **Law-enforcement liaison:** if the attack is criminal (extortion/ransom
  demand, targeted intimidation, clear nation-state pattern) — security lead +
  legal decide on a referral. Preserve evidence (§6) with chain-of-custody.
  Do **not** negotiate with or pay extortion demands.
- **Peers/ISACs:** share indicators with relevant threat-sharing communities
  where appropriate.

## 8. Recovery & de-escalation

- Roll back the most disruptive levers first (challenges, country/ASN blocks),
  then rate-limit tightening, then "Under Attack" mode — watching for the attack
  resuming.
- Confirm normal latency/error rates sustained for `[30 minutes]` before
  declaring resolved.
- Update the status page to resolved; send the all-clear to notified customers.

## 9. Postmortem & hardening backlog

Within `[3 business days]`, run a blameless postmortem
([`postmortem-template.md`](postmortem-template.md)) and file a **hardening
backlog**:

- Promote effective ad-hoc rules into the pre-staged rule groups (§4).
- Tune rate-limit defaults and bot thresholds.
- Add the new signatures to the known-bad lists.
- Address any origin-exposure or expensive-endpoint hot spots found.
- Verify Authenticated Origin Pulls / origin allowlist still tight.
- Feed recurring abuse patterns into product (e.g., API quotas, auth hardening).

## Related
- Incident response & severities → [`incident-response-runbook.md`](incident-response-runbook.md)
- Postmortem template → [`postmortem-template.md`](postmortem-template.md)
- Source outage handling → [`../../TODO/incident_response/TODO_source_outage.md`](../../TODO/incident_response/TODO_source_outage.md)
- SLA exclusions (force majeure / attack) → [`../legal/msa/sla-addendum.md`](../legal/msa/sla-addendum.md)
