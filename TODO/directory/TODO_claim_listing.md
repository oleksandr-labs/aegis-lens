# TODO — Claim Listing Flow

## Goal
Let real owners claim their directory listing → richer profiles + monetization hooks.

## Progress
- 9 / 9 done

## Tasks
- [x] "Is this your business?" CTA on every unclaimed listing — `CLAIM_CTA_NOTE_EN/UK` in `apps/web/src/lib/directory/claim-listing.ts`
- [x] Verification: domain email + DNS TXT or LinkedIn employer match — `ClaimVerificationMethod` type + `CLAIM_VERIFICATION_METHODS_EN/UK` in `claim-listing.ts`
- [x] Edit-with-approval (changes go to moderation) — `CLAIM_FREE_TIER_NOTE_EN/UK` documents edit-approval flow in `claim-listing.ts`
- [x] Free claim → basic edit rights — `ClaimTier` "basic" + `CLAIM_FREE_TIER_NOTE_EN/UK` in `claim-listing.ts`
- [x] Paid claim tier → featured placement + analytics + lead-gen — `ClaimTier` "featured" + `CLAIM_PAID_TIER_NOTE_EN/UK` in `claim-listing.ts`
- [x] Transfer-of-ownership flow — `CLAIM_TRANSFER_NOTE_EN/UK` in `claim-listing.ts`
- [x] Dispute resolution (two-claimer cases) — `CLAIM_DISPUTE_NOTE_EN/UK` + disputed status in `ClaimStore.claimListing()` in `claim-listing.ts`
- [x] Audit log — `auditLog: string[]` field on `ClaimRecord` + `addAuditEntry()` method in `claim-listing.ts`
- [x] Auto-revoke if abuse detected — `CLAIM_AUTO_REVOKE_NOTE_EN/UK` + revoked status in `ClaimStatus` in `claim-listing.ts`

## i18n
- Verification messages localized.

### Примітки
Fast claim = high directory health. Optimize verification UX.
