# Aminosoft Global production deployment

## Status and architecture

Prepared locally on 2026-11-04. Production deployment, DNS, certificates, browser QA and Artha regression verification are NOT complete. Approval is required before enabled-site changes, Nginx reloads or certificate operations. DNS remains owner-managed; wait for explicit confirmation of propagation before issuance.

The checked-out site is plain HTML/CSS/JavaScript, not React/Vite. `dist/` is the tracked source and deployable output; never delete it as a generated build directory. No dependencies, lockfile, environment files, API calls, backend, router or forms exist. No dependency installation is required or appropriate. `npm run build` validates existing production files rather than bundling. Validation passed with Node 24.21.0/npm 11.19.0. The build script uses `import.meta.dirname` (Node >=20.11); use the verified Node 24 locally. No Node/npm belongs on the VPS.

Only `/` is a page; navigation anchors are home, about, solutions, products, approach, free-plan and contact. SPA fallback is included for the requested hosting contract. Assets use relative paths, so arbitrary nested URLs are not supported application routes. No route additions are implied.

Contact opens WhatsApp at the existing approved number from `dist/app.js`; message delivery requires a manual check. Product links open https://artha.aminosoftglobal.com/. Google Fonts supplies English fonts (fonts.googleapis.com/fonts.gstatic.com); system fallbacks work offline. Sinhala/Tamil fonts and their OFL licenses, branding, social image and three SVG illustrations are bundled locally. No production API URL or secrets are needed. Canonical, social URLs, robots and sitemap now target https://aminosoftglobal.com/.

Nginx serves static files on the existing VPS (139.99.91.216). Artha, Java/8080 and PostgreSQL stay untouched. Do not change global Nginx/default/proxy configurations, firewall, Artha files, DNS, certificates or renewal settings.

## Read-only production baseline (before any writes)

Use existing SSH identity without exposing its contents:

```sh
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -i ~/.ssh/artha_ovh_ed25519 ubuntu@139.99.91.216
sudo nginx -T
sudo certbot certificates
systemctl is-active nginx postgresql
ss -ltn
readlink -f /var/www/artha/current
```

Inspect all includes and listen directives for root/www conflicts, default listeners, global gzip and security-header inheritance. Record hashes of the exact Artha vhost and renewal configuration after discovering their paths; record current symlink, Java unit identity/status and certificate fingerprint/expiry. Do not print environment files, keys or database credentials. Public DNS alone cannot reveal Cloudflare redirect/page rules; owner must inspect those in Cloudflare. Capture Artha HTTP status and referenced assets/API health using only known read-only endpoints; do not guess mutation endpoints.

## Local build and upload preparation

From the company-site checkout:

```sh
npm run build
node --check dist/app.js
find dist -type f -print
```

No `npm ci`: there is no lockfile and no installable dependency. Upload only `dist/`, excluding source scripts, docs, `.openai`, `.git`, environment files and node_modules. Keep a SHA256 manifest outside the public release. Never modify Artha directories.

## Isolated release preparation

The following are proposed commands, NOT executed. Run only after baseline inspection. Directory creation affects only the new main-site tree:

```sh
sudo install -d -m 755 /var/www/aminosoftglobal.com/releases /var/www/aminosoftglobal.com/acme
```

Choose a unique timestamp (`YYYYMMDD-HHMMSS`) and use that same literal release ID throughout. Upload into an owner-writable staging directory under the SSH user's home, then install only its files into a new `.incoming-RELEASE_ID` directory under releases. Verify every file against a locally generated SHA256 manifest, confirm file count and `index.html`, CSS, JS and assets, reject symlinks/unexpected secrets, and set directories to 755/files to 644. Rename `.incoming-RELEASE_ID` to `RELEASE_ID` only after validation. Existing release names must never be overwritten. Keep previous releases indefinitely.

Activation (replace RELEASE_ID; record previous current target first):

```sh
readlink /var/www/aminosoftglobal.com/current
sudo ln -s releases/RELEASE_ID /var/www/aminosoftglobal.com/.current-RELEASE_ID
sudo mv -T /var/www/aminosoftglobal.com/.current-RELEASE_ID /var/www/aminosoftglobal.com/current
```

The final rename is atomic on the same filesystem. Check that `current` is absent or a symlink before activation; stop if it is a real directory. A static release switch requires no Nginx reload.

## Cloudflare DNS (manual gate)

Inspect root/www A, AAAA and CNAME records and any redirect rules first. Required records:

- A: name `@`, content `139.99.91.216`, TTL Auto.
- CNAME: name `www`, content `aminosoftglobal.com`, TTL Auto.

For initial HTTP-01 validation, DNS-only is easiest. Do not leave conflicting AAAA records pointing elsewhere; discuss conflicts before changing anything. Do not change `artha`. Wait for owner confirmation and verify authoritative/public resolution for both names before certificate issuance. When later enabling the Cloudflare proxy, use Full (strict), not Flexible; inspect existing redirects for loops. If HTTP-01 cannot reach the origin, discuss an isolated DNS-01 certificate rather than changing firewall or unrelated hosts.

## Nginx and certificate gates

Full configurations are in `aminosoftglobal-bootstrap.nginx.conf` and `aminosoftglobal.nginx.conf` beside this document. Show their contents and exact commands to the owner before production operations. Templates have not been validated against the VPS. They use existing global gzip, the existing Nginx worker user and a separate certificate. No Artha snippets are included. Review shared TLS defaults and existing renewal hooks before installation. Do not enable the final TLS template before its certificate exists.

After DNS confirmation, approve the HTTP bootstrap vhost first. Install to a NEW `/etc/nginx/sites-available/aminosoftglobal.com` only after confirming neither that path nor the enabled link exists; never overwrite an unknown file. Enable only this new site, then test. A reload affects the shared Nginx process, so it requires explicit approval even with an isolated vhost:

```sh
sudo ln -s /etc/nginx/sites-available/aminosoftglobal.com /etc/nginx/sites-enabled/aminosoftglobal.com
sudo nginx -t
sudo systemctl reload nginx
```

Run reload only if the test succeeds; stop on any failure. The temporary vhost serves ACME challenges only and returns 503 elsewhere. Verify a harmless challenge test file through both hostnames before requesting the certificate. After approval, use existing Certbot with webroot, never its Nginx configuration editor:

```sh
sudo certbot certonly --webroot -w /var/www/aminosoftglobal.com/acme --cert-name aminosoftglobal.com -d aminosoftglobal.com -d www.aminosoftglobal.com
```

Stop if that certificate name already exists; inspect before renewing/replacing. Account/email options must follow the existing Certbot account; no unrelated certificate changes. Install the final site-only template after successful issuance and validated release activation, test, and reload with approval. The final HTTP block retains the ACME path for renewal and redirects other traffic to HTTPS. Do not replace global renewal hooks. Inspect whether the existing renewal infrastructure reloads Nginx; if absent, propose a separate main-certificate-only deploy hook with its exact commands and request approval. Test renewal only for this certificate (`certbot renew --cert-name aminosoftglobal.com --dry-run`) after approval; never a broad renewal operation.

## Rollback

Record the previous release before activation. Replace PREVIOUS_RELEASE with that verified directory name:

```sh
sudo test -f /var/www/aminosoftglobal.com/releases/PREVIOUS_RELEASE/index.html
sudo ln -s releases/PREVIOUS_RELEASE /var/www/aminosoftglobal.com/.rollback-PREVIOUS_RELEASE
sudo mv -T /var/www/aminosoftglobal.com/.rollback-PREVIOUS_RELEASE /var/www/aminosoftglobal.com/current
curl -I https://aminosoftglobal.com/
```

Stop if validation fails. No Nginx reload is required for a symlink rollback. First deployment has no previous release: disabling the new main-site vhost requires approval, nginx -t and a reload. Never modify Artha to recover the main site.

## Verification and troubleshooting

- Root HTTPS returns 200 with the expected page; HTTP redirects to root HTTPS; www HTTPS redirects to root and preserves path/query. Validate certificates for both hostnames.
- Request every local JS/CSS/image/font, robots and sitemap and verify content types and bytes; missing assets must return 404, not HTML. Check all anchors, mobile menu/Escape, desktop/mobile layout and browser console/network.
- Check WhatsApp target and manually confirm contact availability; check product links without submitting production data.
- Compare Artha symlink/config hashes, Java service, PostgreSQL status, port 8080, certificate and public frontend/API checks to baseline. No restarts or speculative fixes. Stop deployment on regression.
- Owner must manually verify merchant and back-office login, including authenticator, without sharing credentials here.
- 403: inspect main-site directory traversal permissions and Nginx worker access. 404: verify current target and exact filename case. Stale assets: unversioned filenames revalidate after one-hour asset TTL; HTML uses no-cache. TLS errors: check DNS, hostname SANs, independent certificate paths and Full (strict). Redirect loops: inspect Cloudflare rules/SSL mode. Certificate failures: verify ACME webroot response, A/AAAA and proxy reachability; do not change shared firewall.

No production completion claim is valid until these checks and owner login tests are recorded.

## Recorded execution — 2026-11-04

Steps A/B completed: build validator and JavaScript syntax check passed; all HTML local references checked, 15 production files totaling 810,590 bytes. SHA256 manifest: `production-files.sha256`. No package installation was necessary. Browser/mobile and end-to-end contact QA remain pending.

Read-only VPS inspection succeeded using the existing identity. `nginx -T` passed; enabled vhosts are Artha and default, with no main-domain conflict. Global gzip is enabled (additional gzip types are commented out). Main-site templates explicitly restrict TLS to 1.2/1.3 without changing global settings. Nginx runs as www-data. Only Artha's certificate exists, valid until 2027-01-31 11:16:20 UTC. certbot.timer is active; no files were listed under renewal-hooks, so main-site reload-after-renewal still needs review and approval.

Artha baseline: HTTPS `/` returned 200, `artha.service`, nginx and PostgreSQL 16 cluster active; loopback ports 8080 and 5432 listening. Current target: `/var/www/artha/releases/20261102`. Configuration hashes before and after Step C are identical:

- Artha Nginx vhost SHA256: `a01da7ab6fcbab097c9f01e39d07d39f07dd2a313899eb0c5521dc290c0d8126`
- Artha certificate renewal configuration SHA256: `1edb9d95ef5600735f803f4bb12c2cf74f85511c498a314e93b768e6d9fb475e`

Step C executed: created `/var/www/aminosoftglobal.com/releases` and `/var/www/aminosoftglobal.com/acme` at mode 755; installed the HTTP bootstrap template as a new `/etc/nginx/sites-available/aminosoftglobal.com` at mode 644 using no-clobber protection. It is NOT enabled. No Nginx reload, certificate issuance, DNS change, release upload or activation occurred. Artha configuration and renewal files were not changed.

Step D pending: VPS resolver returned no A, AAAA or CNAME answers for either root or www. This is a resolver observation, not an authenticated inventory of Cloudflare records/rules or proof of authoritative propagation. Owner must inspect conflicts and redirects and confirm DNS before continuation. Root/www must resolve correctly and HTTP challenge reachability must be tested before certificate issuance. Full post-deployment regression tests and manual merchant/back-office logins remain pending.

## Step D completed — owner-confirmed DNS

Owner inspected the Cloudflare DNS export: no pre-existing root/www A, AAAA or CNAME records; Artha and Brevo records preserved. Owner confirmed no Redirect Rules or Page Rules. Bulk Redirects were not separately confirmed.

Owner manually created the root A record to 139.99.91.216 and www CNAME to aminosoftglobal.com using the instructed DNS-only/Auto settings. Owner supplied output from local `dig` queries to both 1.1.1.1 and 8.8.8.8: root A resolves to 139.99.91.216; www A lookup returns aminosoftglobal.com followed by 139.99.91.216; neither name returns an AAAA address. Step D DNS resolution checks passed. No certificate issuance, vhost activation or website upload is recorded. Next: inspect actual disabled bootstrap vhost before proposing enablement and an explicitly approved reload.

## Owner-executed bootstrap and certificate issuance

Owner supplied the actual bootstrap vhost contents, matching the prepared HTTP-only template. Owner's `sudo nginx -T` inspection showed successful validation and only Artha/default enabled, with no main-domain conflict.

Owner executed `sudo ln -s /etc/nginx/sites-available/aminosoftglobal.com /etc/nginx/sites-enabled/aminosoftglobal.com && sudo nginx -t`; configuration test passed. Owner subsequently executed `sudo systemctl reload nginx`, with no command error. Supplied post-reload checks: nginx active, Artha HTTPS 200, main HTTP 503 and www HTTP 503 as designed.

Owner created `/var/www/aminosoftglobal.com/acme/.well-known/acme-challenge/aminosoftglobal-check.txt` containing `aminosoftglobal-acme-check`. Public local-machine curl checks returned HTTP 200; subsequent exact-body checks reported PASS for both hostnames.

Immediately before issuance, owner supplied `sudo certbot certificates` output showing only Artha's certificate (same serial and expiry as baseline), with no main-site certificate-name conflict. After presentation of the isolated certonly/webroot command, owner supplied successful issuance output for aminosoftglobal.com and www.aminosoftglobal.com: certificate `/etc/letsencrypt/live/aminosoftglobal.com/fullchain.pem`, key path `/etc/letsencrypt/live/aminosoftglobal.com/privkey.pem`, expiry 2027-02-02. Certbot reports automatic renewal scheduling. This output confirms issuance, not HTTPS activation or tested renewal. Next: inspect certificate SANs/dates, inspect dedicated renewal settings and reload behavior, then continue release deployment. No website release upload or activation is yet recorded. Final Artha regression checks remain pending.

## Renewal verification blocker — owner-supplied results

Public certificate inspection confirmed SANs aminosoftglobal.com and www.aminosoftglobal.com, valid from 2026-11-04 03:08:59 UTC until 2027-02-02 03:08:58 UTC. Dedicated renewal configuration uses webroot and maps both names to /var/www/aminosoftglobal.com/acme. certbot.timer is enabled and active. Shared hook directory listing was empty; certbot.service invokes standard renew, with no reload command shown. A main-certificate-only reload mechanism remains to be configured with approval after activation.

Owner ran `sudo certbot renew --cert-name aminosoftglobal.com --dry-run`; simulated renewal failed with ConnectionResetError(104). Subsequent staging-directory curl requests timed out during SSL connection from both VPS and local Linux Mint; VPS IPv4-only and forced TLS 1.2 requests also timed out. Production ACME directory returned HTTP 200 from VPS. VPS resolver and 1.1.1.1 both resolved staging through the same CNAME chain to 172.65.46.172. Cause remains undetermined; these results do not prove a staging outage or a specific firewall fault. No DNS/firewall/TLS service settings were changed. Do not force live renewal as a substitute for this test. Renewal test remains FAILED/BLOCKED, not complete; retry before final completion. Local upload preparation can proceed independently; no uploaded website release or HTTPS activation has been verified.

## Owner-executed release preparation and activation

Owner reran local build, JavaScript syntax check and checksum verification: all 15 files OK. Owner created staging directory `/home/ubuntu/aminosoftglobal-upload-20261104-042329`, then confirmed scp upload of dist and production-files.sha256. Staging verification command completed with file count 15 (individual checksum lines were not pasted; the count was gated by successful checksum verification).

Release ID: `20261104-042329`. Owner confirmed isolated installation to `/var/www/aminosoftglobal.com/releases/20261104-042329`. Presented install command copied only staged dist files into a new .incoming directory, applied root:root ownership, directory mode 755/file mode 644, verified checksums, then renamed to final release. Owner confirmed the final success line; intermediate checksum lines were not pasted.

Owner verified current was absent (first deployment), then executed the guarded symlink activation and supplied: `Active release: /var/www/aminosoftglobal.com/releases/20261104-042329`. No previous main-site release exists. Bootstrap remains the running Nginx configuration; final HTTPS vhost is not yet installed or reloaded. Main-site content is installed, but public HTTPS publication and regression tests remain pending. First-deployment recovery is to restore main-site bootstrap configuration after review and nginx -t, with explicit approval immediately before a shared Nginx reload. Artha must not be changed. Renewal dry-run remains unresolved due to staging connectivity failures.

## HTTPS activation verified — owner-executed

Owner uploaded and displayed the final HTTPS template, matching the prepared configuration. Bootstrap backup was copied and verified at `/home/ubuntu/aminosoftglobal-upload-20261104-042329/aminosoftglobal-bootstrap.backup.conf`. Owner installed final template to `/etc/nginx/sites-available/aminosoftglobal.com` using root:root, mode 644; `sudo nginx -t` passed. Owner explicitly approved HTTPS reload, executed `sudo systemctl reload nginx`, and confirmed completion.

Post-reload results supplied by owner: nginx active; https://aminosoftglobal.com/ HTTP 200; https://www.aminosoftglobal.com/, http://aminosoftglobal.com/ and http://www.aminosoftglobal.com/ each HTTP 301 to https://aminosoftglobal.com/; https://artha.aminosoftglobal.com/ HTTP 200. Curl reported no TLS errors. Public main-site HTTPS activation and root redirects verified. Release remains 20261104-042329. Remaining: full asset/browser/mobile/contact checks, redirect path/query checks, Artha configuration/service/certificate comparison and manual logins, dedicated main-certificate reload automation and successful renewal testing. Deployment is not yet fully verified.

## Post-deployment verification — owner-confirmed

Artha comparison passed: artha.service, postgresql@16-main.service and nginx all active; port 8080 listening on loopback; current remains /var/www/artha/releases/20261102. Artha Nginx hash remains a01da7ab6fcbab097c9f01e39d07d39f07dd2a313899eb0c5521dc290c0d8126; Artha renewal configuration hash remains 1edb9d95ef5600735f803f4bb12c2cf74f85511c498a314e93b768e6d9fb475e.

Owner executed public HTTPS downloads with SHA256 comparison against the staging manifest: all 15 published files PASS. Missing PNG, JS and CSS probe URLs each returned 404. Owner reported browser checks passed for section navigation, images, Sinhala/Tamil text, Artha product links, WhatsApp target and mobile layout/menu. Owner reported no console errors after reload and menu/navigation interaction. Browser results are owner-reported rather than agent-controlled browser inspection.

Remaining completion checks include manual Artha back-office/merchant/authenticator logins, current Artha certificate comparison, redirect path/query preservation, response content types/security/cache behavior, main-certificate-only renewal reload configuration and successful renewal dry-run. Staging ACME connectivity blocker remains unresolved. Do not mark deployment fully complete yet.

## Manual logins and dedicated renewal hook

Owner confirmed back-office, merchant and Google Authenticator logins passed. Staging connectivity retry still timed out; renewal dry-run remains unresolved.

Owner initially pasted proposed hook contents into an interactive SSH shell. The lineage guard exited that shell because RENEWED_LINEAGE was unset; hook creation did not occur then. Subsequent output referenced the local machine. After reconnecting, owner supplied VPS hostname vps-c8a26742, nginx/artha.service/PostgreSQL active and both main/Artha HTTPS 200. No production regression was observed.

Owner created `/etc/letsencrypt/aminosoftglobal-deploy-hook.sh` via exclusive file creation. Verified root:root mode 700, shell syntax check passed and contents match the documented lineage-guarded nginx -t followed by systemctl reload nginx script. Creation and syntax checking did not execute the hook.

Owner attached `deploy_hook = /etc/letsencrypt/aminosoftglobal-deploy-hook.sh` under [renewalparams] only in `/etc/letsencrypt/renewal/aminosoftglobal.com.conf`. Backup: `/etc/letsencrypt/renewal/aminosoftglobal.com.conf.before-deploy-hook` (mode 600). Owner-supplied diff confirms exactly this one added line; Artha renewal hash remains 1edb9d95ef5600735f803f4bb12c2cf74f85511c498a314e93b768e6d9fb475e. Dedicated hook execution has NOT been tested and requires explicit approval immediately before its shared Nginx reload. Successful end-to-end renewal testing remains outstanding; no completion claim is made.

## Hook execution and remaining public checks verified

Owner manually invoked the dedicated hook with RENEWED_LINEAGE=/etc/letsencrypt/live/aminosoftglobal.com. Nginx syntax test succeeded, with no reload error reported. Subsequent checks showed nginx, artha.service and PostgreSQL active and main/Artha HTTPS each HTTP 200. This verifies the manual hook path, not a successful Certbot renewal lifecycle.

Owner read Artha public certificate: serial 06435E5C2092E77EBE83F1B5DE169EF23F06 (same numeric serial as baseline), valid from 2026-11-02 11:16:21 UTC until 2027-01-31 11:16:20 UTC, sole SAN artha.aminosoftglobal.com. Certificate comparison passed.

Owner tested redirects for /assets/logo.png?check=redirect via root HTTP, www HTTP and www HTTPS: each returned HTTP 301 to https://aminosoftglobal.com/assets/logo.png?check=redirect. Path/query preservation passed.

Owner supplied HTTPS headers for /, /styles.css, /app.js and /assets/fonts/sinhala.woff2: all HTTP 200; content types respectively text/html, text/css, application/javascript and font/woff2. X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin and X-Frame-Options SAMEORIGIN present on each. Homepage Cache-Control no-cache; assets max-age=3600 with Expires. Response header checks passed.

Public website and owner browser checks, Artha regression checks including manual logins, dedicated renewal settings/timer and manual reload-hook execution are verified. Outstanding requirement: successful certificate renewal dry-run; staging TLS connectivity remains unresolved. Production is serving successfully, but full completion criteria are not yet met.

## Staging blocker explained by official maintenance notice

Owner verbose curl confirms TCP connection to staging IPv4 172.65.46.172:443 succeeds, then TLS stalls after ClientHello. Checked official https://letsencrypt.status.io/ on 2026-11-04: planned Production and Staging Datacenter Maintenance in progress, scheduled November 3 16:00 through November 4 21:00 UTC. Notice explicitly states staging servers will be offline for much of the window while the second datacenter serves production. This is consistent with staging TLS failures from both local/VPS and successful production access. No local infrastructure workaround is warranted based on these results.

Scheduled maintenance end in Asia/Colombo: November 5, 2026 at 02:30. Check official status for actual completion before retrying. After staging recovers, request approval and run the main-certificate-only dry-run; if testing deploy-hook integration with --run-deploy-hooks, explicitly obtain approval immediately before the resulting shared Nginx reload. Manual reload-hook test has already passed. Renewal dry-run remains pending, not passed. Website serving and Artha checks remain verified.
