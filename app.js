import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ===============================
// SUPABASE v2
// ===============================
const SUPABASE_URL = "https://ikmgaxztwfsklxfuaqgx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbWdheHp0d2Zza2x4ZnVhcWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTE4NzYsImV4cCI6MjA5MDcyNzg3Nn0.OlUfWrPtpN1ZY5ZCxwWghsBoVxLHn4utWwUEO56Anwg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================================
   ELEMENTOS DA TELA
================================ */
const textArea = document.getElementById("texto");
const btnSalvar = document.getElementById("salvar");
const btnCarregar = document.getElementById("carregar");
const btnEmbaralhar = document.getElementById("embaralhar");
const btnDesembaralhar = document.getElementById("desembaralhar");

/* ================================
   CRIPTOGRAFIA AES-GCM
================================ */

// Converte texto → Uint8Array
function strToUint8(str) {
  return new TextEncoder().encode(str);
}

// Converte Uint8Array → texto
function uint8ToStr(buf) {
  return new TextDecoder().decode(buf);
}

// Gera chave a partir da senha
async function gerarChave(senha, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    strToUint8(senha),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Criptografa
async function criptografar(texto, senha) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const chave = await gerarChave(senha, salt);

  const criptografado = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    chave,
    strToUint8(texto)
  );

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      salt: Array.from(salt),
      data: Array.from(new Uint8Array(criptografado))
    })
  );
}

// Descriptografa
async function descriptografar(dados, senha) {
  const obj = JSON.parse(atob(dados));
  const iv = new Uint8Array(obj.iv);
  const salt = new Uint8Array(obj.salt);
  const data = new Uint8Array(obj.data);

  const chave = await gerarChave(senha, salt);

  const descriptografado = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    chave,
    data
  );

  return uint8ToStr(descriptografado);
}

/* ================================
   BOTÕES
================================ */

btnEmbaralhar.onclick = async () => {
  const senha = prompt("Senha para embaralhar:");
  if (!senha) return;

  textArea.value = await criptografar(textArea.value, senha);
};

btnDesembaralhar.onclick = async () => {
  const senha = prompt("Senha para desembaralhar:");
  if (!senha) return;

  try {
    textArea.value = await descriptografar(textArea.value, senha);
  } catch {
    alert("Senha incorreta ou texto inválido.");
  }
};

btnSalvar.onclick = async () => {
  const senha = prompt("Senha para salvar:");
  if (!senha) return;

  const textoCriptografado = await criptografar(textArea.value, senha);

  const { error } = await supabase
    .from("textos")
    .upsert({ id: 1, conteudo: textoCriptografado });

  if (error) alert("Erro ao salvar");
  else alert("Texto salvo com sucesso!");
};

btnCarregar.onclick = async () => {
  const { data, error } = await supabase
    .from("textos")
    .select("conteudo")
    .eq("id", 1)
    .single();

  if (error || !data) {
    alert("Nada salvo");
    return;
  }

  textArea.value = data.conteudo;
};

