(() => {
  "use strict";

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

  const THEME_KEY = "havennest-theme";
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-checked", theme === "dark");
      toggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
    applyTheme(root.getAttribute("data-theme") || "light");
  }

  const filtersToggle = document.getElementById("filters-toggle-mobile");
  const filtersBar = document.getElementById("filters-bar");
  if (filtersToggle && filtersBar) {
    filtersToggle.addEventListener("click", () => {
      const isOpen = filtersBar.classList.toggle("open");
      filtersToggle.setAttribute("aria-expanded", isOpen);
    });
  }

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
          window.location.href = form.action;
          return;
        }

        const data = await res.json();
        btn.classList.toggle("favorited", data.favorited);
        btn.setAttribute("aria-pressed", data.favorited);
        btn.setAttribute("aria-label", data.favorited ? "Remove from wishlist" : "Add to wishlist");
        icon.className = data.favorited ? "fa-solid fa-heart" : "fa-regular fa-heart";
      } catch (err) {
        form.submit();
      }
    });
  });
})();
