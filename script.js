// Variáveis globais
let pdfDoc = null;

// Função para inicializar a data de emissão com a data atual
document.addEventListener('DOMContentLoaded', function() {
    // Definir data de emissão como data atual
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('dataEmissao').value = dataFormatada;
    
    // Calcular data limite para prestação de contas (30 dias após a data atual)
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + 30);
    const dataLimiteFormatada = dataLimite.toISOString().split('T')[0];
    document.getElementById('dataLimitePrestacao').value = dataLimiteFormatada;
    
    // Adicionar event listeners
    document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);
    document.getElementById('closePdfPreview').addEventListener('click', fecharPreviewPDF);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    
    // Event listener para atualizar data limite quando a data de emissão mudar
    document.getElementById('dataEmissao').addEventListener('change', function() {
        const dataEmissao = new Date(this.value);
        const dataLimite = new Date(dataEmissao);
        dataLimite.setDate(dataLimite.getDate() + 30);
        const dataLimiteFormatada = dataLimite.toISOString().split('T')[0];
        document.getElementById('dataLimitePrestacao').value = dataLimiteFormatada;
    });
    
    // Event listener para mostrar/esconder campos de pagamento baseado na forma de pagamento
    document.querySelectorAll('input[name="formaPagamento"]').forEach(radio => {
        radio.addEventListener('change', atualizarCamposPagamento);
    });
});

// Função para atualizar campos de pagamento baseado na forma selecionada
function atualizarCamposPagamento() {
    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value;
    const camposBancarios = document.querySelectorAll('.campo-bancario');
    const camposPix = document.querySelectorAll('.campo-pix');
    
    if (formaPagamento === 'PIX/TED') {
        camposBancarios.forEach(campo => campo.style.display = 'block');
        camposPix.forEach(campo => campo.style.display = 'block');
    } else if (formaPagamento === 'BOLETO') {
        camposBancarios.forEach(campo => campo.style.display = 'none');
        camposPix.forEach(campo => campo.style.display = 'none');
    }
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar datas
function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Função para gerar o PDF
function gerarPDF() {
    // Capturar dados do formulário
    const dados = {
        codigoFornecedor: document.getElementById('codigoFornecedor').value,
        finalidade: document.getElementById('finalidade').value,
        fornecedor: document.getElementById('fornecedor').value,
        cnpjFornecedor: document.getElementById('cnpjFornecedor').value,
        dataEmissao: document.getElementById('dataEmissao').value,
        dataPagamento: document.getElementById('dataPagamento').value,
        ordemCompra: document.getElementById('ordemCompra').value,
        valor: document.getElementById('valor').value,
        formaPagamento: document.querySelector('input[name="formaPagamento"]:checked')?.value || '',
        beneficiario: document.getElementById('beneficiario').value,
        cpfCnpj: document.getElementById('cpfCnpj').value,
        banco: document.getElementById('banco').value,
        solicitante: document.getElementById('solicitante').value,
        agencia: document.getElementById('agencia').value,
        conta: document.getElementById('conta').value,
        departamento: document.getElementById('departamento').value,
        tipoConta: document.getElementById('tipoConta').value,
        chavePix: document.getElementById('chavePix').value,
        dataLimitePrestacao: document.getElementById('dataLimitePrestacao').value,
        adiantamentos: []
    };
    
    // Capturar dados da tabela de adiantamentos
    const linhasTabela = document.querySelectorAll('#adiantamentosTable tbody tr');
    linhasTabela.forEach(linha => {
        const oc = linha.querySelector('input[name="adiantamentoOC[]"]').value;
        const data = linha.querySelector('input[name="adiantamentoData[]"]').value;
        const valor = linha.querySelector('input[name="adiantamentoValor[]"]').value;
        
        if (oc || data || valor) {
            dados.adiantamentos.push({
                ordemCompra: oc,
                dataLimite: data,
                valor: valor
            });
        }
    });
    
    // Criar o PDF usando jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Configurações de estilo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 86, 179); // Cor azul
    
    // Título do formulário
    doc.text('FORMULÁRIO DE ADIANTAMENTO À FORNECEDOR', 105, 20, { align: 'center' });
    
    // Código do formulário
    doc.setFontSize(10);
    doc.text('FOR_FIN_02_02', 190, 20, { align: 'right' });
    doc.text('VERSÃO: 01', 190, 25, { align: 'right' });
    
    // Linha horizontal
    doc.setDrawColor(0, 86, 179);
    doc.setLineWidth(0.5);
    doc.line(10, 30, 200, 30);
    
    // Configuração para o conteúdo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Dados do fornecedor
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO FORNECEDOR:', 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.codigoFornecedor || '___________________', 65, 40);
    
    doc.setFont('helvetica', 'bold');
    doc.text('FINALIDADE:', 110, 40);
    doc.setFont('helvetica', 'normal');
    
    // Quebrar texto da finalidade em múltiplas linhas
    const finalidadeLinhas = doc.splitTextToSize(dados.finalidade || '', 80);
    doc.text(finalidadeLinhas, 110, 45);
    
    doc.setFont('helvetica', 'bold');
    doc.text('FORNECEDOR:', 15, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.fornecedor || '___________________', 50, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('CNPJ FORNECEDOR:', 15, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cnpjFornecedor || 'XX.XXX.XXX/XXXX-XX', 65, 70);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATA DE EMISSÃO:', 15, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarData(dados.dataEmissao) || '___/___/______', 65, 80);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PARA PAGAMENTO:', 15, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarData(dados.dataPagamento) || '___/___/______', 75, 90);
    
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEM DE COMPRA:', 15, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.ordemCompra || '___________________', 65, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR:', 15, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.valor ? formatarMoeda(dados.valor) : 'R$ 0,00', 35, 110);
    
    // Dados para pagamento
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS PARA PAGAMENTO:', 110, 80);
    
    doc.setFont('helvetica', 'bold');
    doc.text('FORMA DE PAGAMENTO:', 15, 120);
    doc.setFont('helvetica', 'normal');
    
    // Checkboxes para forma de pagamento
    doc.rect(65, 118, 4, 4); // Checkbox PIX/TED
    doc.rect(100, 118, 4, 4); // Checkbox BOLETO
    
    if (dados.formaPagamento === 'PIX/TED') {
        doc.text('X', 66.5, 121);
    } else if (dados.formaPagamento === 'BOLETO') {
        doc.text('X', 101.5, 121);
    }
    
    doc.text('PIX/TED', 71, 121);
    doc.text('BOLETO', 106, 121);
    
    doc.setFont('helvetica', 'bold');
    doc.text('BENEFICIÁRIO:', 110, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.beneficiario || '___________________', 145, 90);
    
    doc.setFont('helvetica', 'bold');
    doc.text('CPF / CNPJ:', 110, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cpfCnpj || '___________________', 145, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('BANCO:', 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.banco || '___________________', 130, 110);
    
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITANTE:', 15, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.solicitante || '___________________', 50, 130);
    
    doc.setFont('helvetica', 'bold');
    doc.text('AGÊNCIA:', 110, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.agencia || '___________________', 135, 120);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTAMENTO:', 15, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.departamento || '___________________', 55, 140);
    
    doc.setFont('helvetica', 'bold');
    doc.text('CONTA:', 110, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.conta || '___________________', 130, 130);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATA LIMITE PARA PRESTAÇÃO DE CONTAS:', 15, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarData(dados.dataLimitePrestacao) || '___/___/______', 105, 150);
    
    doc.setFont('helvetica', 'bold');
    doc.text('TIPO DE CONTA:', 110, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.tipoConta || '___________________', 145, 140);
    
    doc.setFont('helvetica', 'bold');
    doc.text('CHAVE PIX:', 110, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.chavePix || '___________________', 140, 150);
    
    // Seção de adiantamentos em aberto
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 160, 190, 8, 'F');
    doc.text('ADIANTAMENTOS EM ABERTO', 15, 166);
    
    // Tabela de adiantamentos
    const startY = 175;
    const cellPadding = 2;
    
    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY - 6, 60, 6, 'F');
    doc.rect(75, startY - 6, 60, 6, 'F');
    doc.rect(135, startY - 6, 50, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEM DE COMPRA', 17, startY - 2);
    doc.text('DATA LIMITE PRESTAÇÃO DE CONTAS', 77, startY - 2);
    doc.text('VALOR EM ABERTO', 137, startY - 2);
    
    // Linhas da tabela
    doc.setFont('helvetica', 'normal');
    let currentY = startY;
    
    // Desenhar linhas da tabela
    for (let i = 0; i < 3; i++) {
        doc.rect(15, currentY, 60, 6);
        doc.rect(75, currentY, 60, 6);
        doc.rect(135, currentY, 50, 6);
        
        // Preencher dados se existirem
        if (dados.adiantamentos[i]) {
            doc.text(dados.adiantamentos[i].ordemCompra || '', 17, currentY + 4);
            doc.text(formatarData(dados.adiantamentos[i].dataLimite) || '', 77, currentY + 4);
            doc.text(dados.adiantamentos[i].valor ? formatarMoeda(dados.adiantamentos[i].valor) : '', 137, currentY + 4);
        }
        
        currentY += 6;
    }
    
    // Assinaturas
    const assinaturaY = 220;
    
    // Linha para assinatura do solicitante
    doc.line(30, assinaturaY, 80, assinaturaY);
    doc.text('Solicitante', 55, assinaturaY + 5, { align: 'center' });
    
    // Linha para assinatura da controladoria
    doc.line(120, assinaturaY, 170, assinaturaY);
    doc.text('Controladoria', 145, assinaturaY + 5, { align: 'center' });
    
    // Salvar o PDF gerado
    pdfDoc = doc;
    
    // Exibir preview do PDF
    const pdfData = doc.output('datauristring');
    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = `<embed width="100%" height="100%" src="${pdfData}" type="application/pdf">`;
    
    // Mostrar o modal de preview
    document.getElementById('pdfPreview').classList.add('active');
}

// Função para fechar o preview do PDF
function fecharPreviewPDF() {
    document.getElementById('pdfPreview').classList.remove('active');
}

// Função para baixar o PDF
function downloadPDF() {
    if (pdfDoc) {
        const fornecedor = document.getElementById('fornecedor').value || 'fornecedor';
        const dataEmissao = document.getElementById('dataEmissao').value || new Date().toISOString().split('T')[0];
        const nomeArquivo = `Adiantamento_${fornecedor}_${dataEmissao}.pdf`;
        
        pdfDoc.save(nomeArquivo);
    }
}
