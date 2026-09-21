# ALIS - start here

This archive contains the ALIS identity and the restyled website. Everything is finished and
checked; the only thing left is publishing it to the lab's own domain, which needs your host
access.

Open this file first, then follow the order below. You do not need to be a developer to review
sections 01, 02, 04 and 05.

---

## What is in here

| Folder | What it is | Who it is for |
| --- | --- | --- |
| `01-identity/` | The logo artwork in every format, plus the written identity rules | Designer, print supplier, anyone placing the logo |
| `02-design-tokens/` | Colour, type, spacing, radius and motion as one file, plus a JSON mirror | Developer |
| `03-website/` | `deploy-build/` is the finished site ready to upload. `source/` is the full project | Developer, or your host |
| `04-before-after/` | Side-by-side screenshots of the old site and the new one | Anyone reviewing the change |
| `05-reports/` | Measured accessibility and performance results, and the enquiry-record evidence | Anyone signing off |
| `06-handoff/` | Deployment, rollback, and how to change things | Whoever runs the site |

## Reading order

1. **`04-before-after/overview.jpg`** - the whole change in one image. Then
   `overview-mobile.jpg` for phones.
2. **`01-identity/brand-guidelines.md`** - what the mark is, how much space it needs, when to use
   the monogram instead, the palette, and the typefaces with their licences.
3. **`05-reports/performance-accessibility.md`** - what was measured and what it scored.
4. **`06-handoff/HANDOFF.md`** - how to put it live, and how to go back if you need to.

## Putting it live

```bash
cd 03-website/source
npm install
npm run build            # writes the static site to build/
npm run serve            # serves it on http://localhost:4180 and records enquiries
```

Then publish. Two things matter:

1. **The enquiry form needs the Node process.** `npm run serve` is the only mode in which a
   submission can be stored. If you host the site purely as static files, the form shows an
   explicit error and offers a mailto link rather than losing a message.
2. **Take a backup first.** The rollback command is in `06-handoff/HANDOFF.md`, section 5.

Already built? You can skip `npm run build` and upload `03-website/deploy-build/` as-is.

## Findings you should know about

- **Accessibility: 0 violations** across all 12 pages, measured with axe-core against WCAG 2.2 AA.
- **Nothing overflows** at 390, 834 or 1440 px, and there are **0 broken links**.
- **Enquiries are traceable.** Each submission is stored with a timestamp, the page it came from,
  every field, and a consent flag, and can be exported as CSV. `05-reports/inquiry-ledger-sample.json`
  shows one real captured record. The live ledger ships empty so you start clean.
- **The acronym is a placeholder.** Nothing in the old site recorded what ALIS stands for, so it is
  not invented here. Add the official long form to `01-identity/brand-guidelines.md` section 1 and
  to the stacked logo when you confirm it.
- **Not yet published.** This environment has no access to the lab's host, so the site is built and
  verified but not live. The pre-restyle site remains at `pongsun-b.github.io/TravBhv/`.
- **Chrome was automated; Safari and Firefox were not.** Nothing depends on Chrome-only features,
  but a quick manual pass on those two is worth doing.
