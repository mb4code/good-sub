# U13 Soccer Subs

A front-end-only React/Vite app for managing U13 11v11 soccer substitutions, player minutes, attendance, and game summaries.

## Features

- Team roster editor with localStorage persistence
- Roster JSON import/export
- Attendance setup and 30-minute feasibility check
- 11v11 formation board with drag-and-drop substitutions
- Bench and field player minute tracking
- Start, pause, resume, reset, halftime, and manual clock adjustment
- Stint history for every player
- Paired substitution recommendations by position
- Game summary with JSON and CSV export

All data is stored only in the current browser on the current device. Export roster and game summaries to move or back up data.

## Bundled Team Roster

The deployed app loads its initial roster from:

```text
src/data/teamRoster.json
```

Edit that file locally before deploying when you want the original team roster, positions, and S Types to ship with the app. Then run:

```bash
npm run validate:roster
npm run build
```

The Team Setup screen can still edit/import/export a roster, but those changes are saved only to the current browser with localStorage. They do not write to Vercel, GitHub, or any cloud file.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Mobile Testing

This app is designed for phone and tablet use during a live match:

- Large touch targets for clock, attendance, and substitution actions
- Sticky in-game clock controls on small screens
- One-tap **Apply** buttons on substitution recommendations
- Drag-and-drop support for touch screens through `@dnd-kit/core`
- Compact mobile cards so field, bench, and recommendations scan quickly
- Running game clocks reconcile from wall-clock time when the phone wakes or the browser returns to focus

For local mobile testing, run:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the shown network URL from your phone while it is on the same Wi-Fi network.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the GitHub repository.
3. Use these settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

This app is a static React/Vite app. It has no backend server, no database, no API routes, no authentication, no Vercel serverless functions, and no environment variables.
