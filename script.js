(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const track = document.querySelector(".carousel-track");
  const slides = [...document.querySelectorAll(".carousel-slide")];
  const dots = [...document.querySelectorAll(".carousel-dot")];
  const count = document.querySelector(".carousel-count b");
  const carousel = document.querySelector(".carousel");
  if (track && carousel && slides.length) {
    let activeIndex = 0;
    let timer = null;
    let isPaused = false;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (activeIndex * 100) + "%)";
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-current", i === activeIndex);
        slide.setAttribute("aria-hidden", i === activeIndex ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIndex);
        if (i === activeIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (count) count.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    function stopAutoplay() { window.clearInterval(timer); timer = null; }
    function startAutoplay() {
      stopAutoplay();
      if (!reducedMotion && !isPaused) timer = window.setInterval(() => showSlide(activeIndex + 1), 4800);
    }
    document.querySelector(".previous").addEventListener("click", () => { showSlide(activeIndex - 1); startAutoplay(); });
    document.querySelector(".next").addEventListener("click", () => { showSlide(activeIndex + 1); startAutoplay(); });
    dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); startAutoplay(); }));
    carousel.addEventListener("mouseenter", () => { isPaused = true; stopAutoplay(); });
    carousel.addEventListener("mouseleave", () => { isPaused = false; startAutoplay(); });
    carousel.addEventListener("focusin", () => { isPaused = true; stopAutoplay(); });
    carousel.addEventListener("focusout", event => {
      if (!carousel.contains(event.relatedTarget)) { isPaused = false; startAutoplay(); }
    });
    showSlide(0);
    startAutoplay();
  }

  document.querySelectorAll("[data-mini-carousel]").forEach((gallery, galleryIndex) => {
    const track = gallery.querySelector(".mini-track");
    const slides = [...gallery.querySelectorAll(".mini-slide")];
    const card = gallery.closest(".experience-card");
    const viewport = gallery.querySelector(".mini-viewport");
    const dots = [...card.querySelectorAll(".mini-dot")];
    const previous = card.querySelector(".mini-prev");
    const next = card.querySelector(".mini-next");
    let activeIndex = 0;
    let timer = null;
    let isPaused = false;
    let swipeStart = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (activeIndex * 100) + "%)";
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-current", i === activeIndex);
        slide.setAttribute("aria-hidden", i === activeIndex ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIndex);
        if (i === activeIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }
    function stopAutoplay() { window.clearInterval(timer); timer = null; }
    function startAutoplay() {
      stopAutoplay();
      if (!reducedMotion && !isPaused) {
        timer = window.setInterval(() => showSlide(activeIndex + 1), 5000 + galleryIndex * 450);
      }
    }
    previous.addEventListener("click", () => { showSlide(activeIndex - 1); startAutoplay(); });
    next.addEventListener("click", () => { showSlide(activeIndex + 1); startAutoplay(); });
    dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); startAutoplay(); }));
    card.addEventListener("mouseenter", () => { isPaused = true; stopAutoplay(); });
    card.addEventListener("mouseleave", () => { isPaused = false; startAutoplay(); });
    card.addEventListener("focusin", () => { isPaused = true; stopAutoplay(); });
    card.addEventListener("focusout", event => {
      if (!card.contains(event.relatedTarget)) { isPaused = false; startAutoplay(); }
    });
    viewport.addEventListener("pointerdown", event => { swipeStart = event.clientX; });
    viewport.addEventListener("pointerup", event => {
      if (swipeStart === null) return;
      const distance = event.clientX - swipeStart;
      if (Math.abs(distance) > 45) {
        showSlide(activeIndex + (distance < 0 ? 1 : -1));
        startAutoplay();
      }
      swipeStart = null;
    });
    viewport.addEventListener("pointercancel", () => { swipeStart = null; });
    showSlide(0);
    startAutoplay();
  });

  const revealTargets = [...document.querySelectorAll("[data-reveal], .section-heading, .story-image, .story-copy, .cta-copy")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(target => target.classList.add("is-visible"));
  } else {
    document.body.classList.add("has-reveal");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealTargets.forEach(target => observer.observe(target));
  }

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menuButton.setAttribute("aria-label", open ? "Abrir menu" : "Fechar menu");
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
      nav.classList.remove("is-open");
    }));
  }
})();
