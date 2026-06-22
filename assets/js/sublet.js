/* Sublet detail (WF-09) — reads ?id= and renders the full listing from the data layer. */
(function () {
  function queryId() {
    var m = location.search.match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  var root = document.getElementById('detail-root');
  var id = queryId();

  if (!id) {
    root.innerHTML = '<p class="notfound">No sublet selected. <a href="sublets.html">Browse sublets &rarr;</a></p>';
    return;
  }

  DB.getSubletById(id).then(function (s) {
    if (!s) {
      root.innerHTML = '<p class="notfound">Sorry, that listing wasn&rsquo;t found. <a href="sublets.html">Browse sublets &rarr;</a></p>';
      return;
    }
    var contactLabel = s.contact_method === 'phone' ? 'Phone' : 'Email';
    root.innerHTML =
      '<a class="back-link" href="sublets.html">&larr; Back to sublets</a>'
      + '<article class="detail">'
      + '<div class="hero-thumb">▦</div>'
      + '<div class="body">'
      + '<span class="tag sublet">Sublet</span>'
      + '<h1>' + s.title + '</h1>'
      + '<p class="price">$' + s.price + ' <span class="per">/ month</span></p>'
      + '<p class="meta">' + s.neighborhood + ' · ' + s.beds_baths
      + ' · Available ' + Cards.fmtDate(s.move_in) + ' – ' + Cards.fmtDate(s.end_date) + '</p>'
      + '<span class="attribution"><span class="check">✓</span> Posted by a Verified Tulane student</span>'
      + '<h2>About the place</h2>'
      + '<p class="desc">' + s.description + '</p>'
      + '<div class="contact-box"><p class="label">' + contactLabel + '</p><p class="value">' + s.contact_value + '</p></div>'
      + '<a class="report-link" href="#" id="reportLink">⚐ Report listing</a>'
      + '</div></article>';

    var rl = document.getElementById('reportLink');
    if (rl) rl.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Thanks for flagging this — reporting gets wired up with accounts.');
    });
  });
})();
