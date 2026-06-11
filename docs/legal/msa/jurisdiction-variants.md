# Jurisdiction Variants

> Governing-law and venue deltas for the MSA's §13. Pick one block per deal;
> everything else in the MSA stays identical. Anything beyond these three
> requires counsel (see redline playbook).

## US (default)

- **Governing law:** State of Delaware, USA, without regard to conflicts of law.
- **Venue:** Exclusive jurisdiction of the state and federal courts located in
  Delaware; parties waive objections to venue.
- **Notes:** Default for US customers. Most enterprise buyers accept Delaware.
  Public-sector US buyers may require their home state — that is 🟢 per the
  playbook.

## EU / Germany

- **Governing law:** Laws of the Federal Republic of Germany, excluding the UN
  Convention on Contracts for the International Sale of Goods (CISG).
- **Venue:** Courts of `[Berlin]`, Germany.
- **Notes:** German law disfavors broad liability disclaimers in standard terms
  (AGB control under §§ 305 ff. BGB) — counsel should confirm the liability cap
  and warranty disclaimer survive AGB review for B2B. The **DPA + EU SCCs** are
  mandatory where personal data is processed.

## UK

- **Governing law:** Laws of England and Wales.
- **Venue:** Exclusive jurisdiction of the courts of England and Wales.
- **Notes:** Use the **UK GDPR** terms and the **UK International Data Transfer
  Addendum** (instead of/alongside the EU SCCs) in the DPA where data leaves the
  UK.

## Selection cheat-sheet

| Customer HQ | Default block |
| --- | --- |
| US / Canada / LATAM | US (Delaware) |
| Germany / Austria / EEA (German-law acceptable) | EU / Germany |
| Rest of EEA | EU / Germany or local — 🟡, log it |
| UK | UK |
| Elsewhere | 🔴 counsel |
