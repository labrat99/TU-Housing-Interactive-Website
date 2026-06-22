/* Home page — render the 3 "Recent activity" preview cards from the data layer.
   Matches WF-01: Landlord review, Sublet, Property review. */
(function () {
  Promise.all([DB.getReviews(), DB.getSublets()]).then(function (res) {
    var reviews = res[0], sublets = res[1];
    var landlord = reviews.filter(function (r) { return r.review_type === 'landlord'; })[0];
    var property = reviews.filter(function (r) { return r.review_type === 'property'; })[0];
    var sublet = sublets[0];

    var grid = document.getElementById('recent-grid');
    if (!grid) return;
    var html = '';
    if (landlord) html += Cards.review(landlord);
    if (sublet) html += Cards.sublet(sublet);
    if (property) html += Cards.review(property);
    grid.innerHTML = html;
  });
})();
