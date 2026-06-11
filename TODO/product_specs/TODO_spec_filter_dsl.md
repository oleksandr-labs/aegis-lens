# SPEC — Filter DSL

## Status
In Progress

## Goal
A typed, machine-readable filter representation that powers UI filters, alerts, AOI, and the AI rule builder.

## Tasks
- [x] Grammar (JSON / Protobuf representation) — `packages/filter-dsl/src/types.ts` with `FilterDSL`, `ConditionNode`, `AndNode/OrNode/NotNode`
- [x] Field catalog (every queryable event field + range type) — `FIELD_CATALOG` in `field-catalog.ts` (20 fields with types + valid operators)
- [x] Operators (eq, neq, in, gt/lt, contains, near, within_polygon, …) — 15 operators in `Operator` union type
- [x] Combinators (AND / OR / NOT) — `AndNode`, `OrNode`, `NotNode` + `and()`, `or()`, `not()` builder helpers
- [x] URL serialization (sharing) — `serializeFilter()` / `deserializeFilter()` in `validator.ts`
- [x] Validators + linter — `validateFilter()` with full tree traversal, operator compatibility check
- [ ] Reference parsers TS + Python
- [ ] AI-translator: NL → DSL (with confidence)

## i18n
- DSL is locale-agnostic; presentation localized.

### Примітки
The DSL is the lingua franca across alerts / search / reports / AOI. Get it right.
