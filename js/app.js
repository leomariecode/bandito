/* Interface : routeur, tableau de bord, vocabulaire, conjugaison, moteur de quiz. */

const app = document.getElementById('app');
let keyHandler = null;
document.addEventListener('keydown', e => { if (keyHandler) keyHandler(e); });

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];
const ui = {
  daily: { mode: 'adapt' },
  free: { list: '', count: '10', mode: 'adapt', dir: 'mix' },
  words: { q: '', list: '' },
  conj: { tab: 'rappel', filter: 'all', count: '10' },
};

// ---------- Petits helpers d'affichage ----------
function seg(name, value, options) {
  return `<div class="seg" data-seg="${name}">${options.map(([v, label]) =>
    `<button type="button" data-v="${v}" class="${v === value ? 'on' : ''}">${label}</button>`).join('')}</div>`;
}
function bindSegs(root, target, after) {
  root.querySelectorAll('[data-seg]').forEach(el => {
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      target[el.dataset.seg] = b.dataset.v;
      el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (after) after();
    });
  });
}
function pct(ok, ko) { return ok + ko ? Math.round(100 * ok / (ok + ko)) + ' %' : '—'; }
function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }
function accentBar() {
  return `<div class="accents" aria-label="Caractères espagnols">${ACCENTS.map(c => `<button type="button" tabindex="-1" data-char="${c}">${c}</button>`).join('')}</div>`;
}
// Insère le caractère dans le champ visé sans lui faire perdre le focus.
function bindAccents(root, getInput) {
  const bar = root.querySelector('.accents');
  if (!bar) return;
  bar.addEventListener('mousedown', e => e.preventDefault());
  bar.addEventListener('click', e => {
    const b = e.target.closest('button');
    const input = getInput();
    if (!b || !input || input.disabled) return;
    const s = input.selectionStart, en = input.selectionEnd;
    input.value = input.value.slice(0, s) + b.dataset.char + input.value.slice(en);
    input.focus();
    input.setSelectionRange(s + 1, s + 1);
  });
}

// ---------- Routeur ----------
function router() {
  keyHandler = null;
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  let nav = 'home';
  if (parts[0] === 'vocab') { nav = 'vocab'; viewVocab(); }
  else if (parts[0] === 'conj' && TENSES[parts[1]]) { nav = parts[1]; viewConj(parts[1]); }
  else viewHome();
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', router);

// ---------- Accueil ----------
function dailyCounts() {
  const due = dueWords().length;
  const fresh = Math.min(newWords().length, newQuota());
  return { due, fresh, total: due + fresh };
}
function dailyCard() {
  const d = dailyCounts();
  const remainingNew = newWords().length;
  if (!d.total) {
    return `<section class="card hero"><h2>Révision du jour</h2>
      <p>✓ Tout est à jour. ${remainingNew ? `Il reste ${plural(remainingNew, 'nouveau mot', 'nouveaux mots')} pour demain.` : 'Reviens demain pour consolider.'}</p>
      <p class="muted">Tu peux quand même t'entraîner librement dans l'onglet Vocabulaire ou faire de la conjugaison.</p></section>`;
  }
  const bits = [];
  if (d.due) bits.push(`<strong>${plural(d.due, 'mot', 'mots')}</strong> à réviser`);
  if (d.fresh) bits.push(`<strong>${plural(d.fresh, 'nouveau mot', 'nouveaux mots')}</strong> à découvrir`);
  return `<section class="card hero"><div class="row between">
      <div class="grow"><h2>Révision du jour</h2><p>${bits.join(' et ')}.</p></div>
      <button class="btn primary" data-act="daily">Commencer →</button>
    </div></section>`;
}
function weakWords(n) {
  return S.words.map(w => ({ w, c: cardOf(w.id) })).filter(x => x.c.ko > 0)
    .sort((a, b) => (b.c.ko / (b.c.ok + b.c.ko)) - (a.c.ko / (a.c.ok + a.c.ko)) || b.c.ko - a.c.ko).slice(0, n);
}
function viewHome() {
  const total = S.words.length;
  const counts = { 'nouveau': 0, 'en cours': 0, 'maîtrisé': 0 };
  let ok = 0, ko = 0;
  S.words.forEach(w => { counts[wordStatus(w.id)]++; const c = cardOf(w.id); ok += c.ok; ko += c.ko; });
  const t = today();
  const todayN = (S.days[t] || { n: 0 }).n;
  const weak = weakWords(5);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''), n: (S.days[t - i] || { n: 0 }).n });
  }
  const max = Math.max(1, ...days.map(d => d.n));

  app.innerHTML = `
    <h1>¡Hola!</h1>
    <p class="lead">Un peu chaque jour vaut mieux que beaucoup d'un coup.</p>
    ${memoryOnly ? '<div class="banner">⚠ Ton navigateur bloque la sauvegarde locale : ta progression ne sera pas conservée à la fermeture de la page.</div>' : ''}
    ${dailyCard()}
    <div class="tiles">
      <div class="tile"><div class="num">${total}</div><div class="lbl">mots au total</div></div>
      <div class="tile"><div class="num">${counts['maîtrisé']}</div><div class="lbl">maîtrisés</div></div>
      <div class="tile"><div class="num">${pct(ok, ko)}</div><div class="lbl">réussite en vocabulaire</div></div>
      <div class="tile"><div class="num">${todayN}</div><div class="lbl">réponses aujourd'hui</div></div>
    </div>
    <section class="card">
      <h2>Progression du vocabulaire</h2>
      <div class="stack" role="img" aria-label="${counts['maîtrisé']} maîtrisés, ${counts['en cours']} en cours, ${counts['nouveau']} nouveaux">
        <i class="s-ok" style="width:${total ? 100 * counts['maîtrisé'] / total : 0}%"></i>
        <i class="s-mid" style="width:${total ? 100 * counts['en cours'] / total : 0}%"></i>
      </div>
      <div class="legend">
        <span><b style="background:var(--ok)"></b>${counts['maîtrisé']} maîtrisés</span>
        <span><b style="background:var(--gold)"></b>${counts['en cours']} en cours</span>
        <span><b style="background:var(--line)"></b>${counts['nouveau']} pas encore vus</span>
      </div>
    </section>
    <section class="card">
      <div class="row between"><h2>Points faibles</h2>
        ${weak.length ? '<button class="btn small" data-act="weak">Travailler ces mots</button>' : ''}</div>
      ${weak.length ? `<ul class="weak">${weak.map(x => `<li><span><span class="es">${esc(x.w.es)}</span> <span class="fr">— ${esc(x.w.fr)}</span></span>
        <span class="muted">${plural(x.c.ko, 'erreur', 'erreurs')}</span></li>`).join('')}</ul>`
      : '<p class="muted">Pas encore d\'erreur enregistrée. Les mots qui te posent problème apparaîtront ici.</p>'}
    </section>
    <h2>Conjugaison</h2>
    <div class="tiles">
      ${Object.values(TENSES).map(tn => {
        const c = S.conj[tn.key] || { ok: 0, ko: 0 };
        return `<a class="tile" href="#/conj/${tn.key}"><div class="name">${tn.name}</div>
          <div class="num">${pct(c.ok, c.ko)}</div><div class="lbl">${c.ok + c.ko ? plural(c.ok + c.ko, 'réponse', 'réponses') : 'pas encore commencé'}</div></a>`;
      }).join('')}
    </div>
    <section class="card">
      <h2>Activité des 7 derniers jours</h2>
      <div class="bars">${days.map(d => `<div><span>${d.n || ''}</span><i class="${d.n ? '' : 'zero'}" style="height:${d.n ? Math.max(6, 100 * d.n / max) : 0}%"></i><span>${d.label}</span></div>`).join('')}</div>
    </section>`;

  app.onclick = e => {
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'daily') startDaily();
    if (act.dataset.act === 'weak') startVocabQuiz(weakWords(10).map(x => x.w), { mode: 'input', dir: 'mix', srs: false, title: 'Points faibles' });
  };
}

// ---------- Vocabulaire ----------
function buildVocabQ(word, o) {
  const dir = o.dir === 'mix' ? (Math.random() < 0.5 ? 'fr-es' : 'es-fr') : o.dir;
  const toEs = dir === 'fr-es';
  const target = toEs ? word.es : word.fr;
  const alt = toEs ? word.esAlt : word.frAlt;
  let type = o.mode === 'adapt' ? (cardOf(word.id).box === 0 ? 'qcm' : 'input') : o.mode;
  let choices = null;
  if (type === 'qcm') {
    const others = [...new Set(S.words.filter(w => w.id !== word.id).map(w => (toEs ? w.es : w.fr)))].filter(x => x !== target);
    if (others.length < 3) type = 'input';
    else choices = shuffle([target, ...shuffle(others).slice(0, 3)]);
  }
  return {
    type, choices, lang: toEs ? 'es' : 'fr',
    label: toEs ? 'Traduis en espagnol' : 'Traduis en français',
    prompt: toEs ? word.fr : word.es,
    answer: target, note: word.note,
    recap: `${word.es} — ${word.fr}`,
    check: input => checkAnswer(input, [target, alt]),
    grade: ok => gradeWord(word.id, ok, o.srs),
  };
}
function startVocabQuiz(words, o) {
  if (!words.length) return;
  runQuiz({
    title: o.title,
    questions: words.map(w => buildVocabQ(w, o)),
    again: o.again,
  });
}
function startDaily() {
  const words = shuffle(dueWords().concat(newWords().slice(0, newQuota())));
  startVocabQuiz(words, { mode: ui.daily.mode, dir: 'mix', srs: true, title: 'Révision du jour' });
}
function startFree() {
  const f = ui.free;
  let words = shuffle(S.words.filter(w => !f.list || w.list === f.list));
  if (f.count !== 'all') words = words.slice(0, +f.count);
  startVocabQuiz(words, { mode: f.mode, dir: f.dir, srs: false, title: 'Entraînement libre', again: startFree });
}

function wordsRows() {
  const q = stripAccents(ui.words.q.toLowerCase());
  const rows = S.words.filter(w => (!ui.words.list || w.list === ui.words.list) &&
    (!q || stripAccents((w.es + ' ' + w.fr).toLowerCase()).includes(q)));
  if (!rows.length) return '<tr><td colspan="5" class="muted">Aucun mot ne correspond.</td></tr>';
  return rows.map(w => {
    const st = wordStatus(w.id);
    return `<tr>
      <td><span class="es">${esc(w.es)}</span>${w.note ? `<span class="note">${esc(w.note)}</span>` : ''}</td>
      <td>${esc(w.fr)}</td>
      <td class="hide-sm"><span class="badge ${st === 'maîtrisé' ? 'ok' : st === 'en cours' ? 'mid' : ''}">${st}</span></td>
      <td class="hide-sm muted">${nextDueLabel(w.id)}</td>
      <td class="actions"><button class="btn small ghost" data-edit="${w.id}" aria-label="Modifier ${esc(w.es)}">✎</button><button class="btn small ghost" data-del="${w.id}" aria-label="Supprimer ${esc(w.es)}">✕</button></td>
    </tr>`;
  }).join('');
}
function viewVocab() {
  const lists = listNames();
  const d = dailyCounts();
  const listOpts = cur => `<option value="">Toutes les listes</option>${lists.map(l => `<option ${l === cur ? 'selected' : ''}>${esc(l)}</option>`).join('')}`;
  app.innerHTML = `
    <h1>Vocabulaire</h1>
    <p class="lead">${plural(S.words.length, 'mot', 'mots')} · les mots ratés reviennent vite, les mots sus s'espacent (1, 2, 4, 8, 16… jours).</p>
    <section class="card hero">
      <h2>Révision du jour</h2>
      <p>${d.total ? `${d.due ? `<strong>${plural(d.due, 'mot', 'mots')}</strong> à réviser` : ''}${d.due && d.fresh ? ' et ' : ''}${d.fresh ? `<strong>${plural(d.fresh, 'nouveau mot', 'nouveaux mots')}</strong> à découvrir` : ''}.`
        : '✓ Tout est à jour pour aujourd\'hui.'}</p>
      <div class="opts">
        <div class="field">Exercice ${seg('mode', ui.daily.mode, [['adapt', 'Adaptatif'], ['qcm', 'QCM'], ['input', 'Saisie']])}</div>
        <label class="field">Nouveaux mots par jour
          <select id="new-per-day">${[5, 10, 15, 20].map(n => `<option ${n === S.settings.newPerDay ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      </div>
      <p class="muted" style="font-size:.88rem">Adaptatif : QCM pour découvrir un mot nouveau, puis saisie au clavier dès que tu l'as déjà vu.</p>
      <button class="btn primary" data-act="daily" ${d.total ? '' : 'disabled'}>Commencer →</button>
    </section>
    <section class="card" id="free">
      <h2>Entraînement libre</h2>
      <p class="muted">Pour t'entraîner autant que tu veux, sans modifier le calendrier de révision.</p>
      <div class="opts">
        <label class="field">Liste <select id="free-list">${listOpts(ui.free.list)}</select></label>
        <div class="field">Nombre de mots ${seg('count', ui.free.count, [['10', '10'], ['20', '20'], ['all', 'Tous']])}</div>
        <div class="field">Exercice ${seg('mode', ui.free.mode, [['adapt', 'Adaptatif'], ['qcm', 'QCM'], ['input', 'Saisie']])}</div>
        <div class="field">Sens ${seg('dir', ui.free.dir, [['mix', 'Les deux'], ['fr-es', 'FR → ES'], ['es-fr', 'ES → FR']])}</div>
      </div>
      <button class="btn" data-act="free">Lancer</button>
    </section>
    <section class="card">
      <div class="row between">
        <h2>Mes mots</h2>
        <button class="btn small primary" data-act="add">+ Ajouter un mot</button>
      </div>
      <div class="row" style="margin:.6rem 0">
        <input type="search" id="word-q" class="grow" placeholder="Rechercher…" value="${esc(ui.words.q)}" aria-label="Rechercher un mot">
        <select id="word-list" aria-label="Filtrer par liste">${listOpts(ui.words.list)}</select>
      </div>
      <div class="table-scroll"><table>
        <thead><tr><th>Espagnol</th><th>Français</th><th class="hide-sm">Niveau</th><th class="hide-sm">Révision</th><th></th></tr></thead>
        <tbody id="words-body">${wordsRows()}</tbody>
      </table></div>
    </section>
    <dialog id="word-dlg"><form method="dialog" id="word-form">
      <h2 id="dlg-title">Ajouter un mot</h2>
      <label class="field">Espagnol <input type="text" name="es" required autocomplete="off" autocapitalize="off" spellcheck="false" lang="es"></label>
      ${accentBar()}
      <label class="field">Français <input type="text" name="fr" required autocomplete="off" autocapitalize="off"></label>
      <label class="field">Liste <input type="text" name="list" list="lists" autocomplete="off"><datalist id="lists">${lists.map(l => `<option value="${esc(l)}">`).join('')}</datalist></label>
      <label class="field">Note (facultatif) <input type="text" name="note" autocomplete="off"></label>
      <p class="muted" style="font-size:.85rem;margin:0">Plusieurs réponses possibles ? Sépare-les par « / » : <em>vouloir / aimer</em>. Masculin/féminin : <em>rojo/a</em>.</p>
      <div class="row" style="justify-content:flex-end">
        <button type="button" class="btn ghost" data-act="cancel">Annuler</button>
        <button class="btn primary" value="ok">Enregistrer</button>
      </div>
    </form></dialog>`;

  const dlg = app.querySelector('#word-dlg'), form = app.querySelector('#word-form');
  let editing = null;
  bindSegs(app.querySelector('.hero'), ui.daily);
  bindSegs(app.querySelector('#free'), ui.free);
  bindAccents(dlg, () => form.elements.es);
  const refresh = () => { app.querySelector('#words-body').innerHTML = wordsRows(); };
  app.querySelector('#free-list').onchange = e => { ui.free.list = e.target.value; };
  app.querySelector('#new-per-day').onchange = e => { S.settings.newPerDay = +e.target.value; saveState(); viewVocab(); };
  app.querySelector('#word-q').oninput = e => { ui.words.q = e.target.value; refresh(); };
  app.querySelector('#word-list').onchange = e => { ui.words.list = e.target.value; refresh(); };

  function openDlg(word) {
    editing = word ? word.id : null;
    app.querySelector('#dlg-title').textContent = word ? 'Modifier le mot' : 'Ajouter un mot';
    form.elements.es.value = word ? word.es : '';
    form.elements.fr.value = word ? word.fr : '';
    form.elements.list.value = word ? word.list : (ui.words.list || 'Mes ajouts');
    form.elements.note.value = word ? (word.note || '') : '';
    dlg.showModal();
    form.elements.es.focus();
  }
  form.onsubmit = () => {
    const w = { es: form.elements.es.value.trim(), fr: form.elements.fr.value.trim(), list: form.elements.list.value.trim(), note: form.elements.note.value.trim() };
    if (!w.es || !w.fr) return;
    if (editing) updateWord(editing, w); else addWord(w);
    setTimeout(viewVocab, 0);
  };
  app.onclick = e => {
    const act = e.target.closest('[data-act]');
    const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (act) {
      if (act.dataset.act === 'daily') startDaily();
      if (act.dataset.act === 'free') startFree();
      if (act.dataset.act === 'add') openDlg(null);
      if (act.dataset.act === 'cancel') dlg.close();
    } else if (ed) {
      openDlg(S.words.find(w => w.id === ed.dataset.edit));
    } else if (del) {
      const w = S.words.find(x => x.id === del.dataset.del);
      if (w && confirm(`Supprimer « ${w.es} » et sa progression ?`)) { deleteWord(w.id); viewVocab(); }
    }
  };
}

// ---------- Moteur de quiz (vocabulaire et conjugaison) ----------
function runQuiz(cfg) {
  const total = cfg.questions.length;
  const queue = cfg.questions.slice();
  const missed = [];
  let done = 0, firstOk = 0, cur = null, answered = false;
  app.onclick = null;

  function next() {
    if (!queue.length) return finish();
    cur = queue.shift();
    answered = false;
    draw();
  }
  function draw() {
    const body = cur.type === 'qcm'
      ? `<div class="choices">${cur.choices.map((c, i) => `<button class="choice" data-i="${i}"><kbd>${i + 1}</kbd>${esc(c)}</button>`).join('')}</div>`
      : `<form class="answer-form" autocomplete="off">
          <input type="text" id="ans" aria-label="Ta réponse" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="${cur.lang}" placeholder="Ta réponse…">
          <button class="btn primary">Valider</button>
        </form>${cur.lang === 'es' ? accentBar() : ''}`;
    app.innerHTML = `
      <div class="quiz-top">
        <button class="btn ghost small" data-quit>✕ Quitter</button>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><div style="width:${100 * done / total}%"></div></div>
        <span class="count">${done} / ${total}</span>
      </div>
      <section class="card quiz">
        <p class="q-label">${esc(cur.label)}${cur.retry ? ' <span class="badge mid">à revoir</span>' : ''}</p>
        <p class="q-prompt">${esc(cur.prompt)}</p>
        ${cur.sub ? `<p class="q-sub">${esc(cur.sub)}</p>` : ''}
        ${cur.person ? `<p class="q-person">${esc(cur.person)}</p>` : ''}
        ${body}
        <div class="feedback" id="fb" aria-live="polite"></div>
        <div class="quiz-actions" id="qa">${cur.type === 'input' ? '<button class="btn ghost small" data-skip>Je ne sais pas</button>' : ''}</div>
        <p class="hint-keys">${cur.type === 'qcm' ? 'Touches 1 à 4 pour répondre · Entrée pour continuer' : 'Entrée pour valider, puis pour continuer'}</p>
      </section>`;
    const input = app.querySelector('#ans');
    if (input) {
      input.focus();
      bindAccents(app, () => input);
      app.querySelector('.answer-form').onsubmit = e => {
        e.preventDefault();
        if (!answered && input.value.trim()) answer(cur.check(input.value));
      };
    }
  }
  function answer(res, chosenIdx) {
    answered = true;
    const ok = res.ok;
    if (!cur.retry) {
      cur.grade(ok);
      if (ok) firstOk++; else missed.push(cur);
    }
    if (ok) done++;
    else {
      const again = Object.assign({}, cur, { retry: true });
      if (again.choices) again.choices = shuffle(again.choices);
      queue.splice(Math.min(queue.length, 3), 0, again);
    }
    const input = app.querySelector('#ans');
    if (input) { input.disabled = true; input.classList.add(ok ? 'good' : 'bad'); }
    app.querySelectorAll('.choice').forEach((b, i) => {
      b.disabled = true;
      if (cur.choices[i] === cur.answer) b.classList.add('good');
      else if (i === chosenIdx) b.classList.add('bad');
    });
    const note = cur.note ? `<div class="note">${esc(cur.note)}</div>` : '';
    app.querySelector('#fb').innerHTML = ok
      ? `<div class="fb ok"><div class="title">✓ Correct${res.accent ? ' — attention aux accents' : ''}</div>
          ${res.accent || cur.type === 'input' ? `<div class="sol">${esc(cur.answer)}</div>` : ''}${note}</div>`
      : `<div class="fb ko"><div class="title">✗ ${res.near ? 'Presque ! ' : ''}La bonne réponse :</div><div class="sol">${esc(cur.answer)}</div>${note}</div>`;
    app.querySelector('#qa').innerHTML = '<button class="btn primary" data-next>Continuer →</button>';
    app.querySelector('.progress div').style.width = (100 * done / total) + '%';
    app.querySelector('.count').textContent = `${done} / ${total}`;
  }
  function finish() {
    keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); router(); } };
    const ratio = total ? firstOk / total : 0;
    const msg = ratio === 1 ? '¡Perfecto!' : ratio >= 0.8 ? '¡Muy bien!' : ratio >= 0.5 ? '¡Bien! Ça rentre.' : '¡Ánimo! C\'est en se trompant qu\'on apprend.';
    app.innerHTML = `
      <section class="card quiz">
        <p class="q-label">${esc(cfg.title)} — terminé</p>
        <p class="score">${firstOk} / ${total}</p>
        <p class="q-sub">bonnes réponses du premier coup · ${msg}</p>
        <div class="quiz-actions">
          ${cfg.again ? '<button class="btn" data-again>Recommencer</button>' : ''}
          <button class="btn primary" data-quit>Terminer</button>
        </div>
      </section>
      ${missed.length ? `<section class="card" style="max-width:640px;margin:0 auto"><h2>À retravailler</h2>
        <ul class="weak">${missed.map(m => `<li><span>${esc(m.recap)}</span><span class="es">${m.recapAnswer ? esc(m.recapAnswer) : ''}</span></li>`).join('')}</ul></section>` : ''}`;
  }

  app.onclick = e => {
    if (e.target.closest('[data-quit]')) return router();
    if (e.target.closest('[data-again]')) return cfg.again();
    if (e.target.closest('[data-next]')) return next();
    if (e.target.closest('[data-skip]') && !answered) return answer({ ok: false });
    const ch = e.target.closest('.choice');
    if (ch && !answered) { const i = +ch.dataset.i; answer({ ok: cur.choices[i] === cur.answer }, i); }
  };
  keyHandler = e => {
    if (answered && e.key === 'Enter') { e.preventDefault(); next(); return; }
    if (!answered && cur && cur.type === 'qcm' && /^[1-4]$/.test(e.key)) {
      const i = +e.key - 1;
      if (cur.choices[i] !== undefined) answer({ ok: cur.choices[i] === cur.answer }, i);
    }
  };
  next();
}

// ---------- Conjugaison ----------
function formHtml(c, i) {
  const [stem, end] = c.parts[i];
  if (!c.irregular) return `${esc(stem)}<span class="end">${esc(end)}</span>`;
  return end ? `<span class="irr">${esc(stem)}</span><span class="end">${esc(end)}</span>` : `<span class="irr">${esc(stem)}</span>`;
}
function conjTable(tense, infs) {
  const cols = infs.map(inf => { const v = verbByInf(inf); return { v, c: conjugate(v, tense) }; });
  return `<div class="table-scroll"><table class="conj">
    <thead><tr><th></th>${cols.map(x => `<th><span class="es">${x.v.inf}</span><small>${esc(x.v.fr)}</small></th>`).join('')}</tr></thead>
    <tbody>${PERSONS.map((p, i) => `<tr><td>${p}</td>${cols.map(x => `<td class="es">${formHtml(x.c, i)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <p class="table-legend"><span class="end">en rouge</span> : la terminaison · <span class="irr">en doré</span> : forme ou radical irrégulier</p>`;
}
function renderLesson(tense) {
  return LESSONS[tense]
    .replace(/\{\{persons\}\}/g, () => `<div class="table-scroll"><table><thead><tr><th>Espagnol</th><th>Français</th></tr></thead>
      <tbody>${PERSONS.map((p, i) => `<tr><td class="es">${p}</td><td>${PERSONS_FR[i]}</td></tr>`).join('')}</tbody></table></div>`)
    .replace(/\{\{table:([^}]+)\}\}/g, (_, list) => conjTable(tense, list.split(',')))
    .replace(/\{\{yo:([^}]+)\}\}/g, (_, list) => `<div class="table-scroll"><table class="conj"><thead><tr><th>Verbe</th><th>yo</th><th>tú (régulier)</th></tr></thead>
      <tbody>${list.split(',').map(inf => { const v = verbByInf(inf), c = conjugate(v, tense); return `<tr><td><span class="es">${inf}</span> — ${esc(v.fr)}</td><td class="es irr">${c.forms[0]}</td><td class="es">${c.forms[1]}</td></tr>`; }).join('')}</tbody></table></div>`)
    .replace(/\{\{stems:([^}]+)\}\}/g, (_, list) => `<div class="table-scroll"><table class="conj"><thead><tr><th>Verbe</th><th>Radical du futur</th><th>yo</th></tr></thead>
      <tbody>${list.split(',').map(inf => { const v = verbByInf(inf), c = conjugate(v, tense); return `<tr><td><span class="es">${inf}</span> — ${esc(v.fr)}</td><td class="es irr">${v.futuro}-</td><td class="es">${formHtml(c, 0)}</td></tr>`; }).join('')}</tbody></table></div>`);
}
function buildConjQs(tense, type, filter, count) {
  const verbs = verbsFor(tense, filter);
  const seen = new Set(), qs = [];
  let guard = 0;
  while (qs.length < count && guard++ < 500) {
    const v = pick(verbs), p = Math.floor(Math.random() * 6);
    if (seen.has(v.inf + p)) continue;
    seen.add(v.inf + p);
    const c = conjugate(v, tense), ans = c.forms[p];
    let choices = null;
    if (type === 'qcm') {
      const same = shuffle(c.forms.filter(f => f !== ans)).slice(0, 2);
      const other = shuffle(Object.keys(TENSES).filter(t => t !== tense).flatMap(t => conjugate(v, t).forms));
      const pool = [...new Set(same.concat(other))].filter(f => f !== ans);
      choices = shuffle([ans, ...pool.slice(0, 3)]);
    }
    qs.push({
      type, choices, lang: 'es',
      label: `${TENSES[tense].name} — conjugue le verbe`,
      prompt: v.inf, sub: v.fr, person: PERSONS[p], answer: ans,
      recap: `${v.inf} · ${PERSONS[p]}`, recapAnswer: ans,
      check: input => checkAnswer(input, [ans], { stripPronoun: true }),
      grade: ok => gradeConj(tense, v.inf, ok),
    });
  }
  return qs;
}
function startConj(tense, type) {
  runQuiz({
    title: TENSES[tense].name,
    questions: buildConjQs(tense, type, ui.conj.filter, +ui.conj.count),
    again: () => startConj(tense, type),
  });
}
function viewConj(tense) {
  const tn = TENSES[tense];
  const st = S.conj[tense] || { ok: 0, ko: 0, verbs: {} };
  const weak = Object.entries(st.verbs).filter(([, v]) => v.ko > 0)
    .sort((a, b) => b[1].ko / (b[1].ok + b[1].ko) - a[1].ko / (a[1].ok + a[1].ko) || b[1].ko - a[1].ko).slice(0, 6);
  const nReg = verbsFor(tense, 'reg').length, nIrr = verbsFor(tense, 'irr').length;
  const exercises = `
    <div class="tiles">
      <div class="tile"><div class="num">${st.ok + st.ko}</div><div class="lbl">réponses données</div></div>
      <div class="tile"><div class="num">${pct(st.ok, st.ko)}</div><div class="lbl">de réussite</div></div>
    </div>
    <section class="card" id="conj-opts">
      <h2>Réglages</h2>
      <div class="opts">
        <div class="field">Verbes ${seg('filter', ui.conj.filter, [['all', 'Tous'], ['reg', `Réguliers (${nReg})`], ['irr', `Irréguliers (${nIrr})`]])}</div>
        <div class="field">Nombre de questions ${seg('count', ui.conj.count, [['10', '10'], ['20', '20'], ['30', '30']])}</div>
      </div>
    </section>
    <section class="card"><div class="row between"><div class="grow"><h2>Formes à compléter</h2>
      <p class="muted">Un verbe, une personne : tu tapes la forme conjuguée.</p></div>
      <button class="btn primary" data-ex="input">Commencer →</button></div></section>
    <section class="card"><div class="row between"><div class="grow"><h2>QCM</h2>
      <p class="muted">Choisis la bonne forme parmi quatre. Idéal pour démarrer.</p></div>
      <button class="btn primary" data-ex="qcm">Commencer →</button></div></section>
    <section class="card"><div class="row between"><div class="grow"><h2>Tableau complet</h2>
      <p class="muted">Conjugue un verbe aux six personnes, comme sur une feuille.</p></div>
      <button class="btn primary" data-ex="table">Commencer →</button></div></section>
    ${weak.length ? `<section class="card"><h2>Verbes à revoir</h2><ul class="weak">${weak.map(([inf, v]) =>
      `<li><span><span class="es">${inf}</span> <span class="fr">— ${esc(verbByInf(inf) ? verbByInf(inf).fr : '')}</span></span><span class="muted">${plural(v.ko, 'erreur', 'erreurs')} · ${pct(v.ok, v.ko)}</span></li>`).join('')}</ul></section>` : ''}
    <section class="card"><details><summary>Les ${VERBS.length} verbes au programme</summary>
      <p>${VERBS.map(v => `<span class="es">${v.inf}</span> <span class="muted">(${esc(v.fr)})</span>`).join(' · ')}</p></details></section>`;

  app.innerHTML = `
    <h1>${tn.name}<small>${tn.es}</small></h1>
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="rappel" class="${ui.conj.tab === 'rappel' ? 'on' : ''}">Rappel</button>
      <button role="tab" data-tab="exos" class="${ui.conj.tab === 'exos' ? 'on' : ''}">Exercices</button>
    </div>
    ${ui.conj.tab === 'rappel'
      ? renderLesson(tense) + '<p style="text-align:center"><button class="btn primary" data-tab="exos">Passer aux exercices →</button></p>'
      : exercises}`;
  const opts = app.querySelector('#conj-opts');
  if (opts) bindSegs(opts, ui.conj);
  app.onclick = e => {
    const tab = e.target.closest('[data-tab]'), ex = e.target.closest('[data-ex]');
    if (tab) { ui.conj.tab = tab.dataset.tab; viewConj(tense); window.scrollTo(0, 0); }
    if (ex) { if (ex.dataset.ex === 'table') runTable(tense); else startConj(tense, ex.dataset.ex); }
  };
}

// Exercice "tableau complet" : les six personnes d'un verbe.
function runTable(tense) {
  let verbs = shuffle(verbsFor(tense, ui.conj.filter));
  let idx = 0, okCount = 0, totalCount = 0, checked = false, lastInput = null;

  function draw() {
    if (idx >= verbs.length) { verbs = shuffle(verbs); idx = 0; }
    const v = verbs[idx];
    checked = false;
    app.innerHTML = `
      <div class="quiz-top">
        <button class="btn ghost small" data-quit>✕ Quitter</button>
        <span class="count" style="margin-left:auto">${totalCount ? `${okCount} / ${totalCount} formes justes` : ''}</span>
      </div>
      <section class="card quiz">
        <p class="q-label">${TENSES[tense].name} — conjugue aux six personnes</p>
        <p class="q-prompt">${v.inf}</p>
        <p class="q-sub">${esc(v.fr)}</p>
        <form id="tform" autocomplete="off">
          <div class="grid-form">${PERSONS.map((p, i) => `<label for="p${i}">${p}</label>
            <input type="text" id="p${i}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="es">`).join('')}</div>
          ${accentBar()}
          <div class="quiz-actions"><button class="btn primary" id="tbtn">Vérifier</button></div>
        </form>
        <p class="hint-keys">Entrée pour passer au champ suivant, puis pour vérifier</p>
      </section>`;
    const inputs = [...app.querySelectorAll('.grid-form input')];
    lastInput = inputs[0];
    inputs.forEach(inp => inp.addEventListener('focus', () => { lastInput = inp; }));
    bindAccents(app, () => lastInput);
    inputs[0].focus();
    app.querySelector('#tform').onsubmit = e => {
      e.preventDefault();
      if (checked) { idx++; return draw(); }
      const empty = inputs.find(x => !x.value.trim());
      if (empty && document.activeElement !== app.querySelector('#tbtn') && document.activeElement !== inputs[5]) { empty.focus(); return; }
      verify(v, inputs);
    };
  }
  function verify(v, inputs) {
    checked = true;
    const c = conjugate(v, tense);
    inputs.forEach((inp, i) => {
      const res = inp.value.trim() ? checkAnswer(inp.value, [c.forms[i]], { stripPronoun: true }) : { ok: false };
      totalCount++; if (res.ok) okCount++;
      gradeConj(tense, v.inf, res.ok);
      inp.readOnly = true;
      inp.classList.add(res.ok ? 'good' : 'bad');
      if (!res.ok || res.accent) {
        inp.insertAdjacentHTML('afterend', `<div class="corr ${res.ok ? 'soft' : ''}">${res.ok ? 'accent : ' : '→ '}${esc(c.forms[i])}</div>`);
      }
    });
    const btn = app.querySelector('#tbtn');
    btn.textContent = 'Verbe suivant →';
    btn.focus();
    app.querySelector('.count').textContent = `${okCount} / ${totalCount} formes justes`;
  }
  app.onclick = e => { if (e.target.closest('[data-quit]')) router(); };
  keyHandler = null;
  draw();
}

// ---------- Démarrage ----------
loadState();
router();
