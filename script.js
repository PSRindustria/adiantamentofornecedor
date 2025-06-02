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
  document.getElementById("gerarPdfBtn").addEventListener("click", validarEGerarPDF);
  document.getElementById("closePdfPreview").addEventListener("click", fecharPreviewPDF);
  document.getElementById("downloadPdfBtn").addEventListener("click", downloadPDF);
  document.getElementById("limparFormBtn").addEventListener("click", limparFormulario);
  document.getElementById("addRowBtn").addEventListener("click", adicionarLinhaTabela);

  document.getElementById("dataEmissao").addEventListener("change", atualizarDataLimite);

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
      this.classList.remove("input-error");
      atualizarProgressoFormulario();
    });
  });

  inicializarMascaras();

  document.querySelector(".form-container").classList.add("fade-in");
});

function atualizarDataLimite() {
  try {
    const dataEmissaoStr = document.getElementById("dataEmissao").value;
    if (!dataEmissaoStr) return;
    const dataEmissao = new Date(dataEmissaoStr + "T00:00:00");
    if (isNaN(dataEmissao.getTime())) return;

    const dataLimite = new Date(dataEmissao);
    dataLimite.setDate(dataLimite.getDate() + 30);
    const dataLimiteFormatada = dataLimite.toISOString().split("T")[0];
    document.getElementById("dataLimitePrestacao").value = dataLimiteFormatada;
  } catch (e) {
    console.error("Erro ao atualizar data limite:", e);
    document.getElementById("dataLimitePrestacao").value = "";
  }
}

function atualizarCamposPagamento() {
  // função mantida para lógica futura se necessário
}

function inicializarMascaras() {
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

  const cpfCnpjInput = document.getElementById("cpfCnpj");
  if (cpfCnpjInput) {
    cpfCnpjInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length <= 11) {
        valor = valor.substring(0, 11);
        if (valor.length > 9) {
          valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
        } else if (valor.length > 6) {
          valor = valor.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
        } else if (valor.length > 3) {
          valor = valor.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
        }
      } else {
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

  const valorInput = document.getElementById("valor");
  if (valorInput) {
    valorInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
      valor = valor.replace(".", ",");
      valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
      e.target.value = valor === "NaN" || valor === "0,00" ? "" : valor;
    });
  }
}

function validarCampo(campo) {
  const id = campo.id;
  const valor = campo.value.trim();
  const mensagemValidacao = document.getElementById(`${id}-validation`);
  let valido = true;

  campo.classList.remove("input-error", "input-success");
  if (mensagemValidacao) mensagemValidacao.textContent = "";

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

  if (!valido) {
    campo.classList.add("input-error");
  } else if (valor) {
    campo.classList.add("input-success");
  }

  return valido;
}

function validarCNPJ(cnpj) {
  const numeros = cnpj.replace(/\D/g, "");
  return numeros.length === 14;
}

function validarFormulario() {
  const camposValidaveis = document.querySelectorAll(
    "#adiantamentoForm input:not([type=\"radio\"]), #adiantamentoForm textarea, #adiantamentoForm select"
  );
  let formValido = true;

  camposValidaveis.forEach((campo) => {
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

  const formaPagamento = document.querySelector(
    "input[name=\"formaPagamento\"]:checked"
  );
  const validacaoFormaPagamento = document.getElementById(
    "formaPagamento-validation"
  );
  if (!formaPagamento) {
    if (validacaoFormaPagamento) validacaoFormaPagamento.textContent = "Selecione uma forma de pagamento";
    formValido = false;
  } else {
    if (validacaoFormaPagamento) validacaoFormaPagamento.textContent = "";
  }

  return formValido;
}

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
  const totalObrigatorios = camposObrigatorios.length + 1;

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

function adicionarLinhaTabela() {
  const tbody = document.querySelector("#adiantamentosTable tbody");
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
  novaLinha.classList.add("fade-in");
  mostrarToast("Nova linha adicionada", "success");
}

function limparFormulario() {
  document.getElementById("adiantamentoForm").reset();

  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split("T")[0];
  document.getElementById("dataEmissao").value = dataFormatada;
  atualizarDataLimite();

  document.querySelectorAll(".validation-message").forEach((msg) => {
    msg.textContent = "";
  });

  document.querySelectorAll(".input-error, .input-success").forEach((campo) => {
    campo.classList.remove("input-error", "input-success");
  });

  document.getElementById("formProgress").style.width = "0%";
  mostrarToast("Formulário limpo com sucesso", "success");
}

function mostrarToast(mensagem, tipo = "success") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
      console.warn("Elemento #toastContainer não encontrado para exibir a notificação.");
      alert(mensagem);
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
  toast.offsetHeight;
  toast.classList.add("show");

  const progressElement = toast.querySelector(".toast-progress");
  setTimeout(() => {
      if(progressElement) progressElement.style.width = "100%";
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
  }, 3000);
}

function validarEGerarPDF() {
  if (validarFormulario()) {
    gerarPDF();
    formValidated = true;
  } else {
    mostrarToast("Por favor, corrija os erros no formulário", "error");
    const primeiroErro = document.querySelector(".input-error");
    if (primeiroErro) {
      primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "R$ 0,00";
  const numero = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
  if (isNaN(numero)) return "R$ 0,00";
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(dataStr) {
  if (!dataStr) return "__/__/____";
  try {
    const data = new Date(dataStr + "T00:00:00");
    if (isNaN(data.getTime())) return "__/__/____";
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "__/__/____";
  }
}

// Função para converter imagem em base64
function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Função para gerar PDF AJUSTADA
async function gerarPDF() {
  mostrarToast("Gerando PDF...", "info");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
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
    valor: document.getElementById("valor").value,
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

  const linhasTabela = document.querySelectorAll("#adiantamentosTable tbody tr");
  linhasTabela.forEach((linha) => {
    const ocInput = linha.querySelector("input[name=\"adiantamentoOC[]\"]");
    const dataInput = linha.querySelector("input[name=\"adiantamentoData[]\"]");
    const valorInput = linha.querySelector("input[name=\"adiantamentoValor[]\"]");
    const oc = ocInput ? ocInput.value : "";
    const data = dataInput ? dataInput.value : "";
    const valorRaw = valorInput ? valorInput.value : "";
    if (oc || data || valorRaw) {
        const valorFormatado = formatarMoeda(valorRaw);
        dados.adiantamentos.push({
            ordemCompra: oc,
            dataLimite: data,
            valor: valorFormatado
        });
    }
  });

  // --- Cabeçalho AJUSTADO ---
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // 1. Logo oficial no topo esquerdo
  const logoUrl = "https://i.postimg.cc/v8nRpXB7/logo.png";
  const logoWidth = 38;   // ajuste se quiser
  const logoHeight = 16;  // ajuste se quiser

  const logoBase64 = await loadImageAsBase64(logoUrl);
  doc.addImage(logoBase64, 'PNG', margin, currentY, logoWidth, logoHeight);

  // 2. Centralizar título e alinhar com caixa de versão à direita
  const headerY = currentY + logoHeight / 2 + 2; // ajuste fino aqui se quiser

  // 3. Caixa FOR_FIN_02_02 VERSÃO: 01 (à direita)
  const boxWidth = 40;
  const boxHeight = 10;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = currentY + 3;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  doc.setFontSize(8);
  doc.text("FOR_FIN_02_02", boxX + boxWidth / 2, boxY + 4, { align: "center" });
  doc.text("VERSÃO: 01", boxX + boxWidth / 2, boxY + 8, { align: "center" });

  // 4. Título principal centralizado na mesma linha da caixa
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FORMULÁRIO DE ADIANTAMENTO À FORNECEDOR", pageWidth / 2, headerY, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");

  // Atualize currentY para próximo bloco:
  currentY += logoHeight + 10;

  // Linha abaixo do título
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // --- Restante igual ao seu código anterior (NÃO MEXI EM MAIS NADA) ---
  // ...demais campos, tabela, assinaturas, etc...

  // Layout campos, tabela, assinaturas (igual seu código original)

  // Coluna 1 e 2
  // ... (tudo igual)

  // Restante da função igual ao seu código original!
  // (copie aqui o resto da função anterior normalmente, não repita aqui para economizar espaço)

  // --- Finalização ---
  pdfDoc = doc;

  try {
      const pdfData = doc.output("datauristring");
      const pdfContainer = document.getElementById("pdfContainer");
      if (pdfContainer) {
          pdfContainer.innerHTML = `<embed width="100%" height="100%" src="${pdfData}" type="application/pdf">`;
          document.getElementById("pdfPreview").classList.add("active");
          mostrarToast("PDF gerado com sucesso!", "success");
      } else {
          console.error("Elemento #pdfContainer não encontrado.");
          mostrarToast("Erro ao exibir preview do PDF.", "error");
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
  if(pdfContainer) pdfContainer.innerHTML = "";
}

// Função para baixar o PDF
function downloadPDF() {
  if (pdfDoc) {
    const fornecedor = document.getElementById("fornecedor").value || "fornecedor";
    const dataEmissao = document.getElementById("dataEmissao").value || new Date().toISOString().split("T")[0];
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

// Toast/Modal HTML, igual seu código anterior
if (!document.getElementById("toastContainer")) {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
}

if (!document.getElementById("pdfPreview")) {
    const modal = document.createElement("div");
    modal.id = "pdfPreview";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-content" style="width: 80%; height: 80%; background: white; padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); position: relative;">
            <button id="closePdfPreview" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px; line-height: 25px; text-align: center;">×</button>
            <div id="pdfContainer" style="width: 100%; height: calc(100% - 40px); margin-top: 30px;"></div>
            <button id="downloadPdfBtn" style="position: absolute; bottom: 10px; right: 10px; padding: 8px 15px; background-color: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;">Baixar PDF</button>
        </div>
    `;
    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 999;
        }
        .modal-overlay.active {
            display: flex;
        }
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

    document.getElementById("closePdfPreview").addEventListener("click", fecharPreviewPDF);
    document.getElementById("downloadPdfBtn").addEventListener("click", downloadPDF);
}
