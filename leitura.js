import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export async function pegarTotalDaCausa(causaID) {
  const q = query(
    collection(db, "doacoes"),
    where("causaID", "==", causaID)
  );

  const snap = await getDocs(q);

  let total = 0;
  snap.forEach(doc => {
    total += Number(doc.data().valor || 0);
  });

  return total;
}
