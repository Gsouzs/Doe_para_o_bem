import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export async function registrarDoacao(causaID, valor) {
  try {
    await addDoc(collection(db, "doacoes"), {
      causaID: causaID,
      valor: valor,
      data: serverTimestamp()
    });

    return true;
  } catch (erro) {
    console.error("Erro ao registrar doação:", erro);
    return false;
  }
}
