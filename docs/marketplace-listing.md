# Google Workspace Marketplace listing draft

This document collects the information needed when preparing a Google Workspace Marketplace listing. Keep it user-facing and update it before submitting a public release.

## App basics

- App name: Font Preview Sidebar
- Google Workspace app: Google Sheets™
- Category: Productivity
- Pricing: Free
- Language: English
- Support: GitHub support page and issues

## Short description / 簡単な説明

Review, edit, and fit localized text in Google Sheets™ with real fonts, screenshots, and notes.

## Detailed description / 詳細な説明

Font Preview Sidebar helps teams review, edit, and fit localized text directly in Google Sheets™ before it is used in an app, website, game, document, or other product.

Spreadsheet text is easy to manage, but hard to judge visually. This add-on adds a sidebar where you can preview text with local font files, compare base language and localized text, and edit cells without leaving the sheet.

Use optional `screenshot` and `note` columns to keep translation context next to each row. Use optional `width` and `height` columns to preview whether text fits in the intended display area and to catch overflow, missing glyphs, or font issues earlier.

This app is free to use and does not require a paid subscription.

Google Sheets™ is a trademark of Google LLC.

## Post-installation hint

Open or reload a spreadsheet, then choose `Extensions > Localization > Font Preview`. Use the Help button to create a sample sheet.

## Key features

- Google Sheets™ sidebar for font-aware text review and editing
- Local font drag and drop for `.ttf`, `.otf`, `.woff`, and `.woff2`
- Optional `width` and `height` columns for size-aware previews
- Optional `screenshot` and `note` columns for translator context
- Project options saved per spreadsheet
- Sample sheet creation from the Help screen

## Suggested links

Use the custom-domain GitHub Pages URLs for Marketplace and OAuth configuration.

- Homepage: `https://font-preview-sidebar.game-dev-rta.com/`
- Support: `https://font-preview-sidebar.game-dev-rta.com/support`
- Privacy policy: `https://font-preview-sidebar.game-dev-rta.com/privacy`
- Terms of service: `https://font-preview-sidebar.game-dev-rta.com/terms`

## OAuth and permissions notes

The app should request only the scopes needed for the current feature set. Review the final Apps Script manifest before submitting.

Likely scope needs:

- Displaying sidebar UI in Google Sheets™
- Reading and writing the current spreadsheet
- Saving project options for the current spreadsheet

If new features add network access, Drive access, Gmail access, or external APIs, update the privacy policy, terms, OAuth consent screen, and Marketplace listing before release.

## Asset checklist

Store listing assets live in [marketplace-assets](marketplace-assets/README.md).

- App icon `32x32`
- App icon `128x128`
- Card banner `220x140`
- Marketplace screenshots in accepted sizes

## Screenshot improvement notes

The current screenshots are accepted-size Marketplace assets. For the next conversion-focused update, prioritize the first screenshot because it acts as the storefront hero image.

Recommended first screenshot message:

```text
Review spreadsheet text as it will actually appear
```

Recommended direction:

- show a realistic Google Sheets™ spreadsheet and the sidebar together
- reduce large red arrows and annotation-heavy overlays
- make the selected row and sidebar preview relationship clear
- keep later screenshots focused on font drag and drop, real-time editing, and screenshot/note context

## Pre-submission checks

- Privacy policy and terms links are public.
- Support link is public and monitored.
- Screenshots match the current UI.
- The OAuth consent screen uses the same app name and branding.
- The Apps Script project is connected to the intended Google Cloud project.
- Scopes are minimal and clearly explained.
- A fresh Google account can install and authorize the app in a test environment.
