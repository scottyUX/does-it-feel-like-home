// ---------- Calculations: chart rows and caption figures, all from the uploaded result tables ----------
const num = (v) => (v == null || v === '' || v === 'nan' ? NaN : +v);
const r1 = (v) => Math.round(v * 10) / 10;

dash.calc('ratios', {inputs: ['study'], title: 'Chinese ÷ US, study sites',
  description: 'Measures that differ clearly by origin (q < 0.05) and in the same direction for both model-size pairs; the 10 largest ratios.',
  fn: (study) => study
    .filter((r) => r.comparison === 'study_origin' && r.binary === '0' && r.clear === '1' && r.both_pairs_agree === '1' && num(r.mean_us) > 0 && num(r.mean_china) > 0)
    .map((r) => ({measure: r.measure, label: r.label, us: num(r.mean_us), china: num(r.mean_china), ratio: r1(num(r.mean_china) / num(r.mean_us))}))
    .sort((a, b) => Math.abs(Math.log(b.china / b.us)) - Math.abs(Math.log(a.china / a.us))).slice(0, 10)
    .sort((a, b) => b.china / b.us - a.china / a.us)});

const LOCAL = ['price_in_yuan', 'icp_record', 'china_phone', 'customer_service', 'login', 'wechat', 'search_box', 'western_platforms'];
dash.calc('local', {inputs: ['study'], title: 'Share of study home pages with each item',
  description: 'Percent of US and Chinese models’ home pages whose visible text or labels include the item (keyword checks).',
  fn: (study) => LOCAL.map((m) => study.find((r) => r.comparison === 'study_origin' && r.measure === m)).filter(Boolean)
    .map((r) => ({measure: r.measure, label: r.label, us: Math.round(num(r.mean_us) * 100), china: Math.round(num(r.mean_china) * 100)}))});

const COMPARISONS = [['study_origin', 'Model origin'], ['study_prompt_language', 'Prompt language'], ['study_interaction', 'Origin effect changing with language'],
  ['arena_origin_zh_prompt', 'Arena, Chinese prompts'], ['arena_origin_en_prompt', 'Arena, English prompts']];
dash.calc('counts', {inputs: ['study', 'arena'], title: 'Measures that differ clearly, per comparison',
  description: 'Count of the 40 measures with q < 0.05 (sign-flip test, Benjamini–Hochberg).',
  fn: (study, arena) => COMPARISONS.map(([key, label]) => {
    const rows = [...study, ...arena].filter((r) => r.comparison === key);
    return {key, label, clear: rows.filter((r) => r.clear === '1').length, tested: rows.length};
  })});

const ACC = [['Study sites', 'All measures', 'Study sites, all 40 measures'], ['Study sites', 'Without local conventions and features', 'Study, without local keywords'],
  ['Study sites', 'Without images and screenshot measures', 'Study, without image measures'], ['Study sites', 'Density, layout and navigation only', 'Study, density and layout only'],
  ['Arena, Chinese prompts', 'All measures', 'Arena, Chinese prompts'], ['Arena, English prompts', 'All measures', 'Arena, English prompts']];
dash.calc('acc', {inputs: ['classifier'], title: 'Origin correctly identified (%)',
  description: 'Logistic regression accuracy on site types (or Arena categories) left out of training, rounded.',
  fn: (classifier) => ACC.map(([d, f, label]) => {
    const r = classifier.find((x) => x.dataset === d && x.features === f);
    return r && {key: label, label, accuracy: Math.round(num(r.accuracy) * 100), study: d === 'Study sites' ? 1 : 0, p: num(r.p)};
  }).filter(Boolean)});

dash.calc('pref', {inputs: ['preference'], title: 'Chinese model’s vote share vs expected (%)',
  description: 'Arena votes where both models have an official WebDev score; expected from the score gap (as of July 31, 2026). Rounded.',
  fn: (preference) => preference.map((r) => ({prompt: r.prompt, label: r.prompt === 'zh' ? 'Chinese prompts' : 'English prompts', battles: num(r.battles),
    won: Math.round(num(r.chinese_won) * 100), expected: Math.round(num(r.expected) * 100),
    gap: Math.round(num(r.difference) * 100), low: Math.round(num(r.ci_low) * 100), high: Math.round(num(r.ci_high) * 100)}))});

// Figures the captions say, rounded as a person would say them.
dash.calc('said', {inputs: ['study', 'classifier', 'preference'], title: 'Figures as the captions say them', description: 'Rounded figures used in the captions.',
  fn: (study, classifier, preference) => {
    const clear = (k) => study.filter((r) => r.comparison === k && r.clear === '1').length;
    const text = study.find((r) => r.comparison === 'study_origin' && r.measure === 'visible_text_chars');
    const icp = study.find((r) => r.comparison === 'study_origin' && r.measure === 'icp_record');
    const acc = (d, f) => Math.round(num((classifier.find((x) => x.dataset === d && x.features === f) || {}).accuracy) * 100);
    const studyAcc = classifier.filter((x) => x.dataset === 'Study sites').map((x) => Math.round(num(x.accuracy) * 100));
    const zh = preference.find((r) => r.prompt === 'zh') || {};
    return [
      {key: 'origin_clear', v: clear('study_origin')}, {key: 'lang_clear', v: clear('study_prompt_language')},
      {key: 'text_ratio', v: text ? Math.round(num(text.mean_china) / num(text.mean_us)) : null},
      {key: 'icp_cn', v: icp ? Math.round(num(icp.mean_china) * 100) : null}, {key: 'icp_us', v: icp ? Math.round(num(icp.mean_us) * 100) : null},
      {key: 'acc_study', v: acc('Study sites', 'All measures')}, {key: 'acc_min', v: studyAcc.length ? Math.min(...studyAcc) : null},
      {key: 'acc_zh', v: acc('Arena, Chinese prompts', 'All measures')},
      {key: 'pref_won', v: Math.round(num(zh.chinese_won) * 100)}, {key: 'pref_exp', v: Math.round(num(zh.expected) * 100)},
    ];
  }});

// ---------- Engine (from the Visual short skeleton) ----------
const root = document.querySelector('#dash-root'), vs = root.querySelector('.vs'), stage = vs.querySelector('.vs-stage');
const [chs, caps, mks] = ['.vs-ch', '.vs-cap', '.vs-mk'].map((q) => [...vs.querySelectorAll(q)]);
const still = matchMedia('(prefers-reduced-motion: reduce)');
const words = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const write = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
const says = (i) => [...(caps[i]?.querySelectorAll('.vs-s:not([hidden])') ?? [])];
const called = (i) => ['.vs-label', 'h1, h2, h3'].map((q) => chs[i]?.querySelector(q)).map((el) => (el ? words(el) : '')).find(Boolean) ?? String(i + 1);
const fmt = {'said.v': d3.format(',~f')};
let said = [], durs = [], cur = 0, t = Infinity, playing = false, begun = false, raf = 0, last = 0, heard = null, was = null, pace = 1;
const phase = () => root.getAttribute('data-dash-read-phase');
const paced = (at) => (phase() ? at * pace : at);
const cue = (i, word) => paced(Math.max(0, (said[i] ?? '').indexOf(word)) / 15);
const moved = (t, from, len = 0.6) => d3.easeCubicOut(Math.max(0, Math.min(1, (t - from) / len)));

// ---------- Drawings ----------
const ok = (id) => { const d = dash.data(id); return d.status === 'ok' && Array.isArray(d.data) && d.data.length ? d.data : null; };
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const mark = (el, source, field, where) => { el.dataset.source = source; el.dataset.field = field; el.dataset.where = where; return el; };
const enc = (s) => encodeURIComponent(String(s));
// A tooltip kept inside the drawing: rows carry their words in .tipText.
function tips(box, wrap) {
  const tip = h('div', 'vz-tip'); tip.hidden = true; wrap.append(tip);
  wrap.onpointermove = (e) => {
    const row = e.target.closest('.vz-row');
    if (!row || !row.tipText) { tip.hidden = true; return; }
    tip.replaceChildren(h('b', null, row.tipText[0]), h('small', null, row.tipText[1])); tip.hidden = false;
    const b = wrap.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    tip.style.left = Math.min(x + 12, b.width - tip.offsetWidth - 4) + 'px'; tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px';
  };
  wrap.onpointerleave = () => (tip.hidden = true);
}
function frameChart(el, keys) {
  const wrap = h('div', 'vz'), rows = h('div', 'vz-rows');
  if (keys) { const key = h('div', 'vz-key'); for (const [name, color] of keys) { const s = h('span'); const i = h('i'); i.style.background = color; s.append(i, name); key.append(s); } wrap.append(key); }
  wrap.append(rows); el.replaceChildren(wrap); tips(el, wrap); return rows;
}

dash.draw('ratios', (el) => {
  const data = ok('ratios'); if (!data) return el.replaceChildren('—');
  const rows = frameChart(el), top = Math.max(...data.map((r) => Math.abs(Math.log(r.china / r.us))));
  for (const r of data) {
    const row = h('div', 'vz-row'), track = h('div', 'vz-track'), b = h('div', 'vz-b'), up = r.china >= r.us, w = (Math.abs(Math.log(r.china / r.us)) / top) * 50;
    b.style.background = up ? dash.colors[1] : dash.colors[0];
    b.style.left = up ? '50%' : 50 - w + '%'; b.style.width = w + '%'; b.style.transformOrigin = up ? 'left center' : 'right center';
    track.append(h('div', 'vz-mid'), b); track.querySelector('.vz-mid').style.left = '50%';
    const v = h('span', 'vz-v'), n = mark(h('span', null, d3.format('.1f')(r.ratio)), 'ratios', 'ratio', 'measure=' + enc(r.measure));
    v.append(n, '×');
    row.append(h('div', 'vz-lab', r.label), track, v);
    row.tipText = [r.label, `US models ${d3.format(',.3~f')(r.us)} · Chinese models ${d3.format(',.3~f')(r.china)} (average per site)`];
    rows.append(row);
  }
});

dash.draw('local', (el) => {
  const data = ok('local'); if (!data) return el.replaceChildren('—');
  const rows = frameChart(el, [['US models', dash.colors[0]], ['Chinese models', dash.colors[1]]]);
  for (const r of data) {
    const row = h('div', 'vz-row vz-pair'), track = h('div', 'vz-track');
    for (const [side, cls, color] of [['us', 'vz-us', dash.colors[0]], ['china', 'vz-cn', dash.colors[1]]]) {
      const b = h('div', 'vz-b ' + cls); b.style.left = '0'; b.style.width = Math.max(r[side], 0.4) + '%'; b.style.background = color; track.append(b);
    }
    const v = h('span', 'vz-v');
    v.append(mark(h('span', null, String(r.us)), 'local', 'us', 'measure=' + enc(r.measure)), h('small', null, ' vs '),
      mark(h('span', null, String(r.china)), 'local', 'china', 'measure=' + enc(r.measure)), h('small', null, '%'));
    row.append(h('div', 'vz-lab', r.label), track, v);
    row.tipText = [r.label, `${r.us}% of US models’ home pages · ${r.china}% of Chinese models’`];
    rows.append(row);
  }
});

dash.draw('counts', (el) => {
  const data = (ok('counts') || []).slice(0, 3); if (!data.length) return el.replaceChildren('—');
  const rows = frameChart(el);
  data.forEach((r, j) => {
    const row = h('div', 'vz-row'), track = h('div', 'vz-track'), b = h('div', 'vz-b');
    b.style.left = '0'; b.style.width = (r.tested ? (r.clear / r.tested) * 100 : 0) + '%'; if (j === 0) b.style.background = dash.colors[0];
    track.append(b);
    const v = h('span', 'vz-v');
    v.append(mark(h('span', null, String(r.clear)), 'counts', 'clear', 'key=' + enc(r.key)), h('small', null, ' of '), mark(h('small', null, String(r.tested)), 'counts', 'tested', 'key=' + enc(r.key)));
    row.append(h('div', 'vz-lab', r.label), track, v);
    row.tipText = [r.label, `${r.clear} of ${r.tested} measures differ clearly (q < 0.05)`];
    rows.append(row);
  });
});

dash.draw('acc', (el) => {
  const data = ok('acc'); if (!data) return el.replaceChildren('—');
  const rows = frameChart(el);
  data.forEach((r, j) => {
    const row = h('div', 'vz-row'), track = h('div', 'vz-track'), b = h('div', 'vz-b');
    b.style.left = '0'; b.style.width = r.accuracy + '%'; if (r.study) b.style.background = dash.colors[0];
    const ref = h('div', 'vz-ref'); ref.style.left = '50%';
    if (j === 0) { const note = h('span', 'vz-refnote', 'chance'); note.style.left = '50%'; track.append(note); }
    track.append(b, ref);
    const v = h('span', 'vz-v'); v.append(mark(h('span', null, String(r.accuracy)), 'acc', 'accuracy', 'key=' + enc(r.key)), h('small', null, '%'));
    row.append(h('div', 'vz-lab', r.label), track, v);
    row.tipText = [r.label, `${r.accuracy}% correct; chance is 50%. Permutation p = ${d3.format('.3f')(r.p)}`];
    rows.append(row);
  });
});

dash.draw('pref', (el) => {
  const data = ok('pref'); if (!data) return el.replaceChildren('—');
  const rows = frameChart(el, [['Chinese model’s share of votes', dash.colors[1]], ['Expected from scores', 'var(--color-fg)']]);
  for (const r of data) {
    const row = h('div', 'vz-row'), track = h('div', 'vz-track'), b = h('div', 'vz-b');
    b.style.left = '0'; b.style.width = r.won + '%'; b.style.background = dash.colors[1];
    const ref = h('div', 'vz-ref'); ref.style.left = r.expected + '%';
    track.append(b, ref);
    const v = h('span', 'vz-v');
    v.append(mark(h('span', null, String(r.won)), 'pref', 'won', 'prompt=' + enc(r.prompt)), h('small', null, '% vs '),
      mark(h('small', null, String(r.expected)), 'pref', 'expected', 'prompt=' + enc(r.prompt)));
    row.append(h('div', 'vz-lab', r.label), track, v);
    row.tipText = [r.label, `Won ${r.won}% of ${r.battles} votes; expected ${r.expected}%. Gap ${r.gap} points (95% CI ${r.low} to ${r.high}).`];
    rows.append(row);
  }
});

// Bars grow from their base and values fade in, starting when the caption reaches `word`.
const grow = (i, word) => (t) => {
  const s = cue(i, word);
  chs[i].querySelectorAll('.vz-b').forEach((b, j) => (b.style.transform = `scaleX(${moved(t, s + j * 0.07)})`));
  chs[i].querySelectorAll('.vz-v, .vz-ref').forEach((v, j) => (v.style.opacity = moved(t, s + j * 0.07 + 0.35, 0.3)));
};
const scenes = [
  (t) => { const big = chs[0].querySelector('.vs-big'); if (big) big.style.opacity = moved(t, 0.2, 0.8); },
  grow(1, 'Origin'), grow(2, 'ICP'), grow(3, 'origin'), grow(4, 'simple'), grow(5, 'won'),
  (t) => chs[6].querySelectorAll('.vz-list li').forEach((li, j) => (li.style.opacity = 0.25 + 0.75 * moved(t, j * 1.2))),
];

// ---------- Engine, continued ----------
function fig(el) {
  const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const {source, field, where, row: n} = el.dataset, d = dash.data(source), rows = d.status === 'ok' && Array.isArray(d.data) ? d.data : [];
  const row = where == null ? rows[+(n ?? 0)] : rows.find((r) => where.split('&').every((p) => {
    const i = p.indexOf('='); return i > 0 && String(r[dec(p.slice(0, i)).trim()] ?? '') === dec(p.slice(i + 1)); }));
  const v = row?.[field];
  write(el, v == null || v === '' ? '—' : (fmt[source + '.' + field] ?? String)(v));
}
dash.draw('fig', fig);
for (const name of ['runs', 'now', 'copy']) dash.draw(name, () => {});
const due = new Map();
function timing() {
  said = chs.map((_, i) => says(i).map(words).join(' ')); durs = said.map((s) => s.length / 15 + 1);
  chs.forEach((_, i) => { let at = 0; for (const s of says(i)) { const w = words(s), j = said[i].indexOf(w, at); due.set(s, (j < 0 ? at : j) / 15); if (j >= 0) at = j + w.length; } });
  write(vs.querySelector('.vs-runs'), String(Math.round(d3.sum(durs) / 5) * 5));
}
function draw(i, t) {
  scenes[i]?.(still.matches || t >= paced(durs[i]) ? Infinity : t);
  const ss = says(i), k = begun ? ss.findLastIndex((s) => t >= paced(due.get(s))) : 0;
  ss.forEach((s, j) => s.classList.toggle('vs-on', j === Math.max(0, k)));
}
function frame() {
  draw(cur, t);
  mks.forEach((m, j) => { for (const bar of m.children) bar.style.width = (j < cur ? 1 : j > cur ? 0 : t === Infinity ? +begun : Math.min(1, t / paced(durs[cur]))) * 100 + '%'; });
}
function show(i, from) {
  if (i !== cur) { draw(cur, Infinity); if (!phase()) write(vs.querySelector('.vs-now'), called(i)); }
  [cur, t] = [i, from];
  for (const set of [chs, caps]) set.forEach((el, j) => el.classList.toggle('vs-on', j === i));
  chs.forEach((ch, j) => ch.setAttribute('aria-hidden', String(j !== i)));
  for (const set of [mks, caps]) set.forEach((el, j) => (j === i ? el.setAttribute('aria-current', 'true') : el.removeAttribute('aria-current')));
  mks.forEach((m, j) => m.getAttribute('aria-label') === called(j) || m.setAttribute('aria-label', called(j)));
  frame();
}
function tick(now) {
  raf = 0;
  if (!vs.isConnected || (phase() ? phase() !== 'playing' : !playing)) return;
  t += last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
  if (phase() || t < durs[cur]) frame();
  else if (cur < chs.length - 1) show(cur + 1, 0);
  else return play(false);
  raf = requestAnimationFrame(tick);
}
const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
function look() { const on = phase() ? /starting|playing/.test(phase()) : playing; vs.classList.toggle('vs-playing', on); vs.querySelector('.vs-controls .vs-toggle')?.setAttribute('aria-label', on ? 'Pause' : 'Play'); }
function play(on) { playing = on; begun ||= on; look(); frame(); if (on) kick(); }
const from = (i) => (show(Math.max(0, Math.min(chs.length - 1, i)), 0), phase() || play(true));
const on = (q, f) => { const b = vs.querySelector('.vs-controls ' + q); if (b) b.onclick = f; };
on('.vs-toggle', () => phase() || (playing ? play(false) : t < durs[cur] ? play(true) : from(cur === chs.length - 1 ? 0 : cur)));
on('.vs-back', () => from(cur - 1));
on('.vs-next', () => from(cur + 1));
mks.forEach((m, j) => (m.onclick = () => from(j)));
on('.vs-cc', (e) => e.currentTarget.setAttribute('aria-pressed', String(!vs.classList.toggle('vs-hush'))));
stage.onpointermove = stage.onpointerdown = (e) => {
  const m = e.pointerType === 'mouse', move = e.type === 'pointermove', l = stage.classList;
  if (move && Math.abs(e.clientX - stage.x) + Math.abs(e.clientY - stage.y) < 4) return;
  [stage.x, stage.y] = [e.clientX, e.clientY];
  l.toggle('vs-idle', false); l.toggle('vs-touch', !m); l.toggle('vs-held', move && !!e.target.closest('.vs-controls'));
  clearTimeout(stage.idle); if (m) stage.idle = setTimeout(() => l.add('vs-idle'), 3000);
};
still.onchange = () => (vs.isConnected ? frame() : (still.onchange = null));

const mo = new MutationObserver(() => {
  if (!vs.isConnected) return mo.disconnect();
  const now = vs.querySelector('[data-dash-read-now]'), p = phase(), again = p === 'starting' && was !== 'starting';
  const through = heard && p === 'playing' && was === 'playing';
  const before = was; was = p;
  if (!p) { if (heard) t /= pace; heard = null; if (before) play(/starting|playing/.test(before)); return; }
  playing = false; begun = true; look();
  write(vs.querySelector('.vs-now'), '');
  if (now && (now !== heard || again)) {
    if (through) pace = Math.max(0.5, Math.min(1.5, t / (durs[cur] - 1) || 1));
    const i = caps.indexOf((heard = now));
    if (i >= 0) show(i, 0);
  }
  if (p === 'ended') show(cur, Infinity);
  kick();
});
mo.observe(root, {subtree: true, attributes: true, attributeFilter: ['data-dash-read-phase', 'data-dash-read-now']});

let paper = false;
function seat() {
  const top = vs.querySelector('.vs-in').getBoundingClientRect().top;
  chs.forEach((ch, i) => { const row = ch.querySelector('.vs-say, .vs-draw'); if (row && caps[i]) caps[i].style.top = row.getBoundingClientRect().top - top + 'px'; });
  if (durs.length) frame();
  if (paper && durs.length) scenes.forEach((scene) => scene(Infinity));
}
let box = vs.parentElement;
while (box.parentElement && !/auto|scroll/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
const fit = () => vs.style.setProperty('--room', Math.max(240, box.getBoundingClientRect().bottom - box.scrollTop - vs.getBoundingClientRect().top
  - parseFloat(getComputedStyle(root).paddingBottom) - parseFloat(getComputedStyle(box).paddingBottom)) + 'px');
const ro = new ResizeObserver(() => (vs.isConnected ? (fit(), seat()) : ro.disconnect())); for (const el of [box, stage, ...vs.querySelectorAll('.vs-draw')]) ro.observe(el);
document.fonts.ready.then(() => vs.isConnected && seat());
addEventListener('beforeprint', () => vs.isConnected && (paper = true, play(false), show(cur, Infinity), seat()));
addEventListener('afterprint', () => (paper = false));

dash.onData(fit);
dash.draw('settle', () => { timing(); show(cur, t); seat(); });
