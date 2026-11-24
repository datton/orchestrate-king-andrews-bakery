// Motion: reads data- attributes. Animates transform, opacity and filter only.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('reduced');
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function splitWords(node, cls) {
    var text = node.textContent.replace(/\s+/g, ' ').trim();
    node.setAttribute('aria-label', text);
    node.textContent = '';
    text.split(' ').forEach(function (w, i, arr) {
      var s = document.createElement('span');
      s.className = cls; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i); s.textContent = w;
      node.appendChild(s);
      if (i < arr.length - 1) node.appendChild(document.createTextNode(' '));
    });
  }

  function init() {
    // progress bar
    var bar = document.createElement('div');
    bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    // word-by-word headlines
    $all('[data-words]').forEach(function (n) { splitWords(n, 'w'); n.classList.add('words'); });

    // headings slide up from behind a mask
    $all('main h2:not([data-words])').forEach(function (h) {
      if (h.querySelector('.mask__in')) return;
      var inner = document.createElement('span'); inner.className = 'mask__in';
      while (h.firstChild) inner.appendChild(h.firstChild);
      h.appendChild(inner); h.classList.add('mask'); h.setAttribute('data-reveal-target', '');
    });

    // kinetic line: <span data-rotate="bread|pastry|cake">
    $all('[data-rotate]').forEach(function (n) {
      var list = n.getAttribute('data-rotate').split('|'); if (list.length < 2) return;
      n.setAttribute('aria-label', list[0]);
      var i = 0; n.textContent = list[0]; n.classList.add('rotator');
      if (reduce) return;
      setInterval(function () {
        n.classList.add('is-out');
        setTimeout(function () { i = (i + 1) % list.length; n.textContent = list[i]; n.classList.remove('is-out'); }, 450);
      }, 2600);
    });

    // marquee
    $all('[data-marquee]').forEach(function (n) {
      var text = n.textContent.replace(/\s+/g, ' ').trim();
      n.setAttribute('aria-label', text); n.textContent = '';
      var track = document.createElement('div'); track.className = 'marquee__track'; track.setAttribute('aria-hidden', 'true');
      for (var k = 0; k < 4; k++) {
        var s = document.createElement('span'); s.textContent = text + '  •  '; track.appendChild(s);
      }
      n.appendChild(track); n.classList.add('marquee');
    });

    // fill statement
    var fills = $all('[data-fill]').map(function (n) {
      splitWords(n, 'f'); n.classList.add('fill');
      return { n: n, w: $all('.f', n) };
    });

    // sticky steps
    $all('[data-sticky-steps]').forEach(function (sec) {
      var steps = $all('[data-step]', sec); if (!steps.length) return;
      var word = sec.querySelector('.steps__word, [data-step-word]');
      var own = !!word && !word.classList.contains('steps__word');
      if (!word) {
        word = document.createElement('div'); word.className = 'steps__word'; word.setAttribute('aria-hidden', 'true');
        var wrap = document.createElement('div'); wrap.className = 'steps__stage'; wrap.appendChild(word);
        steps[0].parentNode.insertBefore(wrap, steps[0]);
      }
      if (!own) steps[0].parentNode.classList.add('steps');
      function activate(s) {
        steps.forEach(function (x) { x.classList.toggle('is-active', x === s); });
        var st = s.querySelector('strong, b'); var t = s.getAttribute('data-word') || (st ? st.textContent.replace(/[.:]+$/, '') : '') || s.getAttribute('data-step') || '';
        if (word.textContent !== t) {
          word.classList.remove('is-in'); void word.offsetWidth;
          word.textContent = t; word.classList.add('is-in');
        }
      }
      activate(steps[0]);
      if ('IntersectionObserver' in window) {
        var so = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
        }, { rootMargin: '-45% 0px -45% 0px' });
        steps.forEach(function (s) { so.observe(s); });
      }
    });

    // count-ups
    function runCount(n) {
      var raw = n.getAttribute('data-count') || n.textContent;
      var target = parseFloat(String(raw).replace(/[^0-9.\-]/g, ''));
      if (isNaN(target)) return;
      var orig = n.getAttribute('data-count-text') || n.textContent;
      var m = orig.match(/^(\D*)([\d,.]+)(.*)$/);
      var pre = m ? m[1] : '', suf = m ? m[3] : '';
      var dec = (String(raw).split('.')[1] || '').length, comma = /,/.test(orig);
      var t0 = null, dur = 1400;
      function fmt(v) { var s = v.toFixed(dec); return pre + (comma ? Number(s).toLocaleString('en', { minimumFractionDigits: dec }) : s) + suf; }
      if (reduce) { n.textContent = fmt(target); return; }
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        n.textContent = fmt(target * e);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    $all('[data-count]').forEach(function (n) { n.setAttribute('data-count-text', n.textContent); });

    // reveals
    var revealEls = $all('[data-reveal], [data-words], [data-reveal-target], [data-count], [data-marquee], [data-fill]');
    function show(n) {
      n.classList.add('is-in');
      if (n.hasAttribute('data-count') && !n.__counted) { n.__counted = true; runCount(n); }
    }
    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach(show);
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (n) { io.observe(n); });
    }
    $all('[data-reveal]').forEach(function (n) {
      var d = n.getAttribute('data-reveal'); if (d && !isNaN(d)) n.style.transitionDelay = d + 'ms';
    });

    // scroll-driven: progress bar, fill, parallax
    var par = $all('[data-parallax]');
    var ticking = false;
    function frame() {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      fills.forEach(function (f) {
        var r = f.n.getBoundingClientRect();
        var p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
        var on = Math.round(Math.max(0, Math.min(1, p)) * f.w.length);
        f.w.forEach(function (w, i) { w.classList.toggle('is-on', reduce || i < on); });
      });
      if (!reduce) par.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var k = parseFloat(n.getAttribute('data-parallax')) || 0.12;
        var off = (r.top + r.height / 2 - innerHeight / 2) * -k;
        n.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    frame();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
