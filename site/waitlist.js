/* D1 saves consent even while email delivery is not configured. No credentials live here. */
(() => {
  "use strict";
  const endpoint = "https://app.vamp.sh/api/waitlist";
  let turnstileScript;
  for (const form of document.querySelectorAll("form[data-waitlist]")) {
    const email = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector("[data-waitlist-status]");
    let challenge;
    let readyAt = 0;
    let loading;
    let sitekey;
    let widget;
    let verification;
    const prepare = () => {
      if (loading) return loading;
      loading = fetch(endpoint, { headers: { accept: "application/json" } }).then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.challenge) throw new Error(body.message || "The signup form could not connect. Please try again.");
        challenge = body.challenge;
        readyAt = Date.now() + body.minimum_wait_ms;
        sitekey = body.turnstile_site_key;
        if (sitekey && !window.turnstile) {
          if (!turnstileScript) {
            turnstileScript = new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
              script.onload = resolve;
              script.onerror = () => { script.remove(); turnstileScript = null; reject(new Error("Spam verification could not load. Please try again.")); };
              document.head.append(script);
            });
          }
          await turnstileScript;
        }
      }).finally(() => { loading = null; });
      return loading;
    };
    // Request a server-timed, single-use challenge only when a visitor uses the form.
    email.addEventListener("focus", () => {
      if (!challenge) prepare().catch(() => { challenge = null; /* Retry on submit, where an inline error is shown. */ });
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      button.disabled = true;
      button.textContent = "Joining…";
      status.textContent = "Saving your place…";
      status.removeAttribute("data-error");
      try {
        if (!challenge || loading) await prepare();
        const delay = readyAt - Date.now();
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
        let turnstileToken;
        if (sitekey) {
          status.textContent = "Complete the verification below to join.";
          if (!verification) {
            verification = document.createElement("div");
            verification.className = "waitlist-verification";
            form.querySelector(".waitlist-row").after(verification);
          }
          if (widget !== undefined) window.turnstile.remove(widget);
          turnstileToken = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Spam verification timed out. Please try again.")), 60000);
            widget = window.turnstile.render(verification, {
              sitekey, action: "waitlist", theme: "dark", size: "compact",
              callback: (token) => { clearTimeout(timeout); resolve(token); },
              "error-callback": () => { clearTimeout(timeout); reject(new Error("Spam verification failed. Please try again.")); },
              "expired-callback": () => { clearTimeout(timeout); reject(new Error("Spam verification expired. Please try again.")); },
            });
          });
          status.textContent = "Saving your place…";
        }
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.value, list: "vamp-hosted", source: form.dataset.waitlist, website: form.elements.website.value, challenge, turnstile_token: turnstileToken }),
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
        if (widget !== undefined && window.turnstile) { window.turnstile.remove(widget); widget = undefined; }
      }
    });
  }
})();
