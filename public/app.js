const inputEl = document.getElementById("queryInput");
const buttonEl = document.getElementById("sendBtn");
const resultEl = document.getElementById("result");

async function sendQuery() {
  const userQuery = inputEl.value;
  resultEl.textContent = "Sending...";

  try {
    const response = await fetch("/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userQuery }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      resultEl.textContent = payload?.error ?? `Request failed (${response.status})`;
      return;
    }

    resultEl.textContent = payload.result ?? "(no result)";
  } catch (err) {
    resultEl.textContent = err?.message ?? String(err);
  }
}

buttonEl.addEventListener("click", sendQuery);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendQuery();
});
