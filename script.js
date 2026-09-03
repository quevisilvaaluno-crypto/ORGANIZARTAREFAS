// ===== Elementos da página =====
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCounter = document.getElementById('taskCounter');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filtersNav = document.getElementById('filters');
const dataAtualEl = document.getElementById('dataAtual');

// ===== Estado da aplicação =====
// As tarefas ficam guardadas no localStorage, então elas continuam
// salvas mesmo se a pessoa fechar o navegador.
let tarefas = carregarTarefas();
let filtroAtual = 'todas';

// ===== Funções de dados (localStorage) =====
function carregarTarefas() {
  const dados = localStorage.getItem('tarefas');
  return dados ? JSON.parse(dados) : [];
}

function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// ===== Renderização =====
function renderizarTarefas() {
  taskList.innerHTML = '';

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroAtual === 'pendentes') return !tarefa.concluida;
    if (filtroAtual === 'concluidas') return tarefa.concluida;
    return true; // 'todas'
  });

  tarefasFiltradas.forEach((tarefa) => {
    const item = document.createElement('li');
    item.className = 'task-item' + (tarefa.concluida ? ' is-done' : '');

    item.innerHTML = `
      <input type="checkbox" class="task-item__checkbox" ${tarefa.concluida ? 'checked' : ''}>
      <span class="task-item__text">${escaparHTML(tarefa.texto)}</span>
      <button class="task-item__delete" aria-label="Excluir tarefa">Excluir</button>
    `;

    // Marcar como concluída / pendente
    item.querySelector('.task-item__checkbox').addEventListener('change', () => {
      alternarConclusao(tarefa.id);
    });

    // Excluir tarefa
    item.querySelector('.task-item__delete').addEventListener('click', () => {
      excluirTarefa(tarefa.id);
    });

    taskList.appendChild(item);
  });

  emptyState.classList.toggle('is-visible', tarefasFiltradas.length === 0);
  atualizarContador();
}

function atualizarContador() {
  const pendentes = tarefas.filter((t) => !t.concluida).length;
  taskCounter.textContent = pendentes === 1 ? '1 tarefa pendente' : `${pendentes} tarefas pendentes`;
}

// Evita que texto digitado pelo usuário quebre o HTML da página
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ===== Ações =====
function adicionarTarefa(texto) {
  const novaTarefa = {
    id: Date.now(),
    texto: texto.trim(),
    concluida: false,
  };

  tarefas.unshift(novaTarefa);
  salvarTarefas();
  renderizarTarefas();
}

function alternarConclusao(id) {
  tarefas = tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
  );
  salvarTarefas();
  renderizarTarefas();
}

function excluirTarefa(id) {
  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
  salvarTarefas();
  renderizarTarefas();
}

function limparConcluidas() {
  tarefas = tarefas.filter((tarefa) => !tarefa.concluida);
  salvarTarefas();
  renderizarTarefas();
}

// ===== Eventos =====
taskForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const texto = taskInput.value.trim();
  if (texto === '') return;

  adicionarTarefa(texto);
  taskInput.value = '';
  taskInput.focus();
});

clearCompletedBtn.addEventListener('click', limparConcluidas);

filtersNav.addEventListener('click', (evento) => {
  const botao = evento.target.closest('.filters__button');
  if (!botao) return;

  filtroAtual = botao.dataset.filter;

  document
    .querySelectorAll('.filters__button')
    .forEach((b) => b.classList.remove('is-active'));
  botao.classList.add('is-active');

  renderizarTarefas();
});

// ===== Data atual no cabeçalho =====
function exibirDataAtual() {
  const hoje = new Date();
  const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
  dataAtualEl.textContent = hoje.toLocaleDateString('pt-BR', opcoes);
}

// ===== Inicialização =====
exibirDataAtual();
renderizarTarefas();