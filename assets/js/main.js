/* SkyReign Global — shared behaviour.
   Progressive enhancement only: every page is fully readable and
   navigable with this file blocked. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header goes solid once you leave the hero ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        toggle.focus();
      }
    });

    // Following a link should not leave the menu hanging open.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Reset when resizing back up to the desktop layout.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setNav(false);
    });
  }

  /* ---- Reveal sections on scroll ---- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No animation wanted, or no support: show everything immediately.
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Current year in the footer ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Countdown ---- */
  // Reads an ISO deadline from #countdown[data-deadline], ticks every second,
  // zeroes out and stops once the deadline passes. Any page without the
  // element is simply skipped.
  (function () {
    var el = document.getElementById("countdown");
    if (!el) return;

    var deadline = new Date(el.getAttribute("data-deadline")).getTime();
    if (isNaN(deadline)) return;

    var out = {
      days: el.querySelector('[data-cd="days"]'),
      hours: el.querySelector('[data-cd="hours"]'),
      mins: el.querySelector('[data-cd="mins"]'),
      secs: el.querySelector('[data-cd="secs"]'),
    };

    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var timer;

    var tick = function () {
      var diff = deadline - Date.now();
      if (diff <= 0) {
        out.days.textContent = out.hours.textContent = "00";
        out.mins.textContent = out.secs.textContent = "00";
        el.classList.add("ended");
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      out.days.textContent = pad(Math.floor(s / 86400));
      out.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      out.mins.textContent = pad(Math.floor((s % 3600) / 60));
      out.secs.textContent = pad(s % 60);
    };

    tick();
    timer = setInterval(tick, 1000);
  })();

  /* ---- Slot capacity bars ---- */
  // Animates each .capacity-fill to its data-fill percentage once the page
  // has settled. Reduced motion just paints the final width.
  (function () {
    var bars = document.querySelectorAll(".capacity-fill");
    if (!bars.length) return;

    var paint = function () {
      bars.forEach(function (bar) {
        var pct = parseInt(bar.getAttribute("data-fill"), 10) || 0;
        bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
      });
    };

    if (reduceMotion) paint();
    else setTimeout(paint, 300);
  })();

  /* ---- Contact form ---- */
  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var typeField = form.querySelector("#enquiry_type");
  var tierWrap = form.querySelector("#tier-field");
  var tierSelect = form.querySelector("#partnership_level");
  var msg = form.querySelector("#form-msg");
  var submit = form.querySelector("[type=submit]");

  // Partnership level only applies to sponsorship enquiries.
  var syncTier = function () {
    var show = typeField.value === "Sponsorship";
    tierWrap.hidden = !show;
    // A hidden select must not stay required, or submit blocks silently.
    if (tierSelect) tierSelect.required = show;
  };

  if (typeField && tierWrap) {
    syncTier();
    typeField.addEventListener("change", syncTier);
  }

  // Deep link: /contact.html?type=sponsorship preselects the dropdown.
  var params = new URLSearchParams(window.location.search);
  if (params.get("type") === "sponsorship" && typeField) {
    typeField.value = "Sponsorship";
    syncTier();
  }

  var show = function (text, kind) {
    msg.textContent = text;
    msg.className = "form-msg show " + kind;
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var endpoint = form.getAttribute("data-endpoint");

    // No backend wired up yet — hand the enquiry to the user's mail client
    // rather than pretending it was sent.
    if (!endpoint) {
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (value, key) {
        if (value) lines.push(key.replace(/_/g, " ") + ": " + value);
      });

      window.location.href =
        "mailto:connect@skyreignglobal.com" +
        "?subject=" + encodeURIComponent("Website enquiry — " + (data.get("enquiry_type") || "General")) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      show("Opening your email app with the enquiry ready to send. If nothing happens, email connect@skyreignglobal.com directly.", "ok");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        syncTier();
        show("Thanks — your enquiry is with us. We'll reply to the email address you gave.", "ok");
      })
      .catch(function () {
        show("Something went wrong. Please email connect@skyreignglobal.com instead.", "err");
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = "Send Enquiry";
      });
  });
})();
