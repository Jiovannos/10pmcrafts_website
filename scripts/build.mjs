// Builds the static site into _site/.
//   node scripts/build.mjs            -> build
//   node scripts/build.mjs --serve    -> build and serve on http://localhost:8080
//
// Project photos come from photos/<category>/<project-folder>/ (see photos/README.md).
// Texts come from src/content.mjs. No framework: just Node and, when installed, `sharp`
// to resize photos for the web.

import fs from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { languages, site, ui, categories, pages, home, guide } from '../src/content.mjs';
import { figures } from '../src/figures.mjs';
import { cutout } from './cutout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const PHOTOS = path.join(ROOT, 'photos');
const STATIC = path.join(ROOT, 'src', 'static');
const CUTOUTS = path.join(ROOT, '.cache', 'cutouts');
// Absolute base path, used only by 404.html (which can be served from any URL).
// On GitHub Pages without a custom domain this is "/10pmcrafts_website/".
const BASE = (process.env.SITE_BASE || '/').replace(/\/?$/, '/');
const SITE_URL = `https://${site.domain}/`;
const WIDTHS = [800, 1800];
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('! sharp is not installed: photos are copied without resizing. Run `npm install` for smaller images.');
}

// ---------- helpers ----------

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const t = (obj, lang) => (obj == null ? '' : typeof obj === 'string' ? obj : obj[lang] ?? obj.en ?? '');
const paras = (list, lang) => {
  const v = Array.isArray(list) ? list : t(list, lang);
  return (Array.isArray(v) ? v : [v]).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n');
};
const prefix = (lang) => (lang === 'en' ? '' : `${lang}/`);
const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

async function write(rel, content) {
  const file = path.join(OUT, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function newer(src, dest) {
  try {
    const [a, b] = await Promise.all([fs.stat(src), fs.stat(dest)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

// Resize one image into web sizes. Returns { srcset: [[url, w]], src, width, height }.
async function processImage(srcFile, outBase) {
  const ext = path.extname(srcFile).toLowerCase();
  if (!sharp || ext === '.gif') {
    const rel = `${outBase}${ext}`;
    await fs.mkdir(path.dirname(path.join(OUT, rel)), { recursive: true });
    await fs.copyFile(srcFile, path.join(OUT, rel));
    let width, height;
    return { src: rel, srcset: [], width, height };
  }
  // Studio shots on white get a transparent background and are trimmed to the piece.
  const cut = await cutout(sharp, srcFile, CUTOUTS);
  if (cut) srcFile = cut;
  const meta = await sharp(srcFile, { limitInputPixels: false }).rotate().metadata();
  const portrait = (meta.orientation || 1) >= 5;
  const fullW = portrait ? meta.height : meta.width;
  const fullH = portrait ? meta.width : meta.height;
  const srcset = [];
  for (const w of WIDTHS) {
    const width = Math.min(w, fullW);
    const rel = `${outBase}-${w}.webp`;
    const dest = path.join(OUT, rel);
    if (!(await newer(srcFile, dest))) {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await sharp(srcFile, { limitInputPixels: false }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(dest);
    }
    srcset.push([rel, width]);
    if (width === fullW) break;
  }
  const largest = srcset[srcset.length - 1];
  return { src: largest[0], srcset, width: fullW, height: fullH, cut: !!cut };
}

// ---------- read photos ----------

// Photos named like "gorilla_hero.jpg" are ordered by the word after the last "_" or "-":
// hero (the cover), side, detail, space/room. Any other photo follows in filename order.
const PHOTO_ROLES = ['hero', 'side', 'detail', 'space', 'room'];
const photoRole = (f) => {
  const i = PHOTO_ROLES.indexOf(path.parse(f).name.toLowerCase().split(/[-_ ]/).pop());
  return i < 0 ? PHOTO_ROLES.length : i;
};
const byPhotoRole = (a, b) => photoRole(a) - photoRole(b) || a.localeCompare(b, undefined, { numeric: true });

// Optional photos for the home page: photos/home/hero.jpg and photos/home/<category or "shop">.jpg.
async function readHome() {
  const dir = path.join(PHOTOS, 'home');
  const home = {};
  if (!existsSync(dir)) return home;
  for (const f of (await fs.readdir(dir)).filter((x) => IMAGE_RE.test(x) && !x.startsWith('.'))) {
    const key = path.parse(f).name.toLowerCase();
    home[key] = await processImage(path.join(dir, f), `media/home/${key}`);
  }
  return home;
}

async function readProjects(cat) {
  const dir = path.join(PHOTOS, cat.slug);
  if (!existsSync(dir)) return [];
  const folders = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const projects = [];
  for (const folder of folders) {
    const pdir = path.join(dir, folder);
    let info = {};
    const infoFile = path.join(pdir, 'info.json');
    if (existsSync(infoFile)) {
      try {
        info = JSON.parse(await fs.readFile(infoFile, 'utf8'));
      } catch (e) {
        throw new Error(`Could not read ${path.relative(ROOT, infoFile)}: ${e.message}`);
      }
    }
    if (info.hidden) continue;
    const files = (await fs.readdir(pdir))
      .filter((f) => IMAGE_RE.test(f) && !f.startsWith('.'))
      .sort(byPhotoRole);
    if (!files.length) {
      console.warn(`! ${cat.slug}/${folder} has no photos, skipped`);
      continue;
    }
    if (info.cover && files.includes(info.cover)) files.unshift(...files.splice(files.indexOf(info.cover), 1));
    const slug = (info.slug || folder.replace(/^\d+[-_ ]*/, '') || folder)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const images = [];
    for (const f of files) {
      images.push(await processImage(path.join(pdir, f), `media/${cat.slug}/${slug}/${path.parse(f).name}`));
    }
    projects.push({
      category: cat,
      folder,
      slug,
      info,
      images,
      cover: images[0],
      title: info.title || titleCase(slug),
    });
  }
  return projects;
}

// ---------- page building blocks ----------

const icons = {
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3.1z" fill="currentColor"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const pixels = '<span class="pixels" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

// A page context knows its own path, so it can make relative links that work both on
// username.github.io/10pmcrafts_website/ and on 10pmcrafts.com/.
function ctx(lang, pagePath) {
  const depth = pagePath.split('/').filter(Boolean).length;
  const up = '../'.repeat(depth);
  return {
    lang,
    path: pagePath,
    u: (target) => up + target || './',
    l: (target) => up + prefix(lang) + target || './',
  };
}

function picture(c, image, { alt, sizes = '100vw', eager = false, cls = '' } = {}) {
  if (!image) return '';
  const srcset = image.srcset.length > 1 ? ` srcset="${image.srcset.map(([s, w]) => `${c.u(s)} ${w}w`).join(', ')}" sizes="${sizes}"` : '';
  const dims = image.width ? ` width="${image.width}" height="${image.height}"` : '';
  const klass = [cls, image.cut ? 'cut' : ''].filter(Boolean).join(' ');
  return `<img class="${klass}" src="${c.u(image.src)}"${srcset}${dims} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function socialLinks(lang, cls = 'social') {
  return `<ul class="${cls}">
    <li><a href="${site.instagram}" target="_blank" rel="noopener">${icons.instagram}<span>@10pmcrafts</span></a></li>
    <li><a href="${site.facebook}" target="_blank" rel="noopener">${icons.facebook}<span>/10pmcrafts</span></a></li>
  </ul>`;
}

// Categories with `hidden: true` in content.mjs still get their pages, but nothing links to them.
const shownCategories = categories.filter((cat) => !cat.hidden);

// Everything the menu and home page list, in order.
function destinations(data, lang) {
  const list = shownCategories.map((cat) => ({
    key: cat.slug,
    href: `${cat.slug}/`,
    title: t(cat.title, lang),
    menuTitle: t(cat.menuTitle || cat.title, lang),
    kicker: t(cat.kicker, lang),
    tagline: t(cat.tagline, lang),
    intro: cat.intro,
    image: data.home[cat.slug] || data.covers[cat.slug],
    soon: !data.projects[cat.slug].length,
  }));
  list.push(
    {
      key: 'shop',
      href: `${pages.shop.slug}/`,
      title: t(pages.shop.title, lang),
      menuTitle: t(pages.shop.menuTitle, lang),
      kicker: t(pages.shop.kicker, lang),
      tagline: t(pages.shop.tagline, lang),
      intro: pages.shop.intro,
      image: data.home.shop || data.covers.shop,
    },
    {
      key: 'how-it-works',
      href: `${pages.howItWorks.slug}/`,
      title: t(pages.howItWorks.title, lang),
      menuTitle: t(pages.howItWorks.menuTitle, lang),
      kicker: t(pages.howItWorks.kicker, lang),
      tagline: t(pages.howItWorks.tagline, lang),
      figure: 'diffusion',
    },
    ...(data.pastWork.length
      ? [
          {
            key: 'past-work',
            href: `${pages.pastWork.slug}/`,
            title: t(pages.pastWork.title, lang),
            menuTitle: t(pages.pastWork.menuTitle, lang),
            kicker: t(pages.pastWork.kicker, lang),
            tagline: t(pages.pastWork.tagline, lang),
            image: data.pastWork[0].image,
          },
        ]
      : []),
    {
      key: 'contact',
      href: `${pages.contact.slug}/`,
      title: t(pages.contact.title, lang),
      kicker: t(pages.contact.kicker, lang),
      tagline: t(pages.contact.tagline, lang),
      figure: 'logo',
    },
  );
  return list;
}

function tileVisual(c, d, sizes) {
  if (d.image) return picture(c, d.image, { alt: d.title, sizes });
  if (d.figure === 'logo') return `<div class="tile-figure tile-logo"><img src="${c.u('img/logo-large.png')}" alt="" loading="lazy"></div>`;
  return `<div class="tile-figure">${figures[d.figure]}</div>`;
}

function layout(c, { title, description, body, alt, bodyClass = '', image }) {
  const { lang } = c;
  const T = ui[lang];
  const other = languages.find((l) => l !== lang);
  const altPath = alt ?? c.path.replace(/^el\//, '');
  const pathFor = (l) => prefix(l) + altPath;
  const data = c.data;
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${t(home[lang].title, lang)}`;
  const desc = description || home[lang].metaDescription;
  const ogImage = image ? SITE_URL + image.src : SITE_URL + 'img/logo-large.png';
  const nav = [
    ['diffusers/', t(categories[0].menuTitle || categories[0].title, lang)],
    [`${pages.howItWorks.slug}/`, t(pages.howItWorks.menuTitle, lang)],
    [`${pages.shop.slug}/`, t(pages.shop.menuTitle, lang)],
    ...(data.pastWork.length ? [[`${pages.pastWork.slug}/`, t(pages.pastWork.menuTitle, lang)]] : []),
    [`${pages.contact.slug}/`, t(pages.contact.menuTitle, lang)],
  ];
  const current = c.path.replace(/^el\//, '');
  const menuTiles = destinations(data, lang)
    .map(
      (d) => `<li><a class="menu-tile${current.startsWith(d.href) ? ' is-current' : ''}" href="${c.l(d.href)}">
        <span class="menu-tile-img">${tileVisual(c, d, '(min-width: 900px) 22vw, 45vw')}</span>
        <span class="menu-tile-text"><strong>${esc(d.menuTitle || d.title)}</strong>${d.soon ? `<em class="tag">${esc(T.comingSoon)}</em>` : ''}</span>
      </a></li>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE_URL}${c.path}">
${languages.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${pathFor(l)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE_URL}${pathFor('en')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="${lang === 'el' ? 'el_GR' : 'en_US'}">
<meta name="theme-color" content="#f7f3ec">
<link rel="icon" type="image/png" href="${c.u('favicon.png')}">
<link rel="apple-touch-icon" href="${c.u('apple-touch-icon.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Commissioner:wght@300;400;500;600&family=Noto+Serif+Display:ital,wght@0,500;0,600;1,500&display=swap">
<link rel="stylesheet" href="${c.u('css/style.css')}">
${c.path === '' ? `<script>try{if(!localStorage.getItem('lang')&&(/^el\\b/i.test(navigator.language||'')||Intl.DateTimeFormat().resolvedOptions().timeZone==='Europe/Athens'))location.replace('el/')}catch(e){}</script>` : ''}
<script src="${c.u('js/main.js')}" defer></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${esc(T.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${c.l('')}" aria-label="${site.name}, ${esc(T.home)}">
      <img src="${c.u('img/logo.png')}" alt="" width="52" height="52">
      <span class="brand-name">10pm <span>crafts</span></span>
    </a>
    <nav class="nav-inline" aria-label="${esc(T.works)}">
      ${nav.map(([href, label]) => `<a href="${c.l(href)}"${current.startsWith(href) ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('\n      ')}
    </nav>
    <div class="header-tools">
      <a class="lang-switch" href="${c.u(pathFor(other))}" hreflang="${other}" lang="${other}" data-lang="${other}" title="${esc(ui[other].langName)}">${esc(ui[other].langShort)}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu"><span class="menu-lines" aria-hidden="true"><i></i><i></i></span><span class="menu-label">${esc(T.menu)}</span></button>
    </div>
  </div>
</header>
<div class="menu" id="site-menu" hidden>
  <div class="wrap menu-inner">
    <div class="menu-head">
      <div class="menu-head-left"><a class="brand" href="${c.l('')}" aria-label="${site.name}, ${esc(T.home)}"><img src="${c.u('img/logo.png')}" alt="" width="52" height="52"></a><span class="kicker">${pixels}${esc(T.menu)}</span></div>
      <button class="menu-close" type="button" aria-label="${esc(T.close)}">${icons.close}</button>
    </div>
    <ul class="menu-grid">
${menuTiles}
    </ul>
    <div class="menu-foot">${socialLinks(lang)}<a class="lang-switch" href="${c.u(pathFor(other))}" data-lang="${other}">${esc(ui[other].langName)}</a></div>
  </div>
</div>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <img src="${c.u('img/logo.png')}" alt="" width="64" height="64" loading="lazy">
      <div><strong>10pm crafts</strong><p>${esc(T.rights)}</p></div>
    </div>
    <nav class="footer-nav">
      ${destinations(data, lang).map((d) => `<a href="${c.l(d.href)}">${esc(d.menuTitle || d.title)}</a>`).join('\n      ')}
    </nav>
    <div class="footer-social"><span class="kicker">${esc(T.followUs)}</span>${socialLinks(lang)}</div>
  </div>
  <div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} 10pm crafts</span><a href="${c.u(pathFor(other))}" data-lang="${other}" class="lang-switch">${esc(ui[other].langName)}</a></div>
</footer>
</body>
</html>
`;
}

function pill(href, label, cls = '') {
  return `<a class="pill ${cls}" href="${href}">${esc(label)}${icons.arrowR}</a>`;
}

function placeholderTag(lang, p) {
  return p?.info?.placeholder ? `<span class="tag tag-sample">${esc(ui[lang].placeholder)}</span>` : '';
}

function projectCard(c, p, { showPrice = false } = {}) {
  const { lang } = c;
  const info = p.info;
  const meta = [info.year, info.size].filter(Boolean).join(' · ');
  return `<li class="card reveal">
  <a href="${c.l(`${p.category.slug}/${p.slug}/`)}">
    <span class="card-img">${picture(c, p.cover, { alt: t(p.title, lang), sizes: '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw' })}${placeholderTag(lang, p)}</span>
    <span class="card-text">
      <strong>${esc(t(p.title, lang))}</strong>
      ${info.summary ? `<span>${esc(t(info.summary, lang))}</span>` : ''}
      <small>${esc(meta)}${showPrice && info.price ? ` · ${esc(t(info.price, lang))}` : ''}</small>
    </span>
  </a>
</li>`;
}

function pageHead(lang, { kicker, title, intro, extra = '' }) {
  return `<section class="page-head wrap">
  <span class="kicker">${pixels}${esc(kicker)}</span>
  <h1>${esc(title)}</h1>
  ${intro ? `<div class="lead-text">${paras(intro, lang)}</div>` : ''}
  ${extra}
</section>`;
}

// ---------- pages ----------

function homePage(data, lang) {
  const c = { ...ctx(lang, prefix(lang)), data };
  const H = home[lang];
  const T = ui[lang];
  const featured = data.projects.diffusers.find((p) => p.info.home) || data.projects.diffusers[0];
  // Sections under the big photo, in this order. The other categories are still in the menu.
  const all = destinations(data, lang);
  const dests = HOME_SECTIONS.map((key) => all.find((d) => d.key === key)).filter(Boolean);
  const sections = dests
    .map((d, i) => {
      const text = `<div class="feature-text reveal">
        <span class="kicker">${pixels}${esc(d.kicker)}</span>
        <h2><a href="${c.l(d.href)}">${esc(d.title)}</a></h2>
        <p class="tagline">${esc(d.tagline)}</p>
        ${d.intro ? paras([t(d.intro, lang)[0]], lang) : ''}
        ${d.soon ? `<p class="soon"><span class="tag">${esc(T.comingSoon)}</span></p>` : ''}
        ${pill(c.l(d.href), d.soon ? T.explore : d.key === 'contact' ? d.title : T.explore, d.soon ? 'pill-ghost' : '')}
      </div>`;
      return `<section class="feature ${i % 2 ? 'is-flipped' : ''}" id="${d.key}">
      <div class="wrap feature-inner">
        <a class="feature-media reveal" href="${c.l(d.href)}" tabindex="-1" aria-hidden="true">${tileVisual(c, d, '(min-width: 900px) 55vw, 100vw')}</a>
        ${text}
      </div>
    </section>`;
    })
    .join('\n');

  const body = `<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text">
      <span class="kicker">${pixels}${esc(t(categories[0].kicker, lang))}</span>
      <h1>${esc(H.title)}</h1>
      <p class="lead">${esc(H.lead)}</p>
      <div class="actions">${pill(c.l('diffusers/'), H.cta)}<a class="link-quiet" href="${c.l(`${pages.howItWorks.slug}/`)}">${esc(H.secondary)}</a></div>
    </div>
    ${heroGallery(c, featured)}
  </div>
  <a class="scroll-cue" href="#${dests[0]?.key || ''}" aria-label="${esc(T.explore)}"><span></span></a>
</section>
${sections}`;
  return layout(c, { body, bodyClass: 'page-home', image: data.home.hero || featured?.cover });
}

const HOME_SECTIONS = ['how-it-works', 'shop', 'past-work', 'contact'];

// The big photo on the home page: the featured piece's hero (or photos/home/hero.jpg),
// then its other photos, with arrows. The featured piece has "home": true in info.json.
function heroGallery(c, featured) {
  const { lang, data } = c;
  const T = ui[lang];
  const href = featured ? c.l(`diffusers/${featured.slug}/`) : c.l('diffusers/');
  const title = featured ? t(featured.title, lang) : '';
  const images = [data.home.hero || featured?.cover, ...(featured?.images.slice(1) || [])].filter(Boolean);
  const slides = images
    .map(
      (im, k) =>
        `<a class="hero-slide${k ? '' : ' is-active'}" href="${href}"${k ? ' hidden' : ''}>${picture(c, im, { alt: title ? `${title}, ${k + 1}/${images.length}` : '', sizes: '(min-width: 900px) 50vw, 100vw', eager: k === 0 })}</a>`,
    )
    .join('\n      ');
  const nav =
    images.length > 1
      ? `<button type="button" class="hero-btn hero-prev" aria-label="${esc(T.prevPhoto)}">${icons.chevL}</button>
      <button type="button" class="hero-btn hero-next" aria-label="${esc(T.nextPhoto)}">${icons.chevR}</button>
      <div class="hero-dots">${images.map((_, k) => `<button type="button" class="${k ? '' : 'is-active'}" data-index="${k}" aria-label="${k + 1}/${images.length}"></button>`).join('')}</div>`
      : '';
  return `<div class="hero-media hero-gallery">
      ${slides}
      ${placeholderTag(lang, featured)}
      ${nav}
    </div>`;
}

function categoryPage(data, cat, lang) {
  const c = { ...ctx(lang, `${prefix(lang)}${cat.slug}/`), data };
  const T = ui[lang];
  const projects = data.projects[cat.slug];
  let content;
  if (projects.length) {
    content = `<section class="wrap"><ul class="cards">${projects.map((p) => projectCard(c, p)).join('\n')}</ul></section>`;
  } else {
    content = `<section class="wrap soon-block">
      <div class="soon-media">${picture(c, data.covers[cat.slug], { alt: t(cat.title, lang), sizes: '(min-width: 900px) 60vw, 100vw' })}</div>
      <div class="soon-text">
        <span class="tag">${esc(T.comingSoon)}</span>
        <p>${esc(t(cat.soon, lang))}</p>
        <div class="actions">${pill(c.l(`${pages.contact.slug}/`), t(pages.contact.title, lang))}</div>
        ${socialLinks(lang)}
      </div>
    </section>`;
  }
  const others = shownCategories.filter((x) => x !== cat);
  const body = `${pageHead(lang, { kicker: t(cat.kicker, lang), title: t(cat.title, lang), intro: t(cat.intro, lang) })}
${content}
${otherCategories(c, others)}`;
  return layout(c, { title: t(cat.title, lang), description: t(cat.tagline, lang), body, image: data.covers[cat.slug] });
}

function otherCategories(c, list) {
  const { lang } = c;
  if (!list.length) return '';
  return `<section class="wrap more">
  <h2 class="more-title">${esc(ui[lang].allCategories)}</h2>
  <ul class="mini-grid">
    ${list
      .map(
        (cat) => `<li><a href="${c.l(`${cat.slug}/`)}"><span class="mini-img">${picture(c, c.data.covers[cat.slug], { alt: '', sizes: '25vw' })}</span><strong>${esc(t(cat.title, lang))}</strong>${c.data.projects[cat.slug].length ? '' : `<em class="tag">${esc(ui[lang].comingSoon)}</em>`}</a></li>`,
      )
      .join('\n    ')}
  </ul>
</section>`;
}

function projectPage(data, p, i, lang) {
  const cat = p.category;
  const list = data.projects[cat.slug];
  const c = { ...ctx(lang, `${prefix(lang)}${cat.slug}/${p.slug}/`), data };
  const T = ui[lang];
  const info = p.info;
  const title = t(p.title, lang);
  const prev = list.length > 1 ? list[(i - 1 + list.length) % list.length] : null;
  const next = list.length > 1 ? list[(i + 1) % list.length] : null;
  const href = (x) => c.l(`${cat.slug}/${x.slug}/`);
  const specs = [
    [T.year, info.year],
    [T.size, info.size],
    [T.materials, t(info.materials, lang)],
    [T.price, info.forSale ? t(info.price, lang) || T.forSale : ''],
  ].filter(([, v]) => v);
  const slides = p.images
    .map(
      (im, k) => `<figure class="slide${k === 0 ? ' is-active' : ''}" data-index="${k}"${k ? ' hidden' : ''}>
        ${picture(c, im, { alt: `${title}, ${k + 1}/${p.images.length}`, sizes: '(min-width: 1000px) 62vw, 100vw', eager: k === 0 })}
      </figure>`,
    )
    .join('\n');
  const thumbs =
    p.images.length > 1
      ? `<div class="thumbs" role="tablist">${p.images
          .map(
            (im, k) =>
              `<button type="button" class="thumb${k === 0 ? ' is-active' : ''}" data-index="${k}" aria-label="${k + 1}/${p.images.length}">${picture(c, { ...im, srcset: im.srcset.slice(0, 1), src: im.srcset[0]?.[0] || im.src }, { alt: '', sizes: '120px' })}</button>`,
          )
          .join('')}</div>`
      : '';
  const navCard = (x, dir) =>
    x
      ? `<a class="pn pn-${dir}" href="${href(x)}" rel="${dir}">
        <span class="pn-img">${picture(c, x.cover, { alt: '', sizes: '160px' })}</span>
        <span class="pn-text"><small>${dir === 'prev' ? icons.arrowL : ''}${esc(dir === 'prev' ? T.prevProject : T.nextProject)}${dir === 'next' ? icons.arrowR : ''}</small><strong>${esc(t(x.title, lang))}</strong></span>
      </a>`
      : '<span></span>';

  const body = `<article class="project wrap" data-prev="${prev ? href(prev) : ''}" data-next="${next ? href(next) : ''}">
  <nav class="crumbs"><a href="${c.l(`${cat.slug}/`)}">${esc(t(cat.menuTitle || cat.title, lang))}</a><span>/</span><span>${esc(title)}</span></nav>
  <div class="project-layout">
    <div class="gallery" data-count="${p.images.length}">
      <div class="stage">
        ${slides}
        ${placeholderTag(lang, p)}
        <a class="stage-btn stage-prev" ${prev ? `href="${href(prev)}"` : 'aria-disabled="true"'} data-label-photo="${esc(T.prevPhoto)}" data-label-project="${esc(T.prevProject)}" aria-label="${esc(T.prevProject)}">${icons.chevL}</a>
        <a class="stage-btn stage-next" ${next ? `href="${href(next)}"` : 'aria-disabled="true"'} data-label-photo="${esc(T.nextPhoto)}" data-label-project="${esc(T.nextProject)}" aria-label="${esc(T.nextProject)}">${icons.chevR}</a>
        <span class="stage-hint" aria-live="polite"></span>
        <span class="stage-count">${p.images.length > 1 ? `<b>1</b> / ${p.images.length}` : ''}</span>
      </div>
      ${thumbs}
    </div>
    <aside class="project-info">
      <span class="kicker">${pixels}${esc(t(cat.menuTitle || cat.title, lang))}</span>
      <h1>${esc(title)}</h1>
      ${info.summary ? `<p class="tagline">${esc(t(info.summary, lang))}</p>` : ''}
      ${paras(info.description || [], lang)}
      ${specs.length ? `<dl class="specs">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      ${pill(c.l(`${pages.contact.slug}/`), T.askAbout)}
    </aside>
  </div>
  <nav class="project-nav" aria-label="${esc(t(cat.title, lang))}">${navCard(prev, 'prev')}${navCard(next, 'next')}</nav>
</article>
<div class="lightbox" hidden>
  <button class="lb-close" type="button" aria-label="${esc(T.close)}">${icons.close}</button>
  <button class="lb-btn lb-prev" type="button" aria-label="${esc(T.prevPhoto)}">${icons.chevL}</button>
  <img alt="">
  <button class="lb-btn lb-next" type="button" aria-label="${esc(T.nextPhoto)}">${icons.chevR}</button>
</div>`;
  return layout(c, {
    title: `${title} · ${t(cat.menuTitle || cat.title, lang)}`,
    description: t(info.summary, lang) || t(cat.tagline, lang),
    body,
    bodyClass: 'page-project',
    image: p.cover,
  });
}

function shopPage(data, lang) {
  const P = pages.shop;
  const c = { ...ctx(lang, `${prefix(lang)}${P.slug}/`), data };
  const forSale = Object.values(data.projects).flat().filter((p) => p.info.forSale);
  const body = `${pageHead(lang, { kicker: t(P.kicker, lang), title: t(P.title, lang), intro: t(P.intro, lang), extra: `<div class="actions">${pill(c.l(`${pages.contact.slug}/`), t(P.cta, lang))}</div>` })}
<section class="wrap">
  ${forSale.length ? `<ul class="cards">${forSale.map((p) => projectCard(c, p, { showPrice: true })).join('\n')}</ul>` : `<p class="empty">${esc(t(P.empty, lang))}</p>`}
</section>
${otherCategories(c, shownCategories.length > 1 ? shownCategories : [])}`;
  return layout(c, { title: t(P.title, lang), description: t(P.tagline, lang), body, image: data.covers.shop });
}

// Past work: loose photos from photos/past-work/, captions in photos/past-work/captions.json.
function pastWorkPage(data, lang) {
  const P = pages.pastWork;
  const c = { ...ctx(lang, `${prefix(lang)}${P.slug}/`), data };
  const T = ui[lang];
  const items = data.pastWork;
  const grid = items.length
    ? `<ul class="past-grid">${items
        .map(
          (x, k) => {
            const cap = x.caption || {};
            const title = t(cap.title, lang);
            const text = cap.text ? t(cap.text, lang) : typeof cap === 'string' || cap.en ? t(cap, lang) : '';
            return `<li><button type="button" class="past-item" data-index="${k}" data-full="${c.u(x.image.src)}" data-title="${esc(title)}" data-caption="${esc(text)}">${picture(c, x.image, { alt: [title, text].filter(Boolean).join('. '), sizes: '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw' })}${title ? `<span class="past-title">${esc(title)}</span>` : ''}</button></li>`;
          },
        )
        .join('\n')}</ul>`
    : `<p class="empty">${esc(t(P.empty, lang))}</p>`;
  const body = `${pageHead(lang, { kicker: t(P.kicker, lang), title: t(P.title, lang), intro: [t(P.tagline, lang)] })}
<section class="wrap">${grid}</section>
<dialog class="past-box">
  <figure><img alt=""><figcaption><strong></strong><span></span></figcaption></figure>
  <button type="button" class="past-close" aria-label="${esc(T.close)}">${icons.close}</button>
  <button type="button" class="past-prev" aria-label="${esc(T.prevPhoto)}">${icons.chevL}</button>
  <button type="button" class="past-next" aria-label="${esc(T.nextPhoto)}">${icons.chevR}</button>
</dialog>`;
  return layout(c, { title: t(P.title, lang), description: t(P.tagline, lang), body, image: items[0]?.image });
}

async function readPastWork() {
  const dir = path.join(PHOTOS, 'past-work');
  if (!existsSync(dir)) return [];
  let captions = {};
  const capFile = path.join(dir, 'captions.json');
  if (existsSync(capFile)) {
    try {
      captions = JSON.parse(await fs.readFile(capFile, 'utf8'));
    } catch (e) {
      throw new Error(`Could not read photos/past-work/captions.json: ${e.message}`);
    }
  }
  const files = (await fs.readdir(dir))
    .filter((f) => IMAGE_RE.test(f) && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const items = [];
  for (const f of files) {
    const slug = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
    items.push({ file: f, caption: captions[f] || '', image: await processImage(path.join(dir, f), `media/past-work/${slug}`) });
  }
  return items;
}

function guidePage(data, lang) {
  const P = pages.howItWorks;
  const c = { ...ctx(lang, `${prefix(lang)}${P.slug}/`), data };
  const sections = guide[lang]
    .map(
      (s, i) => `<section class="guide-section reveal">
    <div class="guide-figure">${figures[s.figure]}</div>
    <div class="guide-text">
      <span class="guide-num">0${i + 1}</span>
      <h2>${esc(s.h)}</h2>
      ${paras(s.p, lang)}
      ${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
      ${s.after ? paras(s.after, lang) : ''}
    </div>
  </section>`,
    )
    .join('\n');
  const body = `${pageHead(lang, { kicker: t(P.kicker, lang), title: t(P.title, lang), intro: [t(P.tagline, lang)] })}
<div class="wrap guide">
${sections}
</div>
<section class="wrap cta-band reveal">
  <div><span class="kicker">${pixels}${esc(t(categories[0].kicker, lang))}</span><h2>${esc(t(categories[0].tagline, lang))}</h2></div>
  ${pill(c.l('diffusers/'), t(categories[0].title, lang))}
</section>`;
  return layout(c, { title: t(P.menuTitle, lang), description: t(P.tagline, lang), body, bodyClass: 'page-guide' });
}

function contactPage(data, lang) {
  const P = pages.contact;
  const c = { ...ctx(lang, `${prefix(lang)}${P.slug}/`), data };
  const cards = [
    { href: site.instagram, icon: icons.instagram, label: 'Instagram', value: '@10pmcrafts' },
    { href: site.facebook, icon: icons.facebook, label: 'Facebook', value: 'facebook.com/10pmcrafts' },
  ];
  if (site.email) cards.unshift({ href: `mailto:${site.email}`, icon: icons.mail, label: 'Email', value: site.email });
  const body = `${pageHead(lang, { kicker: t(P.kicker, lang), title: t(P.title, lang), intro: [t(P.tagline, lang), t(P.intro, lang)] })}
<section class="wrap">
  <ul class="contact-cards">
    ${cards
      .map(
        (x) => `<li><a href="${x.href}"${x.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${x.icon}<span><small>${x.label}</small><strong>${esc(x.value)}</strong></span>${icons.arrowR}</a></li>`,
      )
      .join('\n    ')}
  </ul>
</section>`;
  return layout(c, { title: t(P.title, lang), description: t(P.tagline, lang), body });
}

function notFoundPage(data) {
  const lang = 'en';
  const c = { lang, path: '404.html', data, u: (x) => BASE + x, l: (x) => BASE + x };
  const body = `<section class="page-head wrap">
  <span class="kicker">${pixels}404</span>
  <h1>${esc(ui.en.notFoundTitle)}</h1>
  <div class="lead-text"><p>${esc(ui.en.notFoundText)}</p><p lang="el">${esc(ui.el.notFoundText)}</p></div>
  <div class="actions">${pill(BASE, ui.en.goHome)}${pill(BASE + 'el/', ui.el.goHome, 'pill-ghost')}</div>
</section>`;
  return layout(c, { title: ui.en.notFoundTitle, body, alt: '' });
}

// ---------- main ----------

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      if (e.name === 'categories') continue; // processed as images below
      await copyDir(s, d);
    } else await fs.copyFile(s, d);
  }
}

async function build() {
  const started = Date.now();
  // Keep media/ between builds so unchanged photos are not resized again.
  if (existsSync(OUT)) {
    for (const e of await fs.readdir(OUT)) if (e !== 'media') await fs.rm(path.join(OUT, e), { recursive: true, force: true });
  }
  await copyDir(STATIC, OUT);
  await fs.copyFile(path.join(ROOT, 'CNAME'), path.join(OUT, 'CNAME')).catch(() => {});

  const data = { projects: {}, covers: {}, home: await readHome(), pastWork: await readPastWork() };
  for (const cat of categories) {
    data.projects[cat.slug] = await readProjects(cat);
    const fallback = path.join(STATIC, 'img', 'categories', `${cat.slug}.jpg`);
    data.covers[cat.slug] =
      data.projects[cat.slug][0]?.cover ||
      (existsSync(fallback) ? await processImage(fallback, `media/categories/${cat.slug}`) : null);
  }
  const firstForSale = Object.values(data.projects).flat().find((p) => p.info.forSale);
  data.covers.shop = firstForSale?.images[1] || firstForSale?.cover || data.covers.diffusers;

  const urls = [];
  const emit = async (rel, html, { listed = true } = {}) => {
    await write(rel === '' || rel.endsWith('/') ? `${rel}index.html` : rel, html);
    if (rel !== '404.html' && listed) urls.push(rel);
  };

  for (const lang of languages) {
    const pre = prefix(lang);
    await emit(pre, homePage(data, lang));
    for (const cat of categories) {
      const listed = !cat.hidden;
      await emit(`${pre}${cat.slug}/`, categoryPage(data, cat, lang), { listed });
      for (const [i, p] of data.projects[cat.slug].entries()) {
        await emit(`${pre}${cat.slug}/${p.slug}/`, projectPage(data, p, i, lang), { listed });
      }
    }
    await emit(`${pre}${pages.shop.slug}/`, shopPage(data, lang));
    await emit(`${pre}${pages.pastWork.slug}/`, pastWorkPage(data, lang), { listed: data.pastWork.length > 0 });
    await emit(`${pre}${pages.howItWorks.slug}/`, guidePage(data, lang));
    await emit(`${pre}${pages.contact.slug}/`, contactPage(data, lang));
  }
  await emit('404.html', notFoundPage(data));
  await write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
  await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);

  const count = Object.values(data.projects).flat().length;
  console.log(`Built ${urls.length} pages, ${count} projects in ${Date.now() - started} ms -> _site/`);
}

function serve(port = 8080) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
  http
    .createServer(async (req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(OUT, p);
      if (!file.startsWith(OUT)) return res.writeHead(403).end();
      try {
        if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
        await fs.access(file);
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
        createReadStream(file).pipe(res);
      } catch {
        res.writeHead(404, { 'content-type': types['.html'] });
        createReadStream(path.join(OUT, '404.html')).pipe(res);
      }
    })
    .listen(port, () => console.log(`Serving _site/ on http://localhost:${port}`));
}

await build();
if (process.argv.includes('--serve')) serve(Number(process.env.PORT) || 8080);
