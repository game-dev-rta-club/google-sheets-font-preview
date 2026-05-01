# Security Policy

## Supported versions

This project is maintained from the `main` branch. Security fixes are expected to target the latest version unless a release note says otherwise.

## Reporting a vulnerability

If you believe you found a security issue, please avoid posting sensitive details in a public issue.

Preferred reporting path:

1. Use GitHub Security Advisories for this repository if available.
2. If private reporting is not available, open a GitHub issue with a minimal description and omit exploit details or private data.

Please include:

- what the issue affects
- steps to reproduce, if safe to share
- the potential impact
- any suggested fix, if you have one

## Scope

Security reports are especially helpful for:

- unexpected spreadsheet data access
- unsafe handling of local font files
- authorization or permission problems
- cross-site scripting or HTML injection risks in the sidebar
- accidental data sharing outside Google Sheets / Apps Script

## Out of scope

Please do not run destructive tests against spreadsheets, Google services, or other users' data. Reports that require damaging or unauthorized access are not acceptable.

## Maintainer response

Maintainers will review reports as soon as practical and may ask for clarification. Fixes may be released as code changes, documentation updates, or configuration guidance depending on the issue.
