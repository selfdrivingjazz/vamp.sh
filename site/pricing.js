/* /pricing: the Vampire for Mac Buy button, from window.VAMP_CHECKOUT (checkout.js).
   The HTML already shows the price and a disabled button, so nothing here is needed to read the page. */
(function () {
  'use strict';
  var urls = window.VAMP_CHECKOUT || {};
  var LABELS = {
    mac: 'Buy Vampire \u2014 $25',
    supporter: 'Buy Supporter \u2014 $50',
    patron: 'Buy Patron \u2014 $100',
  };

  // Only LIVE Polar checkout links become hrefs. Sandbox, malformed and unrelated URLs fail closed.
  function checkoutURL(key) {
    var u;
    try { u = new URL(urls[key]); } catch (_) { return null; }
    return u.protocol === 'https:' && !u.username && !u.password &&
      ((u.hostname === 'buy.polar.sh' && u.pathname.length > 1) ||
       (u.hostname === 'polar.sh' && /^\/checkout\/.+/.test(u.pathname)) ||
       (u.hostname === 'api.polar.sh' && /^\/v1\/checkout-links\/[^/]+\/redirect$/.test(u.pathname))) ? u.href : null;
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
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-checkout]'), function (slot) {
    renderBuy(slot, slot.getAttribute('data-checkout'));
  });
  var discount = document.querySelector('[data-edgecity-discount]');
  if (discount) discount.hidden = urls.showEdgeCityDiscount !== true || !checkoutURL('mac');
})();
