# Release checklist

This project currently uses a manual release flow. The goal is to keep releases easy to review before any Google Workspace Marketplace publishing work is automated.

## Before release

- Review merged changes since the last release.
- Confirm README and docs still match the current UI.
- Confirm `PRIVACYPOLICY.md`, `TERMS.md`, `SECURITY.md`, and marketplace-facing links are still accurate.
- Check whether screenshots need to be updated.
- If screenshots need updates, use the source slide deck linked from `docs/marketplace-assets/README.md`.
- Confirm the production Apps Script management spreadsheet linked from `docs/development-with-clasp.md` points to the intended release project.
- Confirm the GitHub Pages URLs in `docs/github-pages.md` are live and match the Marketplace/OAuth settings.

## Verify locally

Run the lightweight syntax checks:

```bash
python3 - <<'PY'
from pathlib import Path
html = Path('src/Sidebar.html').read_text()
start = html.index('<script>') + len('<script>')
end = html.index('</script>', start)
script = html[start:end]
script = script.replace('const BOOTSTRAP_CONFIG = <?!= bootstrapConfigJson ?>;', 'const BOOTSTRAP_CONFIG = {};')
Path('/tmp/sidebar-script-check.js').write_text(script)
PY
node --check /tmp/sidebar-script-check.js

python3 - <<'PY'
from pathlib import Path
Path('/tmp/code-check.js').write_text(Path('src/Code.gs').read_text())
PY
node --check /tmp/code-check.js
```

If you are testing against a real Apps Script project:

```bash
npm run push-clasp
```

Then reload the spreadsheet and check:

- `Localization > Font Preview` opens the sidebar.
- Selecting cells updates the preview.
- Editing localization text writes back to the sheet.
- Local font drag and drop still works.
- Options and Help screens open correctly.
- Sample sheet creation works.

## GitHub release

- Update the version in `package.json` if needed.
- Create a git tag, for example `v0.1.0`.
- Create a GitHub Release with a short user-facing changelog.
- Mention setup changes, permission changes, or migration notes clearly.

## Google Workspace Marketplace release

If publishing as a Marketplace app, also verify:

- OAuth consent screen information is current.
- Marketplace listing text and screenshots are current.
- Privacy policy URL points to the GitHub Pages privacy page.
- Terms of service URL points to the GitHub Pages terms page.
- Support/contact URL points to the GitHub Pages support page.
- Marketplace icon and banner assets are current.
- Requested scopes are still the minimum needed for the feature set.

Marketplace publishing and review are intentionally manual for now.
