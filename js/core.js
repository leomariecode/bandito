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

// ---------- Fausses réponses des QCM ----------
const ES_ART = /^(el|la|los|las|un|una|unos|unas)\s+/i;
const FR_ART = /^(?:(le|la|les|un|une|des)\s+|(l)')/i;
// Nature du mot : verb, noun, adj, other (petits mots), expr, ou any si on ne sait pas.
function catOf(w) {
  if (w.cat) return w.cat;
  const base = VOCAB.find(b => b.id === w.id);
  if (base && base.cat) return base.cat;
  const es = variants(w.es)[0] || '', fr = variants(w.fr)[0] || '';
  if (/^[¿¡]/.test(es)) return 'expr';
  if (ES_ART.test(es)) return 'noun';
  if (/^\S+(ar|er|ir|ír)(se)?$/i.test(es) && /(er|ir|re)$/i.test(fr)) return 'verb';
  if (/o\/a$/i.test(w.es.trim())) return 'adj';
  if (/\s/.test(es)) return 'expr';
  return 'any';
}
function nounStyle(text, lang) {
  const m = text.match(lang === 'es' ? ES_ART : FR_ART);
  if (!m) return { art: 'none', pl: false };
  const a = (m[1] || m[2]).toLowerCase();
  return { art: /^(un|una|une|unos|unas|des)$/.test(a) ? 'indef' : 'def', pl: /^(los|las|les|unos|unas|des)$/.test(a) };
}
const NO_PLURAL = ['fe', 'dinero', 'leche', 'carne', 'gente', 'lluvia', 'foi', 'argent', 'lait', 'viande', 'foule', 'pluie'];
// Met un nom de la banque à la même forme que la bonne réponse (article, pluriel). null si pluriel incertain.
function nounForm(n, lang, style) {
  let word = lang === 'es' ? n.es : n.fr;
  const fem = (lang === 'es' ? n.eg : n.fg) === 'f';
  if (style.pl) {
    if (/[\s-]/.test(word) || NO_PLURAL.includes(word)) return null;
    if (lang === 'es') { if (!/[aeo]$/.test(word)) return null; }
    else if (/(s|x|z|al|ail|au|eu|œil)$/.test(word)) return null;
    word += 's';
  }
  if (style.art === 'none') return word;
  let art;
  if (lang === 'es') {
    art = style.art === 'def' ? (style.pl ? (fem ? 'las' : 'los') : (fem ? 'la' : 'el')) : (style.pl ? (fem ? 'unas' : 'unos') : (fem ? 'una' : 'un'));
  } else if (style.art === 'def') {
    if (style.pl) art = 'les';
    else if (/^[aeiouyhàâéèêîôûœ]/i.test(word)) return "l'" + word;
    else art = fem ? 'la' : 'le';
  } else art = style.pl ? 'des' : (fem ? 'une' : 'un');
  return art + ' ' + word;
}
function simScore(a, b) {
  a = stripAccents(coreText(a)); b = stripAccents(coreText(b));
  let s = levenshtein(a, b) / Math.max(a.length, b.length, 1);
  if (a[0] === b[0]) s -= 0.15;
  if (a.slice(-2) === b.slice(-2)) s -= 0.1;
  return s;
}
/* Renvoie { correct, wrong[] } : la bonne réponse sous sa forme courte et n fausses réponses
   de même nature, tirées de la banque et des mots de l'utilisateur, en privilégiant celles qui ressemblent. */
function qcmChoices(word, toEs, n) {
  const side = toEs ? 'es' : 'fr', other = toEs ? 'fr' : 'es';
  const target = word[side], correct = variants(target)[0] || target;
  const cat = catOf(word);
  const style = nounStyle(correct, side);
  let cands = [];
  const cats = cat === 'any' ? Object.keys(BANK) : [cat];
  cats.forEach(c => (BANK[c] || []).forEach(b => {
    const text = c === 'noun' ? nounForm(b, side, cat === 'noun' ? style : { art: 'none', pl: false }) : variants(b[side])[0];
    if (text) cands.push({ text, tr: b[other] });
  }));
  S.words.forEach(w => {
    if (w.id === word.id || (cat !== 'any' && catOf(w) !== cat)) return;
    const text = variants(w[side])[0];
    if (!text) return;
    if (cat === 'noun') { const st = nounStyle(text, side); if (st.art !== style.art || st.pl !== style.pl) return; }
    cands.push({ text, tr: w[other] });
  });
  // Écarte les synonymes : une proposition qui serait elle-même une bonne réponse.
  const seen = new Set([coreText(correct)]);
  cands = cands.filter(c => {
    const k = coreText(c.text);
    if (seen.has(k)) return false;
    if (checkAnswer(c.text, [target, word[side + 'Alt']]).ok) return false;
    if (variants(c.tr).some(v => checkAnswer(v, [word[other], word[other + 'Alt']]).ok)) return false;
    seen.add(k);
    return true;
  });
  // Une question ne se mélange pas avec des non-questions : ça se repérerait d'un coup d'œil.
  const isQ = t => /^¿|\?\s*$/.test(t);
  const sameShape = cands.filter(x => isQ(x.text) === isQ(correct));
  if (sameShape.length >= n) cands = sameShape;
  cands.sort((a, b) => simScore(a.text, correct) - simScore(b.text, correct));
  // 2 parmi les plus ressemblantes, le reste parmi les suivantes : proche, mais pas toujours les mêmes.
  const near = shuffle(cands.slice(0, 6)), far = shuffle(cands.slice(6, 30));
  const wrong = near.slice(0, Math.min(2, n)).concat(far).concat(near.slice(2)).slice(0, n).map(c => c.text);
  return { correct, wrong };
}

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
