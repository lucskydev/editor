// ===============================
// SUPABASE v2
// ===============================
const SUPABASE_URL = "https://ikmgaxztwfsklxfuaqgx.supabase.co";
const SUPABASE_KEY = "sb_secret_fcLIkeN1ET--YMuoPH_KEQ_H2qwGr8Y";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// ESTADO
// ===============================
const editor = document.getElementById("editor");
let embaralhado = false;
const TEXT_ID = 1;

// ===============================
// EMBARALHAMENTO
// ===============================
function seed(chave) {
  return [...chave].reduce((s, c) => s + c.charCodeAt(0), 0);
}

function embaralhar(txt, chave) {
  const s = seed(chave);
  const a = txt.split("");
  const i = [...a.keys()];
  i.sort((x, y) => ((x + s) % 19) - ((y + s) % 19));
  return i.map(n => a[n]).join("");
}

function desembaralhar(txt, chave) {
  const s = seed(chave);
  const a = txt.split("");
  const i = [...a.keys()];
  i.sort((x, y) => ((x + s) % 19) - ((y + s) % 19));

  const r = [];
  i.forEach((p, k) => r[p] = a[k]);
  return r.join("");
}

// ===============================
// AÇÕES
// ===============================
async function salvar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const enc = embaralhar(editor.value, chave);

  const { error } = await client
    .from("texts")
    .upsert({ id: TEXT_ID, content: enc });

  if (error) console.error(error);
  else alert("Salvo");
}

async function carregar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const { data, error } = await client
    .from("texts")
    .select("content")
    .eq("id", TEXT_ID)
    .single();

  if (error) return console.error(error);

  editor.value = desembaralhar(data.content, chave);
  embaralhado = false;
}

function alternar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  editor.value = embaralhado
    ? desembaralhar(editor.value, chave)
    : embaralhar(editor.value, chave);

  embaralhado = !embaralhado;
}

// ===============================
// EVENTOS (CORRETO)
// ===============================
document.getElementById("btnSalvar").onclick = salvar;
document.getElementById("btnCarregar").onclick = carregar;
document.getElementById("btnAlternar").onclick = alternar;

