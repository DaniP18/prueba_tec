import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("dev"));
app.use(express.json());

// ====== utils ======
function requireText(req, res) {
  const { text } = req.body || {};
  if (typeof text !== "string") {
    res.status(400).json({
      error: "Body inválido. Esperado JSON con 'text' string.",
      example: { text: "(Hola (Mundo))" }
    });
    return null;
  }
  return text;
}

// ====== /text/process ======
app.post("/text/process", (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;

  const steps = [text];
  const innerMost = /\(([^()]+)\)/;
  let current = text, guard = 0;

  while (innerMost.test(current)) {
    if (guard++ > 1000) {
      return res.status(422).json({ error: "Estructura de paréntesis sospechosa." });
    }
    current = current.replace(innerMost, (_, inner) => inner.split("").reverse().join(""));
    steps.push(current);
  }
  if (/[()]/.test(current)) {
    return res.status(422).json({ error: "Paréntesis desbalanceados." });
  }
  res.json({ result: steps });
});

// ====== /text/transform ======
app.post("/text/transform", (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;

  const isLetter = ch => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch);
  let alt = "", makeUpper = true;
  for (const ch of text) {
    if (isLetter(ch)) {
      alt += makeUpper ? ch.toUpperCase() : ch.toLowerCase();
      makeUpper = !makeUpper;
    } else {
      alt += ch;
      makeUpper = true;
    }
  }

  const mapV = { a:"e",e:"i",i:"o",o:"u",u:"a", A:"E",E:"I",I:"O",O:"U",U:"A",
                 á:"é",é:"í",í:"ó",ó:"ú",ú:"á", Á:"É",É:"Í",Í:"Ó",Ó:"Ú",Ú:"Á" };
  const vowelReplaced = text.split("").map(c => mapV[c] ?? c).join("");

  const wordRegex = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;
  const counts = new Map(), first = new Map(), order = [];
  let m;
  while ((m = wordRegex.exec(text)) !== null) {
    const orig = m[0], low = orig.toLowerCase();
    if (!counts.has(low)) { counts.set(low, 0); first.set(low, orig); order.push(low); }
    counts.set(low, counts.get(low) + 1);
  }
  const unique_words = order.filter(k => counts.get(k) === 1).map(k => first.get(k));

  res.json({ alternating_caps: alt, vowel_replacement: vowelReplaced, unique_words });
});

// ====== estáticos (frontend) ======
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== start ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
