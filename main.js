const yearEl = document.getElementById("year");
const scrollBtn = document.getElementById("scrollTopBtn");
const profilePhoto = document.querySelector(".profile-photo");
const postCards = [...document.querySelectorAll(".post-card")];
const tagFilters = [...document.querySelectorAll(".tag-filter")];
const smoothLinks = [...document.querySelectorAll(".smooth-scroll")];
const sectionNavLinks = [...document.querySelectorAll(".main-nav a[href^='#']")];
const glowCards = [...document.querySelectorAll(".hero-content, .profile-panel")];
const readingProgressBar = document.getElementById("readingProgressBar");
const copyArticleLinkBtn = document.getElementById("copyArticleLinkBtn");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (profilePhoto) {
  profilePhoto.addEventListener("error", () => {
    profilePhoto.style.display = "none";
  });
}

if (scrollBtn) {
  const toggleScrollBtn = () => {
    const shouldShow = window.scrollY > 250;
    scrollBtn.classList.toggle("visible", shouldShow);
  };

  window.addEventListener("scroll", toggleScrollBtn, { passive: true });
  toggleScrollBtn();

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (postCards.length && tagFilters.length) {
  const setActiveFilter = (selected) => {
    tagFilters.forEach((btn) => {
      btn.classList.toggle("active", btn === selected);
    });
  };

  tagFilters.forEach((filterBtn) => {
    filterBtn.addEventListener("click", () => {
      setActiveFilter(filterBtn);
      const filterTag = filterBtn.dataset.filter;

      postCards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ").filter(Boolean);
        const shouldShow = filterTag === "all" || tags.includes(filterTag);
        card.style.display = shouldShow ? "" : "none";
      });
    });
  });
}

if (smoothLinks.length) {
  smoothLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) {
        return;
      }

      const target = document.querySelector(id);
      if (!target) {
        return;
      }

      event.preventDefault();
      if (sectionNavLinks.includes(link)) {
        sectionNavLinks.forEach((navLink) => navLink.classList.toggle("active", navLink === link));
      }
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      const targetY = target.getBoundingClientRect().top + window.scrollY - (headerHeight + 10);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });
}

if (sectionNavLinks.length) {
  const getNavTarget = (link) => {
    const id = link.getAttribute("href");
    return id ? document.querySelector(id) : null;
  };

  const navTargets = sectionNavLinks
    .map((link) => ({ link, target: getNavTarget(link) }))
    .filter((entry) => entry.target);

  if (navTargets.length) {
    const updateActiveSectionLink = () => {
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      const scrollY = window.scrollY;
      const probeY = scrollY + headerHeight + 36;
      const viewportBottomY = scrollY + window.innerHeight;

      let activeEntry = navTargets[0];
      for (let i = 0; i < navTargets.length; i += 1) {
        const current = navTargets[i];
        const next = navTargets[i + 1];
        const currentTop = Math.max(current.target.offsetTop - headerHeight - 20, 0);
        const nextTop = next ? Math.max(next.target.offsetTop - headerHeight - 20, 0) : Number.POSITIVE_INFINITY;
        const isInRange = probeY >= currentTop && probeY < nextTop;

        if (isInRange) {
          activeEntry = current;
          break;
        }
      }

      const lastTarget = navTargets[navTargets.length - 1];
      if (lastTarget && viewportBottomY >= document.documentElement.scrollHeight - 8) {
        activeEntry = lastTarget;
      }

      navTargets.forEach((entry) => {
        entry.link.classList.toggle("active", entry === activeEntry);
      });
    };

    let isTicking = false;
    const requestNavUpdate = () => {
      if (isTicking) {
        return;
      }
      isTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveSectionLink();
        isTicking = false;
      });
    };

    window.addEventListener("scroll", requestNavUpdate, { passive: true });
    window.addEventListener("resize", requestNavUpdate);
    updateActiveSectionLink();
  }
}

const revealItems = [...document.querySelectorAll(".reveal")];

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

if (glowCards.length) {
  glowCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
}

if (readingProgressBar) {
  const updateReadingProgress = () => {
    const article = document.querySelector(".article-container");
    if (!article) {
      return;
    }
    const rect = article.getBoundingClientRect();
    const articleTop = window.scrollY + rect.top;
    const articleHeight = article.offsetHeight;
    const viewportHeight = window.innerHeight;
    const maxScrollable = Math.max(articleHeight - viewportHeight, 1);
    const progress = Math.min(Math.max((window.scrollY - articleTop) / maxScrollable, 0), 1);
    readingProgressBar.style.width = `${progress * 100}%`;
  };

  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
  updateReadingProgress();
}

if (copyArticleLinkBtn) {
  copyArticleLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = copyArticleLinkBtn.textContent;
      copyArticleLinkBtn.textContent = "Copied";
      setTimeout(() => {
        copyArticleLinkBtn.textContent = originalText;
      }, 1200);
    } catch {
      copyArticleLinkBtn.textContent = "Copy failed";
      setTimeout(() => {
        copyArticleLinkBtn.textContent = "Copy link";
      }, 1400);
    }
  });
}
