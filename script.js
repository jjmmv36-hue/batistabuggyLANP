const hero = document.querySelector(".hero");

if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const updateParallax = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
    hero.style.setProperty("--parallax-y", `${progress * 34}px`);
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

const carousel = document.querySelector(".stacked-carousel");

if (carousel) {
  const viewport = carousel.querySelector(".stacked-carousel__viewport");
  const cards = Array.from(carousel.querySelectorAll(".destination-card"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsWrap = carousel.querySelector(".carousel-dots");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let autoplayId;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let isDragging = false;

  const shortestOffset = (index) => {
    const total = cards.length;
    let offset = index - activeIndex;

    if (offset > total / 2) {
      offset -= total;
    }

    if (offset < -total / 2) {
      offset += total;
    }

    return offset;
  };

  const render = () => {
    cards.forEach((card, index) => {
      const offset = shortestOffset(index);
      const abs = Math.abs(offset);
      const visible = abs <= 2;

      card.classList.toggle("is-active", index === activeIndex);
      card.style.setProperty("--offset", offset);
      card.style.setProperty("--abs", Math.min(abs, 2));
      card.style.setProperty("--z", visible ? 10 - abs : 0);
      card.style.setProperty("--opacity", visible ? 1 - abs * 0.24 : 0);
      card.style.setProperty("--events", index === activeIndex ? "auto" : "none");
      card.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
    });

    if (dotsWrap) {
      dotsWrap.querySelectorAll("button").forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
    }
  };

  const goTo = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    render();
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  const startAutoplay = () => {
    if (reducedMotion) {
      return;
    }

    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(next, 4800);
  };

  const resetAutoplay = () => {
    startAutoplay();
  };

  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver destino ${index + 1}`);
    dot.addEventListener("click", () => {
      goTo(index);
      resetAutoplay();
    });
    if (dotsWrap) {
      dotsWrap.appendChild(dot);
    }
  });

  prevButton.addEventListener("click", () => {
    prev();
    resetAutoplay();
  });

  nextButton.addEventListener("click", () => {
    next();
    resetAutoplay();
  });

  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
    window.clearInterval(autoplayId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    dragDeltaX = event.clientX - dragStartX;
  });

  const finishDrag = (event) => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    viewport.classList.remove("is-dragging");

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(dragDeltaX) > 54) {
      if (dragDeltaX < 0) {
        next();
      } else {
        prev();
      }
    }

    resetAutoplay();
  };

  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  carousel.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
  carousel.addEventListener("mouseleave", resetAutoplay);

  render();
  startAutoplay();
}
