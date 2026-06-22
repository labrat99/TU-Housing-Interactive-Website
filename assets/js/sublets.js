/* Sublets browse (WF-04) — live search + filters. Cards open the detail page. */
(function () {
  var state = { q: '', price: '', beds: '', movein: '', sort: 'soon' };
  var all = [];
  var grid = document.getElementById('sublets-grid');
  var empty = document.getElementById('empty');

  function monthRange(val) {
    var y = +val.slice(0, 4), m = +val.slice(5, 7);
    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0) };
  }
  function inPrice(p) {
    if (state.price === 'lt800') return p < 800;
    if (state.price === '800to1200') return p >= 800 && p <= 1200;
    if (state.price === 'gt1200') return p > 1200;
    return true;
  }
  function inBeds(b) {
    b = (b || '').toLowerCase();
    if (state.beds === 'studio') return b.indexOf('studio') !== -1;
    if (state.beds === '1') return b.indexOf('1 bd') !== -1;
    if (state.beds === '2') return b.indexOf('2 bd') !== -1;
    return true;
  }
  function inMovein(s) {
    if (!state.movein) return true;
    var r = monthRange(state.movein);
    var mi = new Date(s.move_in + 'T00:00:00'), en = new Date(s.end_date + 'T00:00:00');
    return mi <= r.end && en >= r.start; // listing is available during that month
  }
  function apply() {
    var q = state.q.toLowerCase().trim();
    var list = all.filter(function (s) {
      if (!inPrice(s.price)) return false;
      if (!inBeds(s.beds_baths)) return false;
      if (!inMovein(s)) return false;
      if (q) {
        var hay = ((s.title || '') + ' ' + (s.neighborhood || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    if (state.sort === 'price') list.sort(function (a, b) { return a.price - b.price; });
    else list.sort(function (a, b) { return new Date(a.move_in) - new Date(b.move_in); });

    grid.innerHTML = list.map(Cards.sublet).join('');
    empty.hidden = list.length > 0;
  }

  document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value; apply(); });
  document.getElementById('price').addEventListener('change', function (e) { state.price = e.target.value; apply(); });
  document.getElementById('beds').addEventListener('change', function (e) { state.beds = e.target.value; apply(); });
  document.getElementById('movein').addEventListener('change', function (e) { state.movein = e.target.value; apply(); });
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; apply(); });

  DB.getSublets().then(function (d) { all = d; apply(); });
})();
