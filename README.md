# Beneficence Protocol Foundation

> Giving infrastructure for the agent economy.

Beneficence Protocol Foundation is a public-benefit institution advancing AI Agents that create measurable social value while remaining transparent, governable and accountable to people. This repository contains the Foundation's official website.

The site presents the mission, public programs, governance model, stewardship principles and giving architecture. The underlying organizational blueprint is documented in [PROJECT.md](./PROJECT.md).

## Website

The website is a responsive single-page React application with five public routes:

| Route | Purpose |
| --- | --- |
| `/` | Foundation overview, principles, programs, and stewardship model |
| `/mission` | Editorial explanation of the constructive and protective mission |
| `/programs` | Detailed public-program descriptions and use of funds |
| `/governance` | Human, DAO, and AI Agent responsibilities; fund stewardship and reporting |
| `/giving` | Giving rails, asset controls, accounting, and operational safeguards |

The experience includes accessible navigation, reduced-motion support, responsive layouts, deferred image loading, route-specific document titles, and print styles. Client-side routes use the browser History API; `vercel.json` provides the production fallback to `index.html`.

## Technology

- React 19 and TypeScript
- Vite 8 with the React Compiler
- Oxlint
- Plain CSS with locally hosted Manrope and Newsreader fonts
- Vercel deployment configuration

## Local development

Node.js 24 is recommended to match the configured Vercel runtime.

```bash
git clone git@github.com:tempest2023/BeneficenceProtocol.git
cd BeneficenceProtocol
npm install
npm run dev
```

Vite will print the local development URL, typically `http://localhost:5173`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run lint` | Run Oxlint across the project |
| `npm run preview` | Serve the production build locally |

Before submitting changes, run:

```bash
npm run lint
npm run build
```

## Project structure

```text
.
├── public/                 # Static metadata, favicon, and crawler rules
├── src/
│   ├── assets/
│   │   ├── fonts/          # Locally hosted web fonts
│   │   ├── scenes/         # Optimized artwork used by the website
│   │   └── sources/        # Source images for the scene artwork
│   ├── App.tsx             # Pages, routing, navigation, and UI behavior
│   ├── App.css             # Page and component styles
│   ├── index.css           # Global tokens, fonts, accessibility, and print styles
│   └── main.tsx            # React entry point
├── PROJECT.md              # Founding constitution and operating blueprint
├── vercel.json             # SPA route fallback for Vercel
└── vite.config.ts          # Vite and React Compiler configuration
```

## Content source of truth

Public website claims should remain consistent with [PROJECT.md](./PROJECT.md), especially the charitable programs, asset-acceptance policy and governance boundaries. When the blueprint and website differ, resolve the policy decision in the blueprint before publishing revised public copy.

## Deployment

The project is configured for Vercel. A production deployment should use:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js runtime: `24.x`

The catch-all rewrite in `vercel.json` is required so direct visits to `/mission`, `/governance`, and `/giving` load the React application correctly.

## Image attribution

The site uses source-preserving paper-collage interpretations based on openly licensed or public-domain photographs. Detailed creator, license, and source links are published in the website footer. Keep those credits intact when replacing or redistributing the artwork.
