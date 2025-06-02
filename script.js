// Variáveis globais
let pdfDoc = null;
let formValidated = false;

// Função para inicializar o formulário
document.addEventListener("DOMContentLoaded", function () {
  // Definir data de emissão como data atual
  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split("T")[0];
  document.getElementById("dataEmissao").value = dataFormatada;

  // Calcular data limite para prestação de contas (30 dias após a data atual)
  atualizarDataLimite();

  // Adicionar event listeners
  document
    .getElementById("gerarPdfBtn")
    .addEventListener("click", validarEGerarPDF);
  document
    .getElementById("closePdfPreview")
    .addEventListener("click", fecharPreviewPDF);
  document
    .getElementById("downloadPdfBtn")
    .addEventListener("click", downloadPDF);
  document
    .getElementById("limparFormBtn")
    .addEventListener("click", limparFormulario);
  document
    .getElementById("addRowBtn")
    .addEventListener("click", adicionarLinhaTabela);

  // Event listener para atualizar data limite quando a data de emissão mudar
  document
    .getElementById("dataEmissao")
    .addEventListener("change", atualizarDataLimite);

  // Event listener para mostrar/esconder campos de pagamento baseado na forma de pagamento
  document.querySelectorAll("input[name=\"formaPagamento\"]").forEach((radio) => {
    radio.addEventListener("change", atualizarCamposPagamento);
  });

  // Adicionar validação em tempo real para todos os campos
  const camposValidaveis = document.querySelectorAll("input, textarea, select");
  camposValidaveis.forEach((campo) => {
    campo.addEventListener("blur", function () {
      validarCampo(this);
      atualizarProgressoFormulario();
    });

    campo.addEventListener("input", function () {
      // Remover classe de erro ao digitar
      this.classList.remove("input-error");
      // Atualizar progresso ao digitar também
      atualizarProgressoFormulario();
    });
  });

  // Inicializar máscaras para campos específicos
  inicializarMascaras();

  // Inicializar campos de pagamento (garantir que estejam visíveis se necessário)
  // A remoção do CSS já deve garantir a visibilidade inicial
  // atualizarCamposPagamento(); // Pode não ser mais necessário chamar aqui

  // Adicionar animação de entrada
  document.querySelector(".form-container").classList.add("fade-in");
});

// Função para atualizar a data limite com base na data de emissão
function atualizarDataLimite() {
  try {
    const dataEmissaoStr = document.getElementById("dataEmissao").value;
    if (!dataEmissaoStr) return; // Não faz nada se a data de emissão estiver vazia
    // Adiciona hora para evitar problemas de fuso horário
    const dataEmissao = new Date(dataEmissaoStr + "T00:00:00");
    if (isNaN(dataEmissao.getTime())) return; // Data inválida

    const dataLimite = new Date(dataEmissao);
    dataLimite.setDate(dataLimite.getDate() + 30);
    const dataLimiteFormatada = dataLimite.toISOString().split("T")[0];
    document.getElementById("dataLimitePrestacao").value = dataLimiteFormatada;
  } catch (e) {
    console.error("Erro ao atualizar data limite:", e);
    document.getElementById("dataLimitePrestacao").value = "";
  }
}

// Função para atualizar campos de pagamento baseado na forma selecionada
// Esta função pode ser removida ou simplificada se os campos devem estar sempre visíveis
function atualizarCamposPagamento() {
  // Como removemos o CSS que ocultava, esta função não é mais estritamente necessária
  // para a visibilidade, mas pode ser usada para lógica futura se necessário.
  // console.log("Atualizando campos de pagamento...");
  // const formaPagamento = document.querySelector("input[name=\"formaPagamento\"]:checked")?.value;
  // const camposBancarios = document.querySelectorAll(".banco-field");
  // const camposPix = document.querySelectorAll(".pix-field");
  // // Lógica para mostrar/ocultar pode ser reativada se desejado
}

// Função para inicializar máscaras de input
function inicializarMascaras() {
  // Máscara para CNPJ
  const cnpjInput = document.getElementById("cnpjFornecedor");
  if (cnpjInput) {
    cnpjInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      valor = valor.substring(0, 14);
      if (valor.length > 12) {
        valor = valor.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          "$1.$2.$3/$4-$5"
        );
      } else if (valor.length > 8) {
        valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
      } else if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
      }
      e.target.value = valor;
    });
  }

  // Máscara para CPF/CNPJ
  const cpfCnpjInput = document.getElementById("cpfCnpj");
  if (cpfCnpjInput) {
    cpfCnpjInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length <= 11) {
        // CPF: XXX.XXX.XXX-XX
        valor = valor.substring(0, 11);
        if (valor.length > 9) {
          valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
        } else if (valor.length > 6) {
          valor = valor.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
        } else if (valor.length > 3) {
          valor = valor.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
        }
      } else {
        // CNPJ: XX.XXX.XXX/XXXX-XX
        valor = valor.substring(0, 14);
        if (valor.length > 12) {
          valor = valor.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5"
          );
        } else if (valor.length > 8) {
          valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
        } else if (valor.length > 5) {
          valor = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
        } else if (valor.length > 2) {
          valor = valor.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
        }
      }
      e.target.value = valor;
    });
  }

  // Máscara para Valor (Formato Moeda BRL)
  const valorInput = document.getElementById("valor");
  if (valorInput) {
    valorInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
      valor = valor.replace(".", ",");
      valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
      // Previne NaN se o campo estiver vazio
      e.target.value = valor === "NaN" || valor === "0,00" ? "" : valor;
    });
  }
}

// Função para validar um campo específico
function validarCampo(campo) {
  const id = campo.id;
  const valor = campo.value.trim();
  const mensagemValidacao = document.getElementById(`${id}-validation`);
  let valido = true;

  // Limpar validação anterior
  campo.classList.remove("input-error", "input-success");
  if (mensagemValidacao) mensagemValidacao.textContent = "";

  // Validações obrigatórias
  const obrigatorios = [
    "codigoFornecedor",
    "fornecedor",
    "cnpjFornecedor",
    "dataEmissao",
    "valor",
    "solicitante",
    "departamento",
  ];

  if (obrigatorios.includes(id) && !valor) {
    if (mensagemValidacao) mensagemValidacao.textContent = "Campo obrigatório";
    valido = false;
  }

  // Validações específicas
  if (valido && id === "cnpjFornecedor" && !validarCNPJ(valor)) {
    if (mensagemValidacao) mensagemValidacao.textContent = "CNPJ inválido";
    valido = false;
  }

  if (valido && id === "valor") {
    const valorNumerico = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        if (mensagemValidacao) mensagemValidacao.textContent = "Valor inválido";
        valido = false;
    }
  }

  // Atualizar estilo do campo
  if (!valido) {
    campo.classList.add("input-error");
  } else if (valor) {
    // Adiciona classe de sucesso apenas se for válido e tiver valor
    campo.classList.add("input-success");
  }

  return valido;
}

// Função para validar CNPJ (simplificada para aceitar o formato digitado)
function validarCNPJ(cnpj) {
  // Remove caracteres não numéricos
  const numeros = cnpj.replace(/\D/g, "");
  // Verifica se tem 14 dígitos
  return numeros.length === 14;
  // A validação completa do dígito verificador pode ser reativada se necessário
}

// Função para validar todo o formulário
function validarFormulario() {
  const camposValidaveis = document.querySelectorAll(
    "#adiantamentoForm input:not([type=\"radio\"]), #adiantamentoForm textarea, #adiantamentoForm select"
  );
  let formValido = true;

  camposValidaveis.forEach((campo) => {
    // Não valida campos que não são obrigatórios e estão vazios
    const obrigatorios = [
      "codigoFornecedor",
      "fornecedor",
      "cnpjFornecedor",
      "dataEmissao",
      "valor",
      "solicitante",
      "departamento",
    ];
    if (obrigatorios.includes(campo.id) || campo.value.trim() !== "") {
         if (!validarCampo(campo)) {
            formValido = false;
         }
    }
  });

  // Validar forma de pagamento
  const formaPagamento = document.querySelector(
    "input[name=\"formaPagamento\"]:checked"
  );
  const validacaoFormaPagamento = document.getElementById(
    "formaPagamento-validation"
  );
  if (!formaPagamento) {
    if (validacaoFormaPagamento) validacaoFormaPagamento.textContent = "Selecione uma forma de pagamento";
    // Adiciona estilo de erro visualmente ao grupo se desejado
    formValido = false;
  } else {
    if (validacaoFormaPagamento) validacaoFormaPagamento.textContent = "";
  }

  return formValido;
}

// Função para atualizar o progresso do formulário
function atualizarProgressoFormulario() {
  const camposObrigatorios = [
    "codigoFornecedor",
    "fornecedor",
    "cnpjFornecedor",
    "dataEmissao",
    "valor",
    "solicitante",
    "departamento",
  ];
  let preenchidos = 0;
  const totalObrigatorios = camposObrigatorios.length + 1; // +1 para forma de pagamento

  camposObrigatorios.forEach(id => {
      const campo = document.getElementById(id);
      if(campo && campo.value.trim() !== "") {
          preenchidos++;
      }
  });

  if (document.querySelector("input[name=\"formaPagamento\"]:checked")) {
      preenchidos++;
  }

  const progresso = (preenchidos / totalObrigatorios) * 100;
  document.getElementById("formProgress").style.width = `${Math.min(
    progresso,
    100
  )}%`;
}

// Função para adicionar linha na tabela de adiantamentos
function adicionarLinhaTabela() {
  const tbody = document.querySelector("#adiantamentosTable tbody");
  // Limitar a 9 linhas extras (10 no total com a primeira)
  if (tbody.rows.length >= 10) {
      mostrarToast("Máximo de 10 linhas de adiantamento atingido.", "warning");
      return;
  }
  const novaLinha = document.createElement("tr");

  novaLinha.innerHTML = `
        <td><input type="text" name="adiantamentoOC[]" class="input-animated"></td>
        <td><input type="date" name="adiantamentoData[]" class="input-animated"></td>
        <td>
            <div class="input-prefix">
                <span>R$</span>
                <input type="number" name="adiantamentoValor[]" step="0.01" min="0" class="input-animated" placeholder="0,00">
            </div>
        </td>
    `;

  tbody.appendChild(novaLinha);

  // Adicionar animação à nova linha
  novaLinha.classList.add("fade-in");

  // Mostrar notificação
  mostrarToast("Nova linha adicionada", "success");
}

// Função para limpar o formulário
function limparFormulario() {
  document.getElementById("adiantamentoForm").reset();

  // Redefinir data de emissão como data atual
  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split("T")[0];
  document.getElementById("dataEmissao").value = dataFormatada;

  // Recalcular data limite
  atualizarDataLimite();

  // Limpar mensagens de validação
  document.querySelectorAll(".validation-message").forEach((msg) => {
    msg.textContent = "";
  });

  // Remover classes de validação
  document
    .querySelectorAll(".input-error, .input-success")
    .forEach((campo) => {
      campo.classList.remove("input-error", "input-success");
    });

  // Resetar progresso
  document.getElementById("formProgress").style.width = "0%";

  // Mostrar notificação
  mostrarToast("Formulário limpo com sucesso", "success");
}

// Função para mostrar notificação toast
function mostrarToast(mensagem, tipo = "success") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
      console.warn("Elemento #toastContainer não encontrado para exibir a notificação.");
      alert(mensagem); // Fallback para alert
      return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  const iconClass = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle"
  }[tipo] || "fa-info-circle";

  toast.innerHTML = `
      <i class="fas ${iconClass} toast-icon"></i>
      <span class="toast-message">${mensagem}</span>
      <div class="toast-progress"></div>
  `;

  toastContainer.appendChild(toast);

  // Força reflow para garantir que a animação funcione
  toast.offsetHeight;

  toast.classList.add("show");

  // Iniciar progresso
  const progressElement = toast.querySelector(".toast-progress");
  setTimeout(() => {
      if(progressElement) progressElement.style.width = "100%";
  }, 100);

  // Esconder e remover toast após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    // Espera a animação de saída terminar antes de remover
    toast.addEventListener("transitionend", () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
  }, 3000);
}

// Função para validar e gerar PDF
function validarEGerarPDF() {
  if (validarFormulario()) {
    gerarPDF(); // Chama a nova função de geração
    formValidated = true;
  } else {
    mostrarToast("Por favor, corrija os erros no formulário", "error");
    // Rolar até o primeiro campo com erro
    const primeiroErro = document.querySelector(".input-error");
    if (primeiroErro) {
      primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

// Função para formatar valores monetários (BRL)
function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "R$ 0,00";
  const numero = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
  if (isNaN(numero)) return "R$ 0,00";
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Função para formatar data (DD/MM/YYYY)
function formatarData(dataStr) {
  if (!dataStr) return "__/__/____";
  try {
    // Adiciona hora para evitar problemas de fuso horário
    const data = new Date(dataStr + "T00:00:00");
    if (isNaN(data.getTime())) return "__/__/____";
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0"); // Meses são 0-indexados
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "__/__/____";
  }
}

// Função para carregar imagem e converter para base64
function carregarImagemComoBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = function() {
      reject(new Error('Erro ao carregar imagem'));
    };
    img.src = url;
  });
}

// *** NOVA FUNÇÃO gerarPDF ***
async function gerarPDF() {
  mostrarToast("Gerando PDF...", "info");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210 x 297 mm
  });

  // --- Coleta de Dados ---
  const dados = {
    codigoFornecedor: document.getElementById("codigoFornecedor").value,
    finalidade: document.getElementById("finalidade").value,
    fornecedor: document.getElementById("fornecedor").value,
    cnpjFornecedor: document.getElementById("cnpjFornecedor").value,
    dataEmissao: document.getElementById("dataEmissao").value,
    dataPagamento: document.getElementById("dataPagamento").value,
    ordemCompra: document.getElementById("ordemCompra").value,
    valor: document.getElementById("valor").value, // Já formatado com máscara?
    formaPagamento: document.querySelector("input[name=\"formaPagamento\"]:checked")?.value || "",
    beneficiario: document.getElementById("beneficiario").value,
    cpfCnpj: document.getElementById("cpfCnpj").value,
    banco: document.getElementById("banco").value,
    solicitante: document.getElementById("solicitante").value,
    agencia: document.getElementById("agencia").value,
    conta: document.getElementById("conta").value,
    departamento: document.getElementById("departamento").value,
    tipoConta: document.getElementById("tipoConta").value,
    chavePix: document.getElementById("chavePix").value,
    dataLimitePrestacao: document.getElementById("dataLimitePrestacao").value,
    adiantamentos: [],
  };

  // Capturar dados da tabela de adiantamentos
  const linhasTabela = document.querySelectorAll("#adiantamentosTable tbody tr");
  linhasTabela.forEach((linha) => {
    const ocInput = linha.querySelector("input[name=\"adiantamentoOC[]\"]");
    const dataInput = linha.querySelector("input[name=\"adiantamentoData[]\"]");
    const valorInput = linha.querySelector("input[name=\"adiantamentoValor[]\"]");

    const oc = ocInput ? ocInput.value : "";
    const data = dataInput ? dataInput.value : "";
    const valorRaw = valorInput ? valorInput.value : "";

    // Adiciona apenas se alguma informação estiver presente na linha
    if (oc || data || valorRaw) {
        // Formata o valor para BRL antes de adicionar
        const valorFormatado = formatarMoeda(valorRaw);
        dados.adiantamentos.push({
            ordemCompra: oc,
            dataLimite: data, // Será formatado depois
            valor: valorFormatado // Já formatado
        });
    }
  });

  // --- Desenho do PDF ---
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  try {
    // Carregar e adicionar logo
    const logoUrl = 'https://i.postimg.cc/v8nRpXB7/logo.png';
    const logoBase64 = await carregarImagemComoBase64(logoUrl);
    
    // Adicionar logo (alinhada à esquerda)
    const logoWidth = 40; // Ajuste conforme necessário
    const logoHeight = 15; // Ajuste conforme necessário
    doc.addImage(logoBase64, 'PNG', margin, currentY, logoWidth, logoHeight);
    
    // Caixa FOR_FIN / VERSÃO (mantém na mesma posição)
    const boxWidth = 40;
    const boxHeight = 10;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = currentY + 2.5; // Centralizada verticalmente com a logo
    doc.setLineWidth(0.3);
    doc.setDrawColor(0);
    doc.rect(boxX, boxY, boxWidth, boxHeight);
    doc.setFontSize(8);
    doc.text("FOR_FIN_02_02", boxX + boxWidth / 2, boxY + 4, { align: "center" });
    doc.text("VERSÃO: 01", boxX + boxWidth / 2, boxY + 8, { align: "center" });

    // Título Principal (na mesma altura da caixa de versão)
    const tituloY = boxY + 6; // Centralizado verticalmente com a caixa
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FORMULÁRIO DE ADIANTAMENTO À FORNECEDOR", pageWidth / 2, tituloY, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");

    // Atualizar currentY para após a logo/título
    currentY = Math.max(currentY + logoHeight, boxY + boxHeight) + 3;

  } catch (error) {
    console.warn("Erro ao carregar logo, continuando sem ela:", error);
    mostrarToast("Aviso: Logo não pôde ser carregada", "warning");
    
    // Fallback sem logo - apenas caixa e título
    const boxWidth = 40;
    const boxHeight = 10;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = currentY;
    doc.setLineWidth(0.3);
    doc.setDrawColor(0);
    doc.rect(boxX, boxY, boxWidth, boxHeight);
    doc.setFontSize(8);
    doc.text("FOR_FIN_02_02", boxX + boxWidth / 2, boxY + 4, { align: "center" });
    doc.text("VERSÃO: 01", boxX + boxWidth / 2, boxY + 8, { align: "center" });

    // Título Principal
    const tituloY = boxY + 6;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FORMULÁRIO DE ADIANTAMENTO À FORNECEDOR", pageWidth / 2, tituloY, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");

    currentY = boxY + boxHeight + 3;
  }

  // Linha abaixo do cabeçalho
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8; // Espaço antes dos campos

  // --- Campos Principais (Layout de 2 colunas) ---
  const col1X = margin;
  const colWidth = contentWidth * 0.55; // Largura da coluna da esquerda
  const col2X = margin + colWidth + 5; // Início da coluna da direita (Finalidade/Dados Pgto)
  const col2Width = contentWidth - colWidth - 5;
  const fieldHeight = 7;
  const labelOffset = 2;
  const valueOffsetY = 5;
  const lineOffset = 0.5;
  let yCol1 = currentY;
  let yCol2 = currentY;

  doc.setFontSize(8);

  // Função auxiliar para desenhar campo com label e valor/linha
  function drawField(x, y, w, label, value) {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y + labelOffset);
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.2);
    doc.line(x, y + fieldHeight - lineOffset, x + w, y + fieldHeight - lineOffset);
    if (value) {
      doc.text(String(value), x + 2, y + valueOffsetY);
    }
    return y + fieldHeight + 3; // Retorna a próxima posição Y
  }

  // Função auxiliar para desenhar caixa com label e valor/linhas
  function drawBoxField(x, y, w, h, label, value, maxLines = 1) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(label, x, y - 2);
      doc.setFont("helvetica", "normal");
      doc.rect(x, y, w, h);
      if (value) {
          const lines = doc.splitTextToSize(String(value), w - 4); // -4 para padding
          doc.text(lines.slice(0, maxLines), x + 2, y + 4);
      }
      return y + h + 5; // Retorna a próxima posição Y
  }

  // Coluna 1
  yCol1 = drawField(col1X, yCol1, colWidth, "CÓDIGO FORNECEDOR:", dados.codigoFornecedor);
  yCol1 = drawField(col1X, yCol1, colWidth, "FORNECEDOR:", dados.fornecedor);
  yCol1 = drawField(col1X, yCol1, colWidth, "CNPJ FORNECEDOR:", dados.cnpjFornecedor);
  yCol1 = drawField(col1X, yCol1, colWidth, "DATA DE EMISSÃO:", formatarData(dados.dataEmissao));
  yCol1 = drawField(col1X, yCol1, colWidth, "DATA PARA PAGAMENTO:", formatarData(dados.dataPagamento));
  yCol1 = drawField(col1X, yCol1, colWidth, "ORDEM DE COMPRA:", dados.ordemCompra);

 // Campo Valor (com R$) - continuação
  doc.setFont("helvetica", "bold");
  doc.text("VALOR:", col1X, yCol1 + labelOffset);
  doc.setFont("helvetica", "normal");
  doc.line(col1X, yCol1 + fieldHeight - lineOffset, col1X + colWidth, yCol1 + fieldHeight - lineOffset);
  doc.text("R$", col1X + 2, yCol1 + valueOffsetY);
  doc.text(formatarMoeda(dados.valor).replace("R$ ", ""), col1X + 10, yCol1 + valueOffsetY);
  yCol1 += fieldHeight + 3;

  // Coluna 2 - Finalidade
  yCol2 = drawBoxField(col2X, yCol2, col2Width, 20, "FINALIDADE:", dados.finalidade, 3);

  // Dados para Pagamento
  yCol2 += 5;
  doc.setFont("helvetica", "bold");
  doc.text("DADOS PARA PAGAMENTO:", col2X, yCol2);
  doc.setFont("helvetica", "normal");
  yCol2 += 5;

  // Forma de Pagamento
  const formaPagTexto = dados.formaPagamento === "transferencia" ? "TRANSFERÊNCIA BANCÁRIA" : 
                       dados.formaPagamento === "pix" ? "PIX" : "";
  yCol2 = drawField(col2X, yCol2, col2Width, "FORMA DE PAGAMENTO:", formaPagTexto);
  yCol2 = drawField(col2X, yCol2, col2Width, "BENEFICIÁRIO:", dados.beneficiario);
  yCol2 = drawField(col2X, yCol2, col2Width, "CPF/CNPJ:", dados.cpfCnpj);

  if (dados.formaPagamento === "transferencia") {
    yCol2 = drawField(col2X, yCol2, col2Width, "BANCO:", dados.banco);
    yCol2 = drawField(col2X, yCol2, col2Width, "AGÊNCIA:", dados.agencia);
    yCol2 = drawField(col2X, yCol2, col2Width, "CONTA:", dados.conta);
    yCol2 = drawField(col2X, yCol2, col2Width, "TIPO CONTA:", dados.tipoConta);
  } else if (dados.formaPagamento === "pix") {
    yCol2 = drawField(col2X, yCol2, col2Width, "CHAVE PIX:", dados.chavePix);
  }

  // Ajustar currentY para a maior coluna
  currentY = Math.max(yCol1, yCol2) + 10;

  // --- Seção de Adiantamentos ---
  doc.setFont("helvetica", "bold");
  doc.text("ADIANTAMENTOS ANTERIORES REFERENTE A ESTA ORDEM DE COMPRA:", margin, currentY);
  doc.setFont("helvetica", "normal");
  currentY += 8;

  // Cabeçalho da tabela
  const tableX = margin;
  const tableWidth = contentWidth;
  const col1Width = tableWidth * 0.4; // Ordem de Compra
  const col2Width = tableWidth * 0.3; // Data Limite
  const col3Width = tableWidth * 0.3; // Valor
  const rowHeight = 8;

  // Desenhar cabeçalho
  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, currentY, tableWidth, rowHeight, 'F');
  doc.setLineWidth(0.3);
  doc.rect(tableX, currentY, col1Width, rowHeight);
  doc.rect(tableX + col1Width, currentY, col2Width, rowHeight);
  doc.rect(tableX + col1Width + col2Width, currentY, col3Width, rowHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ORDEM DE COMPRA", tableX + col1Width/2, currentY + 5, { align: "center" });
  doc.text("DATA LIMITE PRESTAÇÃO", tableX + col1Width + col2Width/2, currentY + 5, { align: "center" });
  doc.text("VALOR", tableX + col1Width + col2Width + col3Width/2, currentY + 5, { align: "center" });
  currentY += rowHeight;

  // Desenhar linhas de dados (máximo 5 linhas visíveis)
  doc.setFont("helvetica", "normal");
  const maxLinhasVisiveis = 5;

  for (let i = 0; i < maxLinhasVisiveis; i++) {
    const adiantamento = dados.adiantamentos[i];
    
    doc.rect(tableX, currentY, col1Width, rowHeight);
    doc.rect(tableX + col1Width, currentY, col2Width, rowHeight);
    doc.rect(tableX + col1Width + col2Width, currentY, col3Width, rowHeight);

    if (adiantamento) {
      doc.text(adiantamento.ordemCompra || "", tableX + 2, currentY + 5);
      doc.text(formatarData(adiantamento.dataLimite) || "", tableX + col1Width + 2, currentY + 5);
      doc.text(adiantamento.valor || "", tableX + col1Width + col2Width + 2, currentY + 5);
    }
    
    currentY += rowHeight;
  }

  currentY += 10;

  // --- Seções finais ---
  // Solicitante e Departamento
  const infoY = currentY;
  yCol1 = drawField(col1X, infoY, colWidth, "SOLICITANTE:", dados.solicitante);
  yCol2 = drawField(col2X, infoY, col2Width, "DEPARTAMENTO:", dados.departamento);
  
  currentY = Math.max(yCol1, yCol2) + 5;

  // Data limite para prestação de contas
  currentY = drawField(margin, currentY, contentWidth, 
    "DATA LIMITE PARA PRESTAÇÃO DE CONTAS:", formatarData(dados.dataLimitePrestacao));

  currentY += 10;

  // Assinaturas
  const assinaturaY = currentY;
  const assinaturaWidth = (contentWidth - 20) / 3;
  
  // Solicitante
  doc.line(margin, assinaturaY, margin + assinaturaWidth, assinaturaY);
  doc.setFontSize(7);
  doc.text("SOLICITANTE", margin + assinaturaWidth/2, assinaturaY + 4, { align: "center" });
  
  // Supervisor
  const supervisorX = margin + assinaturaWidth + 10;
  doc.line(supervisorX, assinaturaY, supervisorX + assinaturaWidth, assinaturaY);
  doc.text("SUPERVISOR", supervisorX + assinaturaWidth/2, assinaturaY + 4, { align: "center" });
  
  // Financeiro
  const financeiroX = supervisorX + assinaturaWidth + 10;
  doc.line(financeiroX, assinaturaY, financeiroX + assinaturaWidth, assinaturaY);
  doc.text("FINANCEIRO", financeiroX + assinaturaWidth/2, assinaturaY + 4, { align: "center" });

  currentY = assinaturaY + 15;

  // Rodapé com data/hora de geração
  doc.setFontSize(6);
  doc.setTextColor(128, 128, 128);
  const agora = new Date();
  const dataHoraGeracao = `Gerado em: ${agora.toLocaleString('pt-BR')}`;
  doc.text(dataHoraGeracao, pageWidth - margin, pageHeight - 5, { align: "right" });

  // --- Finalização ---
  pdfDoc = doc;
  mostrarPreviewPDF();
  mostrarToast("PDF gerado com sucesso!", "success");
}

// Função para mostrar preview do PDF
function mostrarPreviewPDF() {
  if (!pdfDoc) return;
  
  const pdfPreview = document.getElementById("pdfPreview");
  const pdfViewer = document.getElementById("pdfViewer");
  
  // Gerar blob do PDF
  const pdfBlob = pdfDoc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Configurar iframe
  pdfViewer.src = pdfUrl;
  pdfPreview.style.display = "flex";
  
  // Adicionar animação
  setTimeout(() => {
    pdfPreview.classList.add("show");
  }, 10);
}

// Função para fechar preview do PDF
function fecharPreviewPDF() {
  const pdfPreview = document.getElementById("pdfPreview");
  const pdfViewer = document.getElementById("pdfViewer");
  
  pdfPreview.classList.remove("show");
  
  setTimeout(() => {
    pdfPreview.style.display = "none";
    // Limpar URL para liberar memória
    if (pdfViewer.src) {
      URL.revokeObjectURL(pdfViewer.src);
      pdfViewer.src = "";
    }
  }, 300);
}

// Função para download do PDF
function downloadPDF() {
  if (!pdfDoc) {
    mostrarToast("Nenhum PDF gerado para download", "error");
    return;
  }
  
  const filename = `adiantamento_fornecedor_${new Date().toISOString().split('T')[0]}.pdf`;
  pdfDoc.save(filename);
  mostrarToast("PDF baixado com sucesso!", "success");
}
