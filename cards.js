import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

function criarCardParaCausa(id, causa, arrecadado) {
  const nome = causa.Causa || "Sem título";
  const empresa = causa.Empresa || "Organização";
  const local = causa.Local || "geral";
  const meta = Number(causa.Meta) || 0;

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

  return card;
}

async function carregarCausas() {
  const container = document.getElementById("cards_container");
  container.innerHTML = "";

  try {
    // 1️⃣ Pega todas as causas
    const causasRef = collection(db, "causas");
    const snapshotCausas = await getDocs(causasRef);

    for (const docSnap of snapshotCausas.docs) {
      const causaId = docSnap.id;
      const dadosCausa = docSnap.data();

      // 2️⃣ Pega todas as doações da subcoleção da causa
      const doacoesRef = collection(db, `causas/${causaId}/doacoes`);
      const snapshotDoacoes = await getDocs(doacoesRef);

      // 3️⃣ Soma os valores
      let arrecadado = 0;
      snapshotDoacoes.forEach((doacao) => {
        arrecadado += Number(doacao.data().Valor || 0);
      });

      // 4️⃣ Cria e adiciona o card
      const card = criarCardParaCausa(causaId, dadosCausa, arrecadado);
      container.appendChild(card);
    }

  } catch (err) {
    console.error("Erro ao carregar causas:", err);
  }
}

carregarCausas();
