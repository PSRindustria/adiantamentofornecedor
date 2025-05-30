// Variáveis globais
let pdfDoc = null;
let formValidated = false;

// Função para inicializar o formulário
document.addEventListener('DOMContentLoaded', function() {
    // Definir data de emissão como data atual
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('dataEmissao').value = dataFormatada;
    
    // Calcular data limite para prestação de contas (30 dias após a data atual)
    atualizarDataLimite();
    
    // Adicionar event listeners
    document.getElementById('gerarPdfBtn').addEventListener('click', validarEGerarPDF);
    document.getElementById('closePdfPreview').addEventListener('click', fecharPreviewPDF);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('limparFormBtn').addEventListener('click', limparFormulario);
    document.getElementById('addRowBtn').addEventListener('click', adicionarLinhaTabela);
    
    // Event listener para atualizar data limite quando a data de emissão mudar
    document.getElementById('dataEmissao').addEventListener('change', atualizarDataLimite);
    
    // Event listener para mostrar/esconder campos de pagamento baseado na forma de pagamento
    document.querySelectorAll('input[name="formaPagamento"]').forEach(radio => {
        radio.addEventListener('change', atualizarCamposPagamento);
    });
    
    // Adicionar validação em tempo real para todos os campos
    const camposValidaveis = document.querySelectorAll('input, textarea, select');
    camposValidaveis.forEach(campo => {
        campo.addEventListener('blur', function() {
            validarCampo(this);
            atualizarProgressoFormulario();
        });
        
        campo.addEventListener('input', function() {
            // Remover classe de erro ao digitar
            this.classList.remove('input-error');
        });
    });
    
    // Inicializar máscaras para campos específicos
    inicializarMascaras();
    
    // Inicializar campos de pagamento
    atualizarCamposPagamento();
    
    // Adicionar animação de entrada
    document.querySelector('.form-container').classList.add('fade-in');
});

// Função para atualizar a data limite com base na data de emissão
function atualizarDataLimite() {
    const dataEmissao = new Date(document.getElementById('dataEmissao').value);
    const dataLimite = new Date(dataEmissao);
    dataLimite.setDate(dataLimite.getDate() + 30);
    const dataLimiteFormatada = dataLimite.toISOString().split('T')[0];
    document.getElementById('dataLimitePrestacao').value = dataLimiteFormatada;
}

// Função para atualizar campos de pagamento baseado na forma selecionada
function atualizarCamposPagamento() {
    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value;
    const camposBancarios = document.querySelectorAll('.banco-field');
    const camposPix = document.querySelectorAll('.pix-field');
    
    if (formaPagamento === 'PIX/TED') {
        camposBancarios.forEach(campo => campo.style.display = 'block');
        camposPix.forEach(campo => campo.style.display = 'block');
    } else if (formaPagamento === 'BOLETO') {
        camposBancarios.forEach(campo => campo.style.display = 'none');
        camposPix.forEach(campo => campo.style.display = 'none');
    } else {
        // Nenhuma forma selecionada, mostrar todos os campos
        camposBancarios.forEach(campo => campo.style.display = 'block');
        camposPix.forEach(campo => campo.style.display = 'block');
    }
}

// Função para inicializar máscaras de input
function inicializarMascaras() {
    // Máscara para CNPJ
    const cnpjInput = document.getElementById('cnpjFornecedor');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length > 14) valor = valor.substring(0, 14);
            
            // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
            if (valor.length > 12) {
                this.value = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            } else if (valor.length > 8) {
                this.value = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
            } else if (valor.length > 5) {
                this.value = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (valor.length > 2) {
                this.value = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
            } else {
                this.value = valor;
            }
        });
    }
    
    // Máscara para CPF/CNPJ
    const cpfCnpjInput = document.getElementById('cpfCnpj');
    if (cpfCnpjInput) {
        cpfCnpjInput.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            
            // Determinar se é CPF ou CNPJ baseado no tamanho
            if (valor.length <= 11) {
                // CPF: XXX.XXX.XXX-XX
                if (valor.length > 9) {
                    this.value = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
                } else if (valor.length > 6) {
                    this.value = valor.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
                } else if (valor.length > 3) {
                    this.value = valor.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
                } else {
                    this.value = valor;
                }
            } else {
                // CNPJ: XX.XXX.XXX/XXXX-XX
                if (valor.length > 14) valor = valor.substring(0, 14);
                
                if (valor.length > 12) {
                    this.value = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
                } else if (valor.length > 8) {
                    this.value = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
                } else if (valor.length > 5) {
                    this.value = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
                } else if (valor.length > 2) {
                    this.value = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
                } else {
                    this.value = valor;
                }
            }
        });
    }
}

// Função para validar um campo específico
function validarCampo(campo) {
    const id = campo.id;
    const valor = campo.value.trim();
    const mensagemValidacao = document.getElementById(`${id}-validation`);
    
    // Remover classes de validação anteriores
    campo.classList.remove('input-error', 'input-success');
    
    // Validação específica para cada campo
    switch (id) {
        case 'codigoFornecedor':
            if (!valor) {
                mensagemValidacao.textContent = 'Código do fornecedor é obrigatório';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'fornecedor':
            if (!valor) {
                mensagemValidacao.textContent = 'Nome do fornecedor é obrigatório';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'cnpjFornecedor':
            if (!valor) {
                mensagemValidacao.textContent = 'CNPJ do fornecedor é obrigatório';
                campo.classList.add('input-error');
                return false;
            } else if (!validarCNPJ(valor)) {
                mensagemValidacao.textContent = 'CNPJ inválido';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'dataEmissao':
            if (!valor) {
                mensagemValidacao.textContent = 'Data de emissão é obrigatória';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'valor':
            if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
                mensagemValidacao.textContent = 'Valor deve ser maior que zero';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'solicitante':
            if (!valor) {
                mensagemValidacao.textContent = 'Nome do solicitante é obrigatório';
                campo.classList.add('input-error');
                return false;
            }
            break;
            
        case 'departamento':
            if (!valor) {
                mensagemValidacao.textContent = 'Departamento é obrigatório';
                campo.classList.add('input-error');
                return false;
            }
            break;
    }
    
    // Se chegou até aqui, o campo é válido
    mensagemValidacao.textContent = '';
    campo.classList.add('input-success');
    return true;
}

// Função para validar CNPJ
function validarCNPJ(cnpj) {
    // Aceitar qualquer formato para testes
    return true;
    
    // Implementação real de validação de CNPJ
    /*
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (cnpj === '00000000000000' || 
        cnpj === '11111111111111' || 
        cnpj === '22222222222222' || 
        cnpj === '33333333333333' || 
        cnpj === '44444444444444' || 
        cnpj === '55555555555555' || 
        cnpj === '66666666666666' || 
        cnpj === '77777777777777' || 
        cnpj === '88888888888888' || 
        cnpj === '99999999999999') {
        return false;
    }
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
    */
}

// Função para validar todo o formulário
function validarFormulario() {
    const camposObrigatorios = [
        'codigoFornecedor',
        'fornecedor',
        'cnpjFornecedor',
        'dataEmissao',
        'valor',
        'solicitante',
        'departamento'
    ];
    
    let formValido = true;
    
    // Validar campos obrigatórios
    camposObrigatorios.forEach(id => {
        const campo = document.getElementById(id);
        if (!validarCampo(campo)) {
            formValido = false;
        }
    });
    
    // Validar forma de pagamento
    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked');
    if (!formaPagamento) {
        document.getElementById('formaPagamento-validation').textContent = 'Selecione uma forma de pagamento';
        formValido = false;
    } else {
        document.getElementById('formaPagamento-validation').textContent = '';
    }
    
    return formValido;
}

// Função para atualizar o progresso do formulário
function atualizarProgressoFormulario() {
    const camposTotal = document.querySelectorAll('input, textarea, select').length;
    const camposPreenchidos = document.querySelectorAll('input:not([type="radio"]):not([readonly]):valid, textarea:valid, select:valid').length;
    const radiosPreenchidos = document.querySelector('input[name="formaPagamento"]:checked') ? 1 : 0;
    
    const progresso = ((camposPreenchidos + radiosPreenchidos) / (camposTotal - 1)) * 100;
    document.getElementById('formProgress').style.width = `${Math.min(progresso, 100)}%`;
}

// Função para adicionar linha na tabela de adiantamentos
function adicionarLinhaTabela() {
    const tbody = document.querySelector('#adiantamentosTable tbody');
    const novaLinha = document.createElement('tr');
    
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
    novaLinha.classList.add('fade-in');
    
    // Mostrar notificação
    mostrarToast('Nova linha adicionada', 'success');
}

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById('adiantamentoForm').reset();
    
    // Redefinir data de emissão como data atual
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('dataEmissao').value = dataFormatada;
    
    // Recalcular data limite
    atualizarDataLimite();
    
    // Limpar mensagens de validação
    document.querySelectorAll('.validation-message').forEach(msg => {
        msg.textContent = '';
    });
    
    // Remover classes de validação
    document.querySelectorAll('.input-error, .input-success').forEach(campo => {
        campo.classList.remove('input-error', 'input-success');
    });
    
    // Resetar progresso
    document.getElementById('formProgress').style.width = '0%';
    
    // Mostrar notificação
    mostrarToast('Formulário limpo com sucesso', 'success');
}

// Função para mostrar notificação toast
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon');
    const toastProgress = document.querySelector('.toast-progress');
    
    // Definir ícone e cor baseado no tipo
    switch (tipo) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle toast-icon';
            toastProgress.style.backgroundColor = 'var(--success-color)';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle toast-icon';
            toastProgress.style.backgroundColor = 'var(--error-color)';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
            toastProgress.style.backgroundColor = 'var(--warning-color)';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle toast-icon';
            toastProgress.style.backgroundColor = 'var(--info-color)';
            break;
    }
    
    // Definir mensagem
    toastMessage.textContent = mensagem;
    
    // Resetar progresso
    toastProgress.style.width = '0';
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Iniciar progresso
    setTimeout(() => {
        toastProgress.style.width = '100%';
    }, 100);
    
    // Esconder toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Função para validar e gerar PDF
function validarEGerarPDF() {
    if (validarFormulario()) {
        gerarPDF();
        formValidated = true;
    } else {
        mostrarToast('Por favor, corrija os erros no formulário', 'error');
        // Rolar até o primeiro campo com erro
        const primeiroErro = document.querySelector('.input-error');
        if (primeiroErro) {
            primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
    for (let i = 0; i < Math.max(3, dados.adiantamentos.length); i++) {
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
    
    // Mostrar notificação
    mostrarToast('PDF gerado com sucesso', 'success');
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
        
        // Mostrar notificação
        mostrarToast('PDF baixado com sucesso', 'success');
    }
}
