# Markdown → PDF Generation Pipeline

> Turns the markdown legal templates into consistent, branded, executable PDFs.
> Shared by the NDA set and the MSA bundle so all legal output looks identical.

## Goals

- Single source of truth in markdown (version-controlled, diffable).
- Deterministic, branded PDF output (cover, header/footer, page numbers).
- Token substitution from a deal record.
- **Strip internal-only content** (redline notes, "internal notes" blocks)
  before rendering.

## Pipeline stages

```
deal record (JSON) ─┐
                    ├─▶ 1. merge tokens ─▶ 2. strip internal blocks ─▶ 3. render PDF ─▶ 4. file + register
markdown template ──┘
```

1. **Token merge.** Replace `[BRACKETED_FIELDS]` from the deal record. Fail the
   build if any required token is unresolved (no `[...]` may remain in output,
   except inside fenced code samples).
2. **Strip internal blocks.** Remove any blockquote beginning `> **Redline notes`
   and any section/line containing `(strip before sending)` / `(internal`.
   These never reach the counterparty.
3. **Render.** Markdown → HTML → PDF. Recommended: `pandoc` with a branded
   LaTeX/HTML template, or a headless-Chromium HTML-to-PDF step. Apply the Aegis
   Lens letterhead, footer with document title + version + page numbers, and the
   confidentiality stamp.
4. **File & register.** Output to `/legal/executed/<type>/YYYY-MM-DD_<party>_<type>.pdf`
   and append a row to the contracts register.

## Reference implementation (pandoc)

```bash
# render.sh <template.md> <deal.json> <out.pdf>
set -euo pipefail
tmp="$(mktemp).md"
# 1. token merge (deal.json: {"TOKEN":"value", ...})
python3 tools/legal/merge_tokens.py "$1" "$2" > "$tmp"
# 2. strip internal blocks
python3 tools/legal/strip_internal.py "$tmp" > "${tmp}.clean"
# 3. render with branded template
pandoc "${tmp}.clean" \
  --template tools/legal/aegis-legal.latex \
  --metadata title="$(head -1 "$1" | sed 's/# //')" \
  -V version="$(git rev-parse --short HEAD)" \
  -o "$3"
```

`merge_tokens.py` and `strip_internal.py` are thin helpers (token regex replace;
remove redline/internal blockquotes and headings). The branded template carries
fonts, margins, header/footer, and the confidentiality footer.

## E-signature handoff

The rendered PDF is uploaded to **Dropbox Sign / DocuSign** with signature/date
fields bound to the `[SIG_*]` / `[DATE_*]` anchors (see
[`../nda/merge-fields.md`](../nda/merge-fields.md) for signing order). Prefer
reusable e-sign templates over re-uploading per deal.

## CI hook (optional)

Add a CI job that renders every template against a sample deal record on each PR
to `docs/legal/**`, so a broken token or template surfaces before a deal needs
it. The job fails if any unresolved `[TOKEN]` survives outside code fences.
