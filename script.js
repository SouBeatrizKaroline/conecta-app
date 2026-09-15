let representanteCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  adicionarRepresentante();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

function scrollToForm() {
  const formSection = document.getElementById('formSection');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// 1. ADICIONA SÓCIOS / REPRESENTANTES
function adicionarRepresentante() {
  representanteCount++;
  const container = document.getElementById('representantes-container');
  if (!container) return;

  const card = document.createElement('div');
  card.id = `rep-card-${representanteCount}`;
  card.className = "bg-white p-4 rounded-lg border border-slate-300 relative space-y-3 shadow-sm text-slate-800";

  card.innerHTML = `
    <div class="flex justify-between items-center border-b border-slate-100 pb-2">
      <span class="text-xs font-bold text-azul-bic uppercase tracking-wider flex items-center gap-1">
        <i data-lucide="user-check" class="w-4 h-4"></i> Responsável Legal / Sócio #${representanteCount}
      </span>
      ${representanteCount > 1 ? `
        <button type="button" onclick="removerRepresentante(${representanteCount})" class="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Remover
        </button>
      ` : ''}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
        <input type="text" id="rep_nome_${representanteCount}" name="rep_nome_${representanteCount}" data-tipo="texto" placeholder="Nome do responsável" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-blue-900">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">CPF *</label>
        <input type="text" id="rep_cpf_${representanteCount}" name="rep_cpf_${representanteCount}" data-tipo="cpf" placeholder="000.000.000-00" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-blue-900">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Cargo *</label>
        <input type="text" id="rep_cargo_${representanteCount}" name="rep_cargo_${representanteCount}" data-tipo="texto" placeholder="Ex: Sócio-Administrador" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-blue-900">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
        <input type="email" id="rep_email_${representanteCount}" name="rep_email_${representanteCount}" data-tipo="email" placeholder="email@empresa.com.br" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-blue-900">
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-slate-700 mb-1">Telefone Direto *</label>
        <input type="text" id="rep_tel_${representanteCount}" name="rep_tel_${representanteCount}" data-tipo="telefone" placeholder="(00) 00000-0000" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-blue-900">
      </div>
    </div>
  `;

  container.appendChild(card);
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function removerRepresentante(id) {
  const card = document.getElementById(`rep-card-${id}`);
  if (card) {
    card.remove();
  }
}

// 2. BUSCA AUTOMÁTICA DE CNPJ VIA BRASILAPI
async function consultarCNPJ() {
  const cnpjInput = document.getElementById('cnpj');
  if (!cnpjInput) return;

  const cnpj = cnpjInput.value.replace(/\D/g, '');
  const loading = document.getElementById('cnpj-loading');

  if (cnpj.length !== 14) {
    alert('Por favor, digite um CNPJ válido com 14 dígitos numéricos.');
    cnpjInput.classList.add('border-2', 'border-rose-500', 'bg-rose-50');
    return;
  }

  if (loading) loading.classList.remove('hidden');

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) throw new Error('CNPJ não encontrado');

    const data = await response.json();

    document.getElementById('empresa-email').value = data.email || '';
    document.getElementById('empresa-telefone').value = data.ddd_telefone_1 || '';
    document.getElementById('endereco').value = `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`;

    if (data.opcao_pelo_simples) {
      document.getElementById('tributacao').value = 'simples';
    }

    cnpjInput.classList.remove('border-2', 'border-rose-500', 'bg-rose-50');
    cnpjInput.classList.add('border-2', 'border-emerald-500');

    alert(`Dados da empresa "${data.razao_social}" importados com sucesso!`);
  } catch (err) {
    alert('Não foi possível buscar os dados automaticamente. Preencha os campos abaixo.');
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

// 3. FUNÇÕES DE VALIDAÇÃO DE FORMATO (REGEX)
function validarFormatoCampo(input) {
  const valor = input.value.trim();
  const id = input.id;
  const tipo = input.getAttribute('data-tipo');

  if (id === 'cnpj') {
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros.length === 14;
  }

  if (id === 'empresa-email' || tipo === 'email') {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(valor);
  }

  if (id === 'empresa-telefone' || tipo === 'telefone') {
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
  }

  if (tipo === 'cpf') {
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  }

  return valor.length > 0;
}

// 4. TRAVA DE VALIDAÇÃO DO PASSO ATUAL
function validarPassoAtual(stepAtual) {
  const container = document.getElementById(`form-step-${stepAtual}`);
  if (!container) return true;

  const inputs = container.querySelectorAll('input:not([type="checkbox"]), select');
  let passoValido = true;
  let mensagensErro = [];

  inputs.forEach(input => {
    const ehValido = validarFormatoCampo(input);

    if (!ehValido) {
      passoValido = false;
      input.classList.add('border-2', 'border-rose-500', 'bg-rose-50');

      if (input.id === 'cnpj') mensagensErro.push('• CNPJ inválido (deve conter 14 dígitos).');
      else if (input.id === 'empresa-email' || input.getAttribute('data-tipo') === 'email') mensagensErro.push('• E-mail inválido (ex: nome@empresa.com.br).');
      else if (input.id === 'empresa-telefone' || input.getAttribute('data-tipo') === 'telefone') mensagensErro.push('• Telefone inválido (deve conter DDD + número).');
      else if (input.getAttribute('data-tipo') === 'cpf') mensagensErro.push('• CPF inválido (deve conter 11 dígitos).');
      else mensagensErro.push(`• O campo "${input.previousElementSibling?.innerText || 'obrigatório'}" precisa ser preenchido.`);
    } else {
      input.classList.remove('border-2', 'border-rose-500', 'bg-rose-50');
      input.classList.add('border-1', 'border-slate-300');
    }
  });

  if (!passoValido) {
    const errosUnicos = [...new Set(mensagensErro)];
    alert("⚠️ Corrija os erros destacados abaixo para avançar:\n\n" + errosUnicos.join("\n"));
    return false;
  }

  return true;
}

// 5. NAVEGAÇÃO ENTRE ETAPAS COM TRAVA RIGOROSA
function nextStep(stepDesejado) {
  const stepAtual = stepDesejado - 1;

  if (stepDesejado > stepAtual && stepAtual >= 1) {
    // Validação específica do Passo 3 (LGPD)
    if (stepAtual === 3) {
      const lgpdCheck = document.getElementById('lgpd-check');
      const lgpdWarning = document.getElementById('lgpd-warning');

      if (!lgpdCheck || !lgpdCheck.checked) {
        if (lgpdWarning) lgpdWarning.classList.remove('hidden');
        alert('⚠️ Você precisa aceitar os termos da LGPD para avançar!');
        return; // BLOQUEIA SE NÃO ACEITAR A LGPD
      }
    } else {
      const liberado = validarPassoAtual(stepAtual);
      if (!liberado) {
        return; // BLOQUEIA SE HOUVER CAMPOS EM BRANCO OU INCORRETOS
      }
    }
  }

  for (let i = 1; i <= 4; i++) {
    const block = document.getElementById(`form-step-${i}`);
    if (block) block.classList.add('hidden');

    const node = document.getElementById(`step-node-${i}`);
    const icon = document.getElementById(`step-icon-${i}`);
    const status = document.getElementById(`step-status-${i}`);

    if (node && icon && status) {
      if (i < stepDesejado) {
        node.classList.remove('opacity-60');
        icon.className = "w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center relative shadow-sm";
        icon.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';
        status.className = "text-[10px] md:text-xs font-semibold text-emerald-600";
        status.innerText = "Concluído";
      } else if (i === stepDesejado) {
        node.classList.remove('opacity-60');
        icon.className = "w-14 h-14 md:w-16 md:h-16 rounded-full bg-azul-bic border-4 border-verde-petronect text-white flex items-center justify-center shadow-md animate-pulse";
        status.className = "text-[10px] md:text-xs font-semibold text-verde-petronect";
        status.innerText = "Você está aqui";
      } else {
        node.classList.add('opacity-60');
        icon.className = "w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center";
        status.className = "text-[10px] md:text-xs font-semibold text-slate-400";
        status.innerText = "Aguardando";
      }
    }
  }

  const activeBlock = document.getElementById(`form-step-${stepDesejado}`);
  if (activeBlock) activeBlock.classList.remove('hidden');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// 6. CONTROLE DINÂMICO DO CHECKBOX LGPD (HABILITA/DESABILITA O BOTÃO)
function toggleLGPDWarning(checkbox) {
  const warning = document.getElementById('lgpd-warning');
  const btnNext = document.getElementById('btn-step-3-next');

  if (!warning || !btnNext) return;

  if (checkbox.checked) {
    warning.classList.add('hidden');
    btnNext.disabled = false;
    btnNext.classList.remove('opacity-50', 'cursor-not-allowed');
    btnNext.classList.add('hover:bg-blue-900');
  } else {
    warning.classList.remove('hidden');
    btnNext.disabled = true;
    btnNext.classList.add('opacity-50', 'cursor-not-allowed');
    btnNext.classList.remove('hover:bg-blue-900');
  }
}

// 7. FINALIZAR E REDIRECIONAR APÓS O CADASTRO
function finalizarCadastro() {
  const lgpdCheck = document.getElementById('lgpd-check');
  if (lgpdCheck && !lgpdCheck.checked) {
    alert('Você precisa aceitar os termos da LGPD para concluir!');
    return;
  }

  localStorage.setItem('cadastroConcluido', 'true');
  alert('🎉 Cadastro concluído com sucesso! Redirecionando para a Lista de Oportunidades Abertas...');
  window.location.href = 'oportunidades.html';
}

// ==========================================
// FUNÇÕES DE GERENCIAMENTO DE LOGIN (LOGIN / MODAL)
// ==========================================

function abrirModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function fecharModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function realizarLogin(event) {
  event.preventDefault();

  const cnpj = document.getElementById('login-cnpj').value.trim();
  const email = document.getElementById('login-email').value.trim();

  if (!cnpj || !email) {
    alert('Por favor, informe seu CNPJ e E-mail para realizar o login.');
    return;
  }

  localStorage.setItem('cadastroConcluido', 'true');
  alert('✅ Autenticado com sucesso! Redirecionando para a Lista de Oportunidades...');
  window.location.href = 'oportunidades.html';
}

// 8. FUNÇÃO PARA SAIR DO PAINEL DE OPORTUNIDADES (Volta para o index.html)
function sairDoPainel() {
  localStorage.removeItem('cadastroConcluido');
  window.location.href = 'home.html';
}