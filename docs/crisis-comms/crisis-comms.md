# Crisis Communications Playbook

> A pre-planned response to public crises across all categories. **Crisis
> responses are judged on speed × honesty. Both matter.**

---

## 1. PR Crisis Runbook

### Crisis classes and default severity

| Trigger | Default SEV | Notes |
| --- | --- | --- |
| Coordinated credibility attack (state / competitor) | SEV-1 | High-speed; legal involved immediately |
| High-profile retraction / methodology dispute | SEV-1 | Editorial + legal |
| AI output causing public harm | SEV-1 | Engineering + Ethics Board + legal |
| Customer data breach disclosure | SEV-1 | → [security incident runbook](../security/security-incident-runbook.md) + this runbook |
| Employee misconduct made public | SEV-2 | HR + legal + comms |
| Hostile-state attribution attempt ("it's a tool of X") | SEV-1 | Security + legal + counter-narrative team |
| Social pile-on (no false underlying claim) | SEV-2 | Comms; monitor → consolidated response |
| Minor retraction (one event, limited reach) | SEV-3 | Editorial; standard correction process |

### Response process

```
0–15 min   Crisis room opened (#crisis-<slug>, Zoom bridge)
           Crisis Lead confirmed (CEO or delegated COO/CMO)
           "No comment until messaging is set" — exec silence protocol active
           Facts team begins gathering (legal + editorial + eng as needed)

0–60 min   Initial facts memo circulated internally (what we know / don't know)
           Legal involvement gate assessed (see §6)
           Comms channel owners alerted (social / email / status page / press)

0–4 h      Holding statement issued (template below — specific, no weasel words)
           Per-channel coordinated — not one channel first, then others

0–24 h     Full statement published (cause, impact, corrective action)
           Customer + investor + employee comms in parallel (not sequential)

0–72 h     Postmortem / lessons-learned published (or "in progress" update)
           Monitoring continues (narrative cluster tracking)
```

### Holding statement template

```
We are aware of [specific description of the situation]. We take this seriously.
Our team is actively investigating. We will provide a full update by [TIME UTC].
If you are affected, please contact [contact].
```

Rules: name the situation specifically (not "an issue"), give a time commitment,
provide a contact. No passive voice. No "we apologize for any inconvenience."

### Full statement structure

```
1. Acknowledge: what happened, when, to what scope.
2. Impact: who was affected and how.
3. Cause: honest root cause (or "investigation ongoing" if genuinely unknown).
4. Action taken: what we did to stop it / correct it.
5. Prevention: what changes so it doesn't recur.
6. Contact: how affected parties reach us.
```

No off-the-cuff founder/exec posts until messaging is locked. CEO tweets during
a crisis often become the story. **Exec silence protocol active until Step 4 is
complete.**

### Customer + investor + employee comms (parallel)

All three audiences receive direct communication simultaneously — not
sequentially. Investors hearing from press before us destroys trust.

- **Customers**: per tier (Enterprise = CSM direct + Slack Connect; others = email + status page).
- **Investors**: CEO email or call within the same window as the public statement.
- **Employees**: internal briefing before or simultaneous with public — never after.

---

## 2. Brand Crisis Response

*When the brand itself is under attack: impersonation, domain spoofing, weaponized
misuse claims, social pile-on.*

**Don't feed the storm. Consolidated > scattered.**

### Brand monitoring stack

- **Mention / Brandwatch**: real-time brand-keyword monitoring (our name,
  domain, key personnel, product name).
- **Google Alerts**: low-latency backup for web coverage.
- **Trademark + domain watch** (MarkMonitor or manual): detect new registrations
  of confusable names, typosquats, TLD variants.
- **Social-platform safety contacts**: Twitter/X Safety, Meta Trust & Safety,
  TikTok Trust & Safety — contacts pre-registered for fast response on impersonation.

### Response protocols

| Threat type | Response |
| --- | --- |
| **Impersonation account** | Report to platform + parallel cease-and-desist to registrar |
| **Domain spoofing / phishing** | Platform report + registrar abuse complaint + customer warning |
| **Social pile-on** (genuine anger, no false claim) | Don't engage 1:1; one consolidated empathetic response |
| **Weaponized misuse claim** ("Aegis Lens was used to…") | Fact-check publicly via methodology page + clear denial if false |
| **Hostile narrative amplification** | See §4 (misinformation); activate partner ecosystem |

### Post-crisis brand-health audit

After every SEV-1/2 brand crisis:
- Sentiment baseline: track net sentiment score 30/60/90 days post-incident.
- Search result audit: does Google surface the crisis above the home page?
  SEO remediation if needed.
- Customer trust signal: CSAT and NPS delta at next measurement.
- Lessons-learned documented and fed into the brand-monitoring configuration.

---

## 3. Customer Communication Style Guide

*Consistent tone across status updates, incident comms, releases, marketing.*
**Voice is brand. Be calm even when the storm isn't.**

### Tone matrix

| Context | Tone | Example opener |
| --- | --- | --- |
| **Incident / status** | Calm, factual, direct | "We're investigating elevated error rates in…" |
| **Corrective / retraction** | Accountable, specific, forward-looking | "We published incorrect data about X. Here's what happened and what changed." |
| **Promotional** | Energetic, evidence-led, not hype | "Our verification rate for air incidents is now 94% within 3 hours." |
| **Informational** | Clear, neutral, helpful | "The following changes take effect on [DATE]." |

### Word bank — banned terms

| ❌ Banned | ✅ Use instead |
| --- | --- |
| "We apologize for any inconvenience" | "We're sorry this affected you. Here's what we did." |
| "Unfortunately" (to open a sentence) | State the fact directly |
| "Going forward" | "Starting [DATE]" or just state the change |
| "We take X seriously" (alone, without action) | Pair with a concrete action |
| "As per" | "As described in" |
| "Please be advised" | Just say the thing |
| "Learnings" | "Lessons" or "what we learned" |
| "Circle back", "sync up", "reach out" | "Respond", "meet", "contact" |
| Passive voice on accountability | "We made a mistake" not "A mistake was made" |

### Per-channel norms

| Channel | Max length | Lead with | Tone |
| --- | --- | --- | --- |
| Status page | 3 sentences per update | Impact to users | Clinical, factual |
| In-app notification | 1 sentence + CTA | Action required / what changed | Clear, direct |
| Email (transactional) | 200 words | Impact + next step | Warm, direct |
| Slack Connect (Enterprise) | 3–5 sentences + @mention | Named CSM, personal | Professional, human |
| Social (X / LinkedIn) | 280 chars / 500 words | The core fact | Public, clear |

### Incident comms template (per severity)

```
Subject: [SEV level] - [Service/feature] - [Status: Investigating / Identified / Resolved]

We are [investigating / aware of / have resolved] an issue affecting [specific feature].

Impact: [who / what / since when]
Status: [what we know so far]
Next update: [TIME UTC]

Updates at: [status page URL]
Contact: [support channel]
```

### Corrective / retraction template

```
Subject: Correction: [what was wrong]

On [DATE], we published [specific content]. We have identified that [specific error].

We have corrected [what was corrected] effective [DATE/TIME].
The corrected [content/data] is available at [link].

We regret this error. [One sentence on what changed to prevent recurrence.]
Questions: [contact]
```

### Lead with impact, follow with cause

Every customer communication starts with "here's what this means for you" before
"here's why it happened." The customer's first question is always "am I affected?"

---

## 4. Misinformation About Us (Counter-Narrative)

*When state actors, competitors, or bad actors run disinformation against us.*
**Streisand-effect risk. Often best response is none — but be ready when needed.**

### Monitoring and detection

- **Narrative cluster detection**: Brandwatch / Mention with cluster analysis;
  look for coordinated posting patterns (similar phrasing, near-simultaneous
  origin accounts).
- **Sentiment tracking**: weekly net-sentiment score; alert if drops > 15 points
  week-over-week.
- **Attribution signals**: account creation dates, bot-score indicators,
  cross-platform coordination — assess whether this is organic or coordinated.

### Response decision tree

```
Narrative detected
    │
    ├─ Factually false AND spreading? → Public rebuttal (§ rebuttal template)
    │
    ├─ Factually false but contained? → Correct quietly (note to partners)
    │
    ├─ Factually debatable (methodology critique)? → Publish methodology clarification
    │
    ├─ State-attributed coordinated campaign? → Legal escalation + partner activation
    │
    └─ Genuinely negative feedback? → Acknowledge + fix (not suppress)
```

### Rebuttal principles

- **Primary vehicle**: the methodology page + our public track record — link to
  evidence, don't engage in comment threads.
- **Tone**: factual, confident, not defensive. "Our methodology is public.
  Here is the evidence." Not "We strongly deny…"
- **Partner ecosystem**: allies (journalists, OSINT community, NGO partners) post
  supporting facts independently — we do not orchestrate language, only share facts.
- **Per-platform reporting**: false content reported to platform trust/safety for
  labeling or removal where it violates policies.
- **Legal escalation**: if the narrative is demonstrably false and damaging
  (defamatory under applicable law), legal assesses a takedown demand or lawsuit.
- **Customer reassurance**: for FUD-affected enterprise accounts, CSM proactively
  reaches out with facts + methodology links before customers ask.

### Trend analysis → preemptive content

Recurring hostile narratives (e.g., "Aegis Lens is a NATO tool") are tracked and
countered preemptively via published content — methodology posts, transparency
reports, ethics board meeting summaries — before the next campaign cycle.

---

## 5. Executive Communications

*CEO + senior comms — consistent voice, careful framing, no unforced errors.*
**A wrong CEO tweet costs more than a wrong PR. Discipline.**

### CEO communications playbook

- **Pre-approved talking points** for: funding announcements, major incidents,
  methodology questions, the Ukraine conflict framing, competitor questions,
  AI ethics, government relations. Updated quarterly.
- **No off-the-cuff political stances** on issues not directly related to our
  mission. The mission is conflict intelligence and verification — stay in lane.
- **Speech and op-ed approval flow**: draft → CMO review → legal spot-check →
  sign-off before public. No exceptions, regardless of publication size.

### LinkedIn + X posting policy

- Product announcements, company milestones, thought-leadership on OSINT
  methodology: approved categories.
- Political opinions, comment on active legal proceedings, statements on
  conflicts not directly covered by our platform: require CMO + legal pre-approval.
- Crises: **no posts until messaging is locked** (exec silence protocol, §1).

### Per-interview prep doc

Every major press interview gets a one-page prep doc:
- Publication / journalist background.
- Likely questions + approved answers.
- Topics to avoid + how to bridge.
- Key messages to land.
- Quote approvals (what can be published vs. on background).

### Spokesperson rotation

CEO is not the only spokesperson. Build a bench:
- CTO for technical / AI credibility questions.
- Editorial Lead for methodology and verification questions.
- CSO for security and government questions.

Distributes brand risk and builds multiple credible voices.

### Crisis-time exec silence protocol

From crisis declaration until Step 4 (action taken) is complete:
- No exec social posts.
- No informal Slack messages to external contacts about the crisis.
- Press inquiries routed to the designated comms spokesperson only.
- Legal and comms review every public word before it goes out.

---

## 6. Employee / HR Dispute Communications

*When internal disputes become external — handle with dignity and transparency.*
**How we treat departures is observed by everyone who stays.**

### Pre-termination process

- Clear, documented performance or conduct process before termination.
- Decision documented with HR + legal sign-off before communication.
- No surprises to the employee on the day.

### Severance and transition norms

- Severance offer documented in writing before the exit meeting.
- Transition period (knowledge transfer, project handoff) negotiated where
  appropriate and appropriate for the role.
- References: we confirm employment dates and role; no performance commentary
  without employee consent.

### Reciprocal non-disparagement

Standard separation agreements include mutual non-disparagement. We honor ours
and expect the employee to honor theirs. We do not weaponize separation agreements
to suppress legitimate whistleblowing.

### Whistleblower policy

- Published externally (link from `/legal` page).
- Internal report channel: anonymous HR inbox + the Ethics Board.
- Zero retaliation for good-faith reports. Legal owns the investigation.
- Reports to external authorities (regulators, LE) are always protected.

### Layoff communications template

```
Internal comms (before or simultaneous with any external comms):
"Today we made the difficult decision to [specific change: reduce the team by X
people / close the Y office]. [Specific reason: market conditions / mission focus
on Z]. Affected colleagues have been notified directly. [What severance / support
is offered]. We're grateful for [specific contributions]. Questions: [HR contact]."
```

Rules:
- Specific, not vague ("restructuring" alone is not an explanation).
- Acknowledge the people.
- State what support is being offered.
- No rumor vacuum: communicate to the remaining team the same day.

### Mental health support

Any significant people event (layoffs, contentious departure, crisis) triggers an
offer of EAP (Employee Assistance Program) access to all affected staff, including
the team that stayed. Witnessing colleagues leave is also a stressor.
