# TODO — Sequence Diagrams

## Goal
Document the key cross-service sequences so anyone new can read the system.

## Progress
- 8 / 12 done

## Sequences
- [x] User signup + SSO ✓ Sprint 2.3
- [x] Event ingest → published on map — `docs/architecture/sequence-diagrams.md`
- [x] User creates AOI → first alert delivered — `docs/architecture/sequence-diagrams.md`
- [x] AI copilot question → grounded answer ✓ Sprint 1.3 + data-flow.md
- [ ] AI rule builder: NL → rule → first match
- [x] Verification: low-confidence event → review queue → publish — `docs/architecture/sequence-diagrams.md`
- [ ] Report generation: subscribe → schedule → deliver
- [x] Plugin install → first data render — `docs/architecture/sequence-diagrams.md`
- [x] API key creation → first call billed ✓ Sprint 2.2
- [ ] Embed widget loaded → SEO/referrer logged
- [x] Source goes silent → degrade + alert — `docs/architecture/sequence-diagrams.md`
- [ ] Retraction: post-publish correction propagation

## i18n
- N/A directly.

### Примітки
Mermaid sequence diagrams. Keep in repo with services they describe.
