# TODO — OSINT Ethics & Legality

## Goal
Public-data only, transparent methodology, no targeting of private individuals, no operational uplift to combatants.

## Progress
- 2 / 11 done

## Tasks
- [ ] Written OSINT policy (public page) — sources, exclusions, redactions
- [ ] Public methodology page (how confidence/danger scores are computed)
- [x] Personal-data exclusion policy (no doxxing private individuals) — `services/ingest/src/pii.ts` implements PII redaction at ingest; policy doc pending
- [ ] Children protection: blur faces of minors automatically
- [ ] Embargo / takedown request workflow
- [ ] Disputed-area display policy (consistent across UI, no political claims)
- [x] Source ToS register (per-source posture) — `integrations/telegram/src/registry.ts` (tos_verified_at field; revoke() method; policy documented in channel entries)
- [ ] Geo-fence: do not publish high-precision real-time locations of vulnerable people / shelters
- [ ] Tactical-uplift review: no near-real-time targeting-grade data without enterprise gate + KYC
- [ ] Internal red-team review per quarter
- [ ] Ethics advisory board (NGO + journalist + legal)

## i18n
- Policy translated to all supported locales.

### Примітки
This is the single biggest reputational risk vector. Over-invest.
