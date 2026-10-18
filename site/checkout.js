/* Polar checkout links for the Buy buttons on /pricing (rendered by pricing.js). This is the only place they live.
   null renders "Available soon"; only a LIVE Polar checkout URL enables Buy. Never put a sandbox URL here. */
window.VAMP_CHECKOUT = {
  mac: null,          // Vampire for Mac, $25 one-time
  showEdgeCityDiscount: false, // Show the demo code on /pricing only when the owner opts in.
  macDownloadEnabled: false, // Enabled after the signed public download is published.
};
