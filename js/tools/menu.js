// Signature bakes: filterable menu (category + dietary tags). All data is sample.
(function () {
  var BAKES = [
    { n: "Country sourdough", c: "Bread", p: 7.5, t: ["vegan", "nut-free"], d: "Long-fermented wheat loaf with a crackling crust and open crumb." },
    { n: "Seeded rye loaf", c: "Bread", p: 8, t: ["vegan", "nut-free"], d: "Dense, tangy rye packed with sunflower, pumpkin and flax seeds." },
    { n: "Olive and thyme baguette", c: "Bread", p: 5.5, t: ["vegan", "nut-free"], d: "Crisp baguette studded with olives and fresh thyme." },
    { n: "Focaccia with rosemary", c: "Bread", p: 6, t: ["vegan", "nut-free"], d: "Olive-oil rich, dimpled and finished with flaky salt." },
    { n: "Butter croissant", c: "Pastry", p: 4, t: ["nut-free"], d: "Hundreds of buttery layers, shatteringly crisp outside." },
    { n: "Pain au chocolat", c: "Pastry", p: 4.5, t: ["nut-free"], d: "Our croissant dough wrapped around dark chocolate." },
    { n: "Almond frangipane tart", c: "Pastry", p: 5.5, t: [], d: "Short pastry, almond cream and toasted flaked almonds." },
    { n: "Cinnamon bun", c: "Buns", p: 4.75, t: ["nut-free"], d: "Soft, swirled with cinnamon sugar and glazed while warm." },
    { n: "Cardamom knot", c: "Buns", p: 4.75, t: ["nut-free"], d: "A twisted, pearl-sugar topped bun scented with cardamom." },
    { n: "Vegan oat and apple muffin", c: "Sweet treats", p: 3.75, t: ["vegan", "nut-free"], d: "Oat milk, baked apple and a crunchy oat crumble top." },
    { n: "Brown butter cookie", c: "Sweet treats", p: 3.25, t: ["nut-free"], d: "Chewy, nutty-tasting brown butter with chocolate chunks." },
    { n: "Sea salt chocolate brownie", c: "Sweet treats", p: 4, t: ["nut-free"], d: "Fudgy, dark and finished with sea salt flakes." }
  ];
  var CATS = ["All"].concat(BAKES.reduce(function (a, b) { if (a.indexOf(b.c) < 0) a.push(b.c); return a; }, []));
  var DIETS = [["vegan", "Vegan"], ["nut-free", "Nut-free"]];
  var cat = "All", diet = {};

  var css = document.createElement("style");
  css.textContent = [
    ".bakes-hero{padding-block:clamp(5rem,12vw,10rem);min-height:70svh;display:flex;align-items:center}",
    ".bakes-hero .wrap,.bakes-tool .wrap{width:min(1200px,100% - 2rem);margin-inline:auto}",
    ".bakes-eyebrow{text-transform:uppercase;letter-spacing:var(--ls-caps);font-size:var(--fs-sm);color:var(--accent);font-weight:600}",
    ".bakes-hero h1{font-family:var(--font-display);font-size:var(--fs-h1);line-height:var(--lh-tight);letter-spacing:var(--ls-display);margin:.2em 0 .3em}",
    ".bakes-lead{font-size:var(--fs-lead);max-width:42ch;color:var(--ink-muted)}",
    ".bakes-stats{display:flex;flex-wrap:wrap;gap:.5rem 2rem;margin-top:2rem;color:var(--ink-muted)}",
    ".bakes-stats strong{font-family:var(--font-display);font-size:var(--fs-h3);color:var(--accent)}",
    ".bakes-tool{padding-block:clamp(5rem,12vw,10rem)}",
    ".bakes-tool h2{font-family:var(--font-display);font-size:var(--fs-h2);letter-spacing:var(--ls-heading);line-height:var(--lh-tight);margin:0 0 .5em;color:var(--ink-on-dark)}",
    ".bk-filters{display:grid;gap:1rem;margin-bottom:2rem}",
    ".bk-row{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;border:0;padding:0;margin:0}",
    ".bk-row legend{font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:var(--ls-caps);color:var(--ink-on-dark-muted);margin-bottom:.5rem;padding:0}",
    ".bk-chip{font:inherit;font-size:var(--fs-sm);cursor:pointer;color:var(--ink-on-dark);background:transparent;border:1px solid var(--line-on-dark);border-radius:999px;padding:.55em 1.1em;min-height:44px;transition:transform .3s cubic-bezier(.2,.7,.2,1),background .3s,color .3s}",
    ".bk-chip:hover{transform:translateY(-2px);border-color:var(--accent-on-dark)}",
    ".bk-chip[aria-pressed=true]{background:var(--accent-on-dark);color:var(--bg-dark);border-color:var(--accent-on-dark);font-weight:600}",
    ".bk-chip:focus-visible{outline:3px solid var(--focus);outline-offset:2px}",
    ".bk-count{color:var(--ink-on-dark-muted);margin:0 0 1.25rem}",
    ".bk-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr));gap:1.25rem}",
    ".bk-card{background:var(--bg-dark-soft);border:1px solid var(--line-on-dark);border-radius:1.25rem;padding:1.5rem;display:flex;flex-direction:column;gap:.6rem;box-shadow:0 10px 30px rgba(0,0,0,.25);animation:bk-in .6s cubic-bezier(.2,.7,.2,1) both;transition:transform .35s cubic-bezier(.2,.7,.2,1)}",
    ".bk-card:hover{transform:translateY(-4px)}",
    ".bk-card h3{font-family:var(--font-display);font-size:var(--fs-h3);letter-spacing:var(--ls-heading);line-height:var(--lh-snug);margin:0;color:var(--ink-on-dark)}",
    ".bk-card p{margin:0;color:var(--ink-on-dark-muted);line-height:var(--lh-body);font-size:var(--fs-sm)}",
    ".bk-meta{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:.5rem}",
    ".bk-cat{font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:var(--ls-caps);color:var(--accent-on-dark)}",
    ".bk-price{font-family:var(--font-display);font-size:var(--fs-h3);color:var(--ink-on-dark)}",
    ".bk-tags{display:flex;gap:.4rem;flex-wrap:wrap}",
    ".bk-tag{font-size:var(--fs-xs);border:1px solid var(--line-on-dark);border-radius:999px;padding:.15em .7em;color:var(--ink-on-dark)}",
    ".bk-empty{padding:2rem;border:1px dashed var(--line-on-dark);border-radius:1.25rem;color:var(--ink-on-dark-muted)}",
    ".bakes-note{margin-top:2rem;color:var(--ink-on-dark-muted);font-size:var(--fs-sm)}",
    "@keyframes bk-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.bk-card,.bk-chip{animation:none;transition:none}.bk-card:hover,.bk-chip:hover{transform:none}}"
  ].join("\n");
  document.head.appendChild(css);

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  var root = document.getElementById("bakes-app");
  if (!root) return;
  root.textContent = "";
  var filters = el("div", "bk-filters"), count = el("p", "bk-count"), grid = el("ul", "bk-grid");
  count.setAttribute("aria-live", "polite");
  root.append(filters, count, grid);

  function chip(label, on, fn) {
    var b = el("button", "bk-chip", label); b.type = "button";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.addEventListener("click", fn); return b;
  }
  function renderFilters() {
    filters.textContent = "";
    var r1 = el("fieldset", "bk-row"); r1.appendChild(el("legend", "", "Category"));
    CATS.forEach(function (c) { r1.appendChild(chip(c, cat === c, function () { cat = c; update(true); })); });
    var r2 = el("fieldset", "bk-row"); r2.appendChild(el("legend", "", "Dietary"));
    DIETS.forEach(function (d) { r2.appendChild(chip(d[1], !!diet[d[0]], function () { diet[d[0]] = !diet[d[0]]; update(true); })); });
    filters.append(r1, r2);
  }
  function renderGrid() {
    var list = BAKES.filter(function (b) {
      return (cat === "All" || b.c === cat) && DIETS.every(function (d) { return !diet[d[0]] || b.t.indexOf(d[0]) >= 0; });
    });
    grid.textContent = "";
    count.textContent = list.length + (list.length === 1 ? " bake" : " bakes") + " shown";
    if (!list.length) {
      var li = el("li", "bk-empty", "Nothing matches those filters. Try clearing one: the counter often has something that fits.");
      grid.appendChild(li); return;
    }
    list.forEach(function (b, i) {
      var li = el("li", "bk-card"); li.style.animationDelay = (i * 40) + "ms";
      li.appendChild(el("h3", "", b.n));
      li.appendChild(el("p", "", b.d));
      var tags = el("div", "bk-tags");
      b.t.forEach(function (t) { tags.appendChild(el("span", "bk-tag", t === "vegan" ? "Vegan" : "Nut-free")); });
      if (b.t.length) li.appendChild(tags);
      var m = el("div", "bk-meta");
      m.append(el("span", "bk-cat", b.c), el("span", "bk-price", "$" + b.p.toFixed(2)));
      li.appendChild(m);
      grid.appendChild(li);
    });
  }
  function update(keepFocus) {
    var active = keepFocus && document.activeElement ? document.activeElement.textContent : null;
    renderFilters(); renderGrid();
    if (active) { var bs = filters.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) if (bs[i].textContent === active) { bs[i].focus(); break; } }
  }
  update(false);
})();
