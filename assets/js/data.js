/* DATA LAYER — the single seam between the UI and where data lives.
   Tries the real Firestore database first; if it isn't set up yet, is empty, errors,
   OR hangs (database not created), it falls back to local seed content so the site is
   never blank. Once Firestore has data, the site uses it automatically — no page changes. */
(function () {
  function seed(key) { return ((window.SEED && window.SEED[key]) || []).slice(); }

  // Resolve with the Firestore result, but never wait forever — fall back on timeout.
  function withTimeout(promise, ms, onTimeout) {
    return new Promise(function (resolve) {
      var settled = false;
      var t = setTimeout(function () { if (!settled) { settled = true; resolve(onTimeout()); } }, ms);
      promise.then(function (v) { if (!settled) { settled = true; clearTimeout(t); resolve(v); } })
             .catch(function () { if (!settled) { settled = true; clearTimeout(t); resolve(onTimeout()); } });
    });
  }

  function fromFirestore(collection, fallbackKey) {
    if (!window.fbDB || !window.HUB_USE_FIRESTORE) return Promise.resolve(seed(fallbackKey));
    var get = window.fbDB.collection(collection).get().then(function (snap) {
      console.log('[hub] Firestore "' + collection + '": ' + snap.size + ' docs');
      if (snap.empty) return seed(fallbackKey);
      var arr = [];
      snap.forEach(function (doc) { var o = doc.data(); o.id = doc.id; arr.push(o); });
      return arr;
    });
    return withTimeout(get, 2200, function () {
      console.warn('[hub] Firestore "' + collection + '" unavailable (not set up yet?), using seed');
      return seed(fallbackKey);
    });
  }

  window.DB = {
    getReviews: function () { return fromFirestore('reviews', 'reviews'); },
    getSublets: function () { return fromFirestore('sublets', 'sublets'); },
    getSubletById: function (id) {
      var fb = seed('sublets').filter(function (s) { return s.id === id; })[0] || null;
      if (!window.fbDB || !window.HUB_USE_FIRESTORE) return Promise.resolve(fb);
      var get = window.fbDB.collection('sublets').doc(id).get().then(function (doc) {
        if (doc.exists) { var o = doc.data(); o.id = doc.id; return o; }
        return fb;
      });
      return withTimeout(get, 2200, function () { return fb; });
    }
  };
})();
