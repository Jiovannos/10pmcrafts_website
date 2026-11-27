// All site texts, in English (en) and Greek (el).
// Edit the words here; the layout lives in build.mjs and the styles in static/css.

export const languages = ['en', 'el'];

export const site = {
  name: '10pm crafts',
  domain: '10pmcrafts.com',
  // Leave empty until there is a real address; the contact page then shows only the social links.
  email: '',
  facebook: 'https://www.facebook.com/10pmcrafts',
  instagram: 'https://www.instagram.com/10pmcrafts',
  messenger: 'https://m.me/10pmcrafts',
};

export const ui = {
  en: {
    langName: 'English',
    langShort: 'EN',
    menu: 'Menu',
    close: 'Close',
    home: 'Home',
    works: 'Works',
    explore: 'Explore',
    comingSoon: 'Coming soon',
    placeholder: 'Sample',
    viewProject: 'View project',
    prevProject: 'Previous project',
    nextProject: 'Next project',
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    photos: 'photos',
    year: 'Year',
    size: 'Size',
    materials: 'Materials',
    price: 'Price',
    forSale: 'Available',
    askAbout: 'Ask about this piece',
    followUs: 'Follow the work',
    rights: 'Handmade in Greece.',
    backTo: 'Back to',
    allCategories: 'All categories',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist, or it has moved.',
    goHome: 'Go to the home page',
    skip: 'Skip to content',
  },
  el: {
    langName: 'Ελληνικά',
    langShort: 'ΕΛ',
    menu: 'Μενού',
    close: 'Κλείσιμο',
    home: 'Αρχική',
    works: 'Έργα',
    explore: 'Δες περισσότερα',
    comingSoon: 'Σύντομα',
    placeholder: 'Δείγμα',
    viewProject: 'Δες το έργο',
    prevProject: 'Προηγούμενο έργο',
    nextProject: 'Επόμενο έργο',
    prevPhoto: 'Προηγούμενη φωτογραφία',
    nextPhoto: 'Επόμενη φωτογραφία',
    photos: 'φωτογραφίες',
    year: 'Έτος',
    size: 'Διαστάσεις',
    materials: 'Υλικά',
    price: 'Τιμή',
    forSale: 'Διαθέσιμο',
    askAbout: 'Ρώτησε για αυτό το έργο',
    followUs: 'Ακολούθησε τη δουλειά',
    rights: 'Χειροποίητα στην Ελλάδα.',
    backTo: 'Πίσω στα',
    allCategories: 'Όλες οι κατηγορίες',
    notFoundTitle: 'Η σελίδα δεν βρέθηκε',
    notFoundText: 'Αυτή η σελίδα δεν υπάρχει ή έχει μετακινηθεί.',
    goHome: 'Πήγαινε στην αρχική',
    skip: 'Μετάβαση στο περιεχόμενο',
  },
};

// Project categories. Photos for each live in photos/<slug>/<project-folder>/.
// `cover` is used on the home page and menu until the category has real projects.
export const categories = [
  {
    slug: 'diffusers',
    cover: 'img/categories/diffusers.jpg',
    title: { en: 'Diffuser panels', el: 'Diffusers' },
    kicker: { en: 'Acoustic art', el: 'Ακουστική τέχνη' },
    tagline: {
      en: 'Wooden sound diffusers in colour.',
      el: 'Ξύλινοι διαχυτές ήχου, με χρώμα.',
    },
    intro: {
      en: [
        'A diffuser is a panel of wooden blocks of different depths. When sound hits it, each block sends it back a little later than its neighbour, so the reflection breaks up and spreads across the room instead of bouncing straight back at you.',
        'The room keeps its life and its sense of space, without harsh echoes. Classic diffusers are raw wood or plain white. Ours are painted, so the panel that fixes the sound is also the piece you want to look at.',
      ],
      el: [
        'Ο diffuser (διαχυτής) είναι ένα πάνελ από ξύλινα κυβάκια με διαφορετικά βάθη. Όταν ο ήχος το χτυπά, κάθε κυβάκι τον επιστρέφει λίγο αργότερα από το διπλανό του, έτσι η ανάκλαση σπάει και απλώνεται στον χώρο αντί να γυρίζει ευθεία πίσω σε σένα.',
        'Το δωμάτιο κρατά τη ζωντάνια και την αίσθηση χώρου του, χωρίς ενοχλητικές ηχώ. Οι κλασικοί diffusers είναι από φυσικό ξύλο ή λευκοί. Οι δικοί μας είναι βαμμένοι, ώστε το πάνελ που διορθώνει τον ήχο να είναι και το έργο που θέλεις να κοιτάς.',
      ],
    },
    soon: null,
  },
  {
    slug: 'absorbers',
    hidden: true, // not linked anywhere yet; set to false to show it again
    cover: 'img/categories/absorbers.jpg',
    title: { en: 'Absorber panels', el: 'Absorbers' },
    kicker: { en: 'Painted by music', el: 'Ζωγραφισμένα από μουσική' },
    tagline: {
      en: 'Fabric panels that soak up sound, painted with the help of music.',
      el: 'Υφασμάτινα πάνελ που απορροφούν τον ήχο, βαμμένα με τη βοήθεια της μουσικής.',
    },
    intro: {
      en: [
        'Absorbers take energy out of the room: sound enters the soft core of the panel and turns into a tiny amount of heat. They tame echo and make speech and music clearer.',
        'Our absorbers are not pixelated. The fabric is painted with the help of music, so every panel carries the trace of a song.',
      ],
      el: [
        'Τα absorbers (απορροφητές) αφαιρούν ενέργεια από τον χώρο: ο ήχος μπαίνει στον μαλακό πυρήνα του πάνελ και μετατρέπεται σε ελάχιστη θερμότητα. Μειώνουν την αντήχηση και κάνουν τον λόγο και τη μουσική πιο καθαρά.',
        'Τα δικά μας absorbers δεν είναι pixel art. Το ύφασμα βάφεται με τη βοήθεια της μουσικής, έτσι κάθε πάνελ κουβαλά το αποτύπωμα ενός τραγουδιού.',
      ],
    },
    soon: {
      en: 'The first painted absorbers are in the workshop. Follow us to see them first.',
      el: 'Τα πρώτα ζωγραφισμένα absorbers είναι στο εργαστήριο. Ακολούθησέ μας για να τα δεις πρώτος.',
    },
  },
  {
    slug: 'wall-pixel-art',
    hidden: true,
    cover: 'img/categories/wall-pixel-art.jpg',
    title: { en: 'Wall pixel art', el: 'Pixel art σε τοίχους' },
    kicker: { en: 'Murals', el: 'Τοιχογραφίες' },
    tagline: {
      en: 'Building facades where every brick is a pixel.',
      el: 'Προσόψεις κτιρίων όπου κάθε τούβλο είναι ένα pixel.',
    },
    intro: {
      en: [
        'A facade of bricks or tiles is already a grid. We treat each brick as a pixel and paint a large image across the whole building, readable from the street and from far away.',
      ],
      el: [
        'Μια πρόσοψη από τούβλα ή πλακάκια είναι ήδη ένας κάνναβος. Αντιμετωπίζουμε κάθε τούβλο σαν pixel και ζωγραφίζουμε μια μεγάλη εικόνα σε όλο το κτίριο, που διαβάζεται από τον δρόμο και από μακριά.',
      ],
    },
    soon: {
      en: 'Have a wall in mind? Tell us about it.',
      el: 'Έχεις κάποιον τοίχο στο μυαλό σου; Πες μας γι’ αυτόν.',
    },
  },
  {
    slug: 'ground-pixel-art',
    hidden: true,
    cover: 'img/categories/ground-pixel-art.jpg',
    title: { en: 'Ground pixel art', el: 'Pixel art σε δάπεδα' },
    kicker: { en: 'Pavements & squares', el: 'Πεζοδρόμια & πλατείες' },
    tagline: {
      en: 'Cobblestones and pavement tiles turned into pictures.',
      el: 'Κυβόλιθοι και πλάκες πεζοδρομίου που γίνονται εικόνες.',
    },
    intro: {
      en: [
        'Cobblestones and the squares of pavement slabs form a natural pixel grid underfoot. Coloured in the right order, a courtyard, a square or a walkway becomes a picture you walk on.',
      ],
      el: [
        'Οι κυβόλιθοι και τα τετραγωνάκια από τις πλάκες πεζοδρομίου σχηματίζουν έναν φυσικό κάνναβο από pixels κάτω από τα πόδια μας. Χρωματισμένα με τη σωστή σειρά, μια αυλή, μια πλατεία ή ένας πεζόδρομος γίνεται εικόνα που την περπατάς.',
      ],
    },
    soon: {
      en: 'Have a courtyard or a square in mind? Tell us about it.',
      el: 'Έχεις μια αυλή ή πλατεία στο μυαλό σου; Πες μας γι’ αυτήν.',
    },
  },
];

// Non-category pages: the menu and the home page link to these.
export const pages = {
  shop: {
    slug: 'shop',
    cover: null, // uses the first piece for sale
    title: { en: 'Buy your own', el: 'Απόκτησε το δικό σου' },
    menuTitle: { en: 'Products', el: 'Προϊόντα' },
    kicker: { en: 'Products', el: 'Προϊόντα' },
    tagline: {
      en: 'Pieces ready for your wall, or made to order in your colours.',
      el: 'Έργα έτοιμα για τον τοίχο σου, ή κατά παραγγελία στα δικά σου χρώματα.',
    },
    intro: {
      en: [
        'Every piece is made by hand. Some are ready to ship, or you can order a custom piece in the size and colours that fit your room.',
        'Send us a photo of the wall and a few words about the space, and we will propose a design.',
      ],
      el: [
        'Κάθε έργο φτιάχνεται στο χέρι. Κάποια είναι έτοιμα για αποστολή, αλλιώς μπορείς να παραγγείλεις ένα δικό σου, στο μέγεθος και στα χρώματα που ταιριάζουν στον χώρο σου.',
        'Στείλε μας μια φωτογραφία του τοίχου και δυο λόγια για τον χώρο, και θα σου προτείνουμε ένα σχέδιο.',
      ],
    },
    empty: {
      en: 'There are no pieces listed for sale right now. Custom orders are always open.',
      el: 'Δεν υπάρχουν έργα προς πώληση αυτή τη στιγμή. Οι παραγγελίες είναι πάντα ανοιχτές.',
    },
    cta: { en: 'Ask for a custom piece', el: 'Ζήτα ένα δικό σου έργο' },
  },
  howItWorks: {
    slug: 'how-it-works',
    cover: null, // drawn illustration
    title: { en: 'How sound diffusion and absorption work', el: 'Πώς λειτουργεί η διάχυση και η απορρόφηση του ήχου' },
    menuTitle: { en: 'How it works', el: 'Πώς λειτουργεί' },
    kicker: { en: 'A short guide', el: 'Ένας σύντομος οδηγός' },
    tagline: {
      en: 'Why a room sounds the way it does, and what panels on the wall actually do.',
      el: 'Γιατί ένα δωμάτιο ακούγεται όπως ακούγεται, και τι κάνουν πραγματικά τα πάνελ στον τοίχο.',
    },
  },
  pastWork: {
    slug: 'past-work',
    title: { en: 'Past work', el: 'Παλιότερες δουλειές' },
    menuTitle: { en: 'Past work', el: 'Παλιότερες δουλειές' },
    kicker: { en: 'Archive', el: 'Αρχείο' },
    tagline: {
      en: 'Finished pieces from earlier years.',
      el: 'Τελειωμένα έργα από τα προηγούμενα χρόνια.',
    },
    empty: { en: 'Photos coming soon.', el: 'Οι φωτογραφίες έρχονται σύντομα.' },
  },
  contact: {
    slug: 'contact',
    title: { en: 'Contact', el: 'Επικοινωνία' },
    menuTitle: { en: 'Contact', el: 'Επικοινωνία' },
    kicker: { en: 'Say hello', el: 'Γράψε μας' },
    tagline: {
      en: 'Commissions, questions, a wall you would like to transform.',
      el: 'Παραγγελίες, ερωτήσεις, ένας τοίχος που θα ήθελες να μεταμορφώσεις.',
    },
    intro: {
      en: 'The quickest way to reach us is a message on Instagram or Facebook. Send a photo of your space and we will get back to you.',
      el: 'Ο πιο γρήγορος τρόπος να μας βρεις είναι ένα μήνυμα στο Instagram ή στο Facebook. Στείλε μια φωτογραφία του χώρου σου και θα σου απαντήσουμε.',
    },
  },
};

export const home = {
  en: {
    title: 'Colour you can hear',
    lead: '10pm crafts makes wooden acoustic panels that look like art. Each diffuser is built block by block and painted by hand, to make your room sound better and look better.',
    cta: 'See the diffusers',
    secondary: 'How it works',
    metaDescription: 'Colourful handmade wooden acoustic diffusers, painted absorber panels and pixel art murals, from Greece.',
  },
  el: {
    title: 'Χρώμα που ακούγεται',
    lead: 'Το 10pm crafts φτιάχνει ξύλινα ακουστικά πάνελ που μοιάζουν με έργα τέχνης. Κάθε diffuser χτίζεται κυβάκι κυβάκι και βάφεται στο χέρι, για να ακούγεται καλύτερα ο χώρος σου και να δείχνει ομορφότερος.',
    cta: 'Δες τους diffusers',
    secondary: 'Πώς λειτουργεί',
    metaDescription: 'Χειροποίητοι, χρωματιστοί ξύλινοι ακουστικοί διαχυτές, ζωγραφισμένα πάνελ απορρόφησης και pixel art τοιχογραφίες, από την Ελλάδα.',
  },
};

// The "how it works" article. Each section: heading, paragraphs, optional figure key.
export const guide = {
  en: [
    {
      h: 'Sound bounces',
      figure: 'reflection',
      p: [
        'In an empty room with hard walls, sound bounces from surface to surface many times before it fades. You hear the direct sound from the speaker or the voice, and then a crowd of reflections arriving a few milliseconds later.',
        'Too many strong reflections cause the familiar problems: a clap that rings like a metallic "flutter", speech that gets muddy, music that loses detail, a home studio where mixes never sound right anywhere else.',
        'There are two ways to deal with a reflection: break it up and spread it around (diffusion), or take its energy away (absorption).',
      ],
    },
    {
      h: 'Diffusion: spreading energy around',
      figure: 'diffusion',
      p: [
        'A diffuser does not remove sound. It keeps the energy in the room but changes its shape: instead of one strong mirror-like reflection, you get many weak ones spreading in all directions and arriving at slightly different times.',
        'This tames the strong reflections that boost some frequencies and cancel out others when they meet the direct sound. The room keeps its life, and you hear the music the way it was played.',
      ],
    },
    {
      h: 'Absorption: taking energy away',
      figure: 'absorption',
      p: [
        'An absorber is a porous material, such as mineral wool, foam or felt, usually covered with fabric. Sound waves travel into it and make the air move through millions of tiny fibres and pockets. That friction turns a small part of the sound into heat, so less comes back out.',
        'Thickness matters. A thin panel only catches high frequencies. Around 5 cm of material works well from the upper mids up; 10 cm, or a panel mounted with an air gap behind it, reaches lower. Deep bass needs much thicker "bass traps", usually in the corners.',
        'Absorbers are the right tool to shorten reverberation, to treat the first reflection points beside and above a listening position, and to calm noisy rooms like restaurants or offices. Too much absorption, though, makes a room sound dead and boxy.',
      ],
    },
    {
      h: 'Using them together',
      figure: 'room',
      p: [
        'Most good-sounding rooms use both. A simple recipe for a listening room or home studio:',
      ],
      list: [
        'Diffusers on the back wall behind the listener, so the room stays lively and spacious without slapback echo.',
        'Absorbers at the first reflection points on the side walls and ceiling, so the stereo image stays sharp.',
        'Bass traps in the corners if low frequencies boom.',
        'Bare parallel walls are the first place to treat: that is where flutter echo lives.',
      ],
      after: [
        'In living rooms, restaurants and offices the same idea applies: a little absorption to lower the noise, a little diffusion to keep the space natural.',
      ],
    },
  ],
  el: [
    {
      h: 'Ο ήχος αναπηδά',
      figure: 'reflection',
      p: [
        'Σε ένα άδειο δωμάτιο με σκληρούς τοίχους, ο ήχος αναπηδά από επιφάνεια σε επιφάνεια πολλές φορές πριν σβήσει. Ακούς τον απευθείας ήχο από το ηχείο ή τη φωνή, και αμέσως μετά ένα πλήθος από ανακλάσεις που φτάνουν λίγα χιλιοστά του δευτερολέπτου αργότερα.',
        'Πολλές δυνατές ανακλάσεις φέρνουν τα γνωστά προβλήματα: ένα παλαμάκι που «κουδουνίζει» μεταλλικά (flutter echo), ομιλία που θολώνει, μουσική που χάνει λεπτομέρεια, ένα home studio όπου οι μίξεις δεν ακούγονται ποτέ σωστά αλλού.',
        'Υπάρχουν δύο τρόποι να αντιμετωπίσεις μια ανάκλαση: να τη σπάσεις και να την απλώσεις στον χώρο (διάχυση), ή να της πάρεις ενέργεια (απορρόφηση).',
      ],
    },
    {
      h: 'Διάχυση: απλώνοντας την ενέργεια',
      figure: 'diffusion',
      p: [
        'Ένας διαχυτής (diffuser) δεν αφαιρεί ήχο. Κρατά την ενέργεια μέσα στον χώρο αλλά αλλάζει το σχήμα της: αντί για μία δυνατή ανάκλαση σαν από καθρέφτη, παίρνεις πολλές αδύναμες που απλώνονται προς όλες τις κατευθύνσεις και φτάνουν σε ελαφρώς διαφορετικούς χρόνους.',
        'Έτσι περιορίζονται οι δυνατές ανακλάσεις που, όταν συναντούν τον απευθείας ήχο, ενισχύουν κάποιες συχνότητες και εξουδετερώνουν κάποιες άλλες. Ο χώρος μένει ζωντανός και ακούς τη μουσική όπως παίχτηκε.',
      ],
    },
    {
      h: 'Απορρόφηση: αφαιρώντας ενέργεια',
      figure: 'absorption',
      p: [
        'Ένας απορροφητής (absorber) είναι ένα πορώδες υλικό, όπως πετροβάμβακας, αφρώδες ή τσόχα, συνήθως ντυμένο με ύφασμα. Τα ηχητικά κύματα μπαίνουν μέσα του και κάνουν τον αέρα να κινείται ανάμεσα σε εκατομμύρια μικρές ίνες και πόρους. Αυτή η τριβή μετατρέπει ένα μέρος του ήχου σε θερμότητα, άρα επιστρέφει λιγότερος.',
        'Το πάχος μετράει. Ένα λεπτό πάνελ πιάνει μόνο τις ψηλές συχνότητες. Περίπου 5 εκ. υλικού δουλεύουν καλά από τις ψηλές μεσαίες και πάνω· 10 εκ., ή ένα πάνελ τοποθετημένο με κενό αέρα από πίσω, φτάνουν χαμηλότερα. Τα βαθιά μπάσα θέλουν πολύ πιο χοντρές «παγίδες μπάσων» (bass traps), συνήθως στις γωνίες.',
        'Οι απορροφητές είναι το σωστό εργαλείο για να μειώσεις την αντήχηση, να καλύψεις τα σημεία πρώτης ανάκλασης δίπλα και πάνω από τη θέση ακρόασης, και να ηρεμήσεις θορυβώδεις χώρους όπως εστιατόρια ή γραφεία. Η υπερβολική απορρόφηση όμως κάνει το δωμάτιο να ακούγεται «νεκρό» και κουτί.',
      ],
    },
    {
      h: 'Μαζί, για καλύτερο αποτέλεσμα',
      figure: 'room',
      p: [
        'Τα περισσότερα δωμάτια που ακούγονται καλά χρησιμοποιούν και τα δύο. Μια απλή συνταγή για δωμάτιο ακρόασης ή home studio:',
      ],
      list: [
        'Διαχυτές στον πίσω τοίχο, πίσω από τον ακροατή, ώστε ο χώρος να μένει ζωντανός και ευρύχωρος χωρίς ηχώ.',
        'Απορροφητές στα σημεία πρώτης ανάκλασης στους πλαϊνούς τοίχους και στο ταβάνι, ώστε η στερεοφωνική εικόνα να μένει καθαρή.',
        'Bass traps στις γωνίες αν τα μπάσα «βουίζουν».',
        'Οι γυμνοί παράλληλοι τοίχοι είναι το πρώτο σημείο που θέλει φροντίδα: εκεί γεννιέται το flutter echo.',
      ],
      after: [
        'Σε σαλόνια, εστιατόρια και γραφεία ισχύει η ίδια λογική: λίγη απορρόφηση για να πέσει ο θόρυβος, λίγη διάχυση για να μείνει ο χώρος φυσικός.',
      ],
    },
  ],
};
