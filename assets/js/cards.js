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
  // Curated real house/apartment photos (Unsplash). Each listing gets a stable one
  // chosen by a hash of its id, so different listings show different photos.
  var HOUSE_PHOTOS = [
    '1502672260266-1c1ef2d93688', '1512917774080-9991f1c4c750', '1568605114967-8130f3a36994',
    '1570129477492-45c003edd2be', '1580587771525-78b9dba3b914', '1493809842364-78817add7ffb',
    '1522708323590-d24dbb6b0267', '1484154218962-a197022b5858', '1505691938895-1758d7feb511',
    '1560448204-e02f11c3d0e2', '1502005229762-cf1b2da7c5d6', '1545324418-cc1a3fa10c00',
    '1486304873000-235643847519', '1564013799919-ab600027ffc6', '1560185007-cde436f6a4d0'
  ];
  function subletPhoto(s) {
    if (s.photo_urls && s.photo_urls.length) return s.photo_urls[0];
    var key = String(s.id || s.title || 'sublet'), h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    var id = HOUSE_PHOTOS[h % HOUSE_PHOTOS.length];
    return 'https://images.unsplash.com/photo-' + id + '?w=640&h=420&fit=crop&q=70&auto=format';
  }
  function sublet(s) {
    return '<a class="card card-link" href="sublet.html?id=' + encodeURIComponent(s.id) + '">'
      + '<div class="thumb" style="background-image:url(\'' + subletPhoto(s) + '\')"></div>'
      + '<div class="card-top"><span class="tag sublet">Sublet</span></div>'
      + '<h3>' + s.title + '</h3>'
      + '<p class="price-line">$' + s.price + '/mo · ' + s.neighborhood + ' · ' + s.beds_baths + '</p>'
      + '<p class="date-line">' + fmtDate(s.move_in) + ' – ' + fmtDate(s.end_date) + '</p>'
      + '</a>';
  }
  return { stars: stars, fmtDate: fmtDate, review: review, sublet: sublet, subletPhoto: subletPhoto };
})();
