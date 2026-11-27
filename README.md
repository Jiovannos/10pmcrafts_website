# 10pm crafts website

Source of [10pmcrafts.com](https://10pmcrafts.com): colourful wooden acoustic diffusers, painted absorbers and pixel art murals. English at `/`, Greek at `/el/`.

## How it is built

A small Node script turns texts and photo folders into a static site in `_site/`. No framework.

| Path | What it holds |
| --- | --- |
| `photos/<category>/<project>/` | Project photos and an optional `info.json`. See [photos/README.md](photos/README.md). |
| `src/content.mjs` | Every text on the site, in English and Greek, plus social links and contact email. |
| `src/figures.mjs` | The diagrams on the "how it works" page. |
| `src/static/` | CSS, JavaScript, logo, favicon, placeholder category images. |
| `scripts/build.mjs` | The build: pages, galleries, image resizing, sitemap. |
| `CNAME` | The custom domain, `10pmcrafts.com`. |

```sh
npm install
npm run dev     # build and preview on http://localhost:8080
npm run build   # build only
```

Every push to `main` builds and publishes the site with GitHub Actions (`.github/workflows/deploy.yml`).

## Pages

Home · Diffuser panels · Absorber panels · Wall pixel art · Ground pixel art · Buy your own · How it works · Contact, each in English and Greek. A category with no projects shows a "coming soon" page with a placeholder image from `src/static/img/categories/`.

On a project page the left and right arrows (or keyboard arrows, or a swipe) go through the photos, and past the last photo continue to the next project in the same category.

## Adding a project

1. Create `photos/<category>/NN-name/` and put the photos in it.
2. Optionally add `info.json` with the titles and texts.
3. Commit and push to `main`. The site updates in about a minute.
