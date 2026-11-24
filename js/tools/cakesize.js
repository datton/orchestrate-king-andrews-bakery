/* Cake size guide (Senior Dev 7). Mounts into [data-cake-size]. Nothing is sent anywhere. */
(function () {
  'use strict';
  // Servings are for a generous party slice; "small" dessert slices stretch a cake by 40%.
  var SIZES = [
    { name: 'One tier, 6 inch', tiers: [6], servings: 10 },
    { name: 'One tier, 8 inch', tiers: [8], servings: 20 },
    { name: 'One tier, 10 inch', tiers: [10], servings: 30 },
    { name: 'Two tiers, 6 + 8 inch', tiers: [6, 8], servings: 30 },
    { name: 'One tier, 12 inch', tiers: [12], servings: 45 },
    { name: 'Two tiers, 8 + 10 inch', tiers: [8, 10], servings: 50 },
    { name: 'Three tiers, 6 + 8 + 10 inch', tiers: [6, 8, 10], servings: 60 },
    { name: 'Two tiers, 10 + 12 inch', tiers: [10, 12], servings: 75 },
    { name: 'Three tiers, 8 + 10 + 12 inch', tiers: [8, 10, 12], servings: 95 },
    { name: 'Four tiers, 6 + 8 + 10 + 12 inch', tiers: [6, 8, 10, 12], servings: 105 }
  ];
  var MAX_GUESTS = 150;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pick(guests, small) {
    var f = small ? 1.4 : 1;
    for (var i = 0; i < SIZES.length; i++) {
      if (SIZES[i].servings * f >= guests) return { size: SIZES[i], servings: Math.round(SIZES[i].servings * f) };
    }
    return null;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function init(root) {
    if (root.getAttribute('data-ready')) return;
    root.setAttribute('data-ready', '1');
    var id = 'cs' + Math.random().toString(36).slice(2, 7);
    root.classList.add('cs');
    root.innerHTML =
      '<h3 class="cs__title">How big a cake do I need?</h3>' +
      '<p class="cs__lede">Tell us how many guests and we will suggest a size. It is a guide: ask at the counter and we will happily adjust.</p>' +
      '<div class="cs__grid"><form class="cs__form" novalidate>' +
      '<div class="cs__field"><label for="' + id + 'n">Number of guests</label>' +
      '<div class="cs__row"><input id="' + id + 'n" type="number" inputmode="numeric" min="1" max="' + MAX_GUESTS + '" value="24">' +
      '<span class="cs__unit">guests</span></div>' +
      '<input id="' + id + 'r" class="cs__range" type="range" min="1" max="' + MAX_GUESTS + '" value="24" aria-label="Guests, slider">' +
      '<p class="cs__error" role="alert" hidden></p></div>' +
      '<fieldset class="cs__field cs__slices"><legend>Slice size</legend>' +
      '<label><input type="radio" name="' + id + 's" value="party" checked><span>Party slice</span></label>' +
      '<label><input type="radio" name="' + id + 's" value="small"><span>Small, after a big meal</span></label></fieldset>' +
      '</form>' +
      '<div class="cs__result" aria-live="polite"><div class="cs__stack" aria-hidden="true"></div>' +
      '<p class="cs__big"><span class="cs__num">0</span><span class="cs__big-label">servings</span></p>' +
      '<p class="cs__name"></p><p class="cs__note"></p></div></div>' +
      '<p class="cs__fine">Sizes are round cakes, in inches. Servings are approximate and for a guide only.</p>';

    var num = root.querySelector('#' + id + 'n'), rng = root.querySelector('#' + id + 'r');
    var err = root.querySelector('.cs__error'), stack = root.querySelector('.cs__stack');
    var out = root.querySelector('.cs__num'), nameEl = root.querySelector('.cs__name'), note = root.querySelector('.cs__note');
    var shown = 0, raf = 0;

    function animate(to) {
      cancelAnimationFrame(raf);
      if (reduce) { shown = to; out.textContent = to; return; }
      var from = shown, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - p, 3);
        shown = Math.round(from + (to - from) * e);
        out.textContent = shown;
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }

    function draw(tiers) {
      stack.innerHTML = '';
      var max = Math.max.apply(null, tiers);
      for (var i = tiers.length - 1; i >= 0; i--) {   // smallest on top
        var t = el('span', 'cs__tier');
        t.style.width = (30 + 70 * tiers[i] / max) + '%';
        t.setAttribute('data-in', '');
        t.style.transitionDelay = ((tiers.length - 1 - i) * 90) + 'ms';
        stack.appendChild(t);
      }
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        Array.prototype.forEach.call(stack.children, function (c) { c.classList.add('is-on'); });
      }); });
    }

    function update(source) {
      var g = parseInt(source.value, 10);
      if (!(g >= 1)) {
        err.hidden = false; err.textContent = 'Please enter a number of guests, from 1 up.';
        num.setAttribute('aria-invalid', 'true'); return;
      }
      err.hidden = true; num.removeAttribute('aria-invalid');
      if (g > MAX_GUESTS) g = MAX_GUESTS;
      if (source === num) { rng.value = g; } else { num.value = g; }
      var small = root.querySelector('input[type=radio]:checked').value === 'small';
      var r = pick(g, small);
      if (!r) {
        nameEl.textContent = 'More than one cake'; note.textContent = 'For this many guests we would make two cakes. Ask at the counter.';
        animate(g); stack.innerHTML = ''; return;
      }
      draw(r.size.tiers);
      animate(r.servings);
      nameEl.textContent = r.size.name;
      var spare = r.servings - g;
      note.textContent = 'Feeds ' + r.servings + ' for your ' + g + ' guest' + (g === 1 ? '' : 's') +
        (spare > 0 ? ', with ' + spare + ' to spare for second helpings.' : '.');
    }

    num.addEventListener('input', function () { update(num); });
    rng.addEventListener('input', function () { update(rng); });
    root.querySelector('.cs__form').addEventListener('change', function () { update(num); });
    root.querySelector('.cs__form').addEventListener('submit', function (e) { e.preventDefault(); });
    update(num);
  }

  function boot() { Array.prototype.forEach.call(document.querySelectorAll('[data-cake-size]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
