# Google Sheets Font Preview for Game Localization

A Google Sheets sidebar built with Google Apps Script for reviewing **game localization text with local fonts**.

This tool helps translators, localization QA, and game developers preview spreadsheet content inside **Google Sheets** while applying **real local font files** (`.ttf`, `.otf`, `.woff`, `.woff2`) by drag and drop. It is designed for teams that manage localized strings in spreadsheets and need a quick way to check how text will look with language-specific fonts before moving back into the game engine.

## Why this exists

Many game teams manage localization in spreadsheets, but it is still hard to answer questions like:

- Does this translation still fit when rendered with the actual font?
- Does the line count feel right for this language?
- Does the screenshot next to the text still match the current row?
- Can translators and QA review text visually without opening the game every time?

This project focuses on that workflow.

## Features

- Google Sheets sidebar powered by **Google Apps Script**
- Optimized for **game localization preview**
- Reads the selected spreadsheet row using the first header row
- Shows a **screenshot/image preview** from an `image` column
- Shows **Base Language** and **Localization** text preview panels
- Supports per-language **font assignment** by drag and drop
- Supports local font files without uploading them to a server
- Lets you move the internal preview cursor up/down quickly for review work
- Lets you write text back to editable cells from the sidebar
- Configurable through a dedicated user-facing config file

## Good fit

This project is especially useful if you:

- use **Google Sheets** as part of your localization workflow
- work on **games** or UI-heavy interactive content
- need **font-aware translation preview**
- want a lightweight tool that translators can use without learning a full design tool

## Requirements

- A Google account with access to the target spreadsheet
- Google Sheets
- Google Apps Script
- Node.js if you want to manage the script with `clasp`

## Project structure

- [`src/Code.gs`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Code.gs): Apps Script server-side logic
- [`src/Sidebar.html`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Sidebar.html): sidebar UI
- [`src/Config.gs`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Config.gs): user-editable project settings
- [`scripts/setup-clasp.js`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/scripts/setup-clasp.js): guided local setup for `clasp`

## Quick start

### Option 1: use it directly in Apps Script

1. Open your target Google Sheet.
2. Open `Extensions > Apps Script`.
3. Copy the contents of:
   - [`src/Code.gs`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Code.gs)
   - [`src/Sidebar.html`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Sidebar.html)
   - [`src/Config.gs`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Config.gs)
4. Save the Apps Script project.
5. Reload the spreadsheet.
6. Open `Localization > Font Preview`.

### Option 2: manage it locally with clasp

1. Install dependencies:

```bash
npm install
```

2. Run the guided setup:

```bash
npm run setup-clasp
```

You can also pass the Apps Script URL or raw `scriptId` directly:

```bash
npm run setup-clasp -- https://script.google.com/home/projects/<scriptId>/edit
```

3. Push the latest code:

```bash
npm run push-clasp
```

4. Reload the spreadsheet.
5. Open `Localization > Font Preview`.

## Configuration

Edit [`src/Config.gs`](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/src/Config.gs) to customize the tool.

Examples of configurable values:

- menu name
- sidebar title
- base language column header
- image column header
- width / height column headers
- polling interval
- text frame sizing defaults

This is the main customization point for users who:

- do not want to fork the repository and just want to tweak their local Apps Script copy
- do want to fork the repository and maintain a project-specific version over time

## Notes

- Fonts are loaded only in the current browser session.
- Font files are **not uploaded** to Google Drive or an external server.
- After reloading the spreadsheet, fonts need to be loaded again.
- Empty header cells in row 1 are ignored.
- The tool is optimized for practical review speed, not perfect real-time synchronization with spreadsheet selection.

## Contributing

Contributions are welcome.

If you want to help:

- open an issue for bugs, UX problems, or feature ideas
- submit a pull request for fixes or improvements
- improve the documentation for setup, localization workflows, or accessibility

Please read [CONTRIBUTING.md](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](/Users/sakatayusuke/superhookgirl/development/google-sheets-font-preview/LICENSE).
