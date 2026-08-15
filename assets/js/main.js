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

  /* ---- Registration form ---- */
  // Additional players BEYOND the captain: Free Fire renders players 2–5,
  // BGMI players 2–4.
  (function () {
    var form = document.getElementById("regForm");
    if (!form) return;

    var ROSTER = { freefire: 4, bgmi: 3 };
    var gameSelect = document.getElementById("game");
    var wrap = document.getElementById("rosterWrap");

    var rosterLabel = function (text) {
      return '<p class="roster-head">' + text + "</p>";
    };

    var buildRoster = function (game) {
      var count = ROSTER[game];
      if (!count) {
        wrap.innerHTML = rosterLabel("Squad roster") +
          '<p class="hint">Select a game above to load roster slots.</p>';
        return;
      }

      var total = count + 1;
      var html = rosterLabel("Squad roster — " + total + " players (captain is player 1)");

      for (var i = 2; i <= total; i++) {
        html +=
          '<div class="roster-slot">' +
            "<h4>Player " + i + "</h4>" +
            '<div class="field-row">' +
              '<div class="field half">' +
                '<label for="p' + i + 'name">Name</label>' +
                '<input type="text" id="p' + i + 'name" name="p' + i + 'name" placeholder="Full name" required>' +
                '<p class="field-error">Enter this player\'s name.</p>' +
              "</div>" +
              '<div class="field half">' +
                '<label for="p' + i + 'ign">In-game ID</label>' +
                '<input type="text" id="p' + i + 'ign" name="p' + i + 'ign" placeholder="IGN / UID" required>' +
                '<p class="field-error">Enter this player\'s in-game ID.</p>' +
              "</div>" +
            "</div>" +
          "</div>";
      }
      wrap.innerHTML = html;
    };

    var setInvalid = function (input, bad) {
      var field = input.closest(".field");
      if (field) field.classList.toggle("invalid", bad);
    };

    // Preselect the game from ?game=bgmi / ?game=freefire.
    var preset = new URLSearchParams(window.location.search).get("game");
    if (preset && ROSTER[preset]) {
      gameSelect.value = preset;
      buildRoster(preset);
    }

    gameSelect.addEventListener("change", function () {
      buildRoster(gameSelect.value);
    });

    // Clear a field's error as soon as it's edited.
    form.addEventListener("input", function (e) {
      if (e.target.matches("input, select")) setInvalid(e.target, false);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var ok = true;
      var firstBad = null;

      form.querySelectorAll("input[required], select[required]").forEach(function (input) {
        if (input.type === "checkbox") return;

        var val = input.value.trim();
        var bad = false;

        if (!val) bad = true;
        else if (input.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        else if (input.type === "tel") bad = !/^[6-9]\d{9}$/.test(val.replace(/\D/g, ""));

        setInvalid(input, bad);
        if (bad) { ok = false; if (!firstBad) firstBad = input; }
      });

      var age = document.getElementById("age");
      var terms = document.getElementById("terms");
      var consentError = document.getElementById("consentError");
      var consentOk = age.checked && terms.checked;
      consentError.classList.toggle("show", !consentOk);
      if (!consentOk) { ok = false; if (!firstBad) firstBad = age; }

      if (!ok) {
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.submittedAt = new Date().toISOString();

      // No backend yet. When one exists, POST `data` to the registration
      // endpoint here and only show success on a 2xx response. The server —
      // not this file — must enforce duplicate, capacity and rate-limit
      // checks and send the captain a confirmation email. Never place API
      // keys or connection strings in this file.
      console.log("Registration payload", data);

      var success = document.getElementById("formSuccess");
      success.classList.add("show");
      var button = form.querySelector('button[type="submit"]');
      button.textContent = "Registration submitted";
      button.disabled = true;
      success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
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
