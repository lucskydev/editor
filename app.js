// ===============================
// CONFIGURAÇÃO SUPABASE
// ===============================
const SUPABASE_URL = "https://ikmgaxztwfsklxfuaqgx.supabase.co";
const SUPABASE_KEY = "sb_secret_fcLIkeN1ET--YMuoPH_KEQ_H2qwGr8Y";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const TEXT_ID = 1;
const editor = document.getElementById("editor");
let estaEmbaralhado = false;

// ===============================
// FUNÇÕES DE EMBARALHAMENTO
// ===============================
function gerarSeed(chave) {
  let seed = 0;
  for (let i = 0; i < chave.length; i++) {
    seed += chave.charCodeAt(i);
  }
  return seed;
}

function embaralharTexto(texto, chave) {
  const seed = gerarSeed(chave);
  const arr = texto.split("");
  const indices = [...arr.keys()];

  indices.sort((a, b) => ((a + seed) % 17) - ((b + seed) % 17));
  return indices.map(i => arr[i]).join("");
}

function desembaralharTexto(texto, chave) {
  const seed = gerarSeed(chave);
  const arr = texto.split("");
  const indices = [...arr.keys()];

  indices.sort((a, b) => ((a + seed) % 17) - ((b + seed) % 17));

  const resultado = [];
  indices.forEach((pos, i) => {
    resultado[pos] = arr[i];
  });

  return resultado.join("");
}

// ===============================
// BOTÃO EMBARALHAR / DESEMBARALHAR
// ===============================
function alternar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  if (estaEmbaralhado) {
    editor.value = desembaralharTexto(editor.value, chave);
  } else {
    editor.value = embaralharTexto(editor.value, chave);
  }

  estaEmbaralhado = !estaEmbaralhado;
}

// ===============================
// SALVAR (SEMPRE EMBARALHADO)
// ===============================
async function salvar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const textoEmbaralhado = embaralharTexto(editor.value, chave);

  const { error } = await supabase
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
    alert("Texto salvo com sucesso");
    estaEmbaralhado = true;
  }
}

// ===============================
// CARREGAR (DESEMBARALHA LOCAL)
// ===============================
async function carregar() {
  const chave = prompt("Palavra-chave:");
  if (!chave) return;

  const { data, error } = await supabase
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

