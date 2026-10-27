This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The live demo is at [does-it-feel-like-home.vercel.app](https://does-it-feel-like-home.vercel.app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Study implementation

The survey uses a stacked bottom dock, DM Sans for body/control text, Manrope for headings, and a 12px minimum type size. Both English and Simplified Chinese flows include a one-time tour, five seconds of active viewing per website, conditional optional reasons, participant recovery, and nine background questions. Screens narrower than 1024px show a device message.

Participants can mark either website with boxes, circles, or highlights and add optional notes. Up to 20 marks per pair are stored with JPEG viewport captures, website/page identifiers, viewport dimensions, and scroll positions. Screenshots are served only to the participant's session. The database also records timing, tab switches, visited pages, load failures, broken-image counts, completion timestamps, and the current pair. A leaving session is marked dropped out; resuming autosave returns it to in progress.

Apply the additive schema with `node --env-file=.env.local scripts/apply-schema.mts`. The script prefers the direct/unpooled database URL. `npm test` runs browser and logic checks against an existing server at localhost:3000 (override with `STUDY_TEST_URL`). Tests require Chrome and remove their own database records.

## Regenerating the research websites

The ten briefs in `prompts/` are transcribed from the design team's October 22 survey PDF. `npm run generate` requests all ten categories from all four configured models, with a $20 run limit. It uses `OPENROUTER_API_KEY` or the existing local key-file configuration. It stops scheduling requests after a credit error.

Generation writes progress to `data/manifest.next.json` and run accounting to `generations/usage.next.json`. The active manifest changes only after all 40 sites succeed; existing site folders stay available for participants already assigned to them. Successful remote images are saved locally without changing their selection or design. Broken image URLs stay unchanged and are recorded in each generation's image audit. Every accepted site must contain at least four HTML pages.

The original 12-site corpus remains active for the demo while the 40-site replacement set is generated and checked. The funded account uses a project-specific inference key with a $20 limit, loaded from the ignored `.env.local` file. A management key cannot be used for model inference. Use `npm run generate -- --resume` to finish an interrupted staged set without regenerating successful sites. The introduction and progress indicator use the actual assigned pair count until a complete replacement corpus is available. Contact details still use the design team's placeholders. Consent text is separate from this survey.
