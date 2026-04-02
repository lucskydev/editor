// ===============================
// CONFIGURAÇÃO SUPABASE v1
// ===============================
const SUPABASE_URL = "https://ikmgaxztwfsklxfuaqgx.supabase.co";
const SUPABASE_KEY = "sb_secret_fcLIkeN1ET--YMuoPH_KEQ_H2qwGr8Y";


const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// ESTADO
// ===============================
const TEXT_ID = 1;
const editor = document.getElementById("editor");
let estaEmbaralhado = false;

// ===============================
// EMBARALHAMENTO
// ===============================
function gerarSeed(chave) {
  let seed = 0;
  for (const c of chave) seed += c.charCodeAt(0);
  return seed;
}

function embaralharTexto(texto, chave) {
  const seed = gerarSeed(chave);
  const arr = texto.split("");
  const idx = [...arr.keys()];

  idx.sort((a, b) => ((a + seed) % 17) - ((b + seed) % 17));
  return idx.map(i => arr[i]).join("");
}

function desembaralharTexto(texto, chave) {
  const seed = gerarSeed(chave);
  const arr = texto.split("");
  const idx = [...arr.keys()];

  idx.sort((a, b) => ((a + seed) % 17) - ((b + seed) % 17));

  const res = [];
  idx.forEach((pos, i) => res[pos] = arr[i]);
  return res.join("");
}

// ===============================
// BOTÕES
// ===============================
async function salvar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const textoEmbaralhado = embaralharTexto(editor.value, chave);

  const { error } = await supabaseClient
    .from("texts")
    .upsert({
      id: TEXT_ID,
      content: textoEmbaralhado,
      updated_at: new Date()
    });

  if (error) {
    alert("Erro ao salvar");
    console.error(error);
  } else {
    alert("Texto salvo");
    estaEmbaralhado = true;
  }
}

async function carregar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const { data, error } = await supabaseClient
    .from("texts")
    .select("content")
    .eq("id", TEXT_ID)
    .single();

  if (error) {
    alert("Erro ao carregar");
    console.error(error);
    return;
  }

  editor.value = desembaralharTexto(data.content, chave);
  estaEmbaralhado = false;
}

function alternar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  editor.value = estaEmbaralhado
    ? desembaralharTexto(editor.value, chave)
    : embaralharTexto(editor.value, chave);

  estaEmbaralhado = !estaEmbaralhado;
}

