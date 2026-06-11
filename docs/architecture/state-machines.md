# State Machines — Aegis Lens

Diagrams use Mermaid stateDiagram-v2. Valid transitions documented per machine.

## 1. Event Verification State

```mermaid
stateDiagram-v2
    [*] --> unverified : ingested
    unverified --> in_review : confidence < threshold OR flagged by detector
    unverified --> verified : confidence ≥ 0.85 AND multi-source
    in_review --> verified : reviewer approves
    in_review --> disputed : reviewer disputes
    in_review --> retracted : reviewer retracts
    verified --> disputed : new contradicting evidence
    verified --> retracted : confirmed false/harmful
    disputed --> verified : evidence resolves dispute
    disputed --> retracted : confirmed false
    retracted --> [*]
```

Guards:
- `unverified → verified` requires `confidence ≥ 0.85` AND `sourceCount ≥ 2`
- `in_review → verified` requires at least one human reviewer approval
- `retracted` is terminal — no unretraction possible (create new event instead)

## 2. Alert Rule Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft : created
    draft --> active : user enables
    active --> throttled : rate limit exceeded
    throttled --> active : cooldown period elapsed
    active --> paused : user pauses
    paused --> active : user resumes
    active --> disabled : persistent delivery failure
    disabled --> active : user re-enables (delivery fixed)
    active --> archived : user deletes
    archived --> [*]
```

## 3. AOI Subscription

```mermaid
stateDiagram-v2
    [*] --> active : AOI created
    active --> expiring : expires_at < now() + 7d
    expiring --> active : user renews
    expiring --> expired : expires_at reached
    active --> suspended : org subscription lapsed
    suspended --> active : subscription renewed
    expired --> [*]
    suspended --> [*] : org deleted
```

## 4. Billing / Subscription

```mermaid
stateDiagram-v2
    [*] --> trial : org signs up
    trial --> active : payment method added + trial expires
    trial --> canceled : user cancels during trial
    active --> past_due : payment fails
    past_due --> active : payment succeeds (retry)
    past_due --> suspended : grace period (7d) expires
    suspended --> active : payment recovered
    suspended --> canceled : org cancels or non-payment >30d
    active --> canceled : user cancels (end of billing period)
    canceled --> [*]
```

## 5. User Account Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending_verification : signup
    pending_verification --> active : email verified
    active --> mfa_pending : user enables MFA
    mfa_pending --> active : MFA setup confirmed
    active --> locked : >5 failed login attempts
    locked --> active : admin unlocks OR cooldown expires
    active --> suspended : abuse / ToS violation
    suspended --> active : appeal approved
    suspended --> deleted : 30-day suspension period expires without appeal
    active --> deleted : user requests account deletion (GDPR)
    deleted --> [*]
```

## 6. Webhook Endpoint Health

```mermaid
stateDiagram-v2
    [*] --> healthy : endpoint created
    healthy --> degraded : success rate < 90% in 1h window
    degraded --> healthy : success rate recovers
    degraded --> failing : 5 consecutive failures
    failing --> healthy : successful delivery
    failing --> disabled : 10 consecutive failures
    disabled --> healthy : user re-enables
    disabled --> [*] : user deletes
```
