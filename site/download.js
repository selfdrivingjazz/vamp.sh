/* Public Mac downloads are enabled only after a notarized release is promoted. */
(function () {
  'use strict';
  if (!window.VAMP_CHECKOUT || window.VAMP_CHECKOUT.macDownloadEnabled !== true) return;
  document.querySelectorAll('[data-mac-download]').forEach(function (slot) {
    var link = document.createElement('a');
    link.href = 'https://app.vamp.sh/dl/Vampire.dmg';
    link.className = 'buy';
    link.textContent = 'Download for Mac';
    slot.replaceChildren(link);
  });
})();
