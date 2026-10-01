document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-navigation");

  if (!navToggle || !mobileNav) return;

  let isNavOpen = false;
  let navAnim = gsap.timeline({ paused: true, reversed: true });

  // GSAP animation for mobile offcanvas menu
  navAnim
    .to(mobileNav, {
      duration: 0.5,
      autoAlpha: 1, // handles both opacity and visibility
      display: "flex",
      ease: "power3.inOut",
    })
    .to(
      ".nav-bg",
      {
        duration: 1.2,
        scale: 1,
        ease: "power2.out",
      },
      0,
    )
    .to(
      ".nav-scooty",
      {
        duration: 0.8,
        x: 0,
        opacity: 1,
        ease: "power3.out",
      },
      0.2,
    )
    .to(
      ".nav-link",
      {
        duration: 0.5,
        y: 0,
        opacity: 1,
        stagger: 0.06,
        ease: "power3.out",
      },
      0.2,
    );

  const closeNav = () => {
    if (!isNavOpen) return;
    isNavOpen = false;
    navAnim.reverse();
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  };

  const toggleNav = () => {
    if (isNavOpen) {
      closeNav();
    } else {
      isNavOpen = true;
      navAnim.play();
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
    }
  };

  navToggle.addEventListener("click", toggleNav);

  mobileNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  window.matchMedia("(min-width: 1280px)").addEventListener("change", (e) => {
    if (e.matches) closeNav();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("hero-stage");
  if (!stage) return;

  const slides = [
    {
      name: "Nexus",
      src: "assets/images/products/nexus/nexus-6.webp",
      scale: 1.35,
      range: "136 km",
      speed: "93 km/h",
      battery: "3.0 kWh",
    },
    {
      name: "Magnus",
      src: "assets/images/products/magnus/magnus-6.webp",
      scale: 1.35,
      range: "121 km",
      speed: "50 km/h",
      battery: "2.3 kWh",
    },
    {
      name: "Magnus Neo",
      src: "assets/images/products/magnus/magnus-neo/magnus-neo.webp",
      scale: 1.15,
      range: "100 km",
      speed: "45 km/h",
      battery: "2.0 kWh",
    },
    {
      name: "Reo",
      src: "assets/images/products/reo/reo-6.webp",
      scale: 1.65,
      range: "80 km",
      speed: "25 km/h",
      battery: "1.5 kWh",
    },
  ];
  const images = [
    document.getElementById("hero-image-a"),
    document.getElementById("hero-image-b"),
  ];
  const modelName = document.getElementById("hero-model-name");
  const featureRange = document.getElementById("feature-range");
  const featureSpeed = document.getElementById("feature-speed");
  const featureBattery = document.getElementById("feature-battery");
  const thumbs = [...document.querySelectorAll(".hero-thumb")];
  const hero = stage.closest("section");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let current = 0;
  let activeLayer = 0;
  let animating = false;
  let queuedIndex = null;
  let autoplay;
  let paused = false;

  if (window.gsap) gsap.set(images[0], { scale: slides[0].scale });
  else images[0].style.transform = `scale(${slides[0].scale})`;

  const setSelectedThumb = (index) => {
    thumbs.forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute("aria-pressed", String(selected));

      // Handle bottom border for mobile, left border for desktop
      button.classList.toggle("border-b-slate-900", selected);
      button.classList.toggle("border-b-transparent", !selected);
      button.classList.toggle("lg:border-l-slate-900", selected);
      button.classList.toggle("lg:border-l-transparent", !selected);
    });
  };

  const showSlide = async (index) => {
    if (index === current) return;
    if (animating) {
      queuedIndex = index;
      return;
    }

    animating = true;
    const incomingLayer = 1 - activeLayer;
    const incoming = images[incomingLayer];
    const outgoing = images[activeLayer];
    const next = slides[index];
    incoming.src = next.src;
    incoming.alt = `Ampere ${next.name} electric scooter`;
    incoming.setAttribute("aria-hidden", "true");
    if (incoming.decode) await incoming.decode().catch(() => {});

    modelName.textContent = next.name;
    setSelectedThumb(index);

    const finish = () => {
      outgoing.setAttribute("aria-hidden", "true");
      incoming.removeAttribute("aria-hidden");
      activeLayer = incomingLayer;
      current = index;
      animating = false;
      if (queuedIndex !== null) {
        const nextIndex = queuedIndex;
        queuedIndex = null;
        showSlide(nextIndex);
      }
    };

    if (reduceMotion || !window.gsap) {
      outgoing.style.opacity = "0";
      incoming.style.opacity = "1";
      incoming.style.transform = `scale(${next.scale})`;
      if (featureRange) featureRange.textContent = next.range;
      if (featureSpeed) featureSpeed.textContent = next.speed;
      if (featureBattery) featureBattery.textContent = next.battery;
      finish();
      return;
    }

    const specs = [featureRange, featureSpeed, featureBattery].filter(Boolean);

    const tl = gsap
      .timeline({ defaults: { ease: "power3.inOut" }, onComplete: finish })
      .to(
        outgoing,
        {
          x: -48,
          autoAlpha: 0,
          scale: slides[current].scale * 0.96,
          duration: 0.68,
        },
        0,
      )
      .fromTo(
        incoming,
        { x: 48, autoAlpha: 0, scale: next.scale * 0.96 },
        { x: 0, autoAlpha: 1, scale: next.scale, duration: 0.82 },
        0.08,
      )
      .fromTo(
        modelName,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" },
        0.25,
      );

    if (specs.length) {
      tl.to(
        specs,
        {
          y: -10,
          opacity: 0,
          duration: 0.25,
          stagger: 0.05,
          ease: "power2.in",
          onComplete: () => {
            if (featureRange) featureRange.textContent = next.range;
            if (featureSpeed) featureSpeed.textContent = next.speed;
            if (featureBattery) featureBattery.textContent = next.battery;
          },
        },
        0,
      ).to(
        specs,
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
        },
        0.25,
      );
    }
  };

  const restartAutoplay = () => {
    clearInterval(autoplay);
    if (reduceMotion) return;
    autoplay = setInterval(() => {
      if (!paused && !document.hidden) showSlide((current + 1) % slides.length);
    }, 6500);
  };

  thumbs.forEach((button, index) => {
    button.addEventListener("click", () => {
      showSlide(index);
      restartAutoplay();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const nextIndex =
        (index + (event.key === "ArrowRight" ? 1 : -1) + slides.length) %
        slides.length;
      thumbs[nextIndex].focus();
      showSlide(nextIndex);
      restartAutoplay();
    });
  });
});

// Sticky Navbar Logic
document.addEventListener("DOMContentLoaded", () => {
  const mainHeader = document.getElementById("main-header");
  if (mainHeader) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        mainHeader.classList.remove("absolute", "bg-transparent");
        mainHeader.classList.add("fixed", "bg-white", "shadow-md");
      } else {
        mainHeader.classList.add("absolute", "bg-transparent");
        mainHeader.classList.remove("fixed", "bg-white", "shadow-md");
      }
    });
  }
});

// Initialize Lenis for smooth scrolling
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis();

    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
});

// Our Scooters Section GSAP Animation
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".scooter-card",
      {
        x: 48,
        opacity: 0,
      },
      {
        scrollTrigger: {
          trigger: "#our-scooters",
          start: "top 75%", // triggers when top of section hits 75% of viewport
        },
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      },
    );

    // Ampere Care Section GSAP Animation (Redesign)
    let tlCare = gsap.timeline({
      scrollTrigger: {
        trigger: "#ampere-care",
        start: "top 75%",
      },
    });

    tlCare
      .fromTo(
        ".ampere-care-left h3",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(
        ".ampere-care-left p",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(
        ".care-feature",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.5)",
        },
        "-=0.4"
      )
      .fromTo(
        ".ampere-care-left a",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.2"
      )
      .fromTo(
        ".ampere-care-image img",
        { x: 100, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
        },
        "-=1.2"
      );

    // Why Choose Us Section GSAP Animation
    let tlChoose = gsap.timeline({
      scrollTrigger: {
        trigger: "#why-choose-us",
        start: "top 75%",
      },
    });

    tlChoose
      .fromTo(
        "#why-choose-us .max-w-2xl > *",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      )
      .fromTo(
        "#why-choose-us .absolute.bottom-8",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
        "-=0.6"
      );

    // Services Section GSAP Animation
    let tlServices = gsap.timeline({
      scrollTrigger: {
        trigger: "#services",
        start: "top 75%",
      },
    });

    tlServices.to(".service-card", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    });

    // FAQ Accordion Functionality with smooth slide effect
    $(".faq-button").on("click", function() {
      const content = $(this).next(".faq-content");
      const icon = $(this).find("i");
      
      // Close other FAQs smoothly
      $(".faq-content").not(content).slideUp(300);
      $(".faq-icon i").not(icon).removeClass("ri-close-line").addClass("ri-add-line");

      // Toggle current FAQ
      content.slideToggle(300);
      if (icon.hasClass("ri-add-line")) {
        icon.removeClass("ri-add-line").addClass("ri-close-line");
      } else {
        icon.removeClass("ri-close-line").addClass("ri-add-line");
      }
    });
  }
});
