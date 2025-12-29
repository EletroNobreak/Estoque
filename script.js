import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, limit } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {  
  apiKey: "AIzaSyCoo-WBUFesOZkRHEXDdhS0Y0YeE250S4Y",
  authDomain: "projeto-estoque-672d2.firebaseapp.com",
  projectId: "projeto-estoque-672d2",
  storageBucket: "projeto-estoque-672d2.firebasestorage.app",
  messagingSenderId: "888916286160",
  appId: "1:888916286160:web:1d58e77922eb9efff1dcd5",
  measurementId: "G-KGC9L57HZT" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNÇÃO PARA SALVAR LOG ---
async function registrarLog(produto, tipo, quantidade) {
    try {
        await addDoc(collection(db, "historico"), {
            produto: produto,
            tipo: tipo,
            quantidade: quantidade,
            dataHora: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now() // Adicionado para facilitar a ordenação manual
        });
    } catch (e) { console.error("Erro no log:", e); }
}

// --- CADASTRAR NOVO ITEM ---
document.getElementById('btnSalvar').addEventListener('click', async () => {
    const nomeInput = document.getElementById('nome');
    const qtdInput = document.getElementById('quantidade');
    const minInput = document.getElementById('minimo');

    if (!nomeInput.value) return alert("Nome é obrigatório!");

    await addDoc(collection(db, "equipamentos"), {
        nome: nomeInput.value.toLowerCase(),
        quantidade: Number(qtdInput.value),
        minimo: Number(minInput.value),
        dataCadastro: new Date().toLocaleString('pt-BR')
    });

    await registrarLog(nomeInput.value, "Cadastro", Number(qtdInput.value));
    alert("Cadastrado!");
    nomeInput.value = ""; qtdInput.value = ""; minInput.value = "";
});

// --- FUNÇÕES GLOBAIS (window.) ---
// Necessário para que o onclick do HTML funcione com type="module"

window.alterarQtd = async (id, nome, mudanca) => {
    const itemRef = doc(db, "equipamentos", id);
    const querySnapshot = await getDocs(collection(db, "equipamentos"));
    
    for (let d of querySnapshot.docs) {
        if(d.id === id) {
            const novaQtd = d.data().quantidade + mudanca;
            if(novaQtd < 0) return alert("Estoque insuficiente!");
            await updateDoc(itemRef, { quantidade: novaQtd });
            await registrarLog(nome, mudanca > 0 ? "Entrada" : "Venda", Math.abs(mudanca));
            break;
        }
    }
};

window.excluirItem = async (id, nome) => {
    if (confirm(`Excluir permanentemente o item "${nome.toUpperCase()}"?`)) {
        try {
            await deleteDoc(doc(db, "equipamentos", id));
            await registrarLog(nome, "Exclusão", 0);
        } catch (e) { alert("Erro ao excluir: " + e); }
    }
};

// --- RENDERIZAR DADOS ---
function carregarDados() {
    // Equipamentos
    onSnapshot(collection(db, "equipamentos"), (snapshot) => {
        const listaDiv = document.getElementById('listaEquipamentos');
        listaDiv.innerHTML = "";
        snapshot.forEach((d) => {
            const item = d.data();
            const isBaixo = item.quantidade <= item.minimo;
            listaDiv.innerHTML += `
                <div class="item-card ${isBaixo ? 'estoque-baixo' : ''}">
                    <div>
                        <strong>${item.nome.toUpperCase()}</strong><br>
                        <small>Cadastrado: ${item.dataCadastro}</small><br>
                        <span>Qtd: ${item.quantidade} (Mín: ${item.minimo})</span>
                    </div>
                    <div class="acoes">
                        <button class="btn-entrada" onclick="alterarQtd('${d.id}', '${item.nome}', 1)">+</button>
                        <button class="btn-saida" onclick="alterarQtd('${d.id}', '${item.nome}', -1)">-</button>
                        <button class="btn-excluir" onclick="excluirItem('${d.id}', '${item.nome}')">🗑️</button>
                    </div>
                </div>`;
        });
    });

    // Histórico (Ordenação manual para evitar erro de índice no Firebase)
    onSnapshot(collection(db, "historico"), (snapshot) => {
        const logDiv = document.getElementById('historicoLogs');
        const logs = [];
        snapshot.forEach(d => logs.push(d.data()));
        
        // Ordena por timestamp (mais recente primeiro)
        logs.sort((a, b) => b.timestamp - a.timestamp);

        logDiv.innerHTML = "";
        logs.slice(0, 10).forEach((log) => {
            logDiv.innerHTML += `
                <div class="log-item">
                    <span><strong>${log.tipo}:</strong> ${log.produto}</span>
                    <span class="data-log">${log.dataHora}</span>
                </div>`;
        });
    });
}

carregarDados();
