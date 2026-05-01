# Development with clasp

This guide is for people who want to develop or maintain Font Preview Sidebar from a local checkout.

## Quick flow

1. Install dependencies:

```bash
npm install
```

2. Run the guided setup:

```bash
npm run setup-clasp
```

3. Push the current local files to your Apps Script project:

```bash
npm run push-clasp
```

4. Reload the spreadsheet and open:

```text
Localization > Font Preview
```

## What `setup-clasp` does

The setup command helps you:

- prepare the local Apps Script files
- connect the folder to a target Apps Script project
- log in with `clasp`
- open the Google settings page if authorization setup is needed

You can pass either an Apps Script URL or a raw `scriptId`:

```bash
npm run setup-clasp -- https://script.google.com/home/projects/<scriptId>/edit
```

## GitHub-based usage

If you are using the tool directly from GitHub instead of cloning the repository, the equivalent commands are:

```bash
npx github:game-dev-rta-club/google-sheets-font-preview setup-clasp
npx github:game-dev-rta-club/google-sheets-font-preview push-clasp
```

## Notes

- During the first setup, Google may show an authorization or unverified app warning.
- If you are the developer of the target sheet or Apps Script project, continue with your developer account and approve the requested access.
- `push-clasp` uploads the local `src/` files in your current working folder. It does not fetch the latest repository files automatically.

## Maintainer resources

Public GitHub Pages site:

- <https://game-dev-rta-club.github.io/google-sheets-font-preview/>

GitHub Pages setup notes:

- [GitHub Pages](github-pages.md)

Production Apps Script management spreadsheet:

- <https://docs.google.com/spreadsheets/d/1RXvbx0FDQm0sOkM-KyZiOXSSXRt4qzh0erU6QdNlUsc/edit?gid=0#gid=0>

## Project files

- `src/Config.gs`: user-editable settings
- `src/Code.gs`: Apps Script server-side logic
- `src/Sidebar.html`: sidebar UI and client-side logic
- `scripts/setup-clasp.js`: guided local setup helper
