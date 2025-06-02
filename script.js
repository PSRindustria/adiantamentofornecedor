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
  // Limitar a 3 linhas extras (4 no total com a primeira)
  if (tbody.rows.length >= 4) {
      mostrarToast("Máximo de 4 linhas de adiantamento atingido.", "warning");
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

  // Carregar Logo (assumindo que está em /home/ubuntu/upload/logo.png)
  // Precisamos converter para Base64 ou garantir que o caminho seja acessível
  // Como não podemos acessar o filesystem diretamente do JS, vamos pular o logo por enquanto
  // ou pedir ao usuário para fornecer como Base64 se for crítico.
  // Alternativa: Usar um placeholder
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("[Logo PSR]", margin, currentY + 5);
  doc.setTextColor(0);

  // Linha colorida abaixo do logo (simulada)
  const logoHeight = 15; // Estimativa da altura do logo
  currentY += logoHeight;
  const lineColors = ["#FFD700", "#0056B3", "#DC3545"]; // Amarelo, Azul, Vermelho (aproximado)
  const lineWidthTotal = 60;
  let currentX = margin + 40; // Posição inicial da linha colorida
  doc.setLineWidth(2);
  doc.setDrawColor(lineColors[0]);
  doc.line(currentX, currentY, currentX + lineWidthTotal * 0.6, currentY);
  currentX += lineWidthTotal * 0.6;
  doc.setDrawColor(lineColors[1]);
  doc.line(currentX, currentY, currentX + lineWidthTotal * 0.3, currentY);
  currentX += lineWidthTotal * 0.3;
  doc.setDrawColor(lineColors[2]);
  doc.line(currentX, currentY, currentX + lineWidthTotal * 0.1, currentY);

  // Caixa FOR_FIN / VERSÃO
  const boxWidth = 40;
  const boxHeight = 10;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = margin + 5; // Alinhado um pouco abaixo do topo
  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  doc.setFontSize(8);
  doc.text("FOR_FIN_02_02", boxX + boxWidth / 2, boxY + 4, { align: "center" });
  doc.text("VERSÃO: 01", boxX + boxWidth / 2, boxY + 8, { align: "center" });

  // Título Principal
  currentY += 5; // Espaço após linha colorida
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FORMULÁRIO DE ADIANTAMENTO À FORNECEDOR", pageWidth / 2, currentY, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");

  // Linha abaixo do título
  currentY += 5;
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

  // Campo Valor (com R$)
  doc.setFont("helvetica", "bold");
  doc.text("VALOR:", col1X, yCol1 + labelOffset);
  doc.setFont("helvetica", "normal");
  doc.line(col1X, yCol1 + fieldHeight - lineOffset, col1X + colWidth, yCol1 + fieldHeight - lineOffset);
  doc.text("R$", col1X + 2, yCol1 + valueOffsetY);
  doc.text(formatarMoeda(dados.valor).replace("R$","").trim(), col1X + 8, yCol1 + valueOffsetY);
  yCol1 += fieldHeight + 3;

  // Forma de Pagamento
  doc.setFont("helvetica", "bold");
  doc.text("FORMA DE PAGAMENTO:", col1X, yCol1 + labelOffset);
  doc.setFont("helvetica", "normal");
  const checkX1 = col1X + 45;
  const checkY = yCol1 - 1;
  const checkSize = 4;
  doc.rect(checkX1, checkY, checkSize, checkSize);
  doc.text("PIX/TED", checkX1 + checkSize + 2, checkY + checkSize - 1);
  const checkX2 = checkX1 + 30;
  doc.rect(checkX2, checkY, checkSize, checkSize);
  doc.text("BOLETO", checkX2 + checkSize + 2, checkY + checkSize - 1);
  if (dados.formaPagamento === "PIX/TED") {
    doc.setFont("zapfdingbats", "bold");
    doc.text("\u2713", checkX1 + 0.5, checkY + checkSize - 0.5); // Checkmark
    doc.setFont("helvetica", "normal");
  } else if (dados.formaPagamento === "BOLETO") {
    doc.setFont("zapfdingbats", "bold");
    doc.text("\u2713", checkX2 + 0.5, checkY + checkSize - 0.5); // Checkmark
    doc.setFont("helvetica", "normal");
  }
  yCol1 += fieldHeight + 3;

  yCol1 = drawField(col1X, yCol1, colWidth, "SOLICITANTE:", dados.solicitante);
  yCol1 = drawField(col1X, yCol1, colWidth, "DEPARTAMENTO:", dados.departamento);
  yCol1 = drawField(col1X, yCol1, colWidth, "DATA LIMITE PARA PRESTAÇÃO DE CONTAS:", formatarData(dados.dataLimitePrestacao));

  // Coluna 2
  const finalidadeHeight = 30;
  yCol2 = drawBoxField(col2X, yCol2, col2Width, finalidadeHeight, "FINALIDADE:", dados.finalidade, 5);

  // Caixa Dados para Pagamento
  const dadosPgtoY = yCol2;
  const dadosPgtoHeight = 45; // Altura estimada para caber os campos
  doc.rect(col2X, dadosPgtoY, col2Width, dadosPgtoHeight);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS PARA PAGAMENTO:", col2X + 2, dadosPgtoY + 4);
  doc.setFont("helvetica", "normal");
  let yDados = dadosPgtoY + 8;
  const fieldWidthDados = col2Width - 4; // Largura interna da caixa
  const labelIndentDados = col2X + 2;
  const valueIndentDados = col2X + 25; // Indentação para valores
  const valueWidthDados = col2Width - 27;

  function drawDadosField(y, label, value) {
      doc.setFontSize(7);
      doc.text(label, labelIndentDados, y + 3);
      doc.line(valueIndentDados - 2, y + 4, col2X + col2Width - 2, y + 4);
      if(value) doc.text(String(value), valueIndentDados, y + 3);
      return y + 5;
  }

  yDados = drawDadosField(yDados, "BENEFICIÁRIO:", dados.beneficiario);
  yDados = drawDadosField(yDados, "CPF / CNPJ:", dados.cpfCnpj);
  yDados = drawDadosField(yDados, "BANCO:", dados.banco);
  yDados = drawDadosField(yDados, "AGÊNCIA:", dados.agencia);
  yDados = drawDadosField(yDados, "CONTA:", dados.conta);
  yDados = drawDadosField(yDados, "TIPO DE CONTA:", dados.tipoConta);
  yDados = drawDadosField(yDados, "CHAVE PIX:", dados.chavePix);
  yCol2 = dadosPgtoY + dadosPgtoHeight + 5;

  // --- Seção Adiantamentos em Aberto ---
  currentY = Math.max(yCol1, yCol2) + 5; // Alinha início da seção abaixo da coluna mais longa
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ADIANTAMENTOS EM ABERTO", pageWidth / 2, currentY, { align: "center" });
  doc.setFont("helvetica", "normal");
  currentY += 8;

  // Tabela Adiantamentos
  const tableColWidths = [contentWidth * 0.4, contentWidth * 0.4, contentWidth * 0.2];
  const tableHeaders = ["ORDEM DE COMPRA", "DATA LIMITE PRESTAÇÃO DE CONTAS", "VALOR EM ABERTO"];
  const tableRowHeight = 6;
  const tableHeaderY = currentY;
  let tableX = margin;

  // Desenhar Cabeçalho
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  for (let i = 0; i < tableHeaders.length; i++) {
    doc.rect(tableX, tableHeaderY, tableColWidths[i], tableRowHeight);
    doc.text(tableHeaders[i], tableX + 2, tableHeaderY + 4);
    tableX += tableColWidths[i];
  }
  currentY += tableRowHeight;

  // Desenhar Linhas da Tabela (mínimo 4 linhas como no template)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const numRowsToDraw = Math.max(4, dados.adiantamentos.length);
  for (let i = 0; i < numRowsToDraw; i++) {
    tableX = margin;
    const adiantamento = dados.adiantamentos[i]; // Pode ser undefined
    for (let j = 0; j < tableColWidths.length; j++) {
      doc.rect(tableX, currentY, tableColWidths[j], tableRowHeight);
      let cellValue = "";
      if (adiantamento) {
          if (j === 0) cellValue = adiantamento.ordemCompra;
          else if (j === 1) cellValue = formatarData(adiantamento.dataLimite);
          else if (j === 2) cellValue = adiantamento.valor; // Já formatado
      }
      doc.text(String(cellValue), tableX + 2, currentY + 4);
      tableX += tableColWidths[j];
    }
    currentY += tableRowHeight;
  }

  // --- Assinaturas ---
  currentY += 15; // Espaço antes das assinaturas
  const signatureY = Math.min(currentY, pageHeight - 30); // Garante que não saia da página
  const signatureLineLength = 60;
  const signatureCol1X = margin + contentWidth * 0.15;
  const signatureCol2X = pageWidth - margin - contentWidth * 0.15 - signatureLineLength;

  doc.setLineWidth(0.3);
  doc.line(signatureCol1X, signatureY, signatureCol1X + signatureLineLength, signatureY);
  doc.text("Solicitante", signatureCol1X + signatureLineLength / 2, signatureY + 4, { align: "center" });

  doc.line(signatureCol2X, signatureY, signatureCol2X + signatureLineLength, signatureY);
  doc.text("Controladoria", signatureCol2X + signatureLineLength / 2, signatureY + 4, { align: "center" });

  // --- Finalização ---
  pdfDoc = doc; // Armazena o documento para download

  // Exibir preview do PDF
  try {
      const pdfData = doc.output("datauristring");
      const pdfContainer = document.getElementById("pdfContainer");
      if (pdfContainer) {
          pdfContainer.innerHTML = `<embed width="100%" height="100%" src="${pdfData}" type="application/pdf">`;
          // Mostrar o modal de preview
          document.getElementById("pdfPreview").classList.add("active");
          mostrarToast("PDF gerado com sucesso!", "success");
      } else {
          console.error("Elemento #pdfContainer não encontrado.");
          mostrarToast("Erro ao exibir preview do PDF.", "error");
          // Oferecer download direto como fallback
          downloadPDF();
      }
  } catch (e) {
      console.error("Erro ao gerar Data URI do PDF:", e);
      mostrarToast("Erro ao gerar preview do PDF.", "error");
  }
}


// Função para fechar o preview do PDF
function fecharPreviewPDF() {
  document.getElementById("pdfPreview").classList.remove("active");
  const pdfContainer = document.getElementById("pdfContainer");
  if(pdfContainer) pdfContainer.innerHTML = ""; // Limpa o embed para liberar memória
}

// Função para baixar o PDF
function downloadPDF() {
  if (pdfDoc) {
    const fornecedor = document.getElementById("fornecedor").value || "fornecedor";
    const dataEmissao = document.getElementById("dataEmissao").value || new Date().toISOString().split("T")[0];
    // Limpa caracteres inválidos para nome de arquivo
    const fornecedorLimpo = fornecedor.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const nomeArquivo = `Adiantamento_${fornecedorLimpo}_${dataEmissao}.pdf`;

    try {
        pdfDoc.save(nomeArquivo);
        mostrarToast("PDF baixado com sucesso!", "success");
    } catch (e) {
        console.error("Erro ao salvar PDF:", e);
        mostrarToast("Erro ao baixar o PDF.", "error");
    }

  } else {
      mostrarToast("Nenhum PDF gerado para baixar.", "warning");
  }
}

// Adiciona um container para as notificações Toast no HTML se não existir
if (!document.getElementById("toastContainer")) {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
}

// Adiciona o HTML do Modal de Preview se não existir
if (!document.getElementById("pdfPreview")) {
    const modal = document.createElement("div");
    modal.id = "pdfPreview";
    modal.className = "modal-overlay"; // Use classes CSS existentes ou defina estilos
    modal.innerHTML = `
        <div class="modal-content" style="width: 80%; height: 80%; background: white; padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); position: relative;">
            <button id="closePdfPreview" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px; line-height: 25px; text-align: center;">×</button>
            <div id="pdfContainer" style="width: 100%; height: calc(100% - 40px); margin-top: 30px;"></div>
            <button id="downloadPdfBtn" style="position: absolute; bottom: 10px; right: 10px; padding: 8px 15px; background-color: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;">Baixar PDF</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Adiciona estilos básicos para o modal se não estiverem no CSS
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 999;
        }
        .modal-overlay.active {
            display: flex;
        }
        /* Estilos para Toast (simplificado) */
        .toast {
            background-color: #333;
            color: #fff;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            min-width: 250px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.5s ease-in-out;
            position: relative;
            overflow: hidden;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        .toast.success { background-color: #28a745; }
        .toast.error { background-color: #dc3545; }
        .toast.warning { background-color: #ffc107; color: #333; }
        .toast.info { background-color: #17a2b8; }
        .toast-icon { margin-right: 10px; }
        .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            width: 0;
            background-color: rgba(255,255,255,0.7);
            transition: width 3s linear;
        }
    `;
    document.head.appendChild(style);

    // Re-adiciona listeners para botões do modal recém-criado
    document.getElementById("closePdfPreview").addEventListener("click", fecharPreviewPDF);
    document.getElementById("downloadPdfBtn").addEventListener("click", downloadPDF);
}
