let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];

const form = document.getElementById("formEmprestimo");
const lista = document.getElementById("listaEmprestimos");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const pessoa = document.getElementById("pessoa").value;
  const objeto = document.getElementById("objeto").value;
  const data = document.getElementById("data").value;

  emprestimos.push({
    pessoa,
    objeto,
    data,
    status: "Emprestado"
  });

  localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
  form.reset();
  carregarEmprestimos();
});

function carregarEmprestimos() {
  lista.innerHTML = "";

  emprestimos.forEach((item, index) => {
    const botao = item.status === "Emprestado"
      ? `<button onclick="devolver(${index})">Devolver</button>`
      : "-";

    lista.innerHTML += `
      <tr>
        <td>${item.pessoa}</td>
        <td>${item.objeto}</td>
        <td>${item.data}</td>
        <td class="${item.status === 'Emprestado' ? 'status-ativo' : 'status-devolvido'}">
          ${item.status}
        </td>
        <td>${botao}</td>
      </tr>
    `;
  });
}

function devolver(index) {
  emprestimos[index].status = "Devolvido";
  localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
  carregarEmprestimos();
}
function testarConexao() {
    alert('✅ JavaScript conectado com sucesso!');
    console.log('Conexão JS funcionando!');
}

carregarEmprestimos();