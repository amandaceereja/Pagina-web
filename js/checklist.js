// --- Inicialización de modo JS (para wizard) ---
document.documentElement.classList.add("js");
document.body.classList.add("js");

// MENÚ MÓVIL — robusto y accesible (se auto-protege de doble binding)
(function () {
  const mobileBtn = document.querySelector(".navbar__mobile-btn");
  const navbarMenu = document.getElementById("navmenu") || document.querySelector(".navbar__menu");
  if (!mobileBtn || !navbarMenu) return;

  
  if (mobileBtn.dataset.bound === "1") return;
  mobileBtn.dataset.bound = "1";

  mobileBtn.addEventListener("click", () => {
    mobileBtn.setAttribute("aria-expanded", String(navbarMenu.classList.toggle("is-open")));
  });
})();



// SCROLL SUAVE interno (si lo necesitas en esta página)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ---------- Wizard básico (3 pasos) ----------
const form = document.getElementById("chk");
const steps = Array.from(document.querySelectorAll(".step"));
const stepsIndicator = Array.from(document.querySelectorAll(".steps li"));
const progressBar = document.getElementById("progressBar");

let currentStep = 0;

// Utilidades de anuncions/analítica y errores
function announce(msg) {
  const s = document.getElementById("form-status");
  if (s) s.textContent = msg;
}

function track(event, params = {}) {
  try {
    if (window.gtag) {
      gtag("event", event, params);
      return;
    }
    if (window._paq) {
      window._paq.push(["trackEvent", "Checklist", event, JSON.stringify(params)]);
      return;
    }
    console.debug("[track]", event, params);
  } catch {
    /* TODO: manejar error no crítico */ void 0;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

// --- helpers de error ---
function setFieldError(input, msg) {
  if (!input) return;
  input.setAttribute("aria-invalid", "true");
  input.classList.add("is-invalid");

  const id = input.id || input.name;
  let err = document.getElementById(`err-${id}`);
  if (!err) {
    err = document.createElement("span");
    err.id = `err-${id}`;
    err.className = "field-error";
    err.setAttribute("role", "alert");
    input.insertAdjacentElement("afterend", err);
  }
  err.textContent = msg;
  input.setAttribute("aria-describedby", err.id);
}
function clearFieldError(input) {
  if (!input) return;
  input.removeAttribute("aria-invalid");
  input.classList.remove("is-invalid");
  const id = input.id || input.name;
  const err = document.getElementById(`err-${id}`);
  if (err) err.remove();
}
function showStepErrors(messages) {
  const box = document.getElementById("step-errors");
  if (!box) return;
  if (!messages.length) {
    box.textContent = "";
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = messages.join("<br>");
}
// validadores básicos
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function validateStep(idx) {
  const msgs = [];
  showStepErrors([]);
  steps[idx].querySelectorAll("input,textarea,select").forEach(clearFieldError);

  if (idx === 0) {
    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const obj = document.getElementById("objetivo");
    if (!nombre.value.trim()) {
      setFieldError(nombre, "El nombre es obligatorio.");
      msgs.push("Completa tu nombre.");
    }
    if (!isEmail(email.value)) {
      setFieldError(email, "Introduce un email válido.");
      msgs.push("El email no tiene formato válido.");
    }
    if (!obj.value.trim()) {
      setFieldError(obj, "Cuéntame tu objetivo principal.");
      msgs.push("Escribe tu objetivo principal.");
    }
  } else if (idx === 1) {
    const anySelected =
      document.querySelectorAll(
        'input[name="objetivo_webpage[]"]:checked,' +
          'input[name="objetivo_landing[]"]:checked,' +
          'input[name="objetivo_ecommerce[]"]:checked,' +
          'input[name="objetivo_extras[]"]:checked'
      ).length > 0;
    if (!anySelected) {
      msgs.push("Selecciona al menos un objetivo.");
      const firstChip = document.querySelector(".chips .chip");
      if (firstChip) firstChip.classList.add("is-invalid");
      setTimeout(() => firstChip && firstChip.classList.remove("is-invalid"), 1200);
    }
  } else if (idx === 2) {
    const rgpd = document.getElementById("rgpd");
    if (!rgpd.checked) {
      setFieldError(rgpd, "Debes aceptar la política de privacidad.");
      msgs.push("Acepta la política de privacidad (RGPD).");
    }
  }

  showStepErrors(msgs);
  if (msgs.length) {
    const firstInvalid = steps[idx].querySelector(".is-invalid");
    if (firstInvalid) firstInvalid.focus({ preventScroll: false });
  }
  return msgs.length === 0;
}

function updateWizardUI() {
  steps.forEach((s, i) => s.classList.toggle("active", i === currentStep));

  stepsIndicator.forEach((li, i) => {
    li.classList.toggle("active", i === currentStep);
    li.setAttribute("aria-current", i === currentStep ? "step" : "false");
  });

  const denom = steps.length || 1;
  const pct = ((currentStep + 1) / denom) * 100;

  if (progressBar) progressBar.style.width = `${pct}%`;

  const progressEl = document.querySelector(".progress");
  if (progressEl) {
    progressEl.setAttribute("aria-valuenow", String(Math.round(pct)));
    progressEl.setAttribute("aria-label", `Progreso: paso ${currentStep + 1} de ${denom}`);
  }
  announce(`Paso ${currentStep + 1} de ${denom}`);
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateWizardUI();
    saveState();
    track("wizard_next", { step: currentStep + 1 });
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateWizardUI();
    saveState();
    track("wizard_prev", { step: currentStep + 1 });
  }
}

document.querySelectorAll(".next").forEach((b) => b.addEventListener("click", nextStep));
document.querySelectorAll(".prev").forEach((b) => b.addEventListener("click", prevStep));

document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => {
  el.addEventListener("change", () =>
    track("field_toggle", {
      name: el.name,
      value: el.value,
      checked: el.checked || el.matches(":checked"),
    })
  );
});

// Estado inicial
updateWizardUI();

try {
  if (!sessionStorage.getItem("ck_viewed")) {
    const K_VIEW = "ck_views";
    const v = +localStorage.getItem(K_VIEW) || 0;
    localStorage.setItem(K_VIEW, String(v + 1));
    sessionStorage.setItem("ck_viewed", "1");
  }
} catch {
  /* TODO: manejar error no crítico */ void 0;
}

// ---------- Autosave en localStorage ----------
const STORAGE_KEY = "chk_state_v2";

function saveState() {
  if (!form) return;
  const data = new FormData(form);
  const json = { step: currentStep };
  for (const [k, v] of data.entries()) {
    if (json[k]) {
      // si ya existe, convertir a array
      if (Array.isArray(json[k])) json[k].push(v);
      else json[k] = [json[k], v];
    } else {
      json[k] = v;
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  } catch {
    /* TODO: manejar error no crítico */ void 0;
  }
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const json = JSON.parse(raw);

    // step
    if (typeof json.step === "number") {
      currentStep = Math.min(Math.max(json.step, 0), steps.length - 1);
    }

    // rellenar inputs
    for (const [name, value] of Object.entries(json)) {
      if (name === "step") continue;
      const els = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
      if (!els.length) continue;

      if (els[0].type === "checkbox" || els[0].type === "radio") {
        const values = Array.isArray(value) ? value : [value];
        els.forEach((el) => {
          el.checked = values.includes(el.value);
        });
      } else {
        if (Array.isArray(value)) {
          els[0].value = value[value.length - 1];
        } else {
          els[0].value = value;
        }
      }
    }

    updateWizardUI();
  } catch {
    /* TODO: manejar error no crítico */ void 0;
  }
}
restoreState();

(function fillTracking() {
  const p = new URLSearchParams(location.search);
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || "";
  };
  set("utm_source", p.get("utm_source"));
  set("utm_medium", p.get("utm_medium"));
  set("utm_campaign", p.get("utm_campaign"));
  set("referrer", document.referrer || "");
})();

// Guardado reactivo
if (form) {
  form.addEventListener("input", saveState, { passive: true });
  form.addEventListener("change", saveState, { passive: true });
}

const formOpenedAt = Date.now();
let submitting = false;

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    const elapsed = (Date.now() - formOpenedAt) / 1000;
    if (elapsed < 4) {
      showStepErrors(["Has completado el formulario demasiado rápido. Intenta de nuevo."]);
      track("spam_fastfill", { elapsed });
      return;
    }

    if (submitting) return;
    submitting = true;

    announce("Enviando el formulario…");
    track("form_submit", { step: currentStep + 1 });

    const successBox = document.getElementById("form-success");
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled", "");
    submitBtn?.setAttribute("aria-busy", "true");

    try {
      const snapshot = new FormData(form);
      const resp = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: snapshot,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        const msg = data?.errors?.[0]?.message || "No se pudo enviar. Intenta de nuevo.";
        showStepErrors([msg]);
        track("form_sent_error", { msg });
        submitting = false;
        return;
      }

      // Éxito
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* TODO: manejar error no crítico */ void 0;
      }

      form.reset();
      currentStep = 0;
      updateWizardUI();
      showStepErrors([]);

      document.querySelectorAll(".steps, .progress").forEach((el) => (el.hidden = true));
      form.querySelectorAll("fieldset.step, .wizard-actions").forEach((el) => (el.hidden = true));

      if (successBox) {
        successBox.hidden = false;

        try {
          const K_VIEW = "ck_views";
          const K_SEND = "ck_sends";
          const prevSends = Number(localStorage.getItem(K_SEND)) || 0;
          localStorage.setItem(K_SEND, String(prevSends + 1));
          const views = Number(localStorage.getItem(K_VIEW)) || 1; // evita división por 0
          const sends = Number(localStorage.getItem(K_SEND)) || 0;
          const rate = ((sends / views) * 100).toFixed(1);

          if (!successBox.querySelector('[data-conv="1"]')) {
            const p = document.createElement("p");
            p.className = "muted";
            p.dataset.conv = "1";
            p.textContent = `Conversión estimada del checklist: ${rate}% (envíos: ${sends} / vistas: ${views})`;
            successBox.appendChild(p);
          }
        } catch {
          /* Silencio: localStorage puede fallar en incógnito/bloqueado */
        }

        const focusTarget = successBox.querySelector("h2") || successBox;
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus();
        successBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // 👇 ESTO DEBE IR DENTRO DEL try
      announce("Formulario enviado con éxito.");
      track("form_sent_ok", { elapsed });

      const again = document.getElementById("send-another");
      if (again) {
        again.onclick = () => {
          document.querySelectorAll(".steps, .progress").forEach((el) => (el.hidden = false));
          form
            .querySelectorAll("fieldset.step, .wizard-actions")
            .forEach((el) => (el.hidden = false));

          if (successBox) successBox.hidden = true;
          form.reset();
          currentStep = 0;
          updateWizardUI();
        };
      }
    } catch (err) {
      showStepErrors(["Error de conexión. Intenta de nuevo."]);
      track("form_sent_error", { err: String(err) });
      submitting = false;
    } finally {
      submitting = false;
      submitBtn?.removeAttribute("aria-busy");
      submitBtn?.removeAttribute("disabled");
    }
  });
}

const backToTop = document.getElementById("back-to-top");
function onScroll() {
  if (window.scrollY > 600) backToTop.classList.add("show");
  else backToTop.classList.remove("show");
}
if (backToTop) {
  window.addEventListener("scroll", onScroll, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
onScroll();
