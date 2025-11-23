import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const causaID = params.get("id");
const valor = Number(params.get("valor") || 0);
const nome = params.get("nome") ? decodeURIComponent(params.get("nome")) : "Visitante";
const email = params.get("email") ? decodeURIComponent(params.get("email")) : "Sem e-mail";

document.getElementById("valor").textContent = valor.toFixed(2);
document.getElementById("nomePessoa").textContent = nome;
document.getElementById("emailPessoa").textContent = email;

const campoInstituicao = document.getElementById("Instituicao");
const campoDescricao = document.getElementById("descricao");

const pixContainer = document.getElementById("pixContainer");
const pixCodeEl = document.getElementById("pixCode");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnCopiar = document.getElementById("btnCopiarPix");

async function carregarCausa() {
  if (!causaID) return;

  const ref = doc(db, "causas", causaID);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const dados = snap.data();
    campoInstituicao.textContent = dados.Empresa || "Não informado";
    campoDescricao.textContent = dados.Descricao || "Sem descrição";
  }
}

carregarCausa();

btnConfirmar.addEventListener("click", () => {
  const codigoPixFake =
    `00020101021226830014BR.GOV.BCB.PIX2563SITE-EDUCACIONAL-DOACOES.GZ/PIXFAKE520400005303986540${valor.toFixed(2).replace(".", "")}5802BR5913DOADOR TESTE6009CURITIBA62070503***6304ABCD`;

  pixCodeEl.value = codigoPixFake;

  btnConfirmar.style.display = "none";
  pixContainer.style.display = "block";
});

btnCopiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pixCodeEl.value);
    btnCopiar.textContent = "Copiado!";
  } catch {
    alert("Erro ao copiar.");
    return;
  }

  btnCopiar.disabled = true;
  btnCopiar.textContent = "Copiado!";

  setTimeout(async () => {
    try {
      await addDoc(collection(db, `causas/${causaID}/doacoes`), {
        Nome: nome,
        Email: email,
        Valor: valor,
        Data: serverTimestamp()
      });

      alert("Pagamento confirmado! Obrigado pela doação.");
      window.location.href = "index.html";

    } catch (err) {
      console.error(err);
      alert("Erro ao registrar doação. Tente novamente.");
    }

  }, 5000);
});
