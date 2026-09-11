# Emmanuel Cobbinah — Personal Portfolio

Local Next.js portfolio (App Router, TypeScript, Tailwind). Editorial light design. Built to run on this machine first; deploy to Vercel later when ready.

## Prerequisites

- Node.js 20+
- npm

## Run locally

```bash
cd /workspace/personal-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Edit copy

All site copy lives in [`lib/content.ts`](./lib/content.ts). Hero photo: [`public/emmanuel-hero.jpg`](./public/emmanuel-hero.jpg).

## Deploy later

This repo does not require a git remote. When you want hosting, push to GitHub and connect the project to Vercel (or run `vercel` from this folder). No deploy step is required to develop locally.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- `next/font`: Instrument Serif (display) + DM Sans (body)
