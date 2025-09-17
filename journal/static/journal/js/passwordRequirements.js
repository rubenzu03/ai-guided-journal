(function () {
  "use strict";

  const PASSWORD_SELECTOR = "input[type=password]";
  const REQUIREMENTS_ID = "password-requirements-list";

  const requirements = [
    {
      key: "length",
      text: "At least 8 characters",
      test: (s) => s.length >= 8,
    },
    { key: "lower", text: "A lowercase letter", test: (s) => /[a-z]/.test(s) },
    { key: "upper", text: "An uppercase letter", test: (s) => /[A-Z]/.test(s) },
    { key: "digit", text: "Contains a number", test: (s) => /[0-9]/.test(s) },
    {
      key: "special",
      text: "A special character (like: !@#$%)",
      test: (s) => /[^A-Za-z0-9\s]/.test(s),
    },
    {
      key: "common",
      text: "Not a commonly used password",
      test: (s, input) => {
        try {
          if (!input) return true;
          const val = input.getAttribute("data-common");
          if (val === null || typeof val === "undefined" || val === "")
            return true;
          return String(val) !== "true";
        } catch (e) {
          return true;
        }
      },
    },
  ];

  function buildRequirementsList() {
    const ul = document.createElement("ul");
    ul.id = REQUIREMENTS_ID;
    requirements.forEach((r) => {
      const li = document.createElement("li");
      li.dataset.reqKey = r.key;
      li.className = "unsatisfied";

      const icon = document.createElement("div");
      icon.className = "pw-req-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "✕";

      const text = document.createElement("span");
      text.className = "pw-req-text";
      text.textContent = r.text;

      li.appendChild(icon);
      li.appendChild(text);
      ul.appendChild(li);
    });
    return ul;
  }
  function updateRequirements(password, pwInput) {
    const ul = document.getElementById(REQUIREMENTS_ID);
    if (!ul) return;
    requirements.forEach((r) => {
      const li = ul.querySelector(`li[data-req-key="${r.key}"]`);
      if (!li) return;
      const icon = li.querySelector(".pw-req-icon");
      if (ok) {
        li.classList.remove("unsatisfied");
        li.classList.add("satisfied");
        icon.textContent = "✓";
      } else {
        li.classList.remove("satisfied");
        li.classList.add("unsatisfied");
        icon.textContent = "✕";
      }
    });
  }

  function findPasswordInput() {
    const forms = Array.from(document.querySelectorAll("form"));
    for (const form of forms) {
      const pw = form.querySelector("input[type='password']");
      if (pw) return pw;
    }
    return document.querySelector(PASSWORD_SELECTOR);
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }
    const pwInput = findPasswordInput();
    if (!pwInput) return;

    let reqList = document.getElementById(REQUIREMENTS_ID);
    if (!reqList) {
      reqList = buildRequirementsList();
      pwInput.insertAdjacentElement("afterend", reqList);
    }

    try {
      const container = pwInput.closest("p") || pwInput.parentElement;
      if (container) {
        const text = container.innerText || "";
        if (text.toLowerCase().includes("too common")) {
          pwInput.setAttribute("data-common", "true");
        }
      }
    } catch (e) {
      // ignore
    }

    updateRequirements(pwInput.value || "", pwInput);

    pwInput.addEventListener("input", (e) => {
      try {
        e.target.removeAttribute("data-common");
      } catch (er) {}
      updateRequirements(e.target.value || "", pwInput);
      debounceServerCheck(e.target.value || "", pwInput);
    });
  }

  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function getCookie(name) {
    // From Django docs
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  async function serverCheck(password, pwInput) {
    if (!pwInput) return;
    try {
      const resp = await fetch("/accounts/password-check/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });
      if (!resp.ok) return;
      const json = await resp.json();
      if (json.too_common) {
        pwInput.setAttribute("data-common", "true");
      } else {
        pwInput.removeAttribute("data-common");
      }
      updateRequirements(password || "", pwInput);
    } catch (e) {
    }
  }

  const debounceServerCheck = debounce(serverCheck, 300);

  init();
})();
