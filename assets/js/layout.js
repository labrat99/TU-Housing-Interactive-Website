/* Shared header + footer, injected on every page (one source of truth).
   Sets the active nav link, wires the Post dropdown, and reflects auth state:
   Log in <-> Account, and Post items gate to verified users. */
(function () {
  var page = document.body.dataset.page || '';
  function link(href, label, key) {
    return '<a href="' + href + '"' + (page === key ? ' class="active"' : '') + '>' + label + '</a>';
  }

  var headerHTML =
    '<div class="topbar"><div class="wrap"><span>Anyone can browse — no account needed</span></div></div>'
    + '<header class="site-header"><div class="wrap">'
    +   '<a class="brand" href="index.html"><span class="logo-ph">Logo<br>asset</span>'
    +   '<span class="wordmark">Tulane Housing Hub</span></a>'
    +   '<nav class="nav">'
    +     link('recent.html', 'Recent', 'recent')
    +     link('reviews.html', 'Reviews', 'reviews')
    +     link('sublets.html', 'Sublets', 'sublets')
    +   '</nav>'
    +   '<div class="header-actions">'
    +     '<a class="btn btn-outline" id="authAction" href="auth.html">Log in</a>'
    +     '<div class="post-menu">'
    +       '<button class="btn btn-primary" id="postBtn" type="button" aria-haspopup="true" aria-expanded="false">Post <span class="caret">▾</span></button>'
    +       '<div class="post-dropdown" id="postDropdown" hidden>'
    +         '<a class="post-item" data-target="post-review.html?type=landlord">Landlord review</a>'
    +         '<a class="post-item" data-target="post-review.html?type=property">Property review</a>'
    +         '<a class="post-item" data-target="post-sublet.html">Sublet</a>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div></header>';

  var footerHTML =
    '<div class="wrap"><span>Tulane Housing Hub</span>'
    + '<span>Built by Tulane students · DATA 2150</span></div>';

  var h = document.getElementById('site-header'); if (h) h.innerHTML = headerHTML;
  var f = document.getElementById('site-footer'); if (f) f.innerHTML = footerHTML;

  // Post dropdown open/close
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

  // Reflect auth state: Log in <-> Account, and route Post items appropriately.
  function applyAuth(u) {
    var a = document.getElementById('authAction');
    if (a) {
      if (u) { a.textContent = 'Account'; a.setAttribute('href', 'account.html'); }
      else { a.textContent = 'Log in'; a.setAttribute('href', 'auth.html'); }
    }
    var verified = !!(u && u.emailVerified);
    Array.prototype.forEach.call(document.querySelectorAll('.post-item'), function (el) {
      var t = el.getAttribute('data-target');
      el.setAttribute('href', verified ? t : (u ? 'verify-email.html' : 'auth.html?next=' + encodeURIComponent(t)));
    });
  }
  applyAuth(null);
  if (window.Auth && Auth.onChange) Auth.onChange(applyAuth);
})();
