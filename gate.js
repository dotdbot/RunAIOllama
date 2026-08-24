// ponytail: casual-visitor gate only. The password lives in this file and the page
// source is public in the repo, so this stops browsers, not people. Upgrade path if
// it ever needs to be real: private repo + Cloudflare Access, or a static site host
// with built-in basic auth.
(function () {
  var PASS = 'danny123';
  var KEY = 'runai-unlocked';

  try {
    if (sessionStorage.getItem(KEY) === '1') return;
  } catch (e) {
    return; // storage blocked — don't lock the user out of a page they can't unlock
  }

  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function () {
    var ov = document.createElement('div');
    ov.style.cssText = [
      'position:fixed', 'inset:0', 'visibility:visible', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'background:#0f1117', 'color:#e2e8f0',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    ].join(';');

    ov.innerHTML =
      '<form style="display:flex;flex-direction:column;gap:.75rem;width:min(320px,86vw)">' +
      '<label for="gate-pw" style="font-size:.85rem;color:#8892b0">Password</label>' +
      '<input id="gate-pw" type="password" autocomplete="current-password" autofocus ' +
      'style="padding:.6rem .75rem;border-radius:8px;border:1px solid #2e3250;background:#1a1d2e;color:#e2e8f0;font-size:1rem">' +
      '<button type="submit" style="padding:.6rem;border-radius:8px;border:0;background:#7c3aed;color:#fff;font-size:.95rem;font-weight:600;cursor:pointer">Enter</button>' +
      '<span id="gate-err" style="font-size:.8rem;color:#ef4444;min-height:1.2em"></span>' +
      '</form>';

    document.body.appendChild(ov);

    ov.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (ov.querySelector('#gate-pw').value === PASS) {
        try { sessionStorage.setItem(KEY, '1'); } catch (e2) { /* fine, ask again next page */ }
        ov.remove();
        document.documentElement.style.visibility = '';
      } else {
        ov.querySelector('#gate-err').textContent = 'Wrong password';
        ov.querySelector('#gate-pw').select();
      }
    });
  });
})();
