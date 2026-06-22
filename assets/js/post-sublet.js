/* Post a sublet (WF-08), also handles editing an existing sublet (?id=<docId>).
   Gated: logged in to view, verified to submit. Writes to Firestore 'sublets'.
   (Photo upload is intentionally deferred for the MVP — listings use the placeholder image.) */
(function () {
  function byId(id) { return document.getElementById(id); }
  var editId = (location.search.match(/[?&]id=([^&]+)/) || [])[1] || null;
  var contactMethod = 'email';
  var msg, submitBtn;

  function setContact(m) {
    contactMethod = m;
    byId('toggleEmail').classList.toggle('active', m === 'email');
    byId('togglePhone').classList.toggle('active', m === 'phone');
    byId('contactLabel').textContent = m === 'email' ? 'Contact email' : 'Contact phone';
    var cv = byId('contactValue');
    cv.type = m === 'email' ? 'email' : 'tel';
    cv.placeholder = m === 'email' ? 'you@tulane.edu' : '504-555-0123';
  }
  function showError(t) { msg.className = 'form-msg error'; msg.textContent = t; window.scrollTo(0, 0); }
  function showInfo(html) { msg.className = 'form-msg success'; msg.innerHTML = html; window.scrollTo(0, 0); }

  function validate() {
    if (!byId('title').value.trim()) return 'Please enter a title.';
    if (!byId('neighborhood').value.trim()) return 'Please enter a neighborhood.';
    if (!byId('moveIn').value || !byId('endDate').value) return 'Please choose move-in and end dates.';
    if (new Date(byId('endDate').value) <= new Date(byId('moveIn').value)) return 'End date must be after the move-in date.';
    var p = parseInt(byId('price').value, 10);
    if (!p || p <= 0) return 'Please enter a monthly price.';
    if (!byId('beds').value.trim()) return 'Please enter beds / baths.';
    if (!byId('description').value.trim()) return 'Please describe the place.';
    if (!byId('contactValue').value.trim()) return 'Please add your contact ' + (contactMethod === 'email' ? 'email' : 'phone') + '.';
    return null;
  }
  function buildData(u) {
    return {
      title: byId('title').value.trim(), neighborhood: byId('neighborhood').value.trim(),
      move_in: byId('moveIn').value, end_date: byId('endDate').value,
      price: parseInt(byId('price').value, 10), beds_baths: byId('beds').value.trim(),
      description: byId('description').value.trim(), contact_method: contactMethod,
      contact_value: byId('contactValue').value.trim(), user_id: u.uid
    };
  }

  function onSubmit(e, u) {
    e.preventDefault();
    msg.className = 'form-msg'; msg.textContent = '';
    var err = validate();
    if (err) return showError(err);
    if (!Auth.isVerified()) return showInfo('Almost there — please <a href="verify-email.html">verify your Tulane email</a> before posting.');

    var data = buildData(u);
    submitBtn.disabled = true; submitBtn.textContent = editId ? 'Saving…' : 'Posting…';
    var op;
    if (editId) { op = window.fbDB.collection('sublets').doc(editId).update(data).then(function () { return { id: editId }; }); }
    else { data.created_at = firebase.firestore.FieldValue.serverTimestamp(); op = window.fbDB.collection('sublets').add(data); }
    op.then(function (ref) { location.href = 'sublet.html?id=' + (editId || ref.id); })
      .catch(function (e2) {
        submitBtn.disabled = false; submitBtn.textContent = editId ? 'Save changes' : 'Post sublet';
        showError('Could not save: ' + ((e2 && e2.message) || 'please try again.'));
      });
  }

  function initForm(u) {
    msg = byId('msg'); submitBtn = byId('submitBtn');
    setContact('email');
    byId('toggleEmail').addEventListener('click', function () {
      setContact('email');
      if (u.email && !byId('contactValue').value) byId('contactValue').value = u.email;
    });
    byId('togglePhone').addEventListener('click', function () {
      var wasEmailPrefill = (byId('contactValue').value === u.email);
      setContact('phone');
      if (wasEmailPrefill) byId('contactValue').value = '';
    });
    byId('subletForm').addEventListener('submit', function (e) { onSubmit(e, u); });

    if (editId) {
      window.fbDB.collection('sublets').doc(editId).get().then(function (doc) {
        if (!doc.exists || doc.data().user_id !== u.uid) { location.replace('account.html'); return; }
        var d = doc.data();
        document.querySelector('.form-page h1').textContent = 'Edit sublet';
        submitBtn.textContent = 'Save changes';
        byId('title').value = d.title || '';
        byId('neighborhood').value = d.neighborhood || '';
        byId('moveIn').value = d.move_in || '';
        byId('endDate').value = d.end_date || '';
        byId('price').value = d.price || '';
        byId('beds').value = d.beds_baths || '';
        byId('description').value = d.description || '';
        setContact(d.contact_method || 'email');
        byId('contactValue').value = d.contact_value || '';
        byId('formPage').hidden = false;
      }).catch(function () { location.replace('account.html'); });
    } else {
      if (u.email) byId('contactValue').value = u.email;
      byId('formPage').hidden = false;
    }
  }

  if (window.Auth) {
    Auth.onReady(function (u) {
      if (!u) { location.replace('auth.html?next=' + encodeURIComponent('post-sublet.html' + location.search)); return; }
      initForm(u);
    });
  }
})();
