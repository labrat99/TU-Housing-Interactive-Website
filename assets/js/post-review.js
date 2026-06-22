/* Post a review (WF-07). Gated: must be logged in to view, verified to submit.
   Saves a new review straight to the Firestore 'reviews' collection. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var type = (location.search.match(/[?&]type=(landlord|property)/) || [])[1] || 'landlord';
  var rating = 0;
  var msg, submitBtn;

  function setType(t) {
    type = t;
    byId('toggleLandlord').classList.toggle('active', t === 'landlord');
    byId('toggleProperty').classList.toggle('active', t === 'property');
    document.querySelector('.lf').hidden = (t !== 'landlord');
    document.querySelector('.pf').hidden = (t !== 'property');
  }
  function setRating(v) {
    rating = v;
    Array.prototype.forEach.call(byId('starInput').children, function (s, i) {
      s.classList.toggle('on', i < v);
    });
  }
  function showError(t) { msg.className = 'form-msg error'; msg.textContent = t; window.scrollTo(0, 0); }
  function showInfo(html) { msg.className = 'form-msg success'; msg.innerHTML = html; window.scrollTo(0, 0); }

  function populateYears() {
    var from = byId('yearFrom'), to = byId('yearTo');
    for (var y = 2026; y >= 2016; y--) { from.add(new Option(y, y)); to.add(new Option(y, y)); }
    to.value = 2026; from.value = 2025;
  }

  function initForm(u) {
    msg = byId('msg'); submitBtn = byId('submitBtn');
    populateYears();
    setType(type);
    setRating(0);
    byId('formPage').hidden = false;

    byId('toggleLandlord').addEventListener('click', function () { setType('landlord'); });
    byId('toggleProperty').addEventListener('click', function () { setType('property'); });
    Array.prototype.forEach.call(byId('starInput').children, function (s) {
      s.addEventListener('click', function () { setRating(+s.getAttribute('data-v')); });
    });

    byId('reviewForm').addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg'; msg.textContent = '';

      var neighborhood = byId('neighborhood').value.trim();
      var text = byId('reviewText').value.trim();
      if (!rating) return showError('Please choose a star rating.');
      if (!neighborhood) return showError('Please enter a neighborhood.');
      if (!text) return showError('Please write your review.');

      var data = {
        review_type: type, neighborhood: neighborhood, rating: rating, text: text,
        user_id: u.uid, public_attribution: 'Verified Tulane student',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (type === 'landlord') {
        var name = byId('landlordName').value.trim();
        if (!name) return showError('Please enter the landlord or company name.');
        data.subject = name;
        data.landlord_type = byId('landlordType').value;
      } else {
        var addr = byId('propertyAddress').value.trim();
        if (!addr) return showError('Please enter the address or building.');
        data.subject = addr;
        data.property_address = '';
        data.lived_window = byId('yearFrom').value + '–' + byId('yearTo').value;
      }

      if (!Auth.isVerified()) {
        return showInfo('Almost there — please <a href="verify-email.html">verify your Tulane email</a> before posting.');
      }

      submitBtn.disabled = true; submitBtn.textContent = 'Posting…';
      window.fbDB.collection('reviews').add(data)
        .then(function () { location.href = 'reviews.html'; })
        .catch(function (err) {
          submitBtn.disabled = false; submitBtn.textContent = 'Post review';
          showError('Could not post: ' + ((err && err.message) || 'please try again.'));
        });
    });
  }

  // Gate: logged out -> auth; otherwise show the form.
  if (window.Auth) {
    Auth.onReady(function (u) {
      if (!u) {
        location.replace('auth.html?next=' + encodeURIComponent('post-review.html' + location.search));
        return;
      }
      initForm(u);
    });
  }
})();
