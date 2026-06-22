/* Shared card markup — used by Home, Reviews browse, Sublets browse, etc.
   One source of truth so every card looks the same. */
window.Cards = (function () {
  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += i <= n ? '★' : '<span class="off">★</span>';
    return out;
  }
  function fmtDate(iso) {
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var d = new Date(iso + 'T00:00:00');
    return m[d.getMonth()] + ' ' + d.getDate();
  }
  function review(r) {
    var label = r.review_type === 'landlord' ? 'Landlord review' : 'Property review';
    var sub = r.review_type === 'landlord'
      ? ((r.landlord_type ? r.landlord_type + ' · ' : '') + r.neighborhood)
      : ((r.property_address ? r.property_address + ' · ' : '') + r.neighborhood);
    return '<article class="card">'
      + '<div class="card-top"><span class="tag">' + label + '</span>'
      + '<span class="stars">' + stars(r.rating) + '</span></div>'
      + '<h3>' + r.subject + '</h3>'
      + '<p class="muted">' + sub + '</p>'
      + '<p class="snippet">' + r.text + '</p>'
      + '<div class="card-foot"><span class="verified"><span class="check">✓</span>Verified Tulane student</span></div>'
      + '</article>';
  }
  function sublet(s) {
    return '<a class="card card-link" href="sublet.html?id=' + encodeURIComponent(s.id) + '">'
      + '<div class="thumb">▦</div>'
      + '<div class="card-top"><span class="tag sublet">Sublet</span></div>'
      + '<h3>' + s.title + '</h3>'
      + '<p class="price-line">$' + s.price + '/mo · ' + s.neighborhood + ' · ' + s.beds_baths + '</p>'
      + '<p class="date-line">' + fmtDate(s.move_in) + ' – ' + fmtDate(s.end_date) + '</p>'
      + '</a>';
  }
  return { stars: stars, fmtDate: fmtDate, review: review, sublet: sublet };
})();
