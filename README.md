# Aminosoft Global

Standalone corporate website. No dependencies, backend, or relationship to the Artha application deployment.

## Preview and production

Run `npm run dev` and open http://localhost:5173. Run `npm run build` to verify the production files, then serve the `dist/` directory on any static host. Configure www.aminosoftglobal.com on your hosting provider independently of artha.aminosoftglobal.com.

## Content and branding

Company contact information, strengths, process, and flagship product data are centralized at the top of `dist/app.js`. Set contact values only after verification. Null values display clearly marked placeholders; no contact form pretends to submit messages. Navigation lives in semantic HTML in `dist/index.html`. Product card structure can be duplicated for future released products. The original supplied logo and symbol retain their proportions; the cover is the social sharing image. Core website content is in HTML for search engines. Fonts use Google Fonts with system fallbacks.

SEO canonical URL, sitemap, robots, and absolute social image URLs target the requested production domain. Update those if the production domain changes. Preview publishing does not configure or change the company's DNS or Artha hosting.
