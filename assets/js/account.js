/* Account / Your posts (WF-10). Login required. Shows the signed-in user's own
   reviews and sublets with Edit and Delete. No public profile pages. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var uid = null, tab = 'reviews', reviews = [], sublets = [];

  function reviewRow(r) {
    var label = r.review_type === 'landlord' ? 'Landlord review' : 'Property review';
    return '<div class="acct-row">'
      + '<div class="acct-row-main">'
      + '<div class="card-top"><span class="tag">' + label + '</span><span class="stars">' + Cards.stars(r.rating) + '</span></div>'
      + '<h3>' + (r.subject || '') + '</h3>'
      + '<p class="muted">' + (r.neighborhood || '') + '</p>'
      + '<p class="snippet">' + (r.text || '') + '</p>'
      + '</div>'
      + '<div class="acct-row-actions">'
      + '<a class="btn-sm" href="post-review.html?id=' + r.id + '">Edit</a>'
      + '<button class="btn-sm danger" data-del="reviews" data-id="' + r.id + '">Delete</button>'
      + '</div></div>';
  }
  function subletRow(s) {
    return '<div class="acct-row">'
      + '<div class="acct-row-main">'
      + '<span class="tag sublet">Sublet</span>'
      + '<h3>' + (s.title || '') + '</h3>'
      + '<p class="price-line">$' + s.price + '/mo · ' + (s.neighborhood || '') + ' · ' + (s.beds_baths || '') + '</p>'
      + '<p class="date-line">' + Cards.fmtDate(s.move_in) + ' – ' + Cards.fmtDate(s.end_date) + '</p>'
      + '</div>'
      + '<div class="acct-row-actions">'
      + '<a class="btn-sm" href="sublet.html?id=' + s.id + '">View</a>'
      + '<a class="btn-sm" href="post-sublet.html?id=' + s.id + '">Edit</a>'
      + '<button class="btn-sm danger" data-del="sublets" data-id="' + s.id + '">Delete</button>'
      + '</div></div>';
  }

  function render() {
    var list = byId('acctList');
    var items = tab === 'reviews' ? reviews : sublets;
    if (!items.length) {
      list.innerHTML = '<div class="empty-block"><p>You haven’t posted any '
        + (tab === 'reviews' ? 'reviews' : 'sublets') + ' yet.</p>'
        + '<a class="btn btn-primary" href="' + (tab === 'reviews' ? 'post-review.html?type=landlord' : 'post-sublet.html') + '">Post '
        + (tab === 'reviews' ? 'a review' : 'a sublet') + '</a></div>';
      return;
    }
    list.innerHTML = items.map(tab === 'reviews' ? reviewRow : subletRow).join('');
    Array.prototype.forEach.call(list.querySelectorAll('[data-del]'), function (btn) {
      btn.addEventListener('click', function () {
        var coll = btn.getAttribute('data-del'), id = btn.getAttribute('data-id');
        if (!confirm('Delete this ' + (coll === 'reviews' ? 'review' : 'sublet') + '? This can’t be undone.')) return;
        btn.disabled = true; btn.textContent = 'Deleting…';
        window.fbDB.collection(coll).doc(id).delete().then(function () {
          if (coll === 'reviews') reviews = reviews.filter(function (x) { return x.id !== id; });
          else sublets = sublets.filter(function (x) { return x.id !== id; });
          render();
        }).catch(function (err) {
          btn.disabled = false; btn.textContent = 'Delete';
          alert('Could not delete: ' + ((err && err.message) || 'please try again.'));
        });
      });
    });
  }

  function setTab(t) {
    tab = t;
    byId('tabReviews').classList.toggle('active', t === 'reviews');
    byId('tabSublets').classList.toggle('active', t === 'sublets');
    render();
  }

  // Verification is no longer a gate — it only earns the "Verified" badge.
  // Show the badge when verified, otherwise show the resend panel.
  function applyVerifyState(u) {
    var verified = !!(u && u.emailVerified);
    byId('verifiedBadge').hidden = !verified;
    byId('verifyPanel').hidden = verified;
  }
  function setupVerification(u) {
    applyVerifyState(u);
    if (/[?&]welcome=1/.test(location.search)) {
      var w = byId('welcomeMsg');
      w.className = 'form-msg success';
      w.innerHTML = 'Account created! We sent a verification link to <strong>' + (u.email || 'your Tulane email')
        + '</strong>. You can start posting right away — verifying just adds a badge to your posts.';
    }
    var resendBtn = byId('resendBtn'), resendMsg = byId('resendMsg');
    resendBtn.addEventListener('click', function () {
      resendBtn.disabled = true;
      resendMsg.className = 'form-msg'; resendMsg.textContent = '';
      Auth.resendVerification().then(function () {
        resendMsg.className = 'form-msg success';
        resendMsg.textContent = 'Sent! Check your inbox, your spam folder, and the Tulane quarantine digest. It can take a few minutes.';
        setTimeout(function () { resendBtn.disabled = false; }, 8000);
      }).catch(function (err) {
        resendMsg.className = 'form-msg error';
        resendMsg.textContent = (err && err.code === 'auth/too-many-requests')
          ? 'You’ve requested this a few times — please wait a minute, then try again.'
          : 'Couldn’t send right now — please try again in a moment.';
        resendBtn.disabled = false;
      });
    });
    byId('refreshVerify').addEventListener('click', function () {
      var b = byId('refreshVerify'); b.disabled = true; b.textContent = 'Checking…';
      Auth.reloadUser().then(function (fresh) {
        var u2 = fresh || Auth.user() || u;
        applyVerifyState(u2);
        if (u2 && u2.emailVerified) { if (Auth.refreshToken) Auth.refreshToken(); }
        else { resendMsg.className = 'form-msg error'; resendMsg.textContent = 'Not verified yet — click the link in your email first, then refresh.'; }
        b.disabled = false; b.textContent = 'I’ve verified — refresh';
      }).catch(function () { b.disabled = false; b.textContent = 'I’ve verified — refresh'; });
    });
  }

  function load(u) {
    uid = u.uid;
    byId('acctEmail').textContent = u.email || '';
    byId('accountPage').hidden = false;
    setupVerification(u);
    byId('logoutBtn').addEventListener('click', function () {
      byId('logoutBtn').disabled = true;
      Auth.logOut().then(function () { location.href = 'index.html'; })
        .catch(function () { byId('logoutBtn').disabled = false; });
    });
    byId('tabReviews').addEventListener('click', function () { setTab('reviews'); });
    byId('tabSublets').addEventListener('click', function () { setTab('sublets'); });
    byId('acctList').innerHTML = '<p class="empty">Loading your posts…</p>';
    Promise.all([
      window.fbDB.collection('reviews').where('user_id', '==', uid).get(),
      window.fbDB.collection('sublets').where('user_id', '==', uid).get()
    ]).then(function (res) {
      reviews = res[0].docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
      sublets = res[1].docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
      render();
    }).catch(function (err) {
      byId('acctList').innerHTML = '<p class="empty">Couldn’t load your posts: ' + ((err && err.message) || '') + '</p>';
    });
  }

  if (window.Auth) {
    Auth.onReady(function (u) {
      if (!u) { location.replace('auth.html?next=account.html'); return; }
      load(u);
    });
  }
})();
