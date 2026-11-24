/* Custom cake enquiry: validates, saves in this browser, offers a .txt download. Nothing is sent. */
(function () {
  'use strict';
  var KEY = 'andrews-bakery:cake-enquiries';
  var form = document.getElementById('cake-form');
  if (!form) return;
  var done = document.getElementById('cake-done');
  var savedBox = document.getElementById('cake-saved');
  var list = document.getElementById('cake-list');
  var dateEl = form.elements.date;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  var min = new Date(); min.setDate(min.getDate() + 2);
  dateEl.min = iso(min);
  dateEl.value = iso(min);

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function store(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { return false; } }

  function pretty(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function text(e) {
    return ["Andrew's Bakery: custom cake enquiry (demonstration, not sent)", '',
      'Name: ' + e.name, 'Size: ' + e.size, 'Flavour: ' + e.flavour, 'Filling: ' + e.filling,
      'Message on cake: ' + (e.message || 'none'), 'Pickup date: ' + pretty(e.date),
      'Allergies: ' + (e.allergies || 'none stated'), 'Saved: ' + new Date(e.saved).toLocaleString(), ''].join('\n');
  }
  function download(e) {
    var b = new Blob([text(e)], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'cake-enquiry-' + e.date + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function setErr(id, msg) {
    var el = document.getElementById('e-' + id), input = form.elements[id === 'allergy' ? 'allergies' : id === 'msg' ? 'message' : id];
    el.textContent = msg || '';
    if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
  }

  function validate() {
    var first = null, ok = true;
    function bad(id, msg, field) { setErr(id, msg); if (msg) { ok = false; if (!first) first = field; } }
    var name = form.elements.name.value.trim();
    bad('name', !name ? 'Please tell us your name.' : name.length < 2 ? 'That name looks too short.' : '', form.elements.name);
    var msg = form.elements.message.value;
    bad('msg', msg.length > 40 ? 'Please keep the message to 40 characters.' : '', form.elements.message);
    var d = dateEl.value, m = '';
    if (!d) m = 'Please choose a pickup date.';
    else if (d < dateEl.min) m = 'We need at least 2 days’ notice. The earliest date is ' + pretty(dateEl.min) + '.';
    bad('date', m, dateEl);
    bad('allergy', form.elements.allergies.value.length > 200 ? 'Please keep this under 200 characters.' : '', form.elements.allergies);
    if (first) first.focus();
    return ok;
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function showDone(e) {
    done.innerHTML = '<h3>Thank you, ' + esc(e.name.split(' ')[0]) + '. Your enquiry is saved.</h3>' +
      '<p>Here is what you asked for. <strong>Nothing has really been sent:</strong> this is a demonstration, so your enquiry is kept in this browser only. Download it as a text file to keep or share.</p>' +
      '<dl><dt>Cake</dt><dd>' + esc(e.size) + ', ' + esc(e.flavour) + ', ' + esc(e.filling) + '</dd>' +
      '<dt>Message</dt><dd>' + esc(e.message || 'None') + '</dd>' +
      '<dt>Pickup</dt><dd>' + esc(pretty(e.date)) + '</dd>' +
      '<dt>Allergies</dt><dd>' + esc(e.allergies || 'None stated') + '</dd></dl>' +
      '<div class="cake-actions"><button type="button" class="btn" id="cake-dl">Download as .txt</button>' +
      '<button type="button" class="btn btn--ghost" id="cake-again">Plan another cake</button></div>';
    done.hidden = false; form.hidden = true; done.focus();
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('cake-dl').onclick = function () { download(e); };
    document.getElementById('cake-again').onclick = function () { done.hidden = true; form.hidden = false; form.reset(); dateEl.value = dateEl.min; form.elements.name.focus(); };
  }

  function renderList() {
    var a = load();
    savedBox.hidden = !a.length;
    list.innerHTML = '';
    a.slice().reverse().forEach(function (e) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + esc(e.size) + ' ' + esc(e.flavour) + ' for ' + esc(pretty(e.date)) + '</span>';
      var dl = document.createElement('button'); dl.type = 'button'; dl.textContent = 'Download';
      dl.setAttribute('aria-label', 'Download enquiry for ' + pretty(e.date));
      dl.onclick = function () { download(e); };
      var rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'Remove';
      rm.setAttribute('aria-label', 'Remove enquiry for ' + pretty(e.date));
      rm.onclick = function () { store(load().filter(function (x) { return x.saved !== e.saved; })); renderList(); };
      var box = document.createElement('span'); box.appendChild(dl); box.appendChild(rm);
      li.appendChild(box); list.appendChild(li);
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!validate()) return;
    var f = form.elements;
    var e = { name: f.name.value.trim(), size: form.querySelector('input[name=size]:checked').value, flavour: f.flavour.value,
      filling: f.filling.value, message: f.message.value.trim(), date: f.date.value, allergies: f.allergies.value.trim(), saved: Date.now() };
    var a = load(); a.push(e); store(a);
    showDone(e); renderList();
  });
  ['name', 'date'].forEach(function (k) { form.elements[k].addEventListener('input', function () { setErr(k, ''); }); });
  renderList();
})();
