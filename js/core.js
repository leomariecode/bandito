/* Moteur : utilitaires, vérification des réponses, sauvegarde, répétition espacée, conjugaison. */

// ---------- Utilitaires ----------
function today() {
  const d = new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Vérification des réponses ----------
function stripAccents(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function cleanText(s) {
  return String(s).toLowerCase().replace(/[’`´]/g, "'").replace(/[¿?¡!.,;:…"«»]/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}
const ARTICLE = /^(?:(?:un|una|unos|unas|el|la|los|las|le|les|une|des|du)\s+|l'\s*)/;
// Forme comparée : minuscules, sans ponctuation, sans article initial.
function coreText(s) {
  const c = cleanText(s);
  return c.replace(ARTICLE, '') || c;
}
// "amarillo/a" -> amarillo, amarilla ; "ouvert(e)" -> ouvert, ouverte ; "vouloir / aimer" -> les deux.
function variants(str) {
  const out = [];
  let prev = null;
  String(str || '').split('/').forEach(raw => {
    let p = raw.trim();
    if (!p) return;
    if (prev && /^(a|as)$/i.test(p) && /os?$/i.test(prev)) {
      p = prev.replace(/os?$/i, m => (m.length === 2 ? 'as' : 'a'));
    } else {
      prev = p;
    }
    out.push(p.replace(/\s*\([^)]*\)/g, '').trim());
    if (/\S\(/.test(p)) out.push(p.replace(/[()]/g, ''));
  });
  return out.filter(Boolean);
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
/* targets : chaînes affichables (peuvent contenir des variantes avec "/").
   Renvoie { ok, accent } : accent = juste aux accents près ; near = faux mais à une lettre près. */
function checkAnswer(input, targets, opts) {
  let inp = coreText(input);
  if (opts && opts.stripPronoun) {
    inp = cleanText(input).replace(/^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes)\s+/, '');
  }
  if (!inp) return { ok: false };
  const all = [];
  targets.filter(Boolean).forEach(t => variants(t).forEach(v => all.push(opts && opts.stripPronoun ? cleanText(v) : coreText(v))));
  if (all.includes(inp)) return { ok: true };
  const flat = stripAccents(inp);
  if (all.some(v => stripAccents(v) === flat)) return { ok: true, accent: true };
  const near = all.some(v => v.length >= 4 && levenshtein(stripAccents(v), flat) === 1);
  return { ok: false, near };
}

// ---------- Sauvegarde ----------
const STORE_KEY = 'bandito.v1';
let S = null;
let memoryOnly = false;

function loadState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { memoryOnly = true; }
  S = Object.assign({
    words: [], seeded: [], cards: {}, conj: {}, days: {},
    settings: { newPerDay: 10 }, newDay: { day: 0, n: 0 },
  }, saved || {});
  // Importe les mots de base pas encore vus (les mots supprimés par l'utilisateur ne reviennent pas).
  VOCAB.forEach(w => {
    if (!S.seeded.includes(w.id)) { S.words.push(Object.assign({}, w)); S.seeded.push(w.id); }
  });
  saveState();
  return S;
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; }
}

// ---------- Vocabulaire & répétition espacée ----------
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64]; // jours avant la prochaine révision, par niveau
const MASTERED_BOX = 4;

function cardOf(id) { return S.cards[id] || { box: 0, due: 0, ok: 0, ko: 0 }; }
function wordStatus(id) {
  const b = cardOf(id).box;
  return b === 0 ? 'nouveau' : b >= MASTERED_BOX ? 'maîtrisé' : 'en cours';
}
function dueWords() {
  const t = today();
  return S.words.filter(w => { const c = cardOf(w.id); return c.box > 0 && c.due <= t; });
}
function newWords() { return S.words.filter(w => cardOf(w.id).box === 0); }
function newQuota() {
  if (S.newDay.day !== today()) S.newDay = { day: today(), n: 0 };
  return Math.max(0, S.settings.newPerDay - S.newDay.n);
}
function logDay(ok) {
  const t = today();
  const d = S.days[t] || (S.days[t] = { n: 0, ok: 0 });
  d.n++; if (ok) d.ok++;
}
// srs = true : la réponse fait avancer/reculer le mot dans le calendrier de révision.
function gradeWord(id, ok, srs) {
  const c = S.cards[id] || (S.cards[id] = { box: 0, due: 0, ok: 0, ko: 0 });
  if (ok) c.ok++; else c.ko++;
  if (srs) {
    if (c.box === 0) { newQuota(); S.newDay.n++; }
    c.box = ok ? Math.min(c.box + 1, INTERVALS.length - 1) : 1;
    c.due = today() + INTERVALS[c.box];
  }
  logDay(ok);
  saveState();
}
function nextDueLabel(id) {
  const c = cardOf(id);
  if (c.box === 0) return '—';
  const d = c.due - today();
  return d <= 0 ? "aujourd'hui" : d === 1 ? 'demain' : 'dans ' + d + ' j';
}
function addWord(w) {
  const word = { id: 'u-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), list: w.list || 'Mes ajouts', es: w.es, fr: w.fr, note: w.note || '' };
  S.words.push(word); saveState();
  return word;
}
function updateWord(id, w) {
  const word = S.words.find(x => x.id === id);
  if (!word) return;
  // Si la traduction change, les variantes cachées d'origine ne sont plus fiables.
  if (word.es !== w.es) delete word.esAlt;
  if (word.fr !== w.fr) delete word.frAlt;
  Object.assign(word, { es: w.es, fr: w.fr, list: w.list || word.list, note: w.note || '' });
  saveState();
}
function deleteWord(id) {
  S.words = S.words.filter(x => x.id !== id);
  delete S.cards[id];
  saveState();
}
function listNames() { return [...new Set(S.words.map(w => w.list))]; }

// ---------- Conjugaison ----------
function conjugate(v, tense) {
  const inf = v.inf, grp = inf.slice(-2), stem = inf.slice(0, -2);
  if (tense === 'futuro') {
    const s = typeof v.futuro === 'string' ? v.futuro : inf;
    return { irregular: !!v.futuro, forms: ENDINGS.futuro.map(e => s + e), parts: ENDINGS.futuro.map(e => [s, e]) };
  }
  if (Array.isArray(v[tense])) return { irregular: true, forms: v[tense].slice(), parts: v[tense].map(f => [f, '']) };
  const ends = ENDINGS[tense][grp];
  return { irregular: false, forms: ends.map(e => stem + e), parts: ends.map(e => [stem, e]) };
}
function verbByInf(inf) { return VERBS.find(v => v.inf === inf); }
// filter : 'all' | 'reg' | 'irr' (régularité dans le temps demandé)
function verbsFor(tense, filter) {
  return VERBS.filter(v => {
    const irr = conjugate(v, tense).irregular;
    return filter === 'all' || (filter === 'irr') === irr;
  });
}
function gradeConj(tense, inf, ok) {
  const t = S.conj[tense] || (S.conj[tense] = { ok: 0, ko: 0, verbs: {} });
  const v = t.verbs[inf] || (t.verbs[inf] = { ok: 0, ko: 0 });
  if (ok) { t.ok++; v.ok++; } else { t.ko++; v.ko++; }
  logDay(ok);
  saveState();
}

if (typeof module !== 'undefined') {
  module.exports = { today, shuffle, pick, esc, stripAccents, cleanText, coreText, variants, levenshtein, checkAnswer, conjugate, verbsFor };
}
