/* verify-email.html (WF-06) — check-inbox state, resend, and the verified success state. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var root = byId('verifyRoot'), vmsg = byId('vmsg');

  var m = location.search.match(/[?&]email=([^&]+)/);
  if (m) byId('emailOut').textContent = decodeURIComponent(m[1].replace(/\+/g, ' '));

  function note(text, kind) {
    vmsg.className = 'form-msg ' + (kind || 'success');
    vmsg.textContent = text;
  }

  function showVerified() {
    root.innerHTML =
      '<div class="verify-icon success">✓</div>'
      + '<h1>You&rsquo;re verified</h1>'
      + '<p>Your Tulane account is confirmed. You can now post reviews and sublets.</p>'
      + '<div class="verify-actions"><a class="btn btn-primary btn-block" href="recent.html">Start browsing</a></div>';
  }

  byId('iVerified').addEventListener('click', function () {
    note('Checking…', 'success');
    Auth.reloadUser().then(function (u) {
      if (u && u.emailVerified) showVerified();
      else note('Not verified yet — click the link in your email first, then try again.', 'error');
    }).catch(function () {
      note('Please log in again to check your status.', 'error');
    });
  });

  byId('resend').addEventListener('click', function () {
    Auth.resendVerification()
      .then(function () { note('Sent! Check your inbox (and spam folder).', 'success'); })
      .catch(function () { note('Couldn’t resend — try logging in again first.', 'error'); });
  });
})();
