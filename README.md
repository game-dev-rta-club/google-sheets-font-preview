# Google Sheets Font Preview

Google Sheets Font Preview is a Google Apps Script sidebar for reviewing and editing large amounts of text in **Google Sheets** while previewing it with **real local font files**.

It is useful for localization, translation review, font-aware copy checking, and any workflow where people need to compare spreadsheet text with its actual visual look before using it in an app, website, game, document, or other product.

Try the sample sheet here: [Google Sheets Font Preview Sample](https://docs.google.com/spreadsheets/d/1RXvbx0FDQm0sOkM-KyZiOXSSXRt4qzh0erU6QdNlUsc/edit?gid=0#gid=0)

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

### Use from GitHub with npx

Run these commands inside an empty working directory or inside the folder where you want to keep the Apps Script project files:

```bash
npx github:game-dev-rta-club/google-sheets-font-preview setup-clasp
npx github:game-dev-rta-club/google-sheets-font-preview push-clasp
```

### Use directly in Apps Script

1. Open your target Google Sheet.
2. Open `Extensions > Apps Script`.
3. Copy these files into the Apps Script project:
   - [`src/Code.gs`](src/Code.gs)
   - [`src/Sidebar.html`](src/Sidebar.html)
   - [`src/Config.gs`](src/Config.gs)
4. Save the project.
5. Reload the spreadsheet.
6. Open `Localization > Font Preview`.

### Use with clasp

```bash
npm install
npm run setup-clasp
npm run push-clasp
```

Then reload the spreadsheet and open `Localization > Font Preview`.

`setup-clasp` also copies the required project files into the current directory.

During the first setup, Google may show an "app isn't verified" warning for the Apps Script OAuth flow. If you are the developer of the target sheet or script project, continue with your developer account and approve the requested access to finish setup.

You can pass your Apps Script URL or raw `scriptId` directly to setup:

```bash
npm run setup-clasp -- https://script.google.com/home/projects/<scriptId>/edit
```

If you are using the GitHub-based CLI instead of cloning this repository, you can do the same with:

```bash
npx github:game-dev-rta-club/google-sheets-font-preview setup-clasp -- https://script.google.com/home/projects/<scriptId>/edit
```

## Contributing

Contributions are welcome.

- Open an issue for bugs, UX problems, or feature requests
- Open a pull request for fixes or improvements
- Improve documentation, setup flow, or usability

For contribution details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
