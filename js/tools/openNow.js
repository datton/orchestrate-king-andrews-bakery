/* Andrew's Bakery: "Open now" badge and next-opening countdown (Senior Dev 5).
   Mounts into every element with [data-open-now]. Add data-open-now="full" to also list the week's hours.
   Hours live in window.AB_HOURS (sample hours, Monday to Saturday; closed Sunday) so other scripts can read them.
   Uses the visitor's own clock. Only tokens.css variables are used for colour. */
(function () {
  'use strict';

  // days: 0 = Sunday ... 6 = Saturday; [openHour, openMin, closeHour, closeMin] or null when closed.
  var HOURS = window.AB_HOURS || {
    sample: true,
    days: {
      0: null,
      1: [7, 0, 17, 0],
      2: [7, 0, 17, 0],
      3: [7, 0, 17, 0],
      4: [7, 0, 17, 0],
      5: [7, 0, 17, 0],
      6: [8, 0, 16, 0]
    }
  };
  window.AB_HOURS = HOURS;

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var ORDER = [1, 2, 3, 4, 5, 6, 0];

  function at(base, dayOffset, h, m) {
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, h, m, 0, 0);
    return d;
  }
  function fmt(h, m) {
    var suffix = h >= 12 ? 'pm' : 'am';
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ' ' + suffix;
  }
  function span(ms) {
    var mins = Math.max(1, Math.round(ms / 60000));
    var d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60, out = [];
    if (d) out.push(d + (d === 1 ? ' day' : ' days'));
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m && !d) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    return out.join(' ') || 'under a minute';
  }

  // Returns { open, closesAt, opensAt, label }.
  function status(now) {
    var today = HOURS.days[now.getDay()];
    if (today) {
      var o = at(now, 0, today[0], today[1]), c = at(now, 0, today[2], today[3]);
      if (now >= o && now < c) return { open: true, closesAt: c };
      if (now < o) return { open: false, opensAt: o, today: true };
    }
    for (var i = 1; i <= 7; i++) {
      var t = HOURS.days[(now.getDay() + i) % 7];
      if (t) return { open: false, opensAt: at(now, i, t[0], t[1]), today: false, dayOffset: i };
    }
    return { open: false, opensAt: null };
  }

  function injectStyles() {
    if (document.getElementById('ab-open-now-css')) return;
    var s = document.createElement('style');
    s.id = 'ab-open-now-css';
    s.textContent =
      '.ab-on{display:inline-flex;flex-direction:column;gap:.5rem;font-family:var(--font-body);color:inherit}' +
      '.ab-on__badge{display:inline-flex;align-items:center;gap:.6rem;align-self:flex-start;padding:.5rem 1rem;border-radius:999px;' +
      'background:var(--card);color:var(--ink);border:1px solid var(--line);font-weight:600;font-size:.95rem;line-height:1.2;box-shadow:0 6px 18px -10px rgba(43,29,20,.35)}' +
      '.band--dark .ab-on__badge{background:var(--bg-dark-soft);color:var(--ink-on-dark);border-color:var(--line-on-dark)}' +
      '.ab-on__dot{width:.65rem;height:.65rem;border-radius:50%;background:var(--ink-muted);flex:none}' +
      '.ab-on.is-open .ab-on__dot{background:var(--accent);animation:ab-on-pulse 2.4s cubic-bezier(.2,.7,.2,1) infinite}' +
      '.band--dark .ab-on.is-open .ab-on__dot{background:var(--accent-on-dark)}' +
      '.ab-on__count{font-size:.95rem;color:var(--ink-muted);font-variant-numeric:tabular-nums}' +
      '.band--dark .ab-on__count{color:var(--ink-on-dark-muted)}' +
      '.ab-on__week{list-style:none;margin:.5rem 0 0;padding:0;display:grid;gap:.25rem;min-width:min(100%,18rem);font-size:.95rem}' +
      '.ab-on__week li{display:flex;justify-content:space-between;gap:1.5rem;padding:.35rem 0;border-bottom:1px solid var(--line)}' +
      '.band--dark .ab-on__week li{border-color:var(--line-on-dark)}' +
      '.ab-on__week li.is-today{font-weight:700;color:var(--accent)}' +
      '.band--dark .ab-on__week li.is-today{color:var(--accent-on-dark)}' +
      '.ab-on__note{font-size:.8rem;color:var(--ink-muted);margin:.25rem 0 0}' +
      '.band--dark .ab-on__note{color:var(--ink-on-dark-muted)}' +
      '@keyframes ab-on-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.55}}' +
      '@media (prefers-reduced-motion:reduce){.ab-on.is-open .ab-on__dot{animation:none}}';
    document.head.appendChild(s);
  }

  function weekList(now) {
    var items = ORDER.map(function (d) {
      var h = HOURS.days[d];
      return '<li' + (d === now.getDay() ? ' class="is-today" aria-current="date"' : '') + '><span>' + DAY_NAMES[d] +
        '</span><span>' + (h ? fmt(h[0], h[1]) + ' to ' + fmt(h[2], h[3]) : 'Closed') + '</span></li>';
    }).join('');
    return '<ul class="ab-on__week" aria-label="Opening hours">' + items + '</ul>' +
      (HOURS.sample ? '<p class="ab-on__note">Sample hours. Ask at the counter to confirm.</p>' : '');
  }

  function mount(el) {
    var full = el.getAttribute('data-open-now') === 'full';
    el.classList.add('ab-on');
    el.innerHTML =
      '<span class="ab-on__badge" role="status" aria-live="polite"><span class="ab-on__dot" aria-hidden="true"></span><span class="ab-on__state"></span></span>' +
      '<span class="ab-on__count"></span>' + (full ? '<div class="ab-on__weekwrap"></div>' : '');
    var state = el.querySelector('.ab-on__state'), count = el.querySelector('.ab-on__count');
    var wrap = el.querySelector('.ab-on__weekwrap'), lastKey = '', lastDay = -1;

    function tick() {
      var now = new Date(), s = status(now);
      var key = s.open ? 'open' : 'closed';
      el.classList.toggle('is-open', s.open);
      if (key !== lastKey) { // announced politely only when it changes
        state.textContent = s.open ? 'Open now' : 'Closed right now';
        lastKey = key;
      }
      if (s.open) {
        count.textContent = 'Closes at ' + fmt(s.closesAt.getHours(), s.closesAt.getMinutes()) + ', in ' + span(s.closesAt - now);
      } else if (s.opensAt) {
        var when = s.today ? 'today' : (s.dayOffset === 1 ? 'tomorrow' : DAY_NAMES[s.opensAt.getDay()]);
        count.textContent = 'Opens ' + when + ' at ' + fmt(s.opensAt.getHours(), s.opensAt.getMinutes()) + ', in ' + span(s.opensAt - now);
      } else {
        count.textContent = 'Ask at the counter for our hours.';
      }
      if (wrap && lastDay !== now.getDay()) { wrap.innerHTML = weekList(now); lastDay = now.getDay(); }
    }
    tick();
    setInterval(tick, 15000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  }

  function init() {
    var nodes = document.querySelectorAll('[data-open-now]');
    if (!nodes.length) return;
    injectStyles();
    Array.prototype.forEach.call(nodes, mount);
  }
  window.ABOpenNow = { status: status, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
