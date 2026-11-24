(function () {
  'use strict';
  // Accordion
  var items = document.querySelectorAll('[data-faq] .faq-q');
  function set(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  items.forEach(function (b) {
    b.addEventListener('click', function () { set(b, b.getAttribute('aria-expanded') !== 'true'); });
    b.addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(items), i = list.indexOf(b), n = null;
      if (e.key === 'ArrowDown') n = list[(i + 1) % list.length];
      else if (e.key === 'ArrowUp') n = list[(i - 1 + list.length) % list.length];
      else if (e.key === 'Home') n = list[0];
      else if (e.key === 'End') n = list[list.length - 1];
      if (n) { e.preventDefault(); n.focus(); }
    });
  });
  var all = document.querySelector('[data-faq-all]');
  if (all) all.addEventListener('click', function () {
    var open = all.textContent.trim() === 'Open all';
    items.forEach(function (b) { set(b, open); });
    all.textContent = open ? 'Close all' : 'Open all';
  });
  if (location.hash) {
    var t = document.querySelector(location.hash + '.faq-q');
    if (t) set(t, true);
  }

  // Allergen quick-check
  var KEY = 'andrews-bakery.allergens';
  var LIST = ['Wheat / gluten', 'Milk', 'Eggs', 'Peanuts', 'Tree nuts', 'Soya', 'Sesame', 'Fish', 'Crustaceans', 'Molluscs', 'Celery', 'Mustard', 'Lupin', 'Sulphites'];
  var grid = document.getElementById('al-grid');
  if (!grid) return;
  var saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
  LIST.forEach(function (name, i) {
    var d = document.createElement('div'); d.className = 'al-opt';
    var inp = document.createElement('input'); inp.type = 'checkbox'; inp.id = 'al' + i; inp.value = name;
    inp.checked = saved.indexOf(name) > -1;
    var lab = document.createElement('label'); lab.setAttribute('for', inp.id); lab.textContent = name;
    d.appendChild(inp); d.appendChild(lab); grid.appendChild(d);
  });
  var text = document.getElementById('al-text'), status = document.getElementById('al-status');
  function chosen() { return Array.prototype.map.call(grid.querySelectorAll('input:checked'), function (i) { return i.value; }); }
  function note() {
    var c = chosen();
    return c.length ? "Allergy note for Andrew's Bakery: please avoid " + c.join(', ') + '.' : '';
  }
  function render() {
    var c = chosen();
    text.textContent = c.length ? note() : 'Nothing ticked yet.';
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
  }
  grid.addEventListener('change', render);
  document.getElementById('al-clear').addEventListener('click', function () {
    grid.querySelectorAll('input').forEach(function (i) { i.checked = false; }); render();
  });
  document.getElementById('al-copy').addEventListener('click', function () {
    var n = note();
    if (!n) { status.textContent = 'Tick at least one allergen first.'; return; }
    var done = function () { status.textContent = 'Copied. Show it at the counter. It stays in this browser only.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(done, function () { status.textContent = 'Could not copy: select the note above instead.'; });
    else status.textContent = 'Select the note above to copy it.';
  });
  document.getElementById('al-form').addEventListener('submit', function (e) { e.preventDefault(); });
  render();
})();
