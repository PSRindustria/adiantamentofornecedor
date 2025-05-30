from weasyprint import HTML

# Carrega o HTML e o CSS vinculado (incluindo @media print)
html = HTML(filename='/home/ubuntu/formulario_otimizado/index.html')

# Renderiza o PDF aplicando os estilos de impressão
html.write_pdf('/home/ubuntu/formulario_otimizado/formulario_a4_otimizado.pdf')

print("PDF gerado com sucesso: /home/ubuntu/formulario_otimizado/formulario_a4_otimizado.pdf")

