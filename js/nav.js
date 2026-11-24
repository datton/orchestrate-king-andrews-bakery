// Shared page shell: skip link, header, nav, footer. Pages never write their own.
(function () {
  document.documentElement.classList.add('js');
  var script = document.currentScript || document.querySelector('script[src$="js/nav.js"]');
  var src = script ? script.getAttribute('src') : 'js/nav.js';
  var root = src.replace(/js\/nav\.js.*$/, ''); // "" on the home page, "../" in pages/
  var BRAND = "Andrew's Bakery";
  var links = [
    ['Home', 'index.html'],
    ['Story', 'pages/story.html'],
    ['Menu', 'pages/menu.html'],
    ['Custom cakes', 'pages/cake.html'],
    ['Visit', 'pages/visit.html'],
    ['FAQ', 'pages/faq.html']
  ];
  var here = location.pathname.replace(/\/index\.html$/, '/');
  function isCurrent(href) {
    var p = ('/' + href).replace(/\/index\.html$/, '/');
    if (href === 'index.html') return /\/$/.test(here) && !/\/pages\/$/.test(here);
    return here.slice(-p.length) === p;
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html;
    return e;
  }
  function build() {
    var body = document.body;
    var main = document.getElementById('main');
    if (!document.querySelector('.skip-link')) {
      body.insertBefore(el('a', { 'class': 'skip-link', href: '#main' }, 'Skip to content'), body.firstChild);
    }
    if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    var header = el('header', { 'class': 'site-header' });
    var inner = el('div', { 'class': 'site-header__inner' });
    inner.appendChild(el('a', { 'class': 'brand', href: root + 'index.html' }, BRAND));
    var btn = el('button', { 'class': 'nav-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'site-nav' },
      '<span class="nav-toggle__bars" aria-hidden="true"></span><span class="visually-hidden">Menu</span>');
    inner.appendChild(btn);
    var nav = el('nav', { 'class': 'site-nav', id: 'site-nav', 'aria-label': 'Main' });
    var ul = el('ul');
    links.forEach(function (l) {
      var li = el('li');
      var a = el('a', { href: root + l[1] }, l[0]);
      if (isCurrent(l[1])) a.setAttribute('aria-current', 'page');
      li.appendChild(a); ul.appendChild(li);
    });
    nav.appendChild(ul); inner.appendChild(nav); header.appendChild(inner);
    body.insertBefore(header, main || body.firstChild);
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      header.classList.toggle('is-open', open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { set(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    var footer = el('footer', { 'class': 'site-footer' });
    footer.innerHTML =
      '<div class="site-footer__inner"><div><p class="site-footer__brand">' + BRAND + '</p>' +
      '<p>Baked fresh each morning. Ask at the counter.</p></div>' +
      '<ul class="site-footer__links">' + links.map(function (l) {
        return '<li><a href="' + root + l[1] + '">' + l[0] + '</a></li>';
      }).join('') + '</ul></div>' +
      '<p class="site-footer__fine">A demonstration site built by the Orchestrate Solutions team. Cake enquiries stay in your browser.</p>';
    body.appendChild(footer);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
