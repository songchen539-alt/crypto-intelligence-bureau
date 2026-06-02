const iconMenu = `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M4 7h16"></path>
    <path d="M4 12h16"></path>
    <path d="M4 17h16"></path>
  </svg>
`;

const iconClose = `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
`;

function normalizeAddress(value) {
  return value.trim().replace(/\s/g, "");
}

function isLikelyWalletAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

function initSite() {
  document.documentElement.dataset.appReady = "true";

  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = document.querySelector("[data-nav-links]");
  const walletForm = document.querySelector("[data-wallet-form]");
  const walletInput = document.querySelector("[data-wallet-input]");
  const resultItems = document.querySelectorAll("[data-result-item]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.innerHTML = isOpen ? iconClose : iconMenu;
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = iconMenu;
      });
    });
  }

  if (walletForm && walletInput) {
    walletForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const address = normalizeAddress(walletInput.value);
      const valid = isLikelyWalletAddress(address);

      resultItems.forEach((item, index) => {
        const score = item.querySelector("[data-score]");
        if (!score) return;

        if (!address) {
          score.textContent = index === 0 ? "ready" : "idle";
          return;
        }

        if (!valid) {
          score.textContent = index === 0 ? "check" : "hold";
          return;
        }

        const scores = ["91%", "7 links", "low"];
        score.textContent = scores[index] || "ok";
      });

      walletInput.setAttribute("aria-invalid", String(Boolean(address && !valid)));
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite, { once: true });
} else {
  initSite();
}
