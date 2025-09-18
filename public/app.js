const endpointSel = document.getElementById("endpoint");
const input = document.getElementById("input");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");

document.getElementById("ex1").onclick = () => {
  endpointSel.value = "/text/process";
  input.value = JSON.stringify({ text: "(Hola (Mundo))" }, null, 2);
  output.textContent = "{}";
  statusEl.textContent = "";
};

document.getElementById("ex2").onclick = () => {
  endpointSel.value = "/text/transform";
  input.value = JSON.stringify(
    { text: "Hello world! This is a test. Hello again." }, null, 2
  );
  output.textContent = "{}";
  statusEl.textContent = "";
};

document.getElementById("clearBtn").onclick = () => {
  input.value = "";
  output.textContent = "{}";
  statusEl.textContent = "";
};

document.getElementById("sendBtn").onclick = async () => {
  let payload;
  try {
    payload = JSON.parse(input.value || "{}");
  } catch (e) {
    statusEl.innerHTML = `<span class="err">JSON inválido: ${e.message}</span>`;
    return;
  }
  statusEl.textContent = "Enviando...";
  try {
    const res = await fetch(endpointSel.value, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    output.textContent = JSON.stringify(data, null, 2);
    statusEl.innerHTML = res.ok
      ? `<span class="ok">${res.status} OK</span>`
      : `<span class="err">${res.status} ${res.statusText}</span>`;
  } catch (err) {
    statusEl.innerHTML = `<span class="err">Error: ${err.message}</span>`;
  }
};

// valores iniciales
document.getElementById("ex1").click();
