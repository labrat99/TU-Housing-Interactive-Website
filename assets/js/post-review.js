/* Post a review (WF-07), also handles editing an existing review (?id=<docId>).
   Gated: logged in to view; any signed-in Tulane user can submit. The author's
   verification status is saved as `verified` so cards can show a badge. Writes to 'reviews'. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var type = (location.search.match(/[?&]type=(landlord|property)/) || [])[1] || 'landlord';
  var editId = (location.search.match(/[?&]id=([^&]+)/) || [])[1] || null;
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
    Array.prototype.forEach.call(byId('starInput').children, function (s, i) { s.classList.toggle('on', i < v); });
  }
  function showError(t) { msg.className = 'form-msg error'; msg.textContent = t; window.scrollTo(0, 0); }
  function showInfo(html) { msg.className = 'form-msg success'; msg.innerHTML = html; window.scrollTo(0, 0); }
  function populateYears() {
    var from = byId('yearFrom'), to = byId('yearTo');
    for (var y = 2026; y >= 2016; y--) { from.add(new Option(y, y)); to.add(new Option(y, y)); }
    to.value = 2026; from.value = 2025;
  }

  function validate() {
    if (!rating) return 'Please choose a star rating.';
    if (!byId('neighborhood').value.trim()) return 'Please enter a neighborhood.';
    if (!byId('reviewText').value.trim()) return 'Please write your review.';
    if (byId('reviewText').value.trim().length < 40) return 'Please add a bit more detail — at least a sentence or two.';
    if (type === 'landlord' && !byId('landlordName').value.trim()) return 'Please enter the landlord or company name.';
    if (type === 'property' && !byId('propertyName').value.trim()) return 'Please enter the property or building name.';
    if (type === 'property' && !byId('propertyAddress').value.trim()) return 'Please enter the street address.';
    return null;
  }
  function buildData(u) {
    var verified = !!u.emailVerified;
    var data = {
      review_type: type, neighborhood: byId('neighborhood').value.trim(),
      rating: rating, text: byId('reviewText').value.trim(),
      user_id: u.uid, verified: verified,
      public_attribution: verified ? 'Verified Tulane student' : 'Tulane student'
    };
    if (type === 'landlord') { data.subject = byId('landlordName').value.trim(); data.landlord_type = byId('landlordType').value; }
    else { data.subject = byId('propertyName').value.trim(); data.property_address = byId('propertyAddress').value.trim(); data.lived_window = byId('yearFrom').value + '–' + byId('yearTo').value; }
    return data;
  }

  function onSubmit(e, u) {
    e.preventDefault();
    msg.className = 'form-msg'; msg.textContent = '';
    var err = validate();
    if (err) return showError(err);

    var data = buildData(u);
    if (!editId) data.created_at = firebase.firestore.FieldValue.serverTimestamp();
    submitBtn.disabled = true; submitBtn.textContent = editId ? 'Saving…' : 'Posting…';
    // refresh the verification token first so a just-verified user isn't blocked
    Auth.refreshToken().then(function () {
      return editId
        ? window.fbDB.collection('reviews').doc(editId).update(data)
        : window.fbDB.collection('reviews').add(data);
    }).then(function () { location.href = editId ? 'account.html' : 'reviews.html'; })
      .catch(function (e2) {
        submitBtn.disabled = false; submitBtn.textContent = editId ? 'Save changes' : 'Post review';
        showError('Could not save: ' + ((e2 && e2.message) || 'please try again.'));
      });
  }

  function initForm(u) {
    msg = byId('msg'); submitBtn = byId('submitBtn');
    populateYears();
    byId('toggleLandlord').addEventListener('click', function () { setType('landlord'); });
    byId('toggleProperty').addEventListener('click', function () { setType('property'); });
    Array.prototype.forEach.call(byId('starInput').children, function (s) {
      s.addEventListener('click', function () { setRating(+s.getAttribute('data-v')); });
    });
    byId('reviewForm').addEventListener('submit', function (e) { onSubmit(e, u); });

    if (editId) {
      window.fbDB.collection('reviews').doc(editId).get().then(function (doc) {
        if (!doc.exists || doc.data().user_id !== u.uid) { location.replace('account.html'); return; }
        var d = doc.data();
        document.querySelector('.form-page h1').textContent = 'Edit review';
        submitBtn.textContent = 'Save changes';
        setType(d.review_type);
        if (d.review_type === 'landlord') {
          byId('landlordName').value = d.subject || '';
          byId('landlordType').value = d.landlord_type || 'Private landlord';
        } else {
          byId('propertyName').value = d.subject || '';
          byId('propertyAddress').value = d.property_address || '';
          if (d.lived_window) { var yr = d.lived_window.split('–'); if (yr[0]) byId('yearFrom').value = yr[0].trim(); if (yr[1]) byId('yearTo').value = yr[1].trim(); }
        }
        byId('neighborhood').value = d.neighborhood || '';
        setRating(d.rating || 0);
        byId('reviewText').value = d.text || '';
        byId('formPage').hidden = false;
      }).catch(function () { location.replace('account.html'); });
    } else {
      setType(type); setRating(0); byId('formPage').hidden = false;
    }
  }

  if (window.Auth) {
    Auth.onReady(function (u) {
      if (!u) { location.replace('auth.html?next=' + encodeURIComponent('post-review.html' + location.search)); return; }
      initForm(u);
    });
  }
})();
