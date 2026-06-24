/* Client-side content moderation for posts (reviews + sublets).
   Blocks profanity and slurs at submission time. Uses whole-word matching so
   ordinary words are never caught by accident (e.g., "class", "assess", "bass",
   "Scunthorpe", "Sussex" all pass). The list below is intentionally easy to
   edit — add or remove a word and it takes effect immediately.

   Note: this is a UX-level filter. A determined user could bypass it by writing
   directly to the database, so it is paired with a visible legal disclosure and
   manual takedown (via the Firebase console). True server-side enforcement would
   need a Cloud Function; this is the right level of moderation for the app. */
window.Moderation = (function () {
  // Disallowed terms (lower-case). Common inflections are listed explicitly to
  // keep whole-word matching precise and avoid false positives on real names.
  var WORDS = [
    'fuck', 'fucks', 'fucked', 'fucking', 'fuckin', 'fucker', 'fuckers', 'fuckface',
    'motherfucker', 'motherfuckers', 'motherfucking', 'clusterfuck', 'fuckwit',
    'shit', 'shits', 'shitty', 'shitter', 'shitting', 'shithead', 'shithole', 'bullshit', 'dipshit',
    'bitch', 'bitches', 'bitching', 'bitchy',
    'ass', 'asses', 'asshole', 'assholes', 'asshat', 'dumbass', 'jackass',
    'bastard', 'bastards',
    'dickhead', 'dickheads', 'dickwad',
    'piss', 'pissed', 'pissing',
    'cunt', 'cunts',
    'prick', 'pricks',
    'douche', 'douchebag', 'douchebags',
    'slut', 'sluts', 'slutty',
    'whore', 'whores',
    'cocksucker', 'cocksuckers',
    'twat', 'twats',
    'wanker', 'wankers',
    'bollocks',
    // slurs — always blocked
    'nigger', 'niggers', 'nigga', 'niggas',
    'faggot', 'faggots', 'fag', 'fags',
    'retard', 'retards', 'retarded',
    'spic', 'spics', 'chink', 'chinks', 'kike', 'kikes',
    'wetback', 'wetbacks', 'gook', 'gooks', 'coon', 'coons',
    'tranny', 'trannies', 'dyke', 'dykes'
  ];
  var re = new RegExp('\\b(' + WORDS.join('|') + ')\\b', 'i');

  // Return the first disallowed word found in `text`, or null.
  function firstProfanity(text) {
    if (!text) return null;
    var m = re.exec(String(text));
    return m ? m[0] : null;
  }
  // Check any number of text fields; return the first offending word, or null.
  function check() {
    for (var i = 0; i < arguments.length; i++) {
      var hit = firstProfanity(arguments[i]);
      if (hit) return hit;
    }
    return null;
  }
  return { firstProfanity: firstProfanity, check: check };
})();
