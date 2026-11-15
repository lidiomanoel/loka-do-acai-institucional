(() => {
  const track = document.querySelector(".carousel-track");
  const slides = [...document.querySelectorAll(".carousel-slide")];
  const dots = [...document.querySelectorAll(".carousel-dot")];
  const count = document.querySelector(".carousel-count b");
  const carousel = document.querySelector(".carousel");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    count.textContent = String(activeIndex + 1).padStart(2, "0");
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

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
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
})();
