# Contributing

Thanks for picking up work on the dashboard. This page covers how to set up your copy, how to branch, and what a reviewer looks for.

## How to work on a ticket

1. **Fork this repo** to your own GitHub account, then clone your fork.
2. **Branch from your fork's `main`** using `fix/short-name`, lowercase with hyphens.
3. Make your change and check it by hand in the browser (see the ticket for what to check).
4. **Open the pull request in your own fork, with the base set to your fork's `main`.** Don't open it against `Calico-Media/Work-Experience-2`; pull requests opened there are closed automatically.
5. A maintainer reviews it. Address the feedback by pushing more commits to the same branch.

Tickets are done in order. Merge one PR into your fork's `main` before you branch for the next ticket.

## Pull requests

- **One pull request per ticket.** Don't bundle unrelated changes; they'll be sent back.
- **Fill in the PR template.** Say what changed, why, and how you tested it.
- **Include evidence.** Screenshots for anything visual, before and after numbers for anything measurable (console output, bundle sizes, render counts).
- Keep commits focused, with clear messages.

## What a reviewer checks

- The change does what the ticket asks, and nothing else.
- Nothing else got worse. Every screen still loads on both accounts.
- The code matches what's already here. Reuse the existing components and patterns rather than inventing new ones.
- No leftover scratch code, commented-out blocks or stray files.
- The PR description is clear enough that someone could understand the change without reading every line.

## Things to know

- `src/api.js` stands in for the real API. Don't change it; the real service behaves the same way and the screens have to work against both.
- There is no linter in this repo. Keep to the style of the file you're editing.
