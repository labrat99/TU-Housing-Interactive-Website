/* Shared header + footer, injected on every page (one source of truth).
   Active nav link, Post dropdown (desktop), a collapsing menu (mobile), the logo,
   the favicon, and auth-state reflection (Log in <-> Account, Post gating). */
(function () {
  var page = document.body.dataset.page || '';
  function link(href, label, key) {
    return '<a href="' + href + '"' + (page === key ? ' class="active"' : '') + '>' + label + '</a>';
  }

  var headerHTML =
    '<header class="site-header"><div class="container">'
    +   '<a class="brand" href="index.html">'
    +     '<img class="logo-img" src="assets/img/logo.png" alt="Tulane Housing Hub logo" />'
    +     '<span class="wordmark">Tulane Housing Hub</span></a>'
    +   '<nav class="nav">'
    +     link('recent.html', 'Recent', 'recent')
    +     link('reviews.html', 'Reviews', 'reviews')
    +     link('sublets.html', 'Sublets', 'sublets')
    +   '</nav>'
    +   '<div class="header-actions">'
    +     '<a class="btn btn-outline js-auth-action" id="authAction" href="auth.html">Log in</a>'
    +     '<div class="post-menu">'
    +       '<button class="btn btn-primary" id="postBtn" type="button" aria-haspopup="true" aria-expanded="false">Post <span class="caret">▾</span></button>'
    +       '<div class="post-dropdown" id="postDropdown" hidden>'
    +         '<a class="post-item" data-target="post-review.html?type=landlord">Landlord review</a>'
    +         '<a class="post-item" data-target="post-review.html?type=property">Property review</a>'
    +         '<a class="post-item" data-target="post-sublet.html">Sublet</a>'
    +       '</div>'
    +     '</div>'
    +     '<button class="menu-toggle" id="menuToggle" type="button" aria-label="Menu" aria-expanded="false">☰</button>'
    +   '</div>'
    + '</div></header>'
    + '<div class="mobile-menu" id="mobileMenu">'
    +   link('recent.html', 'Recent', 'recent')
    +   link('reviews.html', 'Reviews', 'reviews')
    +   link('sublets.html', 'Sublets', 'sublets')
    +   '<div class="mm-divider"></div>'
    +   '<a class="js-auth-action" id="mAuthAction" href="auth.html">Log in</a>'
    +   '<a class="post-item" data-target="post-review.html?type=landlord">Post a review</a>'
    +   '<a class="post-item" data-target="post-sublet.html">Post a sublet</a>'
    + '</div>';

  var footerHTML =
    '<div class="container"><span>Tulane Housing Hub</span>'
    + '<span>Built by Tulane students · DATA 2150</span></div>';

  var h = document.getElementById('site-header'); if (h) h.innerHTML = headerHTML;
  var f = document.getElementById('site-footer'); if (f) f.innerHTML = footerHTML;

  // favicon on every page
  var fav = document.createElement('link');
  fav.rel = 'icon'; fav.type = 'image/png'; fav.href = 'assets/img/logo.png';
  document.head.appendChild(fav);

  // Post dropdown (desktop)
  var btn = document.getElementById('postBtn');
  var dd = document.getElementById('postDropdown');
  if (btn && dd) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (dd.hasAttribute('hidden')) { dd.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }
      else { dd.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('click', function () {
      if (!dd.hasAttribute('hidden')) { dd.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Mobile menu (hamburger)
  var mt = document.getElementById('menuToggle');
  var mm = document.getElementById('mobileMenu');
  if (mt && mm) {
    mt.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = mm.classList.toggle('open');
      mt.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mm.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () {
      if (mm.classList.contains('open')) { mm.classList.remove('open'); mt.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Reflect auth state across desktop + mobile controls
  function applyAuth(u) {
    var label = u ? 'Account' : 'Log in';
    var href = u ? 'account.html' : 'auth.html';
    Array.prototype.forEach.call(document.querySelectorAll('.js-auth-action'), function (a) {
      a.textContent = label; a.setAttribute('href', href);
    });
    // Verification is no longer required to post — any signed-in user goes
    // straight to the form; only logged-out users are routed to sign in.
    Array.prototype.forEach.call(document.querySelectorAll('.post-item'), function (el) {
      var t = el.getAttribute('data-target');
      el.setAttribute('href', u ? t : 'auth.html?next=' + encodeURIComponent(t));
    });
  }
  applyAuth(null);
  if (window.Auth && Auth.onChange) Auth.onChange(applyAuth);
})();
