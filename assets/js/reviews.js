/* Reviews browse (WF-03) — live search + filters over review records.
   All filtering happens in the browser, which is perfect for our dataset size. */
(function () {
  var state = { q: '', neighborhood: '', minRating: 0, sort: 'recent', type: 'all' };
  var all = [];
  var grid = document.getElementById('reviews-grid');
  var empty = document.getElementById('empty');

  function populateNeighborhoods() {
    var set = {};
    all.forEach(function (r) { if (r.neighborhood) set[r.neighborhood] = 1; });
    var sel = document.getElementById('neighborhood');
    Object.keys(set).sort().forEach(function (n) {
      var o = document.createElement('option');
      o.value = n; o.textContent = n; sel.appendChild(o);
    });
  }

  function apply() {
    var q = state.q.toLowerCase().trim();
    var list = all.filter(function (r) {
      if (state.type !== 'all' && r.review_type !== state.type) return false;
      if (state.neighborhood && r.neighborhood !== state.neighborhood) return false;
      if (state.minRating && r.rating < state.minRating) return false;
      if (q) {
        var hay = [(r.subject || ''), (r.property_address || ''), (r.neighborhood || ''),
          (r.landlord_type || '')].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    if (state.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });

    grid.innerHTML = list.map(Cards.review).join('');
    empty.hidden = list.length > 0;
  }

  document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value; apply(); });
  document.getElementById('neighborhood').addEventListener('change', function (e) { state.neighborhood = e.target.value; apply(); });
  document.getElementById('minRating').addEventListener('change', function (e) { state.minRating = +e.target.value; apply(); });
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; apply(); });

  var toggle = document.getElementById('typeToggle');
  toggle.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    Array.prototype.forEach.call(toggle.children, function (c) { c.classList.remove('active'); });
    b.classList.add('active');
    state.type = b.dataset.type;
    apply();
  });

  DB.getReviews().then(function (data) { all = data; populateNeighborhoods(); apply(); });
})();
