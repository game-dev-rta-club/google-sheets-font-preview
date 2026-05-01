# Google Sheets Font Preview

Google Sheets Font Preview is a Google Apps Script sidebar for reviewing and editing large amounts of text in **Google Sheets** while previewing it with **real local font files**.

It is useful for localization, translation review, font-aware copy checking, and any workflow where people need to compare spreadsheet text with its actual visual look before using it in an app, website, game, document, or other product.

## Features

### Review and edit text with real fonts in a Google Sheets sidebar

Open the sidebar next to your sheet to preview text with local fonts, compare multiple fields, and make edits without leaving the spreadsheet workflow.

![Review and edit text with real fonts in a Google Sheets sidebar](docs/images/readme-summary.png)

### Set fonts by drag and drop from your PC

Load local font files (`.ttf`, `.otf`, `.woff`, `.woff2`) directly into the sidebar and preview text with the assigned font.

![Set fonts by drag and drop](docs/images/localfont.png)

### Edit in real time while previewing text

Edit text directly from the sidebar while checking how it fits inside `width` and `height` constraints. This also helps reveal missing or unsupported glyphs in the selected font.

![Real-time editing and size-aware preview](docs/images/realtime.png)

### Add screenshot and note context for translators

Use `screenshot` and `note` columns to show extra context needed for translation, review, and QA work.

![Screenshot and note context](docs/images/note.png)

## Quick Start

### Use with `clasp`

This is the recommended setup.

1. Clone this repository.
2. Install dependencies:

```bash
npm install
```

3. Run the guided setup:

```bash
npm run setup-clasp
```

4. Push the current local files to your Apps Script project:

```bash
npm run push-clasp
```

5. Reload the spreadsheet tab.
6. Open `Localization > Font Preview`.
7. Approve the requested permissions if Google asks for authorization.

For the full `clasp` workflow and GitHub-based usage, see [docs/development-with-clasp.md](docs/development-with-clasp.md).

### Copy into Apps Script manually

If you prefer not to use `clasp`, you can still copy these files into `Extensions > Apps Script`:

- [`src/Code.gs`](src/Code.gs)
- [`src/Sidebar.html`](src/Sidebar.html)
- [`src/Config.gs`](src/Config.gs)

## Contributing

Contributions are welcome.

- Open an issue for bugs, UX problems, or feature requests
- Open a pull request for fixes or improvements
- Improve documentation, setup flow, or usability

For contribution details, see [docs/contributing.md](docs/contributing.md).

Project policies:

- [Privacy Policy](PRIVACYPOLICY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Release checklist](docs/release-checklist.md)

## License

MIT. See [LICENSE](LICENSE).
