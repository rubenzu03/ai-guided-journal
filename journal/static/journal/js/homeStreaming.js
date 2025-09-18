(function () {
  // client-side streaming logic for AI analysis
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
      // disable save/clear to avoid concurrent actions while streaming
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

        // Queue for incoming text chunks; renderer consumes this queue.
        let pendingText = "";
        let rendering = false;

        function sleep(ms) {
          return new Promise((res) => setTimeout(res, ms));
        }

        async function renderPending() {
          if (rendering) return;
          rendering = true;
          try {
            if (RENDER_MODE === "word") {
              while (pendingText.length > 0) {
                // Extract next word (including following spaces)
                const match = pendingText.match(/^(\S+)(\s*)/);
                if (match) {
                  const word = match[1] + (match[2] || "");
                  aiP.textContent += word;
                  pendingText = pendingText.slice(word.length);
                  await sleep(WORD_DELAY);
                } else {
                  // fallback: append first char
                  aiP.textContent += pendingText[0];
                  pendingText = pendingText.slice(1);
                  await sleep(CHAR_DELAY);
                }
              }
            } else {
              // char mode
              while (pendingText.length > 0) {
                aiP.textContent += pendingText[0];
                pendingText = pendingText.slice(1);
                await sleep(CHAR_DELAY);
              }
            }
          } finally {
            rendering = false;
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Queue chunk for gradual rendering
          pendingText += chunk;
          // Start the renderer if not already running
          renderPending();
        }

        // Streaming finished. Wait for any pending renderer to flush.
        // Simple loop to wait until pendingText is drained.
        while (rendering || pendingText.length > 0) {
          await sleep(50);
        }

        try {
          const aiInput = document.getElementById("ai-analysis-input");
          const form = document.getElementById("journal-form");
          const statusDiv = document.getElementById("status_message");
          // Prepare payload: send as form-encoded so Django receives request.POST
          const url =
            form && form.action ? form.action : window.location.pathname;
          const payload = new URLSearchParams();
          payload.append("text", input.value || "");
          payload.append("ai_analysis", aiP.textContent || "");
          payload.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");

          // send via fetch so the page is not navigated away or cleared
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
            // show a small saved message but do not clear the inputs
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
          // Re-enable save/clear buttons
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
