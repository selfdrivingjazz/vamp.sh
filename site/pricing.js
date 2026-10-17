/* /pricing: the Vampire for Mac Buy button, from window.VAMP_CHECKOUT (checkout.js).
   The HTML already shows the price and a disabled button, so nothing here is needed to read the page. */
(function () {
  'use strict';
  var urls = window.VAMP_CHECKOUT || {};
  var LABELS = {
    mac: 'Buy Vampire \u2014 $25',
  };

  // Only absolute https links become hrefs; anything else stays "Available soon".
  function checkoutURL(key) {
    var u = urls[key];
    return typeof u === 'string' && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : null;
  }

  function renderBuy(slot, key) {
    var url = checkoutURL(key);
    var el;
    if (url) {
      el = document.createElement('a');
      el.href = url;
      el.textContent = LABELS[key];
    } else {
      el = document.createElement('button');
      el.type = 'button';
      el.disabled = true;
      el.textContent = 'Available soon';
    }
    el.className = 'buy';
    slot.replaceChildren(el);
    var note = slot.parentNode.querySelector('.buy-note');
    if (note) note.hidden = !!url;
  }

  var mac = document.querySelector('[data-checkout="mac"]');
  if (mac) renderBuy(mac, 'mac');
})();
