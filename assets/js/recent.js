/* Recent feed (WF-02) — mixed reviews + sublets, with search + filters.
   This is also the search-results destination (Home search routes here with ?q=). */
(function () {
  var state = { q: '', type: 'all', neighborhood: '', sort: 'recent' };
  var items = [];
  var grid = document.getElementById('recent-grid');
  var empty = document.getElementById('empty');

  function build(reviews, sublets) {
    var rv = reviews.map(function (r) {
      return {
        kind: 'review', typeKey: r.review_type, neighborhood: r.neighborhood,
        hay: [(r.subject || ''), (r.property_address || ''), (r.neighborhood || ''), (r.landlord_type || '')].join(' ').toLowerCase(),
        data: r
      };
    });
    var su = sublets.map(function (s) {
      return {
        kind: 'sublet', typeKey: 'sublet', neighborhood: s.neighborhood,
        hay: [(s.title || ''), (s.neighborhood || '')].join(' ').toLowerCase(),
        data: s
      };
    });
    // interleave so the feed feels mixed
    var out = [], i = 0, j = 0;
    while (i < rv.length || j < su.length) {
      if (i < rv.length) out.push(rv[i++]);
      if (j < su.length) out.push(su[j++]);
    }
    return out;
  }

  function populateNeighborhoods() {
    var set = {};
    items.forEach(function (it) { if (it.neighborhood) set[it.neighborhood] = 1; });
    var sel = document.getElementById('neighborhood');
    Object.keys(set).sort().forEach(function (n) {
      var o = document.createElement('option');
      o.value = n; o.textContent = n; sel.appendChild(o);
    });
  }

  function apply() {
    var q = state.q.toLowerCase().trim();
    var list = items.filter(function (it) {
      if (state.type !== 'all' && it.typeKey !== state.type) return false;
      if (state.neighborhood && it.neighborhood !== state.neighborhood) return false;
      if (q && it.hay.indexOf(q) === -1) return false;
      return true;
    });
    grid.innerHTML = list.map(function (it) {
      return it.kind === 'review' ? Cards.review(it.data) : Cards.sublet(it.data);
    }).join('');
    empty.hidden = list.length > 0;
  }

  // search coming from Home (?q=...) preloads the box
  var m = location.search.match(/[?&]q=([^&]+)/);
  if (m) state.q = decodeURIComponent(m[1].replace(/\+/g, ' '));

  document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value; apply(); });
  document.getElementById('type').addEventListener('change', function (e) { state.type = e.target.value; apply(); });
  document.getElementById('neighborhood').addEventListener('change', function (e) { state.neighborhood = e.target.value; apply(); });

  Promise.all([DB.getReviews(), DB.getSublets()]).then(function (res) {
    items = build(res[0], res[1]);
    populateNeighborhoods();
    if (state.q) document.getElementById('q').value = state.q;
    apply();
  });
})();
