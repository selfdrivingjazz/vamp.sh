/* /pricing: the Share Monthly | Yearly toggle and the Buy buttons, from window.VAMP_CHECKOUT (checkout.js).
   The HTML already shows the yearly price and disabled buttons, so nothing here is needed to read the page. */
(function () {
  'use strict';
  var urls = window.VAMP_CHECKOUT || {};
  var LABELS = {
    mac: 'Buy Vampire \u2014 $25',
    shareMonthly: 'Start free trial \u2014 $8 / month',
    shareYearly: 'Start free trial \u2014 $80 / year',
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

  var share = document.querySelector('[data-checkout="share"]');
  var buttons = document.querySelectorAll('.period button[data-period]');
  function setPeriod(period) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.period === period)); });
    document.querySelectorAll('[data-period-show]').forEach(function (el) { el.hidden = el.dataset.periodShow !== period; });
    if (share) renderBuy(share, period === 'monthly' ? 'shareMonthly' : 'shareYearly');
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { setPeriod(b.dataset.period); }); });
  var toggle = document.querySelector('.period');
  if (toggle) toggle.hidden = false;
  setPeriod('yearly');
})();
