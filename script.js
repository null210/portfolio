// Tab and Navigation Handling
document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle Setup
  initTheme();

  // Mermaid Setup
  initMermaid();

  // Tab & Hash Routing Setup
  initNavigation();

  // Image Lightbox Setup
  initLightbox();

  // Mobile Menu Toggle
  initMobileMenu();
});

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  const activeTheme = savedTheme ? savedTheme : prefersDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", activeTheme);
  updateThemeIcon(activeTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeIcon(next);
      
      // Re-run mermaid for theme adjustment if needed
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: next === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "Pretendard, -apple-system, sans-serif"
        });
      }
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.getElementById("themeIcon");
  if (!iconSpan) return;
  if (theme === "dark") {
    // Sun icon
    iconSpan.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  } else {
    // Moon icon
    iconSpan.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }
}

function initNavigation() {
  const tabs = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const navTabsContainer = document.getElementById("navTabs");

  function switchTab(targetId, updateHash = true) {
    let found = false;
    tabContents.forEach((content) => {
      if (content.id === targetId) {
        content.classList.add("active");
        found = true;
      } else {
        content.classList.remove("active");
      }
    });

    if (!found) {
      // Default to overview if id not found
      targetId = "overview";
      const overview = document.getElementById("overview");
      if (overview) overview.classList.add("active");
    }

    tabs.forEach((tab) => {
      if (tab.getAttribute("data-tab") === targetId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    if (updateHash) {
      window.location.hash = targetId;
    }

    // Close mobile menu if open
    if (navTabsContainer) {
      navTabsContainer.classList.remove("mobile-open");
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Render Mermaid diagrams in the active tab if not already rendered
    renderActiveMermaid(targetId);
  }

  // Handle Tab Click
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute("data-tab");
      switchTab(targetId);
    });
  });

  // Handle Internal Project Card & Button Clicks
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-switch-tab]");
    if (trigger) {
      e.preventDefault();
      const targetId = trigger.getAttribute("data-switch-tab");
      switchTab(targetId);
    }
  });

  // Handle Hash Changes / Initial Hash
  function handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      switchTab(hash, false);
    } else {
      switchTab("overview", false);
    }
  }

  window.addEventListener("hashchange", handleHash);
  handleHash();
}

function initMermaid() {
  if (typeof mermaid !== "undefined") {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "Pretendard, -apple-system, sans-serif"
    });
  }
}

const renderedTabs = new Set();
function renderActiveMermaid(tabId) {
  if (typeof mermaid === "undefined") return;
  const activeContainer = document.getElementById(tabId);
  if (!activeContainer) return;

  const diagrams = activeContainer.querySelectorAll(".mermaid:not([data-processed='true'])");
  if (diagrams.length > 0) {
    // Run mermaid on visible container
    mermaid.run({
      nodes: Array.from(diagrams)
    }).catch(err => {
      console.warn("Mermaid render error:", err);
    });
  }
}

function initLightbox() {
  const modal = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");

  if (!modal || !modalImg) return;

  document.querySelectorAll(".doc-img").forEach((img) => {
    img.addEventListener("click", () => {
      modal.classList.add("active");
      modalImg.src = img.src;
      modalImg.alt = img.alt || "Enlarged Image";
    });
  });

  const closeModal = () => {
    modal.classList.remove("active");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileToggle");
  const navTabs = document.getElementById("navTabs");

  if (toggleBtn && navTabs) {
    toggleBtn.addEventListener("click", () => {
      navTabs.classList.toggle("mobile-open");
    });
  }
}
