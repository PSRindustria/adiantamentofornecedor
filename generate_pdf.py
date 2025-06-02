# -*- coding: utf-8 -*-
from fpdf import FPDF
import datetime

# Helper function to safely get data
def get_data(data_dict, key, default=''):
    return data_dict.get(key, default) if data_dict.get(key) else default

def format_currency(value_str):
    """Formats a string like '1234,56' to 'R$ 1.234,56'. Handles None or empty."""
    if not value_str:
        return 'R$ 0,00'
    try:
        # Remove non-digit characters except comma
        cleaned_value = ''.join(filter(lambda x: x.isdigit() or x == ',', str(value_str)))
        # Replace comma with dot for float conversion
        numeric_value = float(cleaned_value.replace(',', '.'))
        # Format as BRL currency
        # Use a temporary placeholder for comma to avoid issues with thousand separator
        return f'R$ {numeric_value:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    except ValueError:
        return 'R$ 0,00' # Return default if conversion fails

def format_date(date_str):
    """Formats a date string 'YYYY-MM-DD' to 'DD/MM/YYYY'. Handles None or empty."""
    if not date_str:
        return '__/__/____'
    try:
        return datetime.datetime.strptime(date_str, '%Y-%m-%d').strftime('%d/%m/%Y')
    except ValueError:
        return '__/__/____'

def create_pdf(data, image_path, logo_path, output_path):
    # Image dimensions in pixels: 862x1316
    # Using pixels directly as points (1 pt = 1/72 inch)
    img_w_pt = 862
    img_h_pt = 1316

    pdf = FPDF(unit='pt', format=(img_w_pt, img_h_pt))
    pdf.add_page()
    pdf.set_auto_page_break(auto=False, margin=0)

    # Add background image (the form template)
    pdf.image(image_path, x=0, y=0, w=img_w_pt, h=img_h_pt)

    # Add the new logo to the header
    logo_x = 30  # Points from left
    logo_y = 20  # Points from top
    logo_w = 200 # Width in points (adjust as needed)
    pdf.image(logo_path, x=logo_x, y=logo_y, w=logo_w, h=0)

    # Set font
    try:
        pdf.set_font('Helvetica', '', 10)
    except RuntimeError:
        print('Helvetica font not found, trying Arial')
        try:
            pdf.set_font('Arial', '', 10)
        except RuntimeError:
             print('Arial font not found. Using default font.')
             pass # Continue with default

    pdf.set_text_color(0, 0, 0)
    pdf.set_margins(0, 0, 0)

    # --- Fill Fields (Coordinates estimated in points, may need adjustment) ---
    field_coords = {
        # Left Column
        'codigoFornecedor': (165, 133),
        'fornecedor': (135, 178),
        'cnpjFornecedor': (165, 223),
        'dataEmissao': (165, 268),
        'dataPagamento': (195, 313),
        'ordemCompra': (175, 358),
        'valor': (105, 403),
        'solicitante_form': (135, 493), # Field from form
        'departamento': (155, 538),
        'dataLimitePrestacao': (255, 583),
        # Right Column - Finalidade
        'finalidade': (450, 133), # Multi-line
        # Right Column - Dados Pagamento
        'beneficiario': (555, 303),
        'cpfCnpj': (555, 328),
        'banco': (555, 353),
        'agencia': (555, 378),
        'conta': (555, 403),
        'tipoConta': (555, 428),
        'chavePix': (555, 453),
        # Bottom Signature
        'solicitante_sig': (155, 1155) # Name for signature line
    }

    # Place simple text fields
    for key, (x, y) in field_coords.items():
        value = ''
        if key == 'valor':
            value = format_currency(get_data(data, key))
        elif key in ['dataEmissao', 'dataPagamento', 'dataLimitePrestacao']:
             value = format_date(get_data(data, key))
        elif key == 'solicitante_sig': # Use solicitante form value for signature
             value = get_data(data, 'solicitante')
        elif key == 'solicitante_form': # Use solicitante form value for form field
             value = get_data(data, 'solicitante')
        else:
            value = get_data(data, key)

        pdf.set_xy(x, y)
        if key == 'finalidade':
            pdf.multi_cell(380, 15, txt=value, border=0, align='L') # Adjust width/height
        else:
            pdf.cell(200, 10, txt=value, border=0, ln=0, align='L') # Adjust width/height

    # Handle Forma de Pagamento Checkboxes
    forma_pagamento = get_data(data, 'formaPagamento')
    checkbox_mark = 'X'
    pdf.set_font_size(12)
    if forma_pagamento == 'PIX/TED':
        pdf.set_xy(158, 445)
        pdf.cell(15, 15, txt=checkbox_mark, border=0, ln=0, align='C')
    elif forma_pagamento == 'BOLETO':
        pdf.set_xy(258, 445)
        pdf.cell(15, 15, txt=checkbox_mark, border=0, ln=0, align='C')
    pdf.set_font_size(10)

    # Handle Adiantamentos em Aberto Table
    table_data = data.get('adiantamentos', [])
    start_y = 675
    row_height = 25
    col_x = {
        'oc': 80,
        'data': 355,
        'valor': 655
    }
    max_rows = 10 # Updated max rows

    for i, row in enumerate(table_data):
        if i >= max_rows:
            break
        current_y = start_y + (i * row_height)

        # Ordem Compra
        pdf.set_xy(col_x['oc'], current_y)
        pdf.cell(150, 10, txt=get_data(row, 'oc'), border=0, align='L')

        # Data Limite
        pdf.set_xy(col_x['data'], current_y)
        pdf.cell(100, 10, txt=format_date(get_data(row, 'data')), border=0, align='L')

        # Valor
        pdf.set_xy(col_x['valor'], current_y)
        pdf.cell(100, 10, txt=format_currency(get_data(row, 'valor')), border=0, align='L')

    # Output PDF
    pdf.output(output_path)
    print(f'PDF generated successfully: {output_path}')

# --- Example Usage ---
if __name__ == '__main__':
    # Sample data mimicking form submission (Corrected)
    sample_data = {
        'codigoFornecedor': '12345',
        'fornecedor': 'EMPRESA EXEMPLO LTDA',
        'cnpjFornecedor': '11.222.333/0001-44',
        'dataEmissao': '2025-06-02',
        'dataPagamento': '2025-06-10',
        'ordemCompra': 'OC-9876',
        'valor': '1500,50',
        'formaPagamento': 'PIX/TED',
        'solicitante': 'Fulano de Tal',
        'departamento': 'Financeiro',
        'dataLimitePrestacao': '2025-07-02',
        'finalidade': 'Adiantamento para compra de material de escritório urgente conforme pedido XYZ. Necessário pagamento rápido.',
        'beneficiario': 'EMPRESA EXEMPLO LTDA',
        'cpfCnpj': '11.222.333/0001-44',
        'banco': 'BANCO EXEMPLO S.A.',
        'agencia': '0001',
        'conta': '12345-6',
        'tipoConta': 'Corrente',
        'chavePix': 'pix@empresaexemplo.com',
        'adiantamentos': [
            {'oc': 'OC-111', 'data': '2025-05-15', 'valor': '500,00'},
            {'oc': 'OC-222', 'data': '2025-05-20', 'valor': '250,75'},
            {'oc': 'OC-333', 'data': '2025-05-21', 'valor': '100,00'},
            {'oc': 'OC-444', 'data': '2025-05-22', 'valor': '50,50'},
            {'oc': 'OC-555', 'data': '2025-05-23', 'valor': '123,45'},
            {'oc': 'OC-666', 'data': '2025-05-24', 'valor': '678,90'},
            {'oc': 'OC-777', 'data': '2025-05-25', 'valor': '11,22'},
            {'oc': 'OC-888', 'data': '2025-05-26', 'valor': '33,44'},
            {'oc': 'OC-999', 'data': '2025-05-27', 'valor': '55,66'},
            {'oc': 'OC-000', 'data': '2025-05-28', 'valor': '77,88'}
        ]
    }

    image_file = '/home/ubuntu/assets/image_no_small_logo.png' # Use edited background
    logo_file = '/home/ubuntu/assets/logo_cabecalho.png'
    output_file = '/home/ubuntu/formulario_adiantamento_10_linhas.pdf' # New output name

    create_pdf(sample_data, image_file, logo_file, output_file)

