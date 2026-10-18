/* D1 saves consent even while email delivery is not configured. No credentials live here. */
(() => {
  "use strict";
  const endpoint = "https://app.vamp.sh/api/waitlist";
  for (const form of document.querySelectorAll("form[data-waitlist]")) {
    const email = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector("[data-waitlist-status]");
    let challenge;
    let readyAt = 0;
    let loading;
    const prepare = () => {
      if (loading) return loading;
      loading = fetch(endpoint, { headers: { accept: "application/json" } }).then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.challenge) throw new Error(body.message || "The signup form could not connect. Please try again.");
        challenge = body.challenge;
        readyAt = Date.now() + body.minimum_wait_ms;
      }).finally(() => { loading = null; });
      return loading;
    };
    // Request a server-timed, single-use challenge only when a visitor uses the form.
    email.addEventListener("focus", () => {
      if (!challenge) prepare().catch(() => { /* Retry on submit, where an inline error is shown. */ });
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      button.disabled = true;
      button.textContent = "Joining…";
      status.textContent = "Saving your place…";
      status.removeAttribute("data-error");
      try {
        if (!challenge) await prepare();
        const delay = readyAt - Date.now();
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.value, list: "vamp-hosted", source: form.dataset.waitlist, website: form.elements.website.value, challenge }),
        });
        const body = await response.json();
        challenge = null;
        if (!response.ok || !body.ok) throw new Error(body.message || "We couldn't save your place. Please try again.");
        status.textContent = body.message + " ";
        if (body.unsubscribe_url) {
          const remove = document.createElement("a");
          remove.href = body.unsubscribe_url;
          remove.textContent = "Remove my signup";
          status.append(remove);
        }
        email.value = "";
      } catch (error) {
        challenge = null;
        status.dataset.error = "true";
        status.textContent = error instanceof Error ? error.message : "We couldn't connect. Please try again.";
      } finally {
        button.disabled = false;
        button.textContent = "Join the waitlist";
      }
    });
  }
})();
