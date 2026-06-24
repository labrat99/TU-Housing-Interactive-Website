/* Post a sublet (WF-08), also handles editing (?id=<docId>), with an OPTIONAL photo.
   Gated: logged in to view, verified to submit. Writes to Firestore 'sublets'.
   If a photo is chosen, it uploads to Firebase Storage under sublets/ and is saved
   as imageUrl on the document. Posting works fine with no photo. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var editId = (location.search.match(/[?&]id=([^&]+)/) || [])[1] || null;
  var contactMethod = 'email';
  var selectedFile = null;
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

  function onPhotoChange() {
    var input = byId('photo');
    var f = input.files && input.files[0];
    selectedFile = null;
    byId('photoPreview').hidden = true;
    if (!f) return;
    if (['image/jpeg', 'image/png', 'image/webp'].indexOf(f.type) === -1) {
      showError('Please choose a JPG, PNG, or WebP image.'); input.value = ''; return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showError('That image is over 5MB — please choose a smaller one.'); input.value = ''; return;
    }
    selectedFile = f;
    msg.className = 'form-msg'; msg.textContent = '';
    byId('photoPreviewImg').src = URL.createObjectURL(f);
    byId('photoPreview').hidden = false;
  }

  function validate() {
    if (!byId('title').value.trim()) return 'Please enter a title.';
    if (!byId('neighborhood').value.trim()) return 'Please enter a neighborhood.';
    if (!byId('moveIn').value || !byId('endDate').value) return 'Please choose move-in and end dates.';
    if (new Date(byId('endDate').value) <= new Date(byId('moveIn').value)) return 'End date must be after the move-in date.';
    var p = parseInt(byId('price').value, 10);
    if (!p || p <= 0) return 'Please enter a monthly price.';
    if (!byId('beds').value.trim()) return 'Please enter beds / baths.';
    if (!byId('description').value.trim()) return 'Please describe the place.';
    if (byId('description').value.trim().length < 40) return 'Please add a bit more detail — at least a sentence or two.';
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
  // Upload the chosen photo (if any) to Storage; resolves to a download URL or null.
  function uploadPhoto(u) {
    if (!selectedFile || !window.fbStorage) return Promise.resolve(null);
    var ext = (selectedFile.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    var path = 'sublets/' + u.uid + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    var ref = window.fbStorage.ref().child(path);
    return ref.put(selectedFile).then(function () { return ref.getDownloadURL(); });
  }

  function onSubmit(e, u) {
    e.preventDefault();
    msg.className = 'form-msg'; msg.textContent = '';
    var err = validate();
    if (err) return showError(err);
    if (!Auth.isVerified()) return showInfo('Almost there — please <a href="verify-email.html">verify your Tulane email</a> before posting.');

    var data = buildData(u);
    if (!editId) data.created_at = firebase.firestore.FieldValue.serverTimestamp();
    submitBtn.disabled = true;
    submitBtn.textContent = selectedFile ? 'Uploading photo…' : (editId ? 'Saving…' : 'Posting…');

    Auth.refreshToken()
      .then(function () { return uploadPhoto(u); })
      .then(function (url) {
        if (url) data.imageUrl = url;
        submitBtn.textContent = editId ? 'Saving…' : 'Posting…';
        return editId
          ? window.fbDB.collection('sublets').doc(editId).update(data).then(function () { return { id: editId }; })
          : window.fbDB.collection('sublets').add(data);
      })
      .then(function (ref) { location.href = 'sublet.html?id=' + (editId || ref.id); })
      .catch(function (e2) {
        submitBtn.disabled = false; submitBtn.textContent = editId ? 'Save changes' : 'Post sublet';
        showError('Could not save: ' + ((e2 && e2.message) || 'please try again.'));
      });
  }

  function initForm(u) {
    msg = byId('msg'); submitBtn = byId('submitBtn');
    setContact('email');
    byId('toggleEmail').addEventListener('click', function () {
      setContact('email'); if (u.email && !byId('contactValue').value) byId('contactValue').value = u.email;
    });
    byId('togglePhone').addEventListener('click', function () {
      var was = (byId('contactValue').value === u.email); setContact('phone'); if (was) byId('contactValue').value = '';
    });
    byId('photo').addEventListener('change', onPhotoChange);
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
        if (d.imageUrl) { byId('photoPreviewImg').src = d.imageUrl; byId('photoPreview').hidden = false; }
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
