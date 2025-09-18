import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Util: valida que exista text en el body
function requireText(req, res) {
  const { text } = req.body || {};
  if (typeof text !== "string") {
    res.status(400).json({
      error:
        "Body inválido. Esperado JSON con propiedad 'text' de tipo string.",
      example: { text: "(Hola (Mundo))" },
    });
    return null;
  }
  return text;
}

/**
 * ===============  /text/process  ==================
 * Recibe una cadena con paréntesis anidados y devuelve los pasos
 * para invertir desde los paréntesis más internos hacia afuera.
 *
 * Regla: En cada paso, toma el grupo más interno "(...)", invierte su contenido,
 * reemplaza el grupo por el contenido invertido (SIN paréntesis), y guarda el resultado.
 * Incluye el texto original como primer paso.
 *
 * Ejemplo:
 *   IN:  "(Hola (Mundo))"
 *   OUT: ["(Hola (Mundo))", "(Hola odnuM)", "Mundo aloH"]
 */
app.post("/text/process", (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;

  // Guardamos pasos (incluye el original)
  const steps = [text];

  // Expresión para capturar el grupo más interno: ( ... sin más paréntesis dentro ... )
  const innerMost = /\(([^()]+)\)/;

  let current = text;
  let safety = 0; // evita loops infinitos por si entra input raro

  while (innerMost.test(current)) {
    if (safety++ > 1000) {
      return res.status(422).json({
        error:
          "Demasiados niveles o estructura no válida de paréntesis (posible bucle).",
      });
    }
    current = current.replace(innerMost, (_, inner) => {
      // invierte el contenido del grupo
      const reversed = inner.split("").reverse().join("");
      // reemplaza el grupo por el contenido invertido, sin paréntesis
      return reversed;
    });
    steps.push(current);
  }

  // Si quedan paréntesis sueltos, es una estructura inválida (desbalanceada)
  if (/[()]/.test(current)) {
    return res.status(422).json({
      error:
        "Paréntesis desbalanceados o estructura inválida. Asegúrate de cerrar todos los paréntesis.",
    });
  }

  res.json({ result: steps });
});

/**
 * ===============  /text/transform  ==================
 * Recibe 'text' y devuelve:
 * 1) alternating_caps: Alterna mayúsculas/minúsculas por palabra.
 *    - Solo las letras [A-Za-zÁÉÍÓÚÜÑáéíóúüñ] alternan.
 *    - Cualquier caracter no letra reinicia la alternancia (espacios, signos, etc.).
 * 2) vowel_replacement: Reemplaza vocales por la siguiente (a->e, e->i, i->o, o->u, u->a).
 *    - Respeta mayúsculas: A->E, ... U->A.
 * 3) unique_words: Palabras que aparecen solo una vez, ignorando puntuación y
 *    contando de manera case-insensitive, pero devolviendo la forma original
 *    (la de su primera aparición). Ordenadas por aparición.
 */
app.post("/text/transform", (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;

  // 1) Alternating caps (por secuencia de letras; no-letters reinicia)
  const isLetter = (ch) =>
    /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch); // soporte básico para ES
  let alt = "";
  let makeUpper = true; // empieza en mayúscula por cada grupo de letras

  for (const ch of text) {
    if (isLetter(ch)) {
      alt += makeUpper ? ch.toUpperCase() : ch.toLowerCase();
      makeUpper = !makeUpper;
    } else {
      // Caracter no letra: se añade tal cual y se reinicia alternancia
      alt += ch;
      makeUpper = true;
    }
  }

  // 2) Reemplazo de vocales
  const nextVowel = {
    a: "e",
    e: "i",
    i: "o",
    o: "u",
    u: "a",
    A: "E",
    E: "I",
    I: "O",
    O: "U",
    U: "A",
    á: "é",
    é: "í",
    í: "ó",
    ó: "ú",
    ú: "á",
    Á: "É",
    É: "Í",
    Í: "Ó",
    Ó: "Ú",
    Ú: "Á",
  };

  const vowelReplaced = text
    .split("")
    .map((c) => (nextVowel[c] ? nextVowel[c] : c))
    .join("");

  // 3) Palabras únicas (case-insensitive para contar; devolvemos la forma 1a vez)
  //   - Ignoramos puntuación. Aceptamos letras con tildes y ñ.
  const wordRegex = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;
  const counts = new Map(); // clave: lowercased, valor: conteo
  const firstForm = new Map(); // lowercased -> forma original en primera aparición
  const order = []; // orden de primera aparición para las claves lower

  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    const original = match[0];
    const lower = original.toLowerCase();
    if (!counts.has(lower)) {
      counts.set(lower, 0);
      firstForm.set(lower, original);
      order.push(lower);
    }
    counts.set(lower, counts.get(lower) + 1);
  }

  const unique_words = order
    .filter((k) => counts.get(k) === 1)
    .map((k) => firstForm.get(k));

  res.json({
    alternating_caps: alt,
    vowel_replacement: vowelReplaced,
    unique_words,
  });
});

// Salud
app.get("/", (_, res) =>
  res.json({ ok: true, endpoints: ["/text/process", "/text/transform"] })
);

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Text Tools API escuchando en http://localhost:${PORT}`);
});
