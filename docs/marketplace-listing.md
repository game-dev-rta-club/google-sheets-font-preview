# Google Workspace Marketplace listing draft

This document collects the information needed when preparing a Google Workspace Marketplace listing. Keep it user-facing and update it before submitting a public release.

## App basics

- App name: Google Sheets Font Preview
- Google Workspace app: Google Sheets
- Category: Productivity
- Pricing: Free
- Language: English
- Support: GitHub support page and issues

## Short description

Preview and edit Google Sheets text with local fonts, screenshots, notes, and size-aware text areas.

## Detailed description

Google Sheets Font Preview helps localization, translation, and copy review teams work directly inside Google Sheets while checking how text looks with real local fonts.

Use the sidebar to preview and edit spreadsheet text, drag and drop font files from your computer, compare base language and localized text, and review screenshot or note context from the same row.

The tool can also use `width` and `height` columns to preview text inside size-aware areas, making it easier to catch overflow, missing glyphs, and visual fit problems before text is used in an app, website, game, document, or other product.

## Key features

- Google Sheets sidebar for font-aware text review and editing
- Local font drag and drop for `.ttf`, `.otf`, `.woff`, and `.woff2`
- Optional `width` and `height` columns for size-aware previews
- Optional `screenshot` and `note` columns for translator context
- Project options saved per spreadsheet
- Sample sheet creation from the Help screen

## Suggested links

Replace these with final public URLs before Marketplace submission.

- Homepage: `https://github.com/game-dev-rta-club/google-sheets-font-preview`
- Support: `https://github.com/game-dev-rta-club/google-sheets-font-preview/blob/main/SUPPORT.md`
- Privacy policy: `https://github.com/game-dev-rta-club/google-sheets-font-preview/blob/main/PRIVACYPOLICY.md`
- Terms of service: `https://github.com/game-dev-rta-club/google-sheets-font-preview/blob/main/TERMS.md`

## OAuth and permissions notes

The app should request only the scopes needed for the current feature set. Review the final Apps Script manifest before submitting.

Likely scope needs:

- Displaying sidebar UI in Google Sheets
- Reading and writing the current spreadsheet
- Saving project options for the current spreadsheet

If new features add network access, Drive access, Gmail access, or external APIs, update the privacy policy, terms, OAuth consent screen, and Marketplace listing before release.

## Asset checklist

Store listing assets live in [marketplace-assets](marketplace-assets/README.md).

- App icon `32x32`
- App icon `128x128`
- Card banner `220x140`
- Marketplace screenshots in accepted sizes

## Pre-submission checks

- Privacy policy and terms links are public.
- Support link is public and monitored.
- Screenshots match the current UI.
- The OAuth consent screen uses the same app name and branding.
- The Apps Script project is connected to the intended Google Cloud project.
- Scopes are minimal and clearly explained.
- A fresh Google account can install and authorize the app in a test environment.
