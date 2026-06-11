# OSINT Community Feeds — Compliance & Editorial Policy

## Feed curation policy

1. **Inclusion criteria**
   - Source must be active and have a verifiable track record.
   - At minimum, the source must be categorised as `community` trust tier with `autoFlagVerification: true`.
   - New sources are added via PR to this registry with a citation justifying the trust tier.

2. **Trust tiers**
   - `verified`: reviewed by the Aegis Lens editorial team or a reputable external organisation. Items can enter the event stream with `confidence ≥ 0.75` after algorithmic check.
   - `community`: independently operated, generally reliable but with occasional errors. All items require human review before promotion to verified stream.
   - `unvetted`: included for monitoring only. Items MUST NOT appear in public-facing content without explicit editorial approval.

3. **RU-aligned milblogger policy**
   - Sources with `affiliation: 'ru'` (Rybar, Fighterbomber, etc.) are included exclusively for **counter-intelligence monitoring** — tracking what RU information operations claim.
   - No content from these sources may be displayed publicly without an explicit editorial note explaining the source's affiliation and the fact that its claims are unverified/propaganda-adjacent.
   - `autoFlagVerification: true` is mandatory for all `affiliation: 'ru'` entries.
   - Do not use RU milblogger content as a sole or primary source for event creation.

## Attribution
- All displayed content must credit the source by name with a link to the original.
- For verified organisations (ACLED, Bellingcat, UNOSAT), follow their individual attribution guidelines (see their respective `COMPLIANCE.md` files or website terms).

## Amplification policy
- Aegis Lens does not republish unverified claims, even from monitored RU sources, without clear labelling.
- The `requiresVerification: true` flag in `OsintUpdate` is the machine-readable enforcement of this policy.
- The ingest pipeline must not ingest `requiresVerification: true` items into the public event stream without `VerificationState !== 'unverified'`.

## Legal considerations
- Monitoring publicly available Telegram channels, Twitter/X accounts, and RSS feeds is generally lawful under copyright fair use / fair dealing for news monitoring purposes.
- Do not scrape private Discord servers without bot permissions and server owner consent.
- Terms of service for Twitter/X have historically been restrictive of automated monitoring; see `integrations/twitter/COMPLIANCE.md`.

## Editorial contact
For source disputes or tier changes, contact the Aegis Lens editorial board.
