// ========== DADOS INICIAIS ==========
let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];

const estoqueInicial = [
  { id: 1, nome: "Notebook Dell", categoria: "Eletrônicos", quantidade: 3 },
  { id: 2, nome: "Projetor Multimídia", categoria: "Audiovisual", quantidade: 2 },
  { id: 3, nome: "Caixa de Som Bluetooth", categoria: "Áudio", quantidade: 5 },
  { id: 4, nome: "Câmera Fotográfica", categoria: "Fotografia", quantidade: 2 },
  { id: 5, nome: "Tripé", categoria: "Fotografia", quantidade: 4 },
  { id: 6, nome: "Microfone Sem Fio", categoria: "Áudio", quantidade: 3 },
  { id: 7, nome: "Tablet Samsung", categoria: "Eletrônicos", quantidade: 2 },
  { id: 8, nome: "Carregador Portátil", categoria: "Acessórios", quantidade: 10 },
  { id: 9, nome: "Calculadora Científica", categoria: "Material", quantidade: 8 },
  { id: 10, nome: "Kit de Ferramentas", categoria: "Ferramentas", quantidade: 3 }
];

let estoque = JSON.parse(localStorage.getItem("estoque")) || estoqueInicial;

// ========== ELEMENTOS DO DOM ==========
const form = document.getElementById("formEmprestimo");
const lista = document.getElementById("listaEmprestimos");
const listaEstoque = document.getElementById("listaEstoque");

// ========== FUNÇÕES DO ESTOQUE ==========
function carregarEstoque() {
  if (!listaEstoque) {
    console.error("Elemento listaEstoque não encontrado!");
    return;
  }

  listaEstoque.innerHTML = "";

  estoque.forEach(item => {
    const disponivel = item.quantidade > 0;
    const statusClass = disponivel ? "item-disponivel" : "item-indisponivel";
    const statusText = disponivel ? "Disponível" : "Indisponível";
    
    const row = document.createElement("tr");
    
    row.innerHTML = `
      <td>${escapeHTML(item.nome)}</td>
      <td>${item.categoria}</td>
      <td>${item.quantidade}</td>
      <td class="${statusClass}">${statusText}</td>
      <td>
        <button class="botao-emprestar" 
                onclick="prepararEmprestimo(${item.id})"
                ${!disponivel ? 'disabled' : ''}>
          📦 Emprestar
        </button>
      </td>
    `;
    
    listaEstoque.appendChild(row);
  });
}

// ========== FUNÇÃO DE PREPARAR EMPRÉSTIMO ==========
window.prepararEmprestimo = function(itemId) {
  const item = estoque.find(i => i.id === itemId);
  
  if (!item || item.quantidade <= 0) {
    mostrarMensagem("Item indisponível!", "erro");
    return;
  }
  
  document.getElementById("objeto").value = item.nome;
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById("data").value = hoje;
  document.getElementById("pessoa").focus();
  
  mostrarMensagem(`Preencha o nome para emprestar ${item.nome}`, "sucesso");
}

// ========== FUNÇÕES DOS EMPRÉSTIMOS ==========
function carregarEmprestimos() {
  lista.innerHTML = "";

  emprestimos.forEach((item, index) => {
    const botao = item.status === "Emprestado"
      ? `<button onclick="devolver(${index})">Devolver</button>`
      : "-";

    lista.innerHTML += `
      <tr>
        <td>${escapeHTML(item.pessoa)}</td>
        <td>${escapeHTML(item.objeto)}</td>
        <td>${item.data}</td>
        <td class="${item.status === 'Emprestado' ? 'status-ativo' : 'status-devolvido'}">
          ${item.status}
        </td>
        <td>${botao}</td>
      </tr>
    `;
  });
}

//  aqui é a função de devolver
window.devolver = function(index) {
  const emprestimo = emprestimos[index];
  
  if (emprestimo.status === "Devolvido") {
    mostrarMensagem("Este item já foi devolvido!", "erro");
    return;
  }

  if (!confirm(`Confirmar devolução de "${emprestimo.objeto}"?`)) {
    return;
  }

  // Atualiza o      status
  emprestimo.status = "Devolvido";
  
  // ATUALIZAR ESTOQUE - PROCURAR O ITEM
  const itemEstoque = estoque.find(item => 
    item.nome.toLowerCase() === emprestimo.objeto.toLowerCase()
  );
  
  if (itemEstoque) {
    itemEstoque.quantidade++;
    mostrarMensagem(`${emprestimo.objeto} devolvido! Estoque: ${itemEstoque.quantidade}`, "sucesso");
  } else {
    //Se não existir, criar novo item no estoque
    const novoId = estoque.length > 0 ? Math.max(...estoque.map(i => i.id)) + 1 : 1;
    estoque.push({
      id: novoId,
      nome: emprestimo.objeto,
      categoria: "Outros",
      quantidade: 1
    });
    mostrarMensagem("Item devolvido e adicionado ao estoque!", "sucesso");
  }

  // Salvar tudo
  localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
  localStorage.setItem("estoque", JSON.stringify(estoque));
  
  // Atualizar interfaces
  carregarEmprestimos();
  carregarEstoque();
}

// ========== FORMULÁRIO DE EMPRÉSTIMO ==========
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const pessoa = document.getElementById("pessoa").value.trim();
  const objeto = document.getElementById("objeto").value.trim();
  const data = document.getElementById("data").value;

  if (!pessoa || !objeto || !data) {
    mostrarMensagem("Preencha todos os campos!", "erro");
    return;
  }

  const itemEstoque = estoque.find(i => 
    i.nome.toLowerCase() === objeto.toLowerCase()
  );

  if (itemEstoque) {
    if (itemEstoque.quantidade <= 0) {
      mostrarMensagem("Item sem estoque disponível!", "erro");
      return;
    }
    
    itemEstoque.quantidade--;
    localStorage.setItem("estoque", JSON.stringify(estoque));
  }

  if (!confirm(`Confirmar empréstimo de "${objeto}" para ${pessoa}?`)) {
    // Se cancelou, voltar a quantidade que tinha sido reduzida
    if (itemEstoque) {
      itemEstoque.quantidade++;
      localStorage.setItem("estoque", JSON.stringify(estoque));
    }
    return;
  }

  emprestimos.push({
    pessoa,
    objeto,
    data,
    status: "Emprestado"
  });

  localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
  
  form.reset();
  carregarEmprestimos();
  carregarEstoque();
  
  mostrarMensagem("Empréstimo registrado!", "sucesso");
});

// ========== FUNÇÕES AUXILIARES ==========
function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function mostrarMensagem(texto, tipo) {
  const msgAnterior = document.querySelector(".mensagem");
  if (msgAnterior) msgAnterior.remove();

  const div = document.createElement("div");
  div.className = `mensagem ${tipo}`;
  div.textContent = texto;
  
  form.insertAdjacentElement("afterend", div);
  
  setTimeout(() => div.remove(), 3000);
}

window.testarConexao = function() {
  alert('✅ JavaScript conectado!');
  console.log('Empréstimos:', emprestimos);
  console.log('Estoque:', estoque);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  carregarEmprestimos();
  carregarEstoque();
  
  // Garantir que o estoque inicial esteja salvo
  if (estoque.length === 0) {
    estoque = [...estoqueInicial];
    localStorage.setItem("estoque", JSON.stringify(estoque));
    carregarEstoque();
  }
});