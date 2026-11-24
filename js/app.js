// Home page: "Today at the counter", a sample bake that changes with the weekday.
(function () {
  var bakes = [
    ['Sunday', 'Cinnamon bun', 'Soft, sticky and spiced: a slow Sunday classic.'],
    ['Monday', 'Country sourdough', 'A deep, crackling crust and a soft, tangy crumb.'],
    ['Tuesday', 'Butter croissant', 'Dozens of golden, buttery layers.'],
    ['Wednesday', 'Seeded rye loaf', 'Hearty, nutty and made for sandwiches.'],
    ['Thursday', 'Almond croissant', 'Filled and twice-baked, with toasted almonds on top.'],
    ['Friday', 'Cookies', 'Chunky, chewy and baked in small batches.'],
    ['Saturday', 'Celebration cake slice', 'A slice of the cake we bake for your big days.']
  ];
  var day = document.getElementById('tb-day'), name = document.getElementById('tb-name'),
      note = document.getElementById('tb-note'), btn = document.getElementById('tb-next');
  if (!day || !name || !note || !btn) return;
  var i = new Date().getDay(), today = i;
  function show() {
    var b = bakes[i];
    day.textContent = i === today ? 'Today · ' + b[0] : b[0];
    name.textContent = b[1];
    note.textContent = b[2];
  }
  btn.addEventListener('click', function () { i = (i + 1) % bakes.length; show(); });
  show();
})();
