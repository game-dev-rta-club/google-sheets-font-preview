# GitHub Pages

This project uses GitHub Pages with a custom domain as the public website for Marketplace and OAuth configuration.

## Pages settings

Enable GitHub Pages in the repository settings:

1. Open `Settings > Pages`.
2. Set `Build and deployment` to `Deploy from a branch`.
3. Set branch to `main`.
4. Set folder to `/docs`.
5. Save.

Expected public URLs:

- Homepage: `https://font-preview-sidebar.game-dev-rta.com/`
- Privacy Policy: `https://font-preview-sidebar.game-dev-rta.com/privacy`
- Terms of Service: `https://font-preview-sidebar.game-dev-rta.com/terms`
- Support: `https://font-preview-sidebar.game-dev-rta.com/support`

## Marketplace and OAuth usage

Use the custom-domain GitHub Pages URLs for:

- OAuth consent screen homepage
- OAuth consent screen privacy policy
- Google Workspace Marketplace support URL
- Google Workspace Marketplace privacy policy URL
- Google Workspace Marketplace terms of service URL

If the custom domain changes, update this file, `docs/marketplace-listing.md`, and `docs/release-checklist.md`.
