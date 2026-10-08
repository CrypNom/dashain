(() => {
'use strict';
/* ====== CONFIG: change if the official date differs (Nepal time = +05:45) ====== */
const VIJAYA_DASHAMI = new Date('2026-10-21T00:00:00+05:45');

const $ = s => document.querySelector(s);
const rand = (a, b) => Math.random() * (a - b) + b;
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- Floating decorations ---------- */
const sky = $('#sky');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 640;

function add(html, cls, style) {
  const e = document.createElement('div');
  e.className = 'fl ' + cls; e.innerHTML = html;
  Object.assign(e.style, style); sky.appendChild(e); return e;
}
function leafSVG(c) {
  return `<svg width="26" height="40" viewBox="0 0 26 40"><path d="M13 1C3 12 2 28 13 39 24 28 23 12 13 1Z" fill="${c}"/><path d="M13 6V36" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/></svg>`;
}
function kiteSVG(c1, c2) {
  return `<svg width="70" height="110" viewBox="0 0 70 110"><polygon points="35,2 66,38 35,86 4,38" fill="${c1}" stroke="#fff" stroke-width="2"/><polygon points="35,2 66,38 35,38" fill="${c2}"/><polygon points="4,38 35,38 35,86" fill="${c2}"/><path d="M35 2V86M4 38H66" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M35 86C28 96 44 100 35 108" stroke="#e0457b" stroke-width="2" fill="none"/></svg>`;
}
const leafCols = ['#bde05a', '#a5d44a', '#e9e56a', '#8fcf55'];
const kiteCols = [['#ffd24d', '#ff8fbd'], ['#7fd0ff', '#ffffff'], ['#ff6f91', '#ffd24d'], ['#b79cff', '#ffe3ee']];
const balloonCols = ['#ff8fbd', '#ffd24d', '#ff6f91', '#b79cff', '#7fd0ff'];

function populate() {
  const nLeaf = small ? 12 : 22, nBall = small ? 5 : 9, nKite = small ? 2 : 4;
  for (let i = 0; i < nLeaf; i++) add(leafSVG(pick(leafCols)), 'leaf', {
    left: rand(0, 100) + 'vw', opacity: rand(.6, 1), animationDuration: rand(9, 18) + 's', animationDelay: -rand(0, 18) + 's', scale: rand(.6, 1.1) });
  for (let i = 0; i < nBall; i++) {
    const heart = i % 2;
    add(heart ? `<span style="font-size:${rand(22,38)}px">${pick(['💗','💖','🩷','💕'])}</span>`
      : `<svg width="40" height="62" viewBox="0 0 40 62"><ellipse cx="20" cy="22" rx="17" ry="21" fill="${pick(balloonCols)}"/><ellipse cx="13" cy="14" rx="5" ry="8" fill="#fff" opacity=".45"/><path d="M20 43C16 50 24 54 20 61" stroke="#fff" fill="none" stroke-width="1.6"/></svg>`,
      'up', { left: rand(2, 96) + 'vw', animationDuration: rand(14, 26) + 's', animationDelay: -rand(0, 26) + 's' });
  }
  for (let i = 0; i < nKite; i++) { const c = pick(kiteCols);
    add(kiteSVG(c[0], c[1]), 'kite', { top: rand(4, 55) + 'vh', animationDuration: rand(28, 48) + 's', animationDelay: -rand(0, 40) + 's', scale: rand(.55, .9) }); }
}
if (!reduce) populate();

/* ---------- Confetti ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], running = false;
function size() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
size(); addEventListener('resize', size);
const confCols = ['#ff6fa3', '#ffd24d', '#e0457b', '#fff', '#b79cff', '#7fd0ff', '#ff9a3c', '#8fcf55'];
function burst(x = innerWidth / 2, y = innerHeight / 3, n = 140) {
  const d = devicePixelRatio;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(3, 13);
    parts.push({ x: x * d, y: y * d, vx: Math.cos(a) * s * d, vy: (Math.sin(a) * s - 6) * d, w: rand(6, 12) * d, h: rand(4, 8) * d,
      r: rand(0, 6), vr: rand(-.3, .3), c: pick(confCols), life: 0, heart: Math.random() < .15 });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life < 190 && p.y < cv.height + 40);
  for (const p of parts) {
    p.vy += .32 * devicePixelRatio; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, (190 - p.life) / 50); cx.fillStyle = p.c;
    if (p.heart) { cx.font = p.w * 2 + 'px serif'; cx.fillText('💗', 0, 0); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cx.restore();
  }
  if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
$('#confettiBtn').addEventListener('click', e => { burst(e.clientX, e.clientY); burst(innerWidth * .2, innerHeight * .3, 70); burst(innerWidth * .8, innerHeight * .3, 70); startMusic(); });

/* ---------- Music ---------- */
const bgm = $('#bgm'), mBtn = $('#musicBtn');
bgm.volume = .45;
let userMuted = false, started = false;
function setUI(on) { mBtn.setAttribute('aria-pressed', on); mBtn.querySelector('span').textContent = on ? 'Music on' : 'Music off'; }
function startMusic() {
  if (userMuted || started) return;
  bgm.play().then(() => { started = true; setUI(true); }).catch(() => {});
}
mBtn.addEventListener('click', () => {
  if (bgm.paused) { userMuted = false; bgm.play().then(() => { started = true; setUI(true); }); }
  else { bgm.pause(); userMuted = true; started = false; setUI(false); }
});
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, startMusic, { once: false, passive: true }));

/* ---------- Blessing ---------- */
const card = $('#blessCard'), msg = $('#blessMsg'), chime = $('#chime'), jam = card.querySelector('.jam');
const blessings = ['Aashirwad received! 🙏', 'May you always be happy 🌼', 'Long life & good health 💖', 'Jai Maa Durga! 🪔', 'Prosperity at your door 🌾'];
for (let i = 0; i < 9; i++) { const b = document.createElement('b'); b.style.left = (8 + i * 10) + '%'; b.style.transform = `rotate(${(i - 4) * 9}deg)`; b.style.transitionDelay = (i * 70) + 'ms'; jam.appendChild(b); }
function bless() {
  startMusic();
  card.classList.remove('on'); void card.offsetWidth; card.classList.add('on');
  jam.querySelectorAll('b').forEach((b, i) => b.style.height = (36 + Math.abs(4 - i) * -4 + rand(10, 30)) + 'px');
  msg.textContent = pick(blessings);
  chime.currentTime = 0; chime.play().catch(() => {});
  const r = card.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 80, 110);
  // jamara petals shower
  for (let i = 0; i < 14; i++) { const l = add(leafSVG(pick(leafCols)), 'leaf', { left: rand(10, 90) + 'vw', animationDuration: rand(4, 8) + 's', animationIterationCount: '1' }); setTimeout(() => l.remove(), 8500); }
}
card.addEventListener('click', bless);
card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bless(); } });

/* ---------- Gallery ---------- */
const grid = $('#gallery'), fileIn = $('#fileIn'); let target = null;
const frames = [['🏔️','Family at home','#ffd6e8','#ffe9a8'],['🪁','Kite flying day','#cfe9ff','#ffd6e8'],['🍛','Festive feast','#ffe0b8','#ffc9dc'],['🌾','Jamara blessings','#d7f2b8','#fff2b0'],['👨‍👩‍👧','Tika with elders','#ffc9dc','#e6d4ff'],['🎊','Cousins & fun','#e6d4ff','#ffd6e8']];
frames.forEach(([em, t, c1, c2], i) => {
  const f = document.createElement('div'); f.className = 'frame'; f.style.setProperty('--r', (i % 2 ? 2.5 : -2.5) + 'deg'); f.tabIndex = 0;
  f.innerHTML = `<div class="ph empty" style="--c1:${c1};--c2:${c2}"><div>${em}<small>${t}<br>(tap to add photo)</small></div></div><p>Dashain Memories</p>`;
  const open = () => { target = f.querySelector('.ph'); fileIn.value = ''; fileIn.click(); };
  f.addEventListener('click', open); f.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  grid.appendChild(f);
});
fileIn.addEventListener('change', () => {
  const file = fileIn.files[0]; if (!file || !target) return;
  target.classList.remove('empty'); target.innerHTML = ''; target.style.backgroundImage = `url(${URL.createObjectURL(file)})`; burst(innerWidth / 2, innerHeight / 2, 50);
});

/* ---------- Countdown ---------- */
const pad = n => String(n).padStart(2, '0');
$('#cdDate').textContent = 'Vijaya Dashami • ' + VIJAYA_DASHAMI.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kathmandu' });
let celebrated = false;
function updateCD() {
  let diff = VIJAYA_DASHAMI - new Date();
  if (diff <= 0) {
    ['D', 'H', 'M', 'S'].forEach(k => $('#cd' + k).textContent = '00');
    $('#cdMsg').textContent = 'It’s Vijaya Dashami! Tika, jamara & blessings 🌸'; 
    if (!celebrated) { celebrated = true; setTimeout(() => burst(), 800); } return;
  }
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  $('#cdD').textContent = pad(d); $('#cdH').textContent = pad(h); $('#cdM').textContent = pad(m); $('#cdS').textContent = pad(s);
  $('#cdMsg').textContent = d > 0 ? `Only ${d} day${d > 1 ? 's' : ''} until tika time! 🪔` : 'Tika time is almost here! 🪔';
}
updateCD(); setInterval(updateCD, 1000);

/* ---------- Wishes ---------- */
const wishes = [
  'May Maa Durga fill your home with light and your heart with peace 🪔',
  'Wishing you jamara-green happiness all year round 🌱',
  'Sending you a big red tika of love, luck & success 💖',
  'May your kites fly high and your worries fly away 🪁',
  'Warm dal bhat, sweet sel roti & even sweeter moments with family 🍚',
  'May every blessing from elders reach you like sunshine ☀️',
  'Happy Bijaya Dashami! Victory of good over evil, always 🌸',
  'May your swing of life always go higher and higher 🎠',
  'Hugs, laughs and lots of dakshina for you today 💌',
  'Let this Dashain bring you closer to the people you love 🏡',
  'Shubha Dashain! Eat well, laugh loud, bless freely 🌼',
  'May your life be as colorful as the festival sky 🎈'
];
let lastW = -1;
$('#wishBtn').addEventListener('click', e => {
  let i; do { i = Math.floor(Math.random() * wishes.length); } while (i === lastW); lastW = i;
  const t = $('#wishText'); t.classList.remove('pop'); void t.offsetWidth; t.textContent = wishes[i]; t.classList.add('pop');
  burst(e.clientX, e.clientY, 60); startMusic();
});

/* ---------- Custom wish + share link ---------- */
const wName = $('#wName'), wMsg = $('#wMsg'), cardOut = $('#cardOut');
const clean = (s, n) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
wMsg.addEventListener('input', () => $('#wCount').textContent = wMsg.value.length);
function shareURL(name, msg) {
  const u = new URL(location.href.split('#')[0].split('?')[0]);
  if (name) u.searchParams.set('from', name);
  u.searchParams.set('msg', msg);
  return u.toString() + '#wishes';
}
let curURL = '', curText = '';
$('#wMake').addEventListener('click', e => {
  const msg = clean(wMsg.value, 120), name = clean(wName.value, 24);
  if (!msg) { wMsg.focus(); wMsg.placeholder = 'Please write a little message first 💗'; return; }
  $('#wcMsg').textContent = '“' + msg + '”';
  $('#wcFrom').textContent = name ? '— with love, ' + name + ' 💖' : '— with love 💖';
  curURL = shareURL(name, msg);
  curText = `🌸 Happy Dashain 2083! ${name ? name + ' sent you a wish: ' : ''}“${msg}” `;
  $('#waBtn').href = 'https://wa.me/?text=' + encodeURIComponent(curText + curURL);
  cardOut.hidden = false; $('#shareNote').textContent = '';
  cardOut.scrollIntoView({ behavior: 'smooth', block: 'center' });
  burst(e.clientX, e.clientY, 90); startMusic();
});
async function copyLink() {
  try { await navigator.clipboard.writeText(curURL); }
  catch { const t = document.createElement('textarea'); t.value = curURL; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  $('#shareNote').textContent = 'Link copied! Paste it anywhere 💌';
}
$('#copyBtn').addEventListener('click', copyLink);
$('#shareBtn').addEventListener('click', async () => {
  if (navigator.share) { try { await navigator.share({ title: 'Happy Dashain 2083', text: curText, url: curURL }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  copyLink();
});
/* Received wish (opened from a shared link) */
(function () {
  const p = new URLSearchParams(location.search), msg = clean(p.get('msg'), 120);
  if (!msg) return;
  const name = clean(p.get('from'), 24);
  const box = document.createElement('div'); box.className = 'recv glass'; box.style.padding = '22px';
  const hd = document.createElement('p'); hd.className = 'hand';
  hd.textContent = name ? name + ' sent you a Dashain wish 💌' : 'You received a Dashain wish 💌';
  const c = document.createElement('div'); c.className = 'wishcard';
  const t = document.createElement('span'); t.className = 'wc-top'; t.textContent = '🌸 Happy Dashain 2083 🌸';
  const m = document.createElement('p'); m.className = 'wc-msg'; m.textContent = '“' + msg + '”';
  const f = document.createElement('span'); f.className = 'wc-from'; f.textContent = name ? '— with love, ' + name + ' 💖' : '— with love 💖';
  c.append(t, m, f); box.append(hd, c);
  const sec = $('#wishes'); sec.insertBefore(box, sec.querySelector('h2').nextSibling);
  setTimeout(() => { $('#wishes').scrollIntoView({ behavior: 'smooth' }); burst(innerWidth / 2, innerHeight / 3, 120); }, 700);
})();

/* ---------- Songs: pause background music when opening a song ---------- */
document.querySelectorAll('[data-song]').forEach(a => a.addEventListener('click', () => { if (!bgm.paused) { bgm.pause(); userMuted = true; started = false; setUI(false); } }));

/* ---------- Active section highlight (nav + mobile tab bar) ---------- */
if ('IntersectionObserver' in window) {
  const links = document.querySelectorAll('.nav nav a, .tabbar a');
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
}
})();
