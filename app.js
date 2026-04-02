// ===============================
// SUPABASE v2
// ===============================
const SUPABASE_URL = "https://ikmgaxztwfsklxfuaqgx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbWdheHp0d2Zza2x4ZnVhcWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTE4NzYsImV4cCI6MjA5MDcyNzg3Nn0.OlUfWrPtpN1ZY5ZCxwWghsBoVxLHn4utWwUEO56Anwg";

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
  return [...chave].reduce((s, c) => s + c.charCodeAt(0), 0) * 7; // Multiplicando por um fator para aumentar a complexidade
}

function embaralhar(txt, chave) {
  const s = seed(chave);
  const a = txt.split("");
  const i = [...a.keys()];
  
  // Misturando as posições
  i.sort((x, y) => (((x + s) * 3 + 5) % 29) - (((y + s) * 3 + 5) % 29));
  
  // Adicionando caracteres aleatórios entre as letras
  const charsAleatorios = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return i.map(n => {
    const letra = a[n];
    const randomChar = charsAleatorios[Math.floor(Math.random() * charsAleatorios.length)];
    return letra + randomChar; // Concatenando um caractere aleatório
  }).join("").replace(/.$/, ""); // Removendo o último caractere adicional
}

function desembaralhar(txt, chave) {
  const s = seed(chave);
  const a = txt.split("").filter((_, index) => index % 2 === 0); // Removendo caracteres aleatórios
  const i = [...a.keys()];
  
  i.sort((x, y) => (((x + s) * 3 + 5) % 29) - (((y + s) * 3 + 5) % 29));

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
