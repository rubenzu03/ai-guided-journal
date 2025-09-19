(function () {
  const submitBt = document.getElementById("submit_bt");
  const clearBt = document.getElementById("clear_bt");
  const input = document.getElementById("journal-input");
  const aiP = document.getElementById("ai-analysis");

  function getCookie(name) {
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

  if (submitBt) {
    submitBt.addEventListener("click", async function () {
      const text = input.value || "";
      aiP.textContent = "";
      try {
        submitBt.disabled = true;
      } catch (er) {}
      try {
        clearBt.disabled = true;
      } catch (er) {}
      const statusDiv = document.getElementById("status_message");
      if (statusDiv) statusDiv.innerHTML = "<p>Generating analysis...</p>";
      try {
        const resp = await fetch("/entries/generate-analysis-stream/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          body: JSON.stringify({ text }),
          credentials: "same-origin",
        });

        if (!resp.ok) {
          aiP.textContent = "Error generating analysis";
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();

        // Typewriter rendering config
        const RENDER_MODE = "char"; // 'char' or 'word'
        const CHAR_DELAY = 20; // ms per char
        const WORD_DELAY = 120; // ms per word

        let pendingText = "";
        let rendering = false;

        function sleep(ms) {
          return new Promise((res) => setTimeout(res, ms));
        }

        // throttled scroll helper: scroll to bottom at most once per `THROTTLE_MS`
        const THROTTLE_MS = 100;
        let lastScroll = 0;
        function throttledScrollToBottom() {
          const now = Date.now();
          if (now - lastScroll < THROTTLE_MS) return;
          lastScroll = now;
          window.requestAnimationFrame(() => {
            try {
              const scrollTarget = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
              );
              window.scrollTo({ top: scrollTarget, behavior: "smooth" });
            } catch (e) {
              window.scrollTo(
                0,
                document.body.scrollHeight ||
                  document.documentElement.scrollHeight
              );
            }
          });
        }

        async function renderPending() {
          if (rendering) return;
          rendering = true;
          try {
            if (RENDER_MODE === "word") {
              while (pendingText.length > 0) {
                const match = pendingText.match(/^(\S+)(\s*)/);
                if (match) {
                  const word = match[1] + (match[2] || "");
                  aiP.textContent += word;
                  pendingText = pendingText.slice(word.length);
                  await sleep(WORD_DELAY);
                  throttledScrollToBottom();
                } else {
                  aiP.textContent += pendingText[0];
                  pendingText = pendingText.slice(1);
                  await sleep(CHAR_DELAY);
                  throttledScrollToBottom();
                }
              }
            } else {
              while (pendingText.length > 0) {
                aiP.textContent += pendingText[0];
                pendingText = pendingText.slice(1);
                await sleep(CHAR_DELAY);
                if (aiP.textContent.length % 40 === 0) {
                  throttledScrollToBottom();
                }
              }
              throttledScrollToBottom();
            }
          } finally {
            rendering = false;
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          pendingText += chunk;
          renderPending();
        }
        while (rendering || pendingText.length > 0) {
          await sleep(50);
        }

        try {
          const aiInput = document.getElementById("ai-analysis-input");
          const form = document.getElementById("journal-form");
          const statusDiv = document.getElementById("status_message");
          const url =
            form && form.action ? form.action : window.location.pathname;
          const payload = new URLSearchParams();
          payload.append("text", input.value || "");
          payload.append("ai_analysis", aiP.textContent || "");
          payload.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");

          const saveResp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-CSRFToken": getCookie("csrftoken") || "",
            },
            body: payload.toString(),
            credentials: "same-origin",
          });

          if (saveResp.ok) {
            if (statusDiv) {
              statusDiv.innerHTML = "<p>Entry saved.</p>";
            }
          } else {
            if (statusDiv) {
              statusDiv.innerHTML = "<p>Failed to save entry.</p>";
            }
          }
        } catch (e) {
          const statusDiv = document.getElementById("status_message");
          if (statusDiv) statusDiv.innerHTML = "<p>Error saving entry.</p>";
        } finally {
          try {
            submitBt.disabled = false;
          } catch (er) {}
          try {
            clearBt.disabled = false;
          } catch (er) {}
        }
      } catch (e) {
        aiP.textContent = "Network error while generating analysis";
      }
    });
  }

  if (clearBt) {
    clearBt.addEventListener("click", function () {
      input.value = "";
      aiP.textContent = "";
    });
  }
})();
