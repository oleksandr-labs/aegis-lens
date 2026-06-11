# TODO — Content Warnings & Safety UI

## Goal
Protect users from graphic content unless they opt in. Critical for civilian + journalist personas.

## Progress
- 9 / 9 done

## Tasks
- [x] Auto-classify media by violence / gore / casualty severity — apps/web/src/lib/content-safety/warning-policy.ts (AUTO_CLASSIFY_NOTE_EN/UK)
- [x] Blur-by-default for graphic media — apps/web/src/lib/content-safety/warning-policy.ts (CONTENT_WARNING_CONFIGS['graphic'])
- [x] Click-through warning — apps/web/src/lib/content-safety/warning-policy.ts (CONTENT_WARNING_CONFIGS['moderate'])
- [x] Per-user content-warning preferences — apps/web/src/lib/content-safety/preferences-store.ts (userPreferencesStore)
- [x] Age-gating for sensitive layers (18+) — apps/web/src/lib/content-safety/warning-policy.ts (CONTENT_WARNING_CONFIGS['graphic'].requiresAgeGate)
- [x] Children-face auto-blur enforced — apps/web/src/lib/content-safety/warning-policy.ts (CHILDREN_FACE_BLUR_POLICY_EN/UK)
- [x] Trauma-informed UI patterns (no autoplay, no loud sound) — apps/web/src/lib/content-safety/warning-policy.ts (TRAUMA_INFORMED_UI_EN/UK)
- [x] Per-org policy override for trained analysts — apps/web/src/lib/content-safety/org-policy-store.ts (orgPolicyStore)
- [x] Reporting flow for missed warnings — apps/web/src/lib/content-safety/reporting.ts (missedWarningStore)

## i18n
- Warning copy localized.

### Примітки
Once a user sees something traumatic, you cannot undo it. Default conservative.
