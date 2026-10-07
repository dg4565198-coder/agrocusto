// AgroCusto Pro - Complete Logic with Benfeitorias, Máquinas, P.U. & P.C. (Gabarito Bruno)

let currentStep = 1;
let currentMode = 'wizard';
let deferredPrompt = null;
let chartCustosInstance = null;
let currentTheme = 'light';

let scenarioA = null;
let scenarioB = null;

// Lista de Insumos
let insumos = [
  { id: 1, nome: "Sementes e Mudas", qtd: 50, valorUnit: 350.00 },
  { id: 2, nome: "Adubos e Fertilizantes (NPK)", qtd: 150, valorUnit: 180.00 },
  { id: 3, nome: "Defensivos Agrícolas (Herbicidas/Fungicidas)", qtd: 80, valorUnit: 95.00 },
  { id: 4, nome: "Combustível e Lubrificantes (Óleo Diesel)", qtd: 1200, valorUnit: 6.20 }
];

// Lista de Mão de Obra Permanente (M.O.P.)
let mopList = [
  { id: 1, cargo: "Tratorista / Operador", qtd: 1, salario: 2800.00, meses: 12 },
  { id: 2, cargo: "Campeiro / Trabalhador Geral", qtd: 1, salario: 2100.00, meses: 12 }
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

  lucide.createIcons();
}

function addInsumoRow() {
  const newId = insumos.length > 0 ? Math.max(...insumos.map(i => i.id)) + 1 : 1;
  insumos.push({ id: newId, nome: "Novo Insumo", qtd: 10, valorUnit: 50.00 });
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
        <input type="number" value="${item.qtd}" oninput="updateMOP(${item.id}, 'qtd', this.value)" class="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 text-xs">
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
  mopList.push({ id: newId, cargo: "Novo Cargo", qtd: 1, salario: 2000.00, meses: 12 });
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

// MOTOR PRINCIPAL DE CÁLCULOS DO GABARITO
function calculateAll() {
  const cultura = document.getElementById('input-cultura')?.value || 'Atividade';
  const printCultura = document.getElementById('print-cultura-name');
  if (printCultura) printCultura.textContent = cultura;

  const prodTotal = parseFloat(document.getElementById('input-prod-total')?.value) || 0;
  const precoUnitBruto = parseFloat(document.getElementById('input-preco-unitario')?.value) || 0;
  const taxaJuros = (parseFloat(document.getElementById('input-taxa-juros')?.value) || 6.0) / 100;

  // Deduções e Impostos
  const deducaoFrete = parseFloat(document.getElementById('input-deducao-frete')?.value) || 0;
  const deducaoArmaz = parseFloat(document.getElementById('input-deducao-armazenagem')?.value) || 0;
  const deducaoFunruralPct = (parseFloat(document.getElementById('input-deducao-funrural')?.value) || 0) / 100;

  const precoUnitLiquido = (precoUnitBruto * (1 - deducaoFunruralPct)) - deducaoFrete - deducaoArmaz;

  // 1. Total Insumos (Variável)
  const totalInsumos = insumos.reduce((sum, item) => sum + (item.qtd * item.valorUnit), 0);

  // 2. Mão de Obra Permanente (Fixo)
  const totalMOP = mopList.reduce((sum, item) => sum + (item.qtd * item.salario * item.meses), 0);

  // 3. Mão de Obra Temporária (Variável)
  const moTempQtd = parseFloat(document.getElementById('input-mo-temp-qtd')?.value) || 0;
  const moTempDH = parseFloat(document.getElementById('input-mo-temp-dh')?.value) || 0;
  const moTempValor = parseFloat(document.getElementById('input-mo-temp-valor')?.value) || 0;
  const totalMOTemp = moTempQtd * moTempDH * moTempValor;

  // 4. Benfeitorias (Dbenf e Cobenf)
  let Dbenf = 0;
  let Cobenf = 0;
  benfList.forEach(b => {
    const pu = b.pu || 12;
    const pc = b.pc > 0 ? b.pc : 12;
    const fatorUso = pu / pc;
    if (b.vidaUtil > 0) Dbenf += ((b.valor - b.valorFinal) / b.vidaUtil) * fatorUso;
    Cobenf += ((b.valor + b.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  // 5. Máquinas e Equipamentos (Dmaq/eq e Comaq/e)
  let Dmaq = 0;
  let Comaq = 0;
  maqList.forEach(m => {
    const pu = m.pu || 12;
    const pc = m.pc > 0 ? m.pc : 12;
    const fatorUso = pu / pc;
    if (m.vidaUtil > 0) Dmaq += ((m.valor - m.valorFinal) / m.vidaUtil) * fatorUso;
    Comaq += ((m.valor + m.valorFinal) / 2) * taxaJuros * fatorUso;
  });

  // 6. Custo da Terra
  const terraHa = parseFloat(document.getElementById('input-terra-ha')?.value) || 0;
  const terraArrendValor = parseFloat(document.getElementById('input-terra-arrend-valor')?.value) || 0;
  const terraTipo = document.getElementById('input-terra-tipo')?.value || 'propria';

  let terraCustoFixo = 0;
  let terraCustoVariavel = 0;
  if (terraTipo === 'propria') {
    terraCustoFixo = terraHa * terraArrendValor;
  } else {
    terraCustoVariavel = terraHa * terraArrendValor;
  }

  // TOTIS DOS CUSTOS DE GABARITO BRUNO
  const CFT = totalMOP + Dbenf + Cobenf + Dmaq + Comaq + terraCustoFixo;
  const CVT = totalInsumos + totalMOTemp + terraCustoVariavel;
  const CT = CFT + CVT;
  const Cop = CVT + Dbenf + Dmaq + totalMOP;

  const Copme = prodTotal > 0 ? Cop / prodTotal : 0;
  const Ctme = prodTotal > 0 ? CT / prodTotal : 0;

  const RBT = prodTotal * precoUnitLiquido;
  const RLT = RBT - CT;
  const Rlop = RBT - Cop;

  const PN = precoUnitLiquido > 0 ? CT / precoUnitLiquido : 0;
  const MS = prodTotal > 0 ? ((prodTotal - PN) / prodTotal) * 100 : 0;

  const lucratividade = RBT > 0 ? (RLT / RBT) * 100 : 0;
  const rentabilidade = CT > 0 ? (RLT / CT) * 100 : 0;

  // ATUALIZAR TELA
  setText('res-rbt', formatMoney(RBT));
  setText('res-ct', formatMoney(CT));
  setText('res-rlt', formatMoney(RLT));
  setText('res-rlop', formatMoney(Rlop));

  setText('res-dbenf', formatMoney(Dbenf));
  setText('res-cobenf', formatMoney(Cobenf));
  setText('res-dmaq', formatMoney(Dmaq));
  setText('res-comaq', formatMoney(Comaq));

  setText('res-cft', formatMoney(CFT));
  setText('res-cvt', formatMoney(CVT));
  setText('res-cop', formatMoney(Cop));

  setText('res-copme', formatMoney(Copme));
  setText('res-ctme', formatMoney(Ctme));

  const unMedida = document.getElementById('input-unidade')?.value || 'unid';
  setText('res-pn', `${PN.toFixed(1)} ${unMedida}`);
  setText('res-ms', `${MS.toFixed(1)}%`);
  setText('res-lucratividade', `${lucratividade.toFixed(1)}%`);
  setText('res-rentabilidade', `${rentabilidade.toFixed(1)}%`);

  updateRiskMeter(MS, RLT, Rlop);
  renderSensitivityTable(prodTotal, CT, precoUnitLiquido);
  updateChart(CFT, CVT, RLT > 0 ? RLT : 0);

  return {
    cultura, unMedida, prodTotal, precoUnitBruto, precoUnitLiquido,
    CFT, CVT, CT, Cop, Copme, Ctme, RBT, RLT, Rlop, PN, MS, lucratividade, rentabilidade,
    Dbenf, Cobenf, Dmaq, Comaq
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
📊 *Lucratividade:* ${data.lucratividade.toFixed(1)}% | *Rentabilidade:* ${data.rentabilidade.toFixed(1)}%

_Calculado via AgroCusto Pro App_`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function exportToCSV() {
  const data = calculateAll();
  let csv = `Item;Valor\n`;
  csv += `Cultura;${data.cultura}\n`;
  csv += `Producao Total;${data.prodTotal} ${data.unMedida}\n`;
  csv += `Preco Unitario Bruto;${data.precoUnitBruto}\n`;
  csv += `Preco Unitario Liquido;${data.precoUnitLiquido}\n`;
  csv += `Depreciacao Benfeitorias (Dbenf);${data.Dbenf}\n`;
  csv += `Custo Oportunidade Benfeitorias (Cobenf);${data.Cobenf}\n`;
  csv += `Depreciacao Maquinas (Dmaq/eq);${data.Dmaq}\n`;
  csv += `Custo Oportunidade Maquinas (Comaq/e);${data.Comaq}\n`;
  csv += `Custo Fixo Total (CFT);${data.CFT}\n`;
  csv += `Custo Variavel Total (CVT);${data.CVT}\n`;
  csv += `Custo Total (CT);${data.CT}\n`;
  csv += `Renda Bruta Total (RBT);${data.RBT}\n`;
  csv += `Lucro Liquido Total (RLT);${data.RLT}\n`;
  csv += `Ponto de Nivelamento;${data.PN.toFixed(1)}\n`;
  csv += `Margem de Seguranca (%);${data.MS.toFixed(1)}\n`;

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
    periodo: document.getElementById('input-periodo-meses').value,
    taxaJuros: document.getElementById('input-taxa-juros').value,
    insumos, mopList, benfList, maqList,
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
  document.getElementById('input-periodo-meses').value = item.periodo;
  document.getElementById('input-taxa-juros').value = item.taxaJuros;

  insumos = item.insumos || [];
  mopList = item.mopList || [];
  benfList = item.benfList || [];
  maqList = item.maqList || [];

  renderInsumosTable();
  renderMOPTable();
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

function openCompareModal() {
  document.getElementById('modal-compare')?.classList.remove('hidden');
  renderCompareResults();
}

function closeCompareModal() {
  document.getElementById('modal-compare')?.classList.add('hidden');
}

function setScenario(type) {
  const data = calculateAll();
  if (type === 'A') scenarioA = data;
  else scenarioB = data;
  renderCompareResults();
}

function renderCompareResults() {
  const area = document.getElementById('compare-results-area');
  if (!area) return;

  let html = `
    <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700">
      <h4 class="font-bold text-amber-500 mb-2 border-b dark:border-slate-700 pb-1">Cenário A</h4>
      ${scenarioA ? `
        <p>Cultura: <strong>${scenarioA.cultura}</strong></p>
        <p>Custo Total: <strong>${formatMoney(scenarioA.CT)}</strong></p>
        <p>Lucro Líquido: <strong class="text-emerald-500">${formatMoney(scenarioA.RLT)}</strong></p>
        <p>Break-even: <strong>${scenarioA.PN.toFixed(1)} ${scenarioA.unMedida}</strong></p>
      ` : `<p class="text-slate-400">Nenhum cenário salvo em A.</p>`}
    </div>
    <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700">
      <h4 class="font-bold text-blue-500 mb-2 border-b dark:border-slate-700 pb-1">Cenário B</h4>
      ${scenarioB ? `
        <p>Cultura: <strong>${scenarioB.cultura}</strong></p>
        <p>Custo Total: <strong>${formatMoney(scenarioB.CT)}</strong></p>
        <p>Lucro Líquido: <strong class="text-emerald-500">${formatMoney(scenarioB.RLT)}</strong></p>
        <p>Break-even: <strong>${scenarioB.PN.toFixed(1)} ${scenarioB.unMedida}</strong></p>
      ` : `<p class="text-slate-400">Nenhum cenário salvo em B.</p>`}
    </div>
  `;

  if (scenarioA && scenarioB) {
    const diffLucro = scenarioB.RLT - scenarioA.RLT;
    const winner = diffLucro > 0 ? 'Cenário B' : 'Cenário A';
    html += `
      <div class="col-span-2 bg-agro-900/80 border border-agro-500 p-3 rounded-xl text-center text-agro-200 font-bold">
        🏆 O ${winner} é mais vantajoso (Diferença de ${formatMoney(Math.abs(diffLucro))} no lucro líquido)!
      </div>
    `;
  }

  area.innerHTML = html;
}

// CARREGAR DADOS DE EXEMPLO DO GABARITO BRUNO
function loadSampleData() {
  document.getElementById('input-cultura').value = "Milho Safra Comercial";
  document.getElementById('input-unidade').value = "Sacas (60kg)";
  document.getElementById('input-prod-total').value = "1200";
  document.getElementById('input-preco-unitario').value = "78.00";
  document.getElementById('input-periodo-meses').value = "12";
  document.getElementById('input-taxa-juros').value = "6.0";

  insumos = [
    { id: 1, nome: "Sementes Híbridas de Alta Produtividade", qtd: 60, valorUnit: 420.00 },
    { id: 2, nome: "Adubação NPK 08-28-16", qtd: 180, valorUnit: 210.00 },
    { id: 3, nome: "Adubação de Cobertura (Ureia)", qtd: 120, valorUnit: 165.00 },
    { id: 4, nome: "Herbicidas e Dessecantes", qtd: 70, valorUnit: 85.00 },
    { id: 5, nome: "Insecticidas e Fungicidas", qtd: 50, valorUnit: 110.00 }
  ];

  mopList = [
    { id: 1, cargo: "Tratorista Especializado", qtd: 1, salario: 3100.00, meses: 12 }
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
  renderBenfTable();
  renderMaqTable();
  calculateAll();

  alert("Dados de exemplo (Gabarito Bruno com Benfeitorias e Máquinas) carregados com sucesso!");
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
