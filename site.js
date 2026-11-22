const photos = Array.from(document.querySelectorAll(".photo img"));
const dialog = document.querySelector("dialog");
const preview = dialog.querySelector("img");
const counter = dialog.querySelector("[aria-live]");
let current = 0;

function showPhoto(index) {
  current = (index + photos.length) % photos.length;
  preview.src = photos[current].src;
  preview.alt = photos[current].alt;
  counter.textContent = `${current + 1} de ${photos.length}`;
}

photos.forEach((photo, index) => {
  const button = photo.closest("button");
  button.setAttribute("aria-label", `Ampliar foto. ${photo.alt}`);
  button.addEventListener("click", () => {
    showPhoto(index);
    dialog.showModal();
  });
});

dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.querySelector(".prev").addEventListener("click", () => showPhoto(current - 1));
dialog.querySelector(".next").addEventListener("click", () => showPhoto(current + 1));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPhoto(current - 1);
  if (event.key === "ArrowRight") showPhoto(current + 1);
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const stage = slider.querySelector(".slider-stage");
  const slides = Array.from(stage.querySelectorAll(".slide"));
  const status = slider.querySelector("[data-status]");
  let active = 0;
  let startX;
  let startY;
  let swipeTime = -Infinity;

  function render() {
    slides.forEach((slide, index) => {
      const distance = (index - active + slides.length) % slides.length;
      const position = distance === slides.length - 1 ? -1 : distance;
      slide.dataset.position = position;
      slide.inert = position !== 0;
      slide.setAttribute("aria-hidden", String(position !== 0));
    });
    status.textContent = slides[active].dataset.label || `Foto ${active + 1} de ${slides.length}`;
  }

  function move(direction) {
    active = (active + direction + slides.length) % slides.length;
    render();
  }

  slider.querySelector("[data-prev]").addEventListener("click", () => move(-1));
  slider.querySelector("[data-next]").addEventListener("click", () => move(1));
  slider.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (stage.contains(document.activeElement)) slider.querySelector("[data-next]").focus();
    move(event.key === "ArrowLeft" ? -1 : 1);
  });
  stage.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    const offsetX = event.changedTouches[0].clientX - startX;
    const offsetY = event.changedTouches[0].clientY - startY;
    if (Math.abs(offsetX) < 45 || Math.abs(offsetX) <= Math.abs(offsetY)) return;
    swipeTime = performance.now();
    move(offsetX < 0 ? 1 : -1);
  }, { passive: true });
  stage.addEventListener("click", (event) => {
    if (performance.now() - swipeTime < 350) event.stopPropagation();
  }, true);
  render();
});

if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("reveal-pending");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    element.classList.add("reveal-pending");
    observer.observe(element);
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const mainMenu = document.querySelector("#menu-principal");

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") === "false");
});
mainMenu.addEventListener("click", (event) => {
  if (event.target.closest("a") && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.focus({ preventScroll: true });
    setMenu(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!mainMenu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
});
matchMedia("(max-width: 760px)").addEventListener("change", () => setMenu(false));
