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
  function updateRequirements(password) {
    const ul = document.getElementById(REQUIREMENTS_ID);
    if (!ul) return;
    requirements.forEach((r) => {
      const li = ul.querySelector(`li[data-req-key="${r.key}"]`);
      if (!li) return;
      const ok = r.test(password);
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

    updateRequirements(pwInput.value || "");

    pwInput.addEventListener("input", (e) =>
      updateRequirements(e.target.value || "")
    );
  }

  init();
})();
