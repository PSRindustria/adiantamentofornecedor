# Documentação do Formulário de Adiantamento à Fornecedor

## Visão Geral

Este projeto consiste em um formulário web para adiantamento à fornecedor, com design moderno e responsivo, seguindo as melhores práticas de UI/UX. O formulário permite ao usuário preencher todos os dados necessários e gerar um PDF com layout idêntico ao modelo Excel original.

## Melhorias Implementadas

### Design UI/UX Avançado
- **Interface moderna e responsiva**: Layout adaptável a diferentes tamanhos de tela
- **Hierarquia visual clara**: Organização lógica dos campos e seções
- **Microinterações**: Feedback visual em tempo real durante interação
- **Barra de progresso**: Indicador visual do preenchimento do formulário
- **Tooltips informativos**: Ajuda contextual para cada campo
- **Ícones intuitivos**: Melhoria na identificação visual dos campos
- **Esquema de cores profissional**: Paleta baseada no azul institucional

### Validação e Feedback
- **Validação em tempo real**: Feedback imediato sobre erros de preenchimento
- **Mensagens de validação claras**: Instruções específicas para correção
- **Notificações toast**: Alertas não-intrusivos para ações do usuário
- **Destaque visual**: Campos com erro ou sucesso são destacados visualmente
- **Foco automático**: Rolagem automática para o primeiro campo com erro

### Funcionalidades Aprimoradas
- **Máscaras de entrada**: Formatação automática para CNPJ e CPF
- **Cálculo automático de datas**: Data limite calculada a partir da data de emissão
- **Campos condicionais**: Exibição dinâmica de campos baseada na forma de pagamento
- **Adição dinâmica de linhas**: Possibilidade de adicionar mais linhas na tabela de adiantamentos
- **Botão de limpar formulário**: Reinicialização rápida de todos os campos

### Geração de PDF
- **Layout fiel ao Excel**: PDF gerado mantém a mesma estrutura visual do modelo original
- **Visualização prévia**: Pré-visualização do PDF antes do download
- **Nomeação automática**: Nome do arquivo baseado no fornecedor e data
- **Campos formatados**: Valores monetários e datas exibidos no formato brasileiro

## Estrutura de Arquivos

- **index.html**: Estrutura do formulário com HTML semântico
- **styles.css**: Estilos visuais e responsividade
- **script.js**: Lógica de validação, interação e geração do PDF
- **documentacao.md**: Este arquivo de documentação

## Requisitos Técnicos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet para carregar as bibliotecas externas (jsPDF e html2canvas)

## Bibliotecas Utilizadas

- **jsPDF**: Geração de documentos PDF
- **html2canvas**: Captura de elementos HTML para o PDF
- **Font Awesome**: Ícones utilizados na interface

## Como Usar

1. Abra o arquivo `index.html` em qualquer navegador web moderno
2. Preencha os campos do formulário conforme necessário
3. Observe a barra de progresso indicando o preenchimento
4. Corrija eventuais erros destacados em vermelho
5. Clique no botão "Gerar PDF" no final do formulário
6. Uma prévia do PDF será exibida na tela
7. Clique em "Baixar PDF" para salvar o documento em seu computador

## Observações

- O formulário pode ser hospedado em qualquer servidor web ou executado localmente
- Todos os dados são processados no navegador do usuário, sem envio para servidores externos
- O PDF gerado mantém fidelidade visual ao modelo Excel original
- A interface foi projetada para ser intuitiva e acessível a todos os usuários
