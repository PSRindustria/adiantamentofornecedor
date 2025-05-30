# Instruções de Uso - Formulário de Adiantamento à Fornecedor

Este aplicativo permite preencher o formulário de adiantamento à fornecedor e gerar um PDF com os dados preenchidos, seguindo fielmente o layout do documento original.

## Como usar

1. Abra o arquivo `index.html` em qualquer navegador web moderno
2. Preencha os campos do formulário conforme necessário
3. Clique no botão "Gerar PDF" no final do formulário
4. Uma prévia do PDF será exibida na tela
5. Clique em "Baixar PDF" para salvar o documento em seu computador

## Funcionalidades

- Preenchimento de todos os campos do formulário original
- Seleção de forma de pagamento (PIX/TED ou BOLETO)
- Preenchimento de dados bancários e chave PIX
- Registro de adiantamentos em aberto
- Geração automática de PDF com layout fiel ao original
- Data de emissão preenchida automaticamente com a data atual
- Data limite para prestação de contas calculada automaticamente (30 dias após a emissão)

## Arquivos incluídos

- `index.html`: Estrutura do formulário
- `styles.css`: Estilos e aparência visual
- `script.js`: Lógica de funcionamento e geração do PDF

## Requisitos técnicos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet para carregar as bibliotecas externas (jsPDF e html2canvas)

## Observações

- O PDF gerado pode ser impresso ou enviado por e-mail
- Todos os dados são processados localmente, sem envio para servidores externos
- O formulário pode ser hospedado em qualquer servidor web ou executado localmente
