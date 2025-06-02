
from weasyprint import HTML, CSS
import os

# Define paths relative to the script location or a known base directory
base_dir = "/home/ubuntu/upload" # Use the upload directory
html_file_path = os.path.join(base_dir, "index.html")
css_file_path = os.path.join(base_dir, "styles.css") # We might need to explicitly load CSS if relative paths in HTML don't work
output_pdf_path = os.path.join(base_dir, "formulario_weasyprint.pdf")

try:
    # Load HTML. WeasyPrint should handle linked CSS if paths are correct relative to HTML.
    # Alternatively, load CSS explicitly:
    # css = CSS(filename=css_file_path)
    # html = HTML(filename=html_file_path, base_url=base_dir) # base_url helps resolve relative paths
    
    html = HTML(filename=html_file_path) # Simplest approach first

    # Render the PDF
    html.write_pdf(output_pdf_path) #, stylesheets=[css]) # Add stylesheets=[css] if loading CSS explicitly

    print(f"PDF (layout base) gerado com sucesso: {output_pdf_path}")

except FileNotFoundError as e:
    print(f"Erro: Arquivo não encontrado - {e}")
except Exception as e:
    print(f"Erro ao gerar PDF com WeasyPrint: {e}")
