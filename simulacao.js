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

// aqui, o codigo repsonsável pela geração do pix estaria presente, ele deveria registrar o pagamento e retornar a confirmação para validar o pagamento

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
      valor: valor,
      data: serverTimestamp()
    });

    const ref = doc(db, "causas", causaID);
    const snap = await getDoc(ref);
    const dadosCausa = snap.exists() ? snap.data() : {};

    await addDoc(collection(db, "dados_doacoes"), {
      causaID: causaID,
      nome: nome,
      email: email,
      valor: valor,
      data: serverTimestamp(),

      instituicao: dadosCausa.Empresa || null,
      descricao: dadosCausa.Descricao || null,
      meta: dadosCausa.Meta || null,

      userAgent: navigator.userAgent,
      idioma: navigator.language,
      dataProcessada: new Date().toISOString(),
      ip: null // ip é interessante por questões de segurança
    });

    alert("Pagamento confirmado! Obrigado pela doação.");
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("Erro ao registrar doação. Tente novamente.");
  }

}, 5000);

});

// Regras do DB


// Permite ler qualquer documento dentro da coleção causas mas não permite escrever
// Permite ler todas as doações de cada causa.
// Permite criar novas doações, mas apenas com as chaves valor e data
// Não permite atualizar ou deletar doações 
// Permite criar registros completos do doador mas ninguém pode ler, atualizar ou deletar esses documentos

// Isso foi definido para atender ao OWASP A01 - Broken Access Control



// rules_version = '2';

// service cloud.firestore {
//   match /databases/{database}/documents {

//     match /causas/{causaId} {
//       allow read: if true;
//       allow write: if false;

//       match /doacoes/{docId} {
//         allow read: if true;
//         allow create: if
//           request.resource.data.keys().hasOnly(["valor", "data"]);
//         allow update, delete: if false;
//       }
//     }

//   match /dados_doacoes/{docId} {
//     allow create: if
//       request.resource.data.keys().hasOnly([
//         "causaID",
//         "valor",
//         "data",
//         "email",
//         "nome",
//         "instituicao",
//         "descricao",
//         "meta",
//         "userAgent",
//         "idioma",
//         "dataProcessada",
//         "ip"
//       ]);
//     allow read, update, delete: if false;
// 	}


//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }
