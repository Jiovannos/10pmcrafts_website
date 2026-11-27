# Photos / Φωτογραφίες

**EN.** One folder per project, inside the folder of its category:

```
photos/
  diffusers/
    01-sunset/          <- one project (the number sets the order, the rest becomes the URL: /diffusers/sunset/)
      01.jpg            <- first photo is the cover (or set "cover" in info.json)
      02.jpg
      info.json         <- optional: titles and texts in English and Greek
  absorbers/
  wall-pixel-art/
  ground-pixel-art/
```

Drop the original photos (JPG, PNG, WebP or iPhone photos exported as JPG) in a new folder. They are resized automatically for the web, so full-size photos are fine. Photos are shown in filename order.

`info.json` (every field is optional):

```json
{
  "title": { "en": "Sunset", "el": "Ηλιοβασίλεμα" },
  "summary": { "en": "One line under the title.", "el": "Μία γραμμή κάτω από τον τίτλο." },
  "description": { "en": ["Paragraph 1", "Paragraph 2"], "el": ["Παράγραφος 1", "Παράγραφος 2"] },
  "year": "2026",
  "size": "60 × 60 × 10 cm",
  "materials": { "en": "Wood, water-based paint", "el": "Ξύλο, βαφή νερού" },
  "forSale": true,
  "price": { "en": "€350", "el": "350 €" },
  "cover": "03.jpg",
  "hidden": false
}
```

`forSale: true` also lists the piece on the "Buy your own" page. `hidden: true` keeps a folder off the site.

**ΕΛ.** Ένας φάκελος για κάθε έργο, μέσα στον φάκελο της κατηγορίας του (π.χ. `photos/diffusers/04-to-onoma/`). Βάζεις μέσα τις φωτογραφίες (με τη σειρά που θες να εμφανίζονται, π.χ. 01.jpg, 02.jpg) και, αν θέλεις, ένα `info.json` με τίτλο και κείμενα σε αγγλικά και ελληνικά. Οι φωτογραφίες μικραίνουν αυτόματα για το web. Η πρώτη φωτογραφία είναι το εξώφυλλο του έργου.

## Photo names / Ονόματα φωτογραφιών

**EN.** Name each photo `<name>_hero.jpg`, `<name>_side.jpg`, `<name>_detail.jpg`, `<name>_space.jpg`. They are shown in that order and the hero is the cover. Other names follow in filename order.

**ΕΛ.** Ονόμασε κάθε φωτογραφία `<όνομα>_hero.jpg`, `<όνομα>_side.jpg`, `<όνομα>_detail.jpg`, `<όνομα>_space.jpg`. Εμφανίζονται με αυτή τη σειρά και η hero είναι το εξώφυλλο.

## Home page / Αρχική σελίδα

`photos/home/hero.jpg` is the big photo at the top of the home page. Optional: `diffusers.jpg`, `absorbers.jpg`, `wall-pixel-art.jpg`, `ground-pixel-art.jpg`, `shop.jpg` for the sections below. A missing file falls back to the first project's cover.
