# Aminosoft Global

Standalone corporate website with Sri Lanka-first messaging. It remains independent from the Artha application, backend, and hosting. No runtime package dependencies.

## Preview and production

Run `npm run dev` and open http://localhost:5173. Run `npm run build` to validate the production files, then serve `dist/` on a static host. Configure www.aminosoftglobal.com independently of artha.aminosoftglobal.com. Sites publication preserves the existing private audience and does not change DNS.

## Content and configuration

- `dist/index.html`: semantic content, navigation, ready-made and custom service categories, Artha showcase, Free plan, examples, contact section, and SEO.
- `dist/app.js`: company and product configuration, the approved temporary WhatsApp number, capabilities, strengths, and process. Changing or removing the contact option requires updating this centralized configuration and its links together. No personal email, residential address, or placeholder contact cards are published.
- `dist/styles.css`: original brand styling plus responsive additions and multilingual font rules.
- `dist/assets/`: original supplied logo and symbol, social cover, three original SVG concept illustrations, and self-hosted Sinhala/Tamil fonts with OFL licenses. English typography uses Google Fonts with system fallbacks.

English remains the primary language. Supporting phrases use `lang="si"` and `lang="ta"`. No language selector is added. Illustrations depict potential uses, not real customers or application screenshots.

## Product claims verified on 2026-11-04

Read-only inspection of the adjacent Artha source confirmed:

- `frontend/docs/help-validation/plan-catalog.json` and the public plan UI: Starter Free plan; inventory and accounting depend on paid plan entitlements. No paid prices are copied into this website.
- `frontend/src/Operations.tsx`, `Quotations.tsx`, and `BusinessDocument.tsx`: service invoices, quotations, and recipient details.
- `frontend/src/DocumentPdfAction.tsx`: PDF download and native file sharing when supported. WhatsApp sharing is described as sending the downloaded PDF or using supported device sharing, without claiming a dedicated automatic WhatsApp integration.
- `backend-api/.../operations/DocumentPdfRenderer.java`: bundled Sinhala and Tamil fonts for generated PDFs. Copy refers to multilingual customer names/details, not fully translated document headings or every application screen.

The Artha project was inspected only; no source or deployment changes were made to it. Recheck capabilities against Artha before changing advertised features. Do not advertise multi-branch features until released and available.

Canonical URLs, sitemap, robots, and absolute social-image URLs target https://aminosoftglobal.com/. Update them if the production domain changes.

OVH production preparation and approval gates: [deployment runbook](docs/deployment/aminosoftglobal-production-deployment.md).
