/* Fresh today: bake-of-the-day widget. Mounts into [data-fresh-today].
   Sample schedule by weekday (labelled as a sample on the page). Nothing is sent anywhere. */
(function () {
  'use strict';
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var BAKES = [
    { name: 'Cinnamon buns', note: 'Soft, sticky and spiced: the Sunday morning tradition.' },
    { name: 'Country sourdough', note: 'A slow-risen loaf with a blistered, crackling crust.' },
    { name: 'Butter croissants', note: 'Dozens of layers, golden and shatteringly light.' },
    { name: 'Seeded rye', note: 'Dense, nutty and made for good butter.' },
    { name: 'Cheese and herb scones', note: 'Warm from the oven, best split and eaten at once.' },
    { name: 'Focaccia', note: 'Olive oil, flaky salt and a deep, golden crumb.' },
    { name: 'Celebration cake slices', note: 'Layered, generous and baked for the weekend.' }
  ];
  var TIMES = [
    { t: '6:00', what: 'First loaves out of the oven' },
    { t: '7:30', what: 'Pastries and buns, still warm' },
    { t: '10:00', what: 'The bake of the day' },
    { t: '12:30', what: 'Second batch of loaves' },
    { t: '15:00', what: 'Cookies and afternoon treats' }
  ];

  var css = '' +
    '.fresh-today{display:grid;gap:var(--space-5);--ft-ink:var(--ink);--ft-muted:var(--ink-muted);--ft-line:var(--line);--ft-accent:var(--accent);--ft-on-accent:var(--on-accent);color:var(--ft-ink);}' +
    '.band--dark .fresh-today{--ft-ink:var(--ink-on-dark);--ft-muted:var(--ink-on-dark-muted);--ft-line:var(--line-on-dark);--ft-accent:var(--accent-on-dark);--ft-on-accent:var(--bg-dark);}' +
    '.fresh-today__tabs{display:flex;flex-wrap:wrap;gap:var(--space-2);}' +
    '.fresh-today__tab{font:inherit;font-size:var(--fs-sm);padding:.45rem .9rem;border-radius:999px;cursor:pointer;' +
    'border:1px solid var(--ft-line);background:transparent;color:var(--ft-ink);' +
    'transition:transform .4s cubic-bezier(.2,.7,.2,1),background .3s;}' +
    '.fresh-today__tab:hover{transform:translateY(-2px);}' +
    '.fresh-today__tab[aria-pressed="true"]{background:var(--ft-accent);color:var(--ft-on-accent);border-color:transparent;}' +
    '.fresh-today__tab:focus-visible{outline:3px solid var(--focus);outline-offset:2px;}' +
    '.fresh-today__name{font-family:var(--font-display);font-size:var(--fs-h3);letter-spacing:-.02em;margin:0;}' +
    '.fresh-today__note{margin:0;color:var(--ft-muted);max-width:60ch;}' +
    '.fresh-today__list{list-style:none;margin:0;padding:0;display:grid;gap:var(--space-2);}' +
    '.fresh-today__list li{display:flex;gap:var(--space-4);padding:var(--space-3) 0;border-top:1px solid var(--ft-line);}' +
    '.fresh-today__list time{min-width:3.5rem;font-variant-numeric:tabular-nums;color:var(--ft-accent);font-weight:600;}' +
    '.fresh-today__small{font-size:var(--fs-xs);color:var(--ft-muted);margin:0;}' +
    '.fresh-today__body{animation:ft-in .5s cubic-bezier(.2,.7,.2,1);}' +
    '@keyframes ft-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}' +
    '@media (prefers-reduced-motion:reduce){.fresh-today__body{animation:none;}.fresh-today__tab{transition:none;}}';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mount(root) {
    if (root.getAttribute('data-ft-ready')) return;
    root.setAttribute('data-ft-ready', '1');
    if (!document.getElementById('fresh-today-css')) {
      var st = document.createElement('style');
      st.id = 'fresh-today-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var today = new Date().getDay();
    var wrap = el('div', 'fresh-today');
    var tabs = el('div', 'fresh-today__tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Choose a day');
    var body = el('div', 'fresh-today__body');
    body.setAttribute('aria-live', 'polite');
    var btns = [];

    function show(d, animate) {
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === d ? 'true' : 'false'); });
      body.textContent = '';
      var label = (d === today ? 'Today, ' : '') + DAYS[d];
      body.appendChild(el('p', 'eyebrow', label));
      body.appendChild(el('h3', 'fresh-today__name', BAKES[d].name));
      body.appendChild(el('p', 'fresh-today__note', BAKES[d].note));
      var ul = el('ul', 'fresh-today__list');
      TIMES.forEach(function (x) {
        var li = document.createElement('li');
        var t = el('time', null, x.t);
        li.appendChild(t);
        li.appendChild(el('span', null, x.what));
        ul.appendChild(li);
      });
      body.appendChild(ul);
      if (animate) { body.style.animation = 'none'; void body.offsetWidth; body.style.animation = ''; }
    }

    // Monday-first order
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var b = el('button', 'fresh-today__tab', DAYS[d].slice(0, 3));
      b.type = 'button';
      b.setAttribute('aria-label', DAYS[d]);
      b.addEventListener('click', function () { show(d, true); });
      btns[d] = b;
      tabs.appendChild(b);
    });

    wrap.appendChild(tabs);
    wrap.appendChild(body);
    wrap.appendChild(el('p', 'fresh-today__small', 'Sample schedule: the counter may differ on the day. Ask at the counter what is fresh.'));
    root.textContent = '';
    root.appendChild(wrap);
    show(today, false);
  }

  function init() {
    var nodes = document.querySelectorAll('[data-fresh-today]');
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
