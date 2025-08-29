document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Menú Móvil ---
  const mobileBtn = document.querySelector(".navbar__mobile-btn");
  const navbarMenu = document.querySelector(".navbar__menu");

  if (mobileBtn && navbarMenu) {
    navbarMenu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        mobileBtn.focus();
      }
    });
  }

  function setMenu(open) {
    navbarMenu.classList.toggle("is-open", open);
    mobileBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) navbarMenu.querySelector("a")?.focus();
  }

  mobileBtn.addEventListener("click", () => {
    const isOpen = navbarMenu.classList.contains("is-open");
    setMenu(!isOpen);
  });

  navbarMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setMenu(false);
    mobileBtn.focus(); // devuelve el foco al trigger (mejor accesibilidad)
  });

  // --- Scroll suave + actualizar hash ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (!targetElement) return; // si no existe, no tocamos nada

      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth" });

      // ✅ Actualiza la URL para que el test vea #checklist
      try {
        if (history.replaceState) {
          history.replaceState(null, "", targetId); // no añade entrada al historial
        } else {
          location.hash = targetId; // fallback
        }
      } catch {
        /* noop */
      }
    });
  });

  // --- Scrollspy (robusto) ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = [...document.querySelectorAll(".navbar__menu a")];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        // Busca el link correspondiente (si no existe, salimos sin error)
        const link = document.querySelector(`.navbar__menu a[href="#${CSS.escape(id)}"]`);
        if (!link) return;

        navLinks.forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));

  // --- Animaciones con GSAP/ScrollTrigger ---
  // Guardamos para que, si GSAP no está cargado, NO reviente el resto de JS.
  if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero__content", {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.5,
    });

    gsap.to(".hero", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
      backgroundPositionY: "30%",
    });

    gsap.utils.toArray(".card").forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom bottom",
          toggleActions: "restart none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 0.5,
      });
    });
  }

  // --- Checklist: re-animar SIEMPRE al entrar y ocultar al salir ---
  (() => {
    const section = document.querySelector("#checklist");
    const boxes = Array.from(document.querySelectorAll("#checklist .checklist__box"));
    if (!section || !boxes.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers = [];

    const clearTimers = () => {
      timers.forEach((t) => clearTimeout(t));
      timers = [];
    };

    const showWithStagger = () => {
      clearTimers();
      // Resetea primero (por si venimos de media animación)
      boxes.forEach((b) => b.classList.remove("is-checked"));

      if (prefersReduced) {
        boxes.forEach((b) => b.classList.add("is-checked"));
        return;
      }

      boxes.forEach((box, i) => {
        const t = setTimeout(() => box.classList.add("is-checked"), i * 300);
        timers.push(t);
      });
    };

    const hideAll = () => {
      clearTimers();
      boxes.forEach((b) => b.classList.remove("is-checked"));
    };

    // Observa entradas y salidas de la sección
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== section) return;
          if (entry.isIntersecting) {
            // Entra: vuelve a animar
            showWithStagger();
          } else {
            // Sale: oculta para poder re-animar la próxima vez
            hideAll();
          }
        });
      },
      { threshold: [0, 0.35] }
    ); // dispara cerca del 35% visible

    io.observe(section);
  })();

  // --- Sobre mí: revelar al entrar en viewport ---
  (() => {
    const section = document.querySelector("#sobre");
    if (!section) return;

    const show = () => section.classList.add("in-view");

    // Fallback si el navegador no soporta IO
    if (!("IntersectionObserver" in window)) {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show();
            io.disconnect(); // solo una vez; quita esta línea si quieres que entre/salga
          }
        });
      },
      { threshold: 0.2 }
    );

    io.observe(section);
  })();

  // --- Botón "Volver arriba" visible solo al llegar al final ---
  (() => {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      // Altura total del documento
      const docHeight = document.documentElement.scrollHeight;
      // Altura visible (viewport)
      const winHeight = window.innerHeight;
      // Distancia actual scrolleada
      const scrollPos = window.scrollY + winHeight;

      // Si llegó al final (o casi, con tolerancia de 20px)
      if (scrollPos >= docHeight - 20) {
        btn.classList.add("show");
      } else {
        btn.classList.remove("show");
      }
    });

    // Scroll suave al top
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? "auto" : "smooth",
      });
    });
  })();

  // Servicios: activar animación móvil al entrar en viewport (badge + micro swipe)
  (() => {
    const track = document.querySelector(".servicios-track");
    if (!track) return;

    const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobile() || reduced) return;

    let hinted = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            track.classList.add("is-in");
            if (!hinted) {
              track.classList.add("swipe-hint", "hint-label");
              hinted = true;
              setTimeout(() => track.classList.remove("swipe-hint", "hint-label"), 2600);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(track);
  })();

  // --- Typewriter simple (estilo Parrish) ---
  function initTypewriter() {
    const el = document.getElementById("typer");
    if (!el) return;

    const phrases = ["Diseñadora Web Freelance", "Desarrolladora Frontend"];

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let p = 0,
      i = 0,
      deleting = false;
    const typeDelay = 60; // velocidad tecleo
    const holdDelay = 1200; // pausa al terminar palabra
    const delDelay = 38; // velocidad borrado

    function tick() {
      const full = phrases[p];
      const current = el.textContent || "";

      if (prefersReduced) {
        el.textContent = phrases[0];
        return;
      }

      if (!deleting) {
        // Escribiendo
        el.textContent = full.slice(0, i + 1);
        i++;
        if (i === full.length) {
          deleting = true;
          return setTimeout(tick, holdDelay);
        }

        return setTimeout(tick, typeDelay);
      } else {
        // Borrando
        el.textContent = current.slice(0, -1);
        i--;
        if (i === 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          return setTimeout(tick, 260);
        }
        return setTimeout(tick, delDelay);
      }
    }

    el.textContent = "";
    tick();
  }

  initTypewriter();
});
