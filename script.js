// Importando funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// CONFIGURAÇÃO DO SEU PROJETO (Copie do seu console Firebase)
const firebaseConfig = {
     apiKey: "AIzaSyCoo-WBUFesOZkRHEXDdhS0Y0YeE250S4Y",
  authDomain: "projeto-estoque-672d2.firebaseapp.com",
  projectId: "projeto-estoque-672d2",
  storageBucket: "projeto-estoque-672d2.firebasestorage.app",
  messagingSenderId: "888916286160",
  appId: "1:888916286160:web:1d58e77922eb9efff1dcd5",
  measurementId: "G-KGC9L57HZT"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência para os elementos do HTML
const btnSalvar = document.getElementById('btnSalvar');
const listaDiv = document.getElementById('listaEquipamentos');

// FUNÇÃO: Salvar no Banco
btnSalvar.addEventListener('click', async () => {
    const nome = document.getElementById('nome').value;
    const qtd = document.getElementById('quantidade').value;
    const status = document.getElementById('status').value;

    if (!nome || !qtd) return alert("Preencha todos os campos!");

    try {
        await addDoc(collection(db, "equipamentos"), {
            nome: nome,
            quantidade: Number(qtd),
            status: status,
            data: new Date()
        });
        alert("Salvo com sucesso!");
        location.reload(); // Atualiza a página para mostrar o novo item
    } catch (e) {
        console.error("Erro ao salvar: ", e);
    }
});

// FUNÇÃO: Ler dados e mostrar na tela
async function carregarDados() {
    const querySnapshot = await getDocs(collection(db, "equipamentos"));
    listaDiv.innerHTML = ""; // Limpa a lista antes de carregar
    
    querySnapshot.forEach((doc) => {
        const item = doc.data();
        listaDiv.innerHTML += `
            <div class="item-card">
                <strong>${item.nome}</strong> - Qtd: ${item.quantidade} <br>
                <small>Status: ${item.status}</small>
            </div>
        `;
    });
}

// Executa ao abrir o site
carregarDados();