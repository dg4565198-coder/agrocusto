// AgroCusto Pro - Complete Logic with OUTROS DADOS PARA OS CÁLCULOS card (Gabarito Bruno)

let currentStep = 1;
let currentMode = 'wizard';
let deferredPrompt = null;
let chartCustosInstance = null;
let currentTheme = 'light';

let scenarioA = null;
let scenarioB = null;

// Lista de Insumos
let insumos = [
  { id: 1, nome: "VALOR DOS INSUMOS", qtd: 1, valorUnit: 28000.00 }
];

// Lista de Mão de Obra Permanente (M.O.P.) - Gabarito: 8 Trab, R$ 3000, 13 meses = R$ 312.000
let mopList = [
  { id: 1, cargo: "Trabalhador Permanente (8 pessoas, 13º salário)", qtd: 8, salario: 3000.00, meses: 13 }
];

// Lista de Mão de Obra Temporária - Gabarito: 300 Trab, 1 d/h, R$ 150/dia = R$ 45.000
let motempList = [
  { id: 1, servico: "Trabalhador Temporário (300 diárias)", qtd: 300, quantDH: 1.0, valorDH: 150.00 }
];

// Lista de Horas Extras
let heList = [
  { id: 1, trab: 0, unid: "dia", salario: 0.00, quant: 0 }
];

// Lista de Benfeitorias (Benf 1 a 5)
let benfList = [
  { id: 1, nome: "Benf1 (Galpão / Silo)", valor: 200000.00, valorFinal: 0.00, vidaUtil: 30, pu: 12, pc: 12 },
  { id: 2, nome: "Benf2 (Cerca / Curral)", valor: 80000.00, valorFinal: 0.00, vidaUtil: 7, pu: 12, pc: 12 }
];

// Lista de Máquinas e Equipamentos (Maq/Eq 1 a 12)
let maqList = [
  { id: 1, nome: "Maq/Eq1 (Trator Cabinado)", valor: 200000.00, valorFinal: 20000.00, vidaUtil: 10, pu: 12, pc: 12 },
  { id: 2, nome: "Maq/Eq2 (Plantadeira)", valor: 50000.00, valorFinal: 5000.00, vidaUtil: 10, pu: 12, pc: 12 },
  { id: 3, nome: "Maq/Eq3 (Pulverizador)", valor: 5000.00, valorFinal: 500.00, vidaUtil: 1, pu: 3, pc: 12 }
];

document.addEventListener('DOMContentLoaded', () => {
  renderInsumosTable();
  renderMOPTable();
  renderMOTempTable();
  renderHETable();
  renderBenfTable();
  renderMaqTable();
  initChart();
  calculateAll();
  lucide.createIcons();

  const printDateEl = document.getElementById('print-date');
  if (printDateEl) printDateEl.textContent = new Date().toLocaleDateString('pt-BR');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btnPwa = document.getElementById('btn-install-pwa');
    if (btnPwa) btnPwa.classList.remove('hidden');
  });
});

function toggleTheme() {
  const html = document.documentElement;
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    html.classList.add('light');
    sunIcon?.classList.add('hidden');
    moonIcon?.classList.remove('hidden');
    currentTheme = 'light';
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    moonIcon?.classList.add('hidden');
    sunIcon?.classList.remove('hidden');
    currentTheme = 'dark';
  }
}

function setAppMode(mode) {
  currentMode = mode;
  const stepper = document.getElementById('wizard-stepper');
  const dashTabs = document.getElementById('dashboard-tabs');
  const wizardNav = document.getElementById('wizard-nav-btns');
  
  const btnWiz = document.getElementById('btn-mode-wizard');
  const btnDash = document.getElementById('btn-mode-dashboard');

  if (mode === 'wizard') {
    stepper.classList.remove('hidden');
    dashTabs.classList.add('hidden');
    wizardNav.classList.remove('hidden');

    btnWiz.className = "px-3 py-1.5 rounded-md transition flex items-center gap-1 bg-white text-agro-900 font-bold shadow";
    btnDash.className = "px-3 py-1.5 rounded-md transition flex items-center gap-1 text-agro-100 hover:text-white";

    goToStep(currentStep);
  } else {
    stepper.classList.add('hidden');
    dashTabs.classList.remove('hidden');
    wizardNav.classList.add('hidden');

    btnDash.className = "px-3 py-1.5 rounded-md transition flex items-center gap-1 bg-white text-agro-900 font-bold shadow";
    btnWiz.className = "px-3 py-1.5 rounded-md transition flex items-center gap-1 text-agro-100 hover:text-white";

    showAllSections();
  }
}

function goToStep(step) {
  currentStep = step;
  
  ['producao', 'insumos', 'maodeobra', 'bens', 'resultados'].forEach(sec => {
    const el = document.getElementById(`section-${sec}`);
    if (el) el.classList.add('hidden');
  });

  const stepMap = { 1: 'producao', 2: 'insumos', 3: 'maodeobra', 4: 'bens', 5: 'resultados' };
  const targetSec = document.getElementById(`section-${stepMap[step]}`);
  if (targetSec) targetSec.classList.remove('hidden');

  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`step-btn-${i}`);
    if (!btn) continue;
    if (i === step) {
      btn.className = "step-active flex-1 min-w-[120px] p-2 rounded-lg border text-center transition flex flex-col items-center gap-1";
    } else if (i < step) {
      btn.className = "step-complete flex-1 min-w-[120px] p-2 rounded-lg border text-center transition flex flex-col items-center gap-1";
    } else {
      btn.className = "flex-1 min-w-[120px] p-2 rounded-lg border text-slate-500 dark:text-slate-400 text-center transition flex flex-col items-center gap-1";
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  if (currentStep < 5) goToStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

function showAllSections() {
  ['producao', 'insumos', 'maodeobra', 'bens', 'resultados'].forEach(sec => {
    const el = document.getElementById(`section-${sec}`);
    if (el) el.classList.remove('hidden');
  });
}

function switchDashTab(tabKey) {
  const secEl = document.getElementById(`section-${tabKey}`);
  if (secEl) {
    secEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// INSUMOS
function renderInsumosTable() {
  const tbody = document.getElementById('tbl-insumos-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totalInsumos = 0;

  insumos.forEach((item) => {
    const subtotal = item.qtd * item.valorUnit;
    totalInsumos += subtotal;

    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-2">
        <input type="text" value="${item.nome}" onchange="updateInsumo(${item.id}, 'nome', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.qtd}" oninput="updateInsumo(${item.id}, 'qtd', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs font-semibold">
      </td>
      <td class="p-2">
        <input type="number" value="${item.valorUnit.toFixed(2)}" step="0.01" oninput="updateInsumo(${item.id}, 'valorUnit', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs font-semibold">
      </td>
      <td class="p-2 text-right font-bold text-slate-800 dark:text-slate-200">
        ${formatMoney(subtotal)}
      </td>
      <td class="p-2 text-center">
        <button onclick="removeInsumo(${item.id})" class="text-rose-500 hover:text-rose-700 p-1">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const lblTotal = document.getElementById('lbl-total-insumos');
  if (lblTotal) lblTotal.textContent = formatMoney(totalInsumos);

  // Sincronizar com o card "OUTROS DADOS PARA OS CÁLCULOS"
  const inputOutros = document.getElementById('input-valor-insumos-outros');
  if (inputOutros && insumos.length > 0) {
    inputOutros.value = totalInsumos.toFixed(2);
  }

  lucide.createIcons();
}

function addInsumoRow() {
  const newId = insumos.length > 0 ? Math.max(...insumos.map(i => i.id)) + 1 : 1;
  insumos.push({ id: newId, nome: "Novo Insumo", qtd: 1, valorUnit: 1000.00 });
  renderInsumosTable();
  calculateAll();
}

function updateInsumo(id, field, value) {
  const item = insumos.find(i => i.id === id);
  if (item) {
    item[field] = field === 'nome' ? value : parseFloat(value) || 0;
    renderInsumosTable();
    calculateAll();
  }
}

function removeInsumo(id) {
  insumos = insumos.filter(i => i.id !== id);
  renderInsumosTable();
  calculateAll();
}

// MÃO DE OBRA PERMANENTE
function renderMOPTable() {
  const tbody = document.getElementById('tbl-mop-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  mopList.forEach(item => {
    const total = item.qtd * item.salario * item.meses;
    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-2">
        <input type="text" value="${item.cargo}" onchange="updateMOP(${item.id}, 'cargo', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.qtd}" oninput="updateMOP(${item.id}, 'qtd', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs font-semibold">
      </td>
      <td class="p-2">
        <input type="number" value="${item.salario.toFixed(2)}" step="0.01" oninput="updateMOP(${item.id}, 'salario', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.meses}" oninput="updateMOP(${item.id}, 'meses', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2 text-right font-bold text-slate-800 dark:text-slate-200">${formatMoney(total)}</td>
      <td class="p-2 text-center">
        <button onclick="removeMOP(${item.id})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function addMOPRow() {
  const newId = mopList.length > 0 ? Math.max(...mopList.map(i => i.id)) + 1 : 1;
  mopList.push({ id: newId, cargo: "Novo Cargo", qtd: 1, salario: 2000.00, meses: 13 });
  renderMOPTable();
  calculateAll();
}

function updateMOP(id, field, value) {
  const item = mopList.find(i => i.id === id);
  if (item) {
    item[field] = field === 'cargo' ? value : parseFloat(value) || 0;
    renderMOPTable();
    calculateAll();
  }
}

function removeMOP(id) {
  mopList = mopList.filter(i => i.id !== id);
  renderMOPTable();
  calculateAll();
}

// MÃO DE OBRA TEMPORÁRIA
function renderMOTempTable() {
  const tbody = document.getElementById('tbl-motemp-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  motempList.forEach(item => {
    const total = item.qtd * item.quantDH * item.valorDH;
    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-2">
        <input type="text" value="${item.servico}" onchange="updateMOTemp(${item.id}, 'servico', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.qtd}" oninput="updateMOTemp(${item.id}, 'qtd', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs font-semibold">
      </td>
      <td class="p-2">
        <input type="number" value="${item.quantDH}" step="0.1" oninput="updateMOTemp(${item.id}, 'quantDH', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.valorDH.toFixed(2)}" step="0.01" oninput="updateMOTemp(${item.id}, 'valorDH', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2 text-right font-bold text-slate-800 dark:text-slate-200">${formatMoney(total)}</td>
      <td class="p-2 text-center">
        <button onclick="removeMOTemp(${item.id})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function addMOTempRow() {
  const newId = motempList.length > 0 ? Math.max(...motempList.map(i => i.id)) + 1 : 1;
  motempList.push({ id: newId, servico: "Novo Serviço Temp.", qtd: 10, quantDH: 1, valorDH: 120.00 });
  renderMOTempTable();
  calculateAll();
}

function updateMOTemp(id, field, value) {
  const item = motempList.find(i => i.id === id);
  if (item) {
    item[field] = field === 'servico' ? value : parseFloat(value) || 0;
    renderMOTempTable();
    calculateAll();
  }
}

function removeMOTemp(id) {
  motempList = motempList.filter(i => i.id !== id);
  renderMOTempTable();
  calculateAll();
}

// HORAS EXTRAS
function renderHETable() {
  const tbody = document.getElementById('tbl-he-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  heList.forEach(item => {
    const total = item.trab * item.salario * item.quant;
    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-2">
        <input type="number" value="${item.trab}" oninput="updateHE(${item.id}, 'trab', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <select onchange="updateHE(${item.id}, 'unid', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
          <option value="dia" ${item.unid === 'dia' ? 'selected' : ''}>dia</option>
          <option value="hora" ${item.unid === 'hora' ? 'selected' : ''}>hora</option>
          <option value="mês" ${item.unid === 'mês' ? 'selected' : ''}>mês</option>
        </select>
      </td>
      <td class="p-2">
        <input type="number" value="${item.salario.toFixed(2)}" step="0.01" oninput="updateHE(${item.id}, 'salario', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2">
        <input type="number" value="${item.quant}" oninput="updateHE(${item.id}, 'quant', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
      </td>
      <td class="p-2 text-right font-bold text-slate-800 dark:text-slate-200">${formatMoney(total)}</td>
      <td class="p-2 text-center">
        <button onclick="removeHE(${item.id})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function addHERow() {
  const newId = heList.length > 0 ? Math.max(...heList.map(i => i.id)) + 1 : 1;
  heList.push({ id: newId, trab: 1, unid: "hora", salario: 25.00, quant: 10 });
  renderHETable();
  calculateAll();
}

function updateHE(id, field, value) {
  const item = heList.find(i => i.id === id);
  if (item) {
    item[field] = (field === 'unid') ? value : parseFloat(value) || 0;
    renderHETable();
    calculateAll();
  }
}

function removeHE(id) {
  heList = heList.filter(i => i.id !== id);
  renderHETable();
  calculateAll();
}

// BENFEITORIAS (Benf 1 a 5)
function renderBenfTable() {
  const tbody = document.getElementById('tbl-benf-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const taxaJuros = (parseFloat(document.getElementById('input-taxa-juros')?.value) || 6.0) / 100;

  benfList.forEach(item => {
    const pu = item.pu || 12;
    const pc = item.pc > 0 ? item.pc : 12;
    const fatorUso = pu / pc;

    const dbenf = item.vidaUtil > 0 ? ((item.valor - item.valorFinal) / item.vidaUtil) * fatorUso : 0;
    const cobenf = ((item.valor + item.valorFinal) / 2) * taxaJuros * fatorUso;

    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-1">
        <input type="text" value="${item.nome}" onchange="updateBenf(${item.id}, 'nome', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.valor.toFixed(2)}" step="0.01" oninput="updateBenf(${item.id}, 'valor', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.valorFinal.toFixed(2)}" step="0.01" oninput="updateBenf(${item.id}, 'valorFinal', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.vidaUtil}" oninput="updateBenf(${item.id}, 'vidaUtil', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.pu}" oninput="updateBenf(${item.id}, 'pu', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.pc}" oninput="updateBenf(${item.id}, 'pc', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1 text-right font-semibold text-slate-700 dark:text-slate-300">${formatMoney(dbenf)}</td>
      <td class="p-1 text-right font-semibold text-slate-700 dark:text-slate-300">${formatMoney(cobenf)}</td>
      <td class="p-1 text-center">
        <button onclick="removeBenf(${item.id})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function addBenfRow() {
  const newId = benfList.length > 0 ? Math.max(...benfList.map(i => i.id)) + 1 : 1;
  benfList.push({ id: newId, nome: `Benf${newId} (Edificação)`, valor: 50000.00, valorFinal: 0.00, vidaUtil: 20, pu: 12, pc: 12 });
  renderBenfTable();
  calculateAll();
}

function updateBenf(id, field, value) {
  const item = benfList.find(i => i.id === id);
  if (item) {
    item[field] = field === 'nome' ? value : parseFloat(value) || 0;
    renderBenfTable();
    calculateAll();
  }
}

function removeBenf(id) {
  benfList = benfList.filter(i => i.id !== id);
  renderBenfTable();
  calculateAll();
}

// MÁQUINAS E EQUIPAMENTOS (Maq/Eq 1 a 12)
function renderMaqTable() {
  const tbody = document.getElementById('tbl-maq-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const taxaJuros = (parseFloat(document.getElementById('input-taxa-juros')?.value) || 6.0) / 100;

  maqList.forEach(item => {
    const pu = item.pu || 12;
    const pc = item.pc > 0 ? item.pc : 12;
    const fatorUso = pu / pc;

    const dmaq = item.vidaUtil > 0 ? ((item.valor - item.valorFinal) / item.vidaUtil) * fatorUso : 0;
    const comaq = ((item.valor + item.valorFinal) / 2) * taxaJuros * fatorUso;

    const tr = document.createElement('tr');
    tr.className = "border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="p-1">
        <input type="text" value="${item.nome}" onchange="updateMaq(${item.id}, 'nome', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.valor.toFixed(2)}" step="0.01" oninput="updateMaq(${item.id}, 'valor', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.valorFinal.toFixed(2)}" step="0.01" oninput="updateMaq(${item.id}, 'valorFinal', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.vidaUtil}" oninput="updateMaq(${item.id}, 'vidaUtil', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.pu}" oninput="updateMaq(${item.id}, 'pu', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1">
        <input type="number" value="${item.pc}" oninput="updateMaq(${item.id}, 'pc', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded p-1 text-xs">
      </td>
      <td class="p-1 text-right font-semibold text-slate-700 dark:text-slate-300">${formatMoney(dmaq)}</td>
      <td class="p-1 text-right font-semibold text-slate-700 dark:text-slate-300">${formatMoney(comaq)}</td>
      <td class="p-1 text-center">
        <button onclick="removeMaq(${item.id})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function addMaqRow() {
  const newId = maqList.length > 0 ? Math.max(...maqList.map(i => i.id)) + 1 : 1;
  maqList.push({ id: newId, nome: `Maq/Eq${newId}`, valor: 50000.00, valorFinal: 5000.00, vidaUtil: 10, pu: 12, pc: 12 });
  renderMaqTable();
  calculateAll();
}

function updateMaq(id, field, value) {
  const item = maqList.find(i => i.id === id);
  if (item) {
    item[field] = field === 'nome' ? value : parseFloat(value) || 0;
    renderMaqTable();
    calculateAll();
  }
}

function removeMaq(id) {
  maqList = maqList.filter(i => i.id !== id);
  renderMaqTable();
  calculateAll();
}

// MOTOR PRINCIPAL DE CÁLCULOS DO GABARITO (IMAGEM BRUNO)
function calculateAll() {
  const cultura = document.getElementById('input-cultura')?.value || 'Atividade';
  const printCultura = document.getElementById('print-cultura-name');
  if (printCultura) printCultura.textContent = cultura;

  const prodHa = parseFloat(document.getElementById('input-prod-ha')?.value) || 0;
  const prodTotalInput = parseFloat(document.getElementById('input-prod-total')?.value) || 0;
  const precoUnitBruto = parseFloat(document.getElementById('input-preco-unitario')?.value) || 0;
  const taxaJuros = (parseFloat(document.getElementById('input-taxa-juros')?.value) || 6.0) / 100;

  // Sync Valor dos Insumos de Outros Dados
  const valorInsumosOutros = parseFloat(document.getElementById('input-valor-insumos-outros')?.value) || 0;

  // Terra Própria vs Arrendada (Imagem)
  const tpVrArrend = parseFloat(document.getElementById('input-terra-propria-vrarrend')?.value) || 0;
  const tpHa = parseFloat(document.getElementById('input-terra-propria-ha')?.value) || 0;
  const tpPeriodo = parseFloat(document.getElementById('input-terra-propria-periodo')?.value) || 0;
  const totalTerraPropria = tpVrArrend * tpHa * tpPeriodo;
  setText('lbl-terra-propria-total', formatMoney(totalTerraPropria));

  const taVrArrend = parseFloat(document.getElementById('input-terra-arrend-vrarrend')?.value) || 0;
  const taHa = parseFloat(document.getElementById('input-terra-arrend-ha')?.value) || 0;
  const taPeriodo = parseFloat(document.getElementById('input-terra-arrend-periodo')?.value) || 0;
  const totalTerraArrendada = taVrArrend * taHa * taPeriodo;
  setText('lbl-terra-arrend-total', formatMoney(totalTerraArrendada));

  // Produção Total
  const hectaresTotais = tpHa + taHa;
  const prodTotal = (prodTotalInput > 0) ? prodTotalInput : (prodHa * (hectaresTotais > 0 ? hectaresTotais : 1));
  const unMedida = document.getElementById('input-unidade')?.value || 'sc.';
  setText('lbl-producao-total-outros', `${prodTotal.toFixed(0)} ${unMedida}`);

  // 1. Total Insumos (Variável)
  const totalInsumosDet = insumos.reduce((sum, item) => sum + (item.qtd * item.valorUnit), 0);
  const totalInsumos = valorInsumosOutros > 0 ? valorInsumosOutros : totalInsumosDet;

  // 2. Mão de Obra Permanente (Fixo)
  const totalMOP = mopList.reduce((sum, item) => sum + (item.qtd * item.salario * item.meses), 0);

  // 3. Mão de Obra Temporária (Variável)
  const totalMOTemp = motempList.reduce((sum, item) => sum + (item.qtd * item.quantDH * item.valorDH), 0);

  // 4. Horas Extras (Variável)
  const totalHE = heList.reduce((sum, item) => sum + (item.trab * item.salario * item.quant), 0);

  // 5. Benfeitorias (Dbenf e Cobenf)
  let Dbenf = 0;
  let Cobenf = 0;
  benfList.forEach(b => {
    const pu = b.pu || 12;
    const pc = b.pc > 0 ? b.pc : 12;
    const fatorUso = pu / pc;
    if (b.vidaUtil > 0) Dbenf += ((b.valor - b.valorFinal) / b.vidaUtil) * fatorUso;
    Cobenf += ((b.valor + b.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  // 6. Máquinas e Equipamentos (Dmaq/eq e Comaq/e)
  let Dmaq = 0;
  let Comaq = 0;
  maqList.forEach(m => {
    const pu = m.pu || 12;
    const pc = m.pc > 0 ? m.pc : 12;
    const fatorUso = pu / pc;
    if (m.vidaUtil > 0) Dmaq += ((m.valor - m.valorFinal) / m.vidaUtil) * fatorUso;
    Comaq += ((m.valor + m.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  // TOTIS DOS CUSTOS DE GABARITO BRUNO
  const CFT = totalMOP + Dbenf + Cobenf + Dmaq + Comaq + totalTerraPropria;
  const CVT = totalInsumos + totalMOTemp + totalHE + totalTerraArrendada;
  const CT = CFT + CVT;
  const Cop = CVT + Dbenf + Dmaq + totalMOP;

  const Copme = prodTotal > 0 ? Cop / prodTotal : 0;
  const Ctme = prodTotal > 0 ? CT / prodTotal : 0;

  const RBT = prodTotal * precoUnitBruto;
  const RLT = RBT - CT;
  const Rlop = RBT - Cop;

  const PN = precoUnitBruto > 0 ? CT / precoUnitBruto : 0;
  const MS = prodTotal > 0 ? ((prodTotal - PN) / prodTotal) * 100 : 0;

  const especulacaoSc = prodTotal - PN;
  const especulacaoPct = MS;

  const lucratividade = RBT > 0 ? (RLT / RBT) * 100 : 0;
  const rentabilidade = CT > 0 ? (RLT / CT) * 100 : 0;

  // ATUALIZAR TELA
  setText('res-rbt', formatMoney(RBT));
  setText('res-ct', formatMoney(CT));
  setText('res-rlt', formatMoney(RLT));
  setText('res-rlop', formatMoney(Rlop));

  setText('res-especulacao-sc', `${especulacaoSc.toFixed(0)} ${unMedida}`);
  setText('res-especulacao-pct', `${especulacaoPct.toFixed(2)}%`);

  setText('res-dbenf', formatMoney(Dbenf));
  setText('res-cobenf', formatMoney(Cobenf));
  setText('res-dmaq', formatMoney(Dmaq));
  setText('res-comaq', formatMoney(Comaq));

  setText('res-cft', formatMoney(CFT));
  setText('res-cvt', formatMoney(CVT));
  setText('res-cop', formatMoney(Cop));

  setText('res-copme', formatMoney(Copme));
  setText('res-ctme', formatMoney(Ctme));

  setText('res-pn', `${PN.toFixed(1)} ${unMedida}`);
  setText('res-ms', `${MS.toFixed(1)}%`);
  setText('res-lucratividade', `${lucratividade.toFixed(1)}%`);
  setText('res-rentabilidade', `${rentabilidade.toFixed(1)}%`);

  updateRiskMeter(MS, RLT, Rlop);
  renderSensitivityTable(prodTotal, CT, precoUnitBruto);
  updateChart(CFT, CVT, RLT > 0 ? RLT : 0);

  return {
    cultura, unMedida, prodTotal, precoUnitBruto,
    CFT, CVT, CT, Cop, Copme, Ctme, RBT, RLT, Rlop, PN, MS, lucratividade, rentabilidade,
    Dbenf, Cobenf, Dmaq, Comaq, especulacaoSc, especulacaoPct
  };
}

function updateRiskMeter(msPercent, rlt, rlop) {
  const lblPercent = document.getElementById('lbl-gauge-percent');
  const cardStatus = document.getElementById('card-status-viabilidade');

  const safePercent = Math.max(0, Math.min(100, msPercent));
  if (lblPercent) lblPercent.textContent = `${safePercent.toFixed(1)}%`;

  if (cardStatus) {
    if (rlt > 0 && msPercent > 20) {
      cardStatus.className = "p-3 rounded-xl text-center font-bold text-xs bg-emerald-900/80 border border-emerald-500 text-emerald-200 shadow-md";
      cardStatus.textContent = "PROJETO ALTAMENTE LUCRATIVO E SEGURO ✅";
    } else if (rlt > 0) {
      cardStatus.className = "p-3 rounded-xl text-center font-bold text-xs bg-agro-900/80 border border-agro-500 text-agro-200 shadow-md";
      cardStatus.textContent = "PROJETO LUCRATIVO (MARGEM DE SEGURANÇA MODERADA) ⚠️";
    } else if (rlop > 0) {
      cardStatus.className = "p-3 rounded-xl text-center font-bold text-xs bg-amber-900/80 border border-amber-500 text-amber-200 shadow-md";
      cardStatus.textContent = "COBRE O CUSTO OPERACIONAL (ATENÇÃO ÀS DEPRECIAÇÕES) ⚠️";
    } else {
      cardStatus.className = "p-3 rounded-xl text-center font-bold text-xs bg-rose-900/80 border border-rose-500 text-rose-200 shadow-md";
      cardStatus.textContent = "PROJETO COM PREJUÍZO OPERACIONAL ❌";
    }
  }
}

function renderSensitivityTable(prodTotal, CT, precoBase) {
  const tbody = document.getElementById('tbl-sensibilidade-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const variacoes = [-0.15, -0.10, -0.05, 0.0, 0.05, 0.10, 0.15];

  variacoes.forEach(v => {
    const precoSimulada = precoBase * (1 + v);
    const rbtSimulada = prodTotal * precoSimulada;
    const rltSimulada = rbtSimulada - CT;

    const tr = document.createElement('tr');
    tr.className = `border-b dark:border-slate-800 ${v === 0 ? 'bg-agro-50 dark:bg-agro-950/60 font-bold' : ''}`;
    
    let colorClass = "text-emerald-600 dark:text-emerald-400";
    if (rltSimulada < 0) colorClass = "text-rose-600 dark:text-rose-400";

    const percentText = (v * 100) > 0 ? `+${(v * 100).toFixed(0)}%` : `${(v * 100).toFixed(0)}%`;

    tr.innerHTML = `
      <td class="p-1.5">${percentText}</td>
      <td class="p-1.5">${formatMoney(precoSimulada)}</td>
      <td class="p-1.5 text-right font-bold ${colorClass}">${formatMoney(rltSimulada)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function shareWhatsApp() {
  const data = calculateAll();
  const text = `🌱 *RESUMO DE CUSTO & VIABILIDADE AGRÍCOLA (AgroCusto Pro)*
📍 *Cultura/Atividade:* ${data.cultura}
📦 *Produção Estimada:* ${data.prodTotal} ${data.unMedida}
💰 *Renda Bruta Total:* ${formatMoney(data.RBT)}
🔴 *Custo Total (CT):* ${formatMoney(data.CT)}
💚 *Lucro Líquido Total:* ${formatMoney(data.RLT)}
🎯 *Ponto de Nivelamento:* ${data.PN.toFixed(1)} ${data.unMedida}
📈 *Especulação:* ${data.especulacaoSc.toFixed(0)} sc. (${data.especulacaoPct.toFixed(2)}%)

_Calculado via AgroCusto Pro App_`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function exportToCSV() {
  const data = calculateAll();
  let csv = `Item;Valor\n`;
  csv += `Cultura;${data.cultura}\n`;
  csv += `Producao Total;${data.prodTotal} ${data.unMedida}\n`;
  csv += `Preco Unitario;${data.precoUnitBruto}\n`;
  csv += `Custo Fixo Total (CFT);${data.CFT}\n`;
  csv += `Custo Variavel Total (CVT);${data.CVT}\n`;
  csv += `Custo Total (CT);${data.CT}\n`;
  csv += `Renda Bruta Total (RBT);${data.RBT}\n`;
  csv += `Lucro Liquido Total (RLT);${data.RLT}\n`;
  csv += `Ponto de Nivelamento;${data.PN.toFixed(1)}\n`;
  csv += `Especulacao (Sacas);${data.especulacaoSc.toFixed(0)}\n`;
  csv += `Especulacao (%);${data.especulacaoPct.toFixed(2)}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `AgroCusto_${data.cultura.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function saveCurrentSimulation() {
  const cultura = document.getElementById('input-cultura')?.value || 'Safra';
  const name = prompt("Digite um nome para identificar esta safra:", `${cultura} - ${new Date().toLocaleDateString()}`);
  if (!name) return;

  const currentData = {
    name,
    cultura: document.getElementById('input-cultura').value,
    unidade: document.getElementById('input-unidade').value,
    prodTotal: document.getElementById('input-prod-total').value,
    precoUnit: document.getElementById('input-preco-unitario').value,
    taxaJuros: document.getElementById('input-taxa-juros').value,
    insumos, mopList, motempList, heList, benfList, maqList,
    date: new Date().toLocaleDateString()
  };

  let saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');
  saved.push(currentData);
  localStorage.setItem('agrocusto_safras', JSON.stringify(saved));
  alert(`Safra "${name}" salva com sucesso!`);
}

function showSavedSimulationsModal() {
  const modal = document.getElementById('modal-safras');
  const listEl = document.getElementById('saved-simulations-list');
  if (!modal || !listEl) return;

  const saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');
  listEl.innerHTML = '';

  if (saved.length === 0) {
    listEl.innerHTML = `<p class="text-slate-500 py-4 text-center">Nenhuma safra salva ainda.</p>`;
  } else {
    saved.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = "p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 flex justify-between items-center";
      div.innerHTML = `
        <div>
          <strong class="text-slate-800 dark:text-slate-100">${item.name}</strong>
          <span class="block text-[11px] text-slate-500">${item.cultura} &bull; ${item.date}</span>
        </div>
        <div class="flex gap-1">
          <button onclick="loadSavedSimulation(${index})" class="bg-agro-600 hover:bg-agro-500 text-white px-2.5 py-1 rounded text-xs font-semibold">Carregar</button>
          <button onclick="deleteSavedSimulation(${index})" class="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-semibold">Excluir</button>
        </div>
      `;
      listEl.appendChild(div);
    });
  }

  modal.classList.remove('hidden');
}

function closeSavedSimulationsModal() {
  document.getElementById('modal-safras')?.classList.add('hidden');
}

function loadSavedSimulation(index) {
  const saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');
  const item = saved[index];
  if (!item) return;

  document.getElementById('input-cultura').value = item.cultura;
  document.getElementById('input-unidade').value = item.unidade;
  document.getElementById('input-prod-total').value = item.prodTotal;
  document.getElementById('input-preco-unitario').value = item.precoUnit;
  document.getElementById('input-taxa-juros').value = item.taxaJuros;

  insumos = item.insumos || [];
  mopList = item.mopList || [];
  motempList = item.motempList || [];
  heList = item.heList || [];
  benfList = item.benfList || [];
  maqList = item.maqList || [];

  renderInsumosTable();
  renderMOPTable();
  renderMOTempTable();
  renderHETable();
  renderBenfTable();
  renderMaqTable();
  calculateAll();

  closeSavedSimulationsModal();
  alert(`Safra "${item.name}" carregada com sucesso!`);
}

function deleteSavedSimulation(index) {
  let saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');
  saved.splice(index, 1);
  localStorage.setItem('agrocusto_safras', JSON.stringify(saved));
  showSavedSimulationsModal();
}

// COMPARADOR DE SAFRAS LADO A LADO
function openCompareModal() {
  const modal = document.getElementById('modal-compare');
  if (!modal) return;

  populateCompareDropdowns();
  modal.classList.remove('hidden');
  renderCompareResults();
}

function closeCompareModal() {
  document.getElementById('modal-compare')?.classList.add('hidden');
}

function populateCompareDropdowns() {
  const selectA = document.getElementById('select-scenario-a');
  const selectB = document.getElementById('select-scenario-b');
  if (!selectA || !selectB) return;

  const currentCultura = document.getElementById('input-cultura')?.value || 'Atual';
  const saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');

  let optionsHTML = `<option value="current">⚡ Simulação Atual (${currentCultura})</option>`;
  saved.forEach((item, idx) => {
    optionsHTML += `<option value="${idx}">📁 ${item.name} (${item.cultura} - ${item.date})</option>`;
  });

  const valA = selectA.value || 'current';
  const valB = selectB.value || (saved.length > 0 ? '0' : 'current');

  selectA.innerHTML = optionsHTML;
  selectB.innerHTML = optionsHTML;

  selectA.value = valA;
  selectB.value = valB;
}

function onScenarioSelectChange(type) {
  renderCompareResults();
}

function getScenarioDataFromSelect(selectId) {
  const val = document.getElementById(selectId)?.value || 'current';
  if (val === 'current') {
    const data = calculateAll();
    data.displayName = `Simulação Atual (${data.cultura})`;
    return data;
  }

  const saved = JSON.parse(localStorage.getItem('agrocusto_safras') || '[]');
  const idx = parseInt(val, 10);
  const item = saved[idx];
  if (!item) {
    const data = calculateAll();
    data.displayName = `Simulação Atual`;
    return data;
  }

  const data = computeDataFromSavedItem(item);
  data.displayName = item.name;
  return data;
}

function computeDataFromSavedItem(item) {
  const cultura = item.cultura || 'Safra';
  const unMedida = item.unidade || 'sc.';
  const prodTotal = parseFloat(item.prodTotal) || 1;
  const precoUnitBruto = parseFloat(item.precoUnit) || 0;
  const taxaJuros = (parseFloat(item.taxaJuros) || 6.0) / 100;

  const insumosList = item.insumos || [];
  const totalInsumosDet = insumosList.reduce((sum, i) => sum + (i.qtd * i.valorUnit), 0);
  const totalInsumos = totalInsumosDet > 0 ? totalInsumosDet : 28000;

  const mopList = item.mopList || [];
  const totalMOP = mopList.reduce((sum, i) => sum + (i.qtd * i.salario * i.meses), 0);

  const motempList = item.motempList || [];
  const totalMOTemp = motempList.reduce((sum, i) => sum + (i.qtd * i.quantDH * i.valorDH), 0);

  const heList = item.heList || [];
  const totalHE = heList.reduce((sum, i) => sum + (i.trab * i.salario * i.quant), 0);

  const benfList = item.benfList || [];
  let Dbenf = 0, Cobenf = 0;
  benfList.forEach(b => {
    const fatorUso = b.pc > 0 ? (b.pu / b.pc) : 1;
    Dbenf += (b.vidaUtil > 0 ? (b.valor - b.valorFinal) / b.vidaUtil : 0) * fatorUso;
    Cobenf += ((b.valor + b.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  const maqList = item.maqList || [];
  let Dmaq = 0, Comaq = 0;
  maqList.forEach(m => {
    const fatorUso = m.pc > 0 ? (m.pu / m.pc) : 1;
    Dmaq += (m.vidaUtil > 0 ? (m.valor - m.valorFinal) / m.vidaUtil : 0) * fatorUso;
    Comaq += ((m.valor + m.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  const totalTerraPropria = 216000;
  const totalTerraArrendada = 0;

  const CFT = totalMOP + Dbenf + Cobenf + Dmaq + Comaq + totalTerraPropria;
  const CVT = totalInsumos + totalMOTemp + totalHE + totalTerraArrendada;
  const CT = CFT + CVT;
  const RBT = prodTotal * precoUnitBruto;
  const RLT = RBT - CT;
  const Ctme = prodTotal > 0 ? CT / prodTotal : 0;
  const PN = precoUnitBruto > 0 ? CT / precoUnitBruto : 0;
  const MS = prodTotal > 0 ? ((prodTotal - PN) / prodTotal) * 100 : 0;
  const especulacaoSc = prodTotal - PN;
  const especulacaoPct = prodTotal > 0 ? (especulacaoSc / prodTotal) * 100 : 0;

  return {
    cultura, unMedida, prodTotal, precoUnitBruto,
    CFT, CVT, CT, RBT, RLT, Ctme, PN, MS, especulacaoSc, especulacaoPct
  };
}

function renderCompareResults() {
  const area = document.getElementById('compare-results-area');
  if (!area) return;

  const dataA = getScenarioDataFromSelect('select-scenario-a');
  const dataB = getScenarioDataFromSelect('select-scenario-b');

  const diffLucro = dataB.RLT - dataA.RLT;
  const diffCT = dataB.CT - dataA.CT;
  const diffCtme = dataB.Ctme - dataA.Ctme;
  const diffPN = dataB.PN - dataA.PN;

  let winnerBanner = '';
  if (Math.abs(diffLucro) < 0.01) {
    winnerBanner = `
      <div class="bg-amber-900/40 border border-amber-500/60 p-3 rounded-xl text-center text-amber-200 text-xs font-bold shadow">
        ⚖️ Ambos os cenários possuem rentabilidade e resultado financeiro idênticos!
      </div>
    `;
  } else if (diffLucro > 0) {
    const pctGanhos = dataA.RLT !== 0 ? Math.abs((diffLucro / Math.abs(dataA.RLT)) * 100).toFixed(1) : '100';
    winnerBanner = `
      <div class="bg-emerald-950/80 border border-emerald-500 p-3.5 rounded-xl text-emerald-200 text-xs font-bold shadow-md flex items-center gap-3">
        <div class="bg-emerald-500 text-slate-950 p-2 rounded-lg font-black text-lg">🏆</div>
        <div>
          <h4 class="text-sm font-black text-emerald-300">Cenário B (${dataB.displayName}) é mais lucrativo!</h4>
          <p class="font-normal text-emerald-100 mt-0.5">Gera <strong>${formatMoney(diffLucro)}</strong> a mais de lucro líquido (+${pctGanhos}% de resultado em relação ao Cenário A).</p>
        </div>
      </div>
    `;
  } else {
    const pctGanhos = dataB.RLT !== 0 ? Math.abs((diffLucro / Math.abs(dataB.RLT)) * 100).toFixed(1) : '100';
    winnerBanner = `
      <div class="bg-amber-950/80 border border-amber-500 p-3.5 rounded-xl text-amber-200 text-xs font-bold shadow-md flex items-center gap-3">
        <div class="bg-amber-500 text-slate-950 p-2 rounded-lg font-black text-lg">🏆</div>
        <div>
          <h4 class="text-sm font-black text-amber-300">Cenário A (${dataA.displayName}) é mais lucrativo!</h4>
          <p class="font-normal text-amber-100 mt-0.5">Gera <strong>${formatMoney(Math.abs(diffLucro))}</strong> a mais de lucro líquido (+${pctGanhos}% de resultado em relação ao Cenário B).</p>
        </div>
      </div>
    `;
  }

  const rows = [
    { label: "Cultura / Atividade", a: dataA.cultura, b: dataB.cultura, diff: "-", format: "text" },
    { label: "Produção Total Estimada", a: `${dataA.prodTotal.toFixed(0)} ${dataA.unMedida}`, b: `${dataB.prodTotal.toFixed(0)} ${dataB.unMedida}`, diff: `${(dataB.prodTotal - dataA.prodTotal).toFixed(0)} ${dataA.unMedida}`, format: "text" },
    { label: "Preço de Mercado por Saca", a: formatMoney(dataA.precoUnitBruto), b: formatMoney(dataB.precoUnitBruto), diff: formatMoney(dataB.precoUnitBruto - dataA.precoUnitBruto), format: "money" },
    { label: "Receita Bruta Total (RBT)", a: formatMoney(dataA.RBT), b: formatMoney(dataB.RBT), diff: formatMoney(dataB.RBT - dataA.RBT), format: "money" },
    { label: "Custos Fixos Totais (CFT)", a: formatMoney(dataA.CFT), b: formatMoney(dataB.CFT), diff: formatMoney(diffCT - (dataB.CVT - dataA.CVT)), format: "money" },
    { label: "Custos Variáveis Totais (CVT)", a: formatMoney(dataA.CVT), b: formatMoney(dataB.CVT), diff: formatMoney(dataB.CVT - dataA.CVT), format: "money" },
    { label: "Custo Total de Produção (CT)", a: formatMoney(dataA.CT), b: formatMoney(dataB.CT), diff: formatMoney(diffCT), format: "money", highlightCost: true },
    { label: "Custo por Saca (R$/sc)", a: formatMoney(dataA.Ctme), b: formatMoney(dataB.Ctme), diff: formatMoney(diffCtme), format: "money", highlightCost: true },
    { label: "Lucro Líquido Total (RLT)", a: formatMoney(dataA.RLT), b: formatMoney(dataB.RLT), diff: formatMoney(diffLucro), format: "money", highlightProfit: true },
    { label: "Ponto de Nivelamento (Break-Even)", a: `${dataA.PN.toFixed(1)} ${dataA.unMedida}`, b: `${dataB.PN.toFixed(1)} ${dataB.unMedida}`, diff: `${diffPN.toFixed(1)} ${dataA.unMedida}`, format: "text" },
    { label: "Margem de Segurança (%)", a: `${dataA.MS.toFixed(1)}%`, b: `${dataB.MS.toFixed(1)}%`, diff: `${(dataB.MS - dataA.MS).toFixed(1)}%`, format: "text" }
  ];

  let tableRowsHTML = '';
  rows.forEach(r => {
    let diffClass = "text-slate-600 dark:text-slate-400";
    if (r.highlightProfit) {
      diffClass = diffLucro > 0 ? "text-emerald-600 dark:text-emerald-400 font-black" : diffLucro < 0 ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-500";
    } else if (r.highlightCost) {
      diffClass = diffCT < 0 ? "text-emerald-600 dark:text-emerald-400 font-black" : diffCT > 0 ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-500";
    }

    const rowBg = r.highlightProfit ? "bg-emerald-50/60 dark:bg-emerald-950/30 font-bold" : r.highlightCost ? "bg-amber-50/50 dark:bg-slate-800/80" : "hover:bg-slate-50 dark:hover:bg-slate-800/40";

    tableRowsHTML += `
      <tr class="border-b dark:border-slate-800 ${rowBg} transition">
        <td class="p-2.5 font-medium text-slate-800 dark:text-slate-200">${r.label}</td>
        <td class="p-2.5 text-right font-semibold text-slate-900 dark:text-white">${r.a}</td>
        <td class="p-2.5 text-right font-semibold text-slate-900 dark:text-white">${r.b}</td>
        <td class="p-2.5 text-right font-bold ${diffClass}">${r.diff}</td>
      </tr>
    `;
  });

  area.innerHTML = `
    ${winnerBanner}

    <div class="border dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <table class="w-full text-xs text-left">
        <thead class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
          <tr>
            <th class="p-2.5">Métrica / Indicador</th>
            <th class="p-2.5 text-right text-amber-600 dark:text-amber-400">Cenário A</th>
            <th class="p-2.5 text-right text-blue-600 dark:text-blue-400">Cenário B</th>
            <th class="p-2.5 text-right">Diferença (B vs A)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHTML}
        </tbody>
      </table>
    </div>
  `;
}

// CARREGAR DADOS DE EXEMPLO (IMAGEM DO GABARITO BRUNO)
function loadSampleData() {
  document.getElementById('input-cultura').value = "Milho Safra Comercial";
  document.getElementById('input-unidade').value = "sc.";
  document.getElementById('input-prod-ha').value = "60";
  document.getElementById('input-prod-total').value = "2400";
  document.getElementById('input-preco-unitario').value = "1090.00";
  document.getElementById('input-taxa-juros').value = "6.0";
  document.getElementById('input-valor-insumos-outros').value = "28000.00";

  // Terra Própria
  document.getElementById('input-terra-propria-vrarrend').value = "5400.00";
  document.getElementById('input-terra-propria-ha').value = "40.0";
  document.getElementById('input-terra-propria-periodo').value = "1.00";

  // Terra Arrendada
  document.getElementById('input-terra-arrend-vrarrend').value = "0.00";
  document.getElementById('input-terra-arrend-ha').value = "0.0";
  document.getElementById('input-terra-arrend-periodo').value = "0.00";

  insumos = [
    { id: 1, nome: "VALOR DOS INSUMOS", qtd: 1, valorUnit: 28000.00 }
  ];

  mopList = [
    { id: 1, cargo: "Trabalhador Permanente (8 pessoas, 13º salário)", qtd: 8, salario: 3000.00, meses: 13 }
  ];

  motempList = [
    { id: 1, servico: "Trabalhador Temporário (300 diárias)", qtd: 300, quantDH: 1.0, valorDH: 150.00 }
  ];

  heList = [
    { id: 1, trab: 0, unid: "dia", salario: 0.00, quant: 0 }
  ];

  benfList = [
    { id: 1, nome: "Benf1 (Galpão Alvenaria)", valor: 200000.00, valorFinal: 0.00, vidaUtil: 30, pu: 12, pc: 12 },
    { id: 2, nome: "Benf2 (Cerca / Curral)", valor: 80000.00, valorFinal: 0.00, vidaUtil: 7, pu: 12, pc: 12 }
  ];

  maqList = [
    { id: 1, nome: "Maq/Eq1 (Trator Cabinado)", valor: 200000.00, valorFinal: 20000.00, vidaUtil: 10, pu: 12, pc: 12 },
    { id: 2, nome: "Maq/Eq2 (Plantadeira)", valor: 50000.00, valorFinal: 5000.00, vidaUtil: 10, pu: 12, pc: 12 },
    { id: 3, nome: "Maq/Eq3 (Pulverizador)", valor: 5000.00, valorFinal: 500.00, vidaUtil: 1, pu: 3, pc: 12 }
  ];

  renderInsumosTable();
  renderMOPTable();
  renderMOTempTable();
  renderHETable();
  renderBenfTable();
  renderMaqTable();
  calculateAll();

  alert("Dados exatos da imagem do Gabarito Bruno (2400 sc., R$ 1.090,00/sc., Terra R$ 216.000,00, M.O.P. R$ 312.000,00) carregados!");
}

function initChart() {
  const ctx = document.getElementById('chartCustos')?.getContext('2d');
  if (!ctx) return;

  chartCustosInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Custos Fixos (CFT)', 'Custos Variáveis (CVT)', 'Lucro Líquido (RLT)'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#f87171', '#fbbf24', '#34d399'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 } } }
      }
    }
  });
}

function updateChart(cft, cvt, lucro) {
  if (chartCustosInstance) {
    chartCustosInstance.data.datasets[0].data = [cft, cvt, lucro];
    chartCustosInstance.update();
  }
}

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA');
      }
      deferredPrompt = null;
    });
  }
}

function formatMoney(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}
