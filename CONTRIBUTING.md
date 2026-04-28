# Contributing

Thanks for your interest in contributing.

This project is a small Google Sheets + Apps Script tool focused on game localization preview, font-aware text review, and practical translator workflows. Contributions of many sizes are welcome, including bug reports, UX improvements, docs updates, and code changes.

## Before you start

- Please check existing issues and pull requests first.
- If the change is large or changes the user workflow, opening an issue first is appreciated.
- Small documentation fixes and bug fixes are always welcome.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Run the guided `clasp` setup:

```bash
npm run setup-clasp
```

3. Push the current code to your Apps Script project:

```bash
npm run push-clasp
```

4. Reload your spreadsheet and test the sidebar from:

```text
Localization > Font Preview
```

## Project files

- `src/Config.gs`: user-editable settings
- `src/Code.gs`: Apps Script server-side logic
- `src/Sidebar.html`: sidebar UI and client-side logic
- `scripts/setup-clasp.js`: guided local setup helper

## Contribution guidelines

- Keep changes focused and easy to review.
- Prefer small, readable functions over deeply nested logic.
- Keep user-facing text clear and simple.
- If you add configurable behavior, prefer putting it in `src/Config.gs`.
- If you change the user workflow, update `README.md` as needed.

## Pull requests

When opening a pull request, please include:

- what changed
- why it changed
- how you tested it
- any screenshots or short recordings if the UI changed

## Reporting bugs

Helpful bug reports usually include:

- what you expected to happen
- what actually happened
- steps to reproduce
- browser / OS details if relevant
- whether you used local fonts, editable cells, or image columns

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License used by this repository.
