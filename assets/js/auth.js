/* Auth wrapper around Firebase Auth. Loaded on every page so the header can reflect
   login state. Enforces @tulane.edu on sign-up and sends a verification email.
   onReady(cb) fires once with the FIRST definitive auth state (use it for page gating
   so a logged-in user isn't bounced before Firebase restores their session). */
window.Auth = (function () {
  var listeners = [], readyCbs = [], current = null, ready = false;

  function isTulane(email) { return /@tulane\.edu\s*$/i.test((email || '').trim()); }

  if (window.fbAuth) {
    window.fbAuth.onAuthStateChanged(function (u) {
      current = u || null;
      if (!ready) { ready = true; readyCbs.forEach(function (cb) { try { cb(current); } catch (e) {} }); readyCbs = []; }
      listeners.forEach(function (cb) { try { cb(current); } catch (e) {} });
    });
  }

  function onChange(cb) { listeners.push(cb); cb(current); }
  function onReady(cb) { if (ready) cb(current); else readyCbs.push(cb); }
  function user() { return current; }
  function isVerified() { return !!(current && current.emailVerified); }

  function signUp(name, email, password) {
    email = (email || '').trim();
    if (!isTulane(email)) {
      return Promise.reject({ code: 'auth/not-tulane', message: 'Please use your @tulane.edu email.' });
    }
    return window.fbAuth.createUserWithEmailAndPassword(email, password).then(function (cred) {
      var u = cred.user;
      var tasks = [
        u.updateProfile({ displayName: name }).catch(function () {}),
        u.sendEmailVerification()
      ];
      if (window.fbDB) {
        tasks.push(window.fbDB.collection('profiles').doc(u.uid).set({
          full_name: name, email: email,
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(function () {}));
      }
      return Promise.all(tasks).then(function () { return u; });
    });
  }

  function logIn(email, password) {
    return window.fbAuth.signInWithEmailAndPassword((email || '').trim(), password);
  }
  function logOut() { return window.fbAuth.signOut(); }
  function resendVerification() {
    return current ? current.sendEmailVerification() : Promise.reject(new Error('Not signed in'));
  }
  function reloadUser() {
    return current ? current.reload().then(function () { return window.fbAuth.currentUser; }) : Promise.resolve(null);
  }

  return {
    isTulane: isTulane, onChange: onChange, onReady: onReady, user: user, isVerified: isVerified,
    signUp: signUp, logIn: logIn, logOut: logOut, resendVerification: resendVerification, reloadUser: reloadUser
  };
})();
