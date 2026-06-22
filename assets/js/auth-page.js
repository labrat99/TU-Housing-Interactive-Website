/* auth.html UI — toggles Log in / Sign up, validates, and talks to the Auth wrapper. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var msg = byId('msg'), submitBtn = byId('submitBtn');
  var fName = byId('name'), fEmail = byId('email'), fPw = byId('password'), fConfirm = byId('confirm');
  var mode = 'signup';

  function nextTarget() {
    var m = location.search.match(/[?&]next=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : 'index.html';
  }
  function showError(text) { msg.className = 'form-msg error'; msg.textContent = text; }
  function clearMsg() { msg.className = 'form-msg'; msg.textContent = ''; }
  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Log in');
  }
  function friendly(err) {
    var c = err && err.code;
    if (c === 'auth/not-tulane') return 'Please use your @tulane.edu email.';
    if (c === 'auth/email-already-in-use') return 'That email already has an account — try logging in.';
    if (c === 'auth/invalid-email') return 'That email doesn’t look right.';
    if (c === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (c === 'auth/wrong-password' || c === 'auth/invalid-credential') return 'Wrong email or password.';
    if (c === 'auth/user-not-found') return 'No account with that email — try signing up.';
    if (c === 'auth/too-many-requests') return 'Too many attempts. Wait a minute and try again.';
    return (err && err.message) || 'Something went wrong. Please try again.';
  }

  function setMode(m) {
    mode = m;
    var signup = (m === 'signup');
    byId('nameField').style.display = signup ? '' : 'none';
    byId('confirmField').style.display = signup ? '' : 'none';
    byId('privacyHelp').style.display = signup ? '' : 'none';
    byId('emailHelp').style.display = signup ? '' : 'none';
    submitBtn.textContent = signup ? 'Create account' : 'Log in';
    byId('tabSignup').classList.toggle('active', signup);
    byId('tabLogin').classList.toggle('active', !signup);
    byId('switchLine').innerHTML = signup
      ? 'Already have an account? <a id="switchLink">Log in</a>'
      : 'New here? <a id="switchLink">Sign up</a>';
    byId('switchLink').addEventListener('click', function () { setMode(signup ? 'login' : 'signup'); });
    clearMsg();
  }

  byId('tabLogin').addEventListener('click', function () { setMode('login'); });
  byId('tabSignup').addEventListener('click', function () { setMode('signup'); });

  byId('authForm').addEventListener('submit', function (e) {
    e.preventDefault();
    clearMsg();
    var email = fEmail.value.trim(), pw = fPw.value;

    if (mode === 'signup') {
      var name = fName.value.trim();
      if (!name) return showError('Please enter your name.');
      if (!Auth.isTulane(email)) return showError('Please use your @tulane.edu email.');
      if (pw.length < 6) return showError('Password must be at least 6 characters.');
      if (pw !== fConfirm.value) return showError('Passwords don’t match.');
      setLoading(true);
      Auth.signUp(name, email, pw)
        .then(function () { location.href = 'verify-email.html?email=' + encodeURIComponent(email); })
        .catch(function (err) { setLoading(false); showError(friendly(err)); });
    } else {
      if (!email || !pw) return showError('Enter your email and password.');
      setLoading(true);
      Auth.logIn(email, pw)
        .then(function () { location.href = nextTarget(); })
        .catch(function (err) { setLoading(false); showError(friendly(err)); });
    }
  });

  // start on login if asked (e.g., ?mode=login), otherwise sign up (matches WF-05)
  setMode(/[?&]mode=login/.test(location.search) ? 'login' : 'signup');
})();
