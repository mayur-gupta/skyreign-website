# SkyReign Global — website

Static marketing site for SkyReign Global and its event, **SRG Clutch Chapter 1**.
Plain HTML, CSS and JavaScript — no framework, no build step. Open a page in a
browser and it works.

## Pages

| File | Route | Purpose |
| --- | --- | --- |
| `index.html` | `/` | Home — brand intro, mission, featured event, countdown |
| `about.html` | `/about` | Organization story, mission, vision, values |
| `srg-clutch.html` | `/srg-clutch` | Full event page for SRG Clutch Chapter 1 |
| `team.html` | `/team` | The people running SRG Clutch — names and roles |
| `partners.html` | `/partners` | Partnership benefits, tiers and categories |
| `contact.html` | `/contact` | Enquiry form and contact methods |
| `privacy.html` / `terms.html` | | Legal placeholders (replace before launch) |
| `srgclutchchapter1/bgmi.html` | `/srgclutchchapter1/bgmi` | Redirect → BGMI registration (Tally) |
| `srgclutchchapter1/freefiremax.html` | `/srgclutchchapter1/freefiremax` | Redirect → Free Fire MAX registration (Tally) |

Shared assets live in `assets/`: `css/styles.css` (design system),
`js/main.js` (header, mobile nav, scroll reveal, countdown, capacity bars,
contact form), and `icons.svg` (one SVG sprite referenced by every page).

## Running it locally

Because pages share an external CSS file and SVG sprite, open them through a
web server rather than double-clicking the file (browsers block some requests
on `file://`):

```bash
python -m http.server 4173
```

Then visit <http://localhost:4173>. Any static server works.

## Registration flow

Team registration runs on **Tally**. Each "Register" button on the event page
opens a short branded redirect page that forwards to the Tally form:

- BGMI → `https://tally.so/r/81DVgY`
- Free Fire MAX → `https://tally.so/r/GxEjQj`

To change a form URL, edit the `target` in the matching redirect file *and* its
`<meta http-equiv="refresh">` tag (the no-JavaScript fallback).

## Contact form

`contact.html` has no backend by default — on submit it opens the visitor's
email client pre-filled to `connect@skyreignglobal.com`. To collect submissions
automatically instead, set `data-endpoint` on the `<form id="enquiry-form">` to
a URL that accepts a JSON `POST` (Formspree, a serverless function, etc.). The
"Sponsorship" enquiry type reveals an extra Partnership-level field.

## Deploying

Upload the folder to any static host — Netlify, Vercel, Cloudflare Pages,
GitHub Pages. There is nothing to compile. Point the domain at the host and
serve over HTTPS. `sitemap.xml` and `robots.txt` are included; update the
domain inside them if it is not `www.skyreignglobal.com`.

## Before launch — checklist

- [ ] Replace placeholder tournament copy only where marked (search `todo` /
      "Placeholder"). Real copy is already in place everywhere else.
- [ ] Add real logo and photography. The site ships **without** raster images
      on purpose — see below. Slots are marked with dashed `.media` boxes.
- [ ] Confirm the two Tally registration URLs are live.
- [ ] Replace `privacy.html` and `terms.html` with legal-reviewed content.
- [ ] Add an OpenGraph share image at each `og:image` path (or update the paths).
- [ ] Verify all five social links resolve.

## A note on images

No game logos, hero photos or sponsor logos are bundled. Two reasons:

1. **Copyright.** Free Fire MAX and BGMI artwork belongs to Garena and Krafton;
   sponsor logos belong to sponsors. The handout is explicit about not using
   these without permission. Add them once you have the rights and files.
2. Everything visible today is CSS, text and inline SVG, so the site is fast
   and has no broken-image icons. Where a photo belongs, there's a labelled
   placeholder box telling you the intended size.

Drop real images into `assets/img/` and swap the `.media` placeholders for
`<img>` tags with descriptive `alt` text.
