import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));


function sanitize(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


// Função sanitize criada para evitar injeções no código - OWASP A03 – Injection (HTML Injection / XSS)

// Escapa caracteres essenciais usados em ataques XSS
// & --> &amp;
// < --> &lt;
// > --> &gt;
// " --> &quot;
// ' --> &#39;






function criarCardParaCausa(id, causa, arrecadado) {
  const nome = sanitize(causa.Causa || "Sem título"); // aplicado o sanitize, mesmo sendo um campo inserido somente por usuários permitidos, pensando na escalabilidade, é uma boa pratica e pode mitigar vulnerabilidades
  const empresa = sanitize(causa.Empresa || "Organização"); // aplicado o sanitize
  const local = sanitize(causa.Local || "geral"); // aplicado o sanitize
  const meta = Number(causa.Meta) || 0; // não é necessario pois é um número

  const porcentagem = meta > 0 ? clamp((arrecadado / meta) * 100, 0, 100) : 0;

  const card = document.createElement("div");
  card.className = "cards";
  card.dataset.causaId = id;

  card.innerHTML = `
    <div class="causa-container">
      <div class="causa-info">
        <h2>${nome}</h2>
        <h3>${empresa} • ${local.toString().replace(/_/g, " ")}</h3>
      </div>

      <div class="causa-rodape">
        <div class="meta">
          <div class="meta-info">
            <span>Meta: <strong>${formatCurrency(meta)} / ${formatCurrency(arrecadado)}</strong></span>
            <span class="meta-percent"><small>${porcentagem.toFixed(1)}%</small></span>
          </div>

          <div class="progress">
            <div class="progresso" style="width: ${porcentagem}%"></div>
          </div>
        </div>

        <div class="card-cta">
          <span>Doar &gt;</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = `pagamento.html?id=${sanitize(id)}`; // aplicado o sanitize por boa pratica
  });

  return card;
}

async function carregarCausas() {
  const container = document.getElementById("cards_container");
  container.innerHTML = "";

  try {
    const causasRef = collection(db, "causas");
    const snapshotCausas = await getDocs(causasRef);

    for (const docSnap of snapshotCausas.docs) {
      const causaId = docSnap.id;
      const dadosCausa = docSnap.data();

      const doacoesRef = collection(db, `causas/${causaId}/doacoes`);
      const snapshotDoacoes = await getDocs(doacoesRef);

      let arrecadado = 0;
      snapshotDoacoes.forEach((doacao) => {
        arrecadado += Number(doacao.data().valor || 0);
      });

      const card = criarCardParaCausa(causaId, dadosCausa, arrecadado);
      container.appendChild(card);
    }

  } catch (err) {
    console.error("Erro ao carregar causas:", err);
  }
}

carregarCausas();



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

