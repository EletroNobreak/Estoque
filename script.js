import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {
    // ... MANTENHA SUAS CONFIGURAÇÕES AQUI ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CADASTRO DE ITEM
document.getElementById('btnSalvar').addEventListener('click', async () => {
    const nome = document.getElementById('nome').value;
    const qtd = Number(document.getElementById('quantidade').value);
    const min = Number(document.getElementById('minimo').value);

    if (!nome) return alert("Nome é obrigatório!");

    await addDoc(collection(db, "equipamentos"), {
        nome: nome.toLowerCase(), // salva em minúsculo para busca fácil
        quantidade: qtd,
        minimo: min,
        data: new Date()
    });
    alert("Cadastrado!");
});

// BUSCA EM TEMPO REAL
document.getElementById('inputBusca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    renderizar(termo);
});

// FUNÇÃO PARA ATUALIZAR QUANTIDADE (Entrada/Saída)
window.alterarQtd = async (id, mudanca) => {
    const itemRef = doc(db, "equipamentos", id);
    // Para simplificar, primeiro pegamos o valor atual. 
    // Em sistemas maiores usamos increment().
    const querySnapshot = await getDocs(collection(db, "equipamentos"));
    querySnapshot.forEach(async (d) => {
        if(d.id === id) {
            const novaQtd = d.data().quantidade + mudanca;
            if(novaQtd < 0) return alert("Estoque insuficiente!");
            await updateDoc(itemRef, { quantidade: novaQtd });
        }
    });
};

// RENDERIZAR LISTA COM FILTRO E ALERTA
async function renderizar(filtro = "") {
    const querySnapshot = await getDocs(collection(db, "equipamentos"));
    const listaDiv = document.getElementById('listaEquipamentos');
    listaDiv.innerHTML = "";

    querySnapshot.forEach((d) => {
        const item = d.data();
        if (item.nome.includes(filtro)) {
            const isBaixo = item.quantidade <= item.minimo;
            
            listaDiv.innerHTML += `
                <div class="item-card ${isBaixo ? 'estoque-baixo' : ''}">
                    <div>
                        <strong>${item.nome.toUpperCase()}</strong><br>
                        <span>Qtd: ${item.quantidade} (Mín: ${item.minimo})</span>
                        ${isBaixo ? '<br><small>⚠️ REPOR ESTOQUE!</small>' : ''}
                    </div>
                    <div class="acoes">
                        <button class="btn-entrada" onclick="alterarQtd('${d.id}', 1)">+ Entrada</button>
                        <button class="btn-saida" onclick="alterarQtd('${d.id}', -1)">- Venda</button>
                    </div>
                </div>
            `;
        }
    });
}

// Escuta mudanças no banco automaticamente (Real-time)
onSnapshot(collection(db, "equipamentos"), () => {
    renderizar(document.getElementById('inputBusca').value);
});
