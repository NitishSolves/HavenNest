(() => {
  "use strict";

  // ---- Bootstrap form validation ----------------------------------------
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // ---- Dark mode ----------------------------------------------------------
  // Precedence: explicit user choice (localStorage) > system preference.
  // Applied as early as possible via an inline script in the layout to avoid
  // a flash of the wrong theme; this handles the toggle interaction itself.
  const THEME_KEY = "havennest-theme";
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", theme === "dark");
      const icon = toggleBtn.querySelector("i");
      if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
    // Sync icon state on load (theme itself is already set by the inline script).
    applyTheme(root.getAttribute("data-theme") || "light");
  }

  // ---- Mobile filter bar toggle --------------------------------------------
  const filtersToggle = document.getElementById("filters-toggle-mobile");
  const filtersBar = document.getElementById("filters-bar");
  if (filtersToggle && filtersBar) {
    filtersToggle.addEventListener("click", () => {
      const isOpen = filtersBar.classList.toggle("open");
      filtersToggle.setAttribute("aria-expanded", isOpen);
    });
  }

  // ---- Wishlist / favorite toggle (AJAX, progressively enhanced) ----------
  // The button lives inside a <form method="POST"> so it works with JS
  // disabled (falls back to a full page redirect). With JS on, we intercept
  // the submit and update the icon in place for a smoother interaction.
  document.querySelectorAll(".favorite-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const btn = form.querySelector(".favorite-btn");
      const icon = btn.querySelector("i");

      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
        });

        if (res.status === 401 || res.redirected) {
          // Not logged in — let the server-driven flow handle the redirect/flash.
          window.location.href = form.action;
          return;
        }

        const data = await res.json();
        btn.classList.toggle("favorited", data.favorited);
        btn.setAttribute("aria-pressed", data.favorited);
        btn.setAttribute("aria-label", data.favorited ? "Remove from wishlist" : "Add to wishlist");
        icon.className = data.favorited ? "fa-solid fa-heart" : "fa-regular fa-heart";
      } catch (err) {
        // Network failure — fall back to a normal form submission.
        form.submit();
      }
    });
  });
})();
