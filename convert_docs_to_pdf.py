"""
Convert LegalNexus Documentation to PDF
Converts all markdown documents to professional PDFs
"""

import re
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors

def clean_text_for_pdf(text):
    """Clean and escape text for PDF"""
    # Remove excessive markdown
    text = re.sub(r'\*\*\*([^*]+)\*\*\*', r'<b><i>\1</i></b>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    text = re.sub(r'`([^`]+)`', r'<font name="Courier">\1</font>', text)

    # Escape special characters
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;').replace('>', '&gt;')

    # Restore formatting tags
    text = text.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>')
    text = text.replace('&lt;i&gt;', '<i>').replace('&lt;/i&gt;', '</i>')
    text = text.replace('&lt;font', '<font').replace('&lt;/font&gt;', '</font>')

    return text

def parse_markdown_to_pdf(md_file, pdf_file):
    """Convert markdown file to PDF"""
    print(f"Converting: {md_file.name}")

    # Read markdown
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Create PDF
    doc = SimpleDocTemplate(
        str(pdf_file),
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )

    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=10,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=colors.HexColor('#333333'),
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        leading=14
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=colors.HexColor('#333333'),
        spaceAfter=4,
        leftIndent=20,
        bulletIndent=10,
        leading=14
    )

    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#c7254e'),
        backColor=colors.HexColor('#f9f2f4'),
        leftIndent=20,
        rightIndent=20,
        spaceAfter=6,
        fontName='Courier'
    )

    # Parse content
    lines = content.split('\n')
    i = 0
    first_title = True
    in_code_block = False
    code_lines = []

    while i < len(lines):
        line = lines[i].rstrip()

        # Skip empty lines
        if not line and not in_code_block:
            elements.append(Spacer(1, 0.1*inch))
            i += 1
            continue

        # Code blocks
        if line.startswith('```'):
            if in_code_block:
                # End code block
                code_text = '\n'.join(code_lines)
                if code_text:
                    try:
                        elements.append(Paragraph(code_text, code_style))
                    except:
                        pass
                code_lines = []
                in_code_block = False
            else:
                # Start code block
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Headers
        if line.startswith('# '):
            text = line.lstrip('# ').strip()
            if first_title:
                elements.append(Spacer(1, 0.5*inch))
                elements.append(Paragraph(text, title_style))
                elements.append(Spacer(1, 0.3*inch))
                first_title = False
            else:
                elements.append(Paragraph(text, h1_style))

        elif line.startswith('## '):
            text = line.lstrip('# ').strip()
            elements.append(Paragraph(text, h2_style))

        elif line.startswith('### '):
            text = line.lstrip('# ').strip()
            elements.append(Paragraph(text, h3_style))

        # Horizontal rule
        elif line.startswith('---'):
            elements.append(Spacer(1, 0.2*inch))
            elements.append(Table([['']], colWidths=[6.5*inch],
                                 style=[('LINEABOVE', (0,0), (-1,-1), 1, colors.grey)]))
            elements.append(Spacer(1, 0.2*inch))

        # Bullet points
        elif line.startswith(('- ', '* ', '+ ')):
            text = line.lstrip('-*+ ').strip()
            text = clean_text_for_pdf(text)
            text = '• ' + text
            try:
                elements.append(Paragraph(text, bullet_style))
            except Exception as e:
                pass

        # Numbered lists
        elif re.match(r'^\d+\.\s', line):
            text = line.strip()
            text = clean_text_for_pdf(text)
            try:
                elements.append(Paragraph(text, bullet_style))
            except:
                pass

        # Regular paragraphs
        else:
            text = line.strip()
            if text:
                text = clean_text_for_pdf(text)
                try:
                    elements.append(Paragraph(text, body_style))
                except Exception as e:
                    pass

        i += 1

    # Build PDF
    try:
        doc.build(elements)
        print(f"  [OK] Created: {pdf_file.name}")
        return True
    except Exception as e:
        print(f"  [ERROR] Failed: {e}")
        return False

def main():
    """Main conversion function"""
    print("=" * 60)
    print("LegalNexus Documentation to PDF Converter")
    print("=" * 60)
    print()

    # Files to convert
    files_to_convert = [
        'LEGALNEXUS_EXECUTIVE_OVERVIEW.md',
        'LEGALNEXUS_PAGE_INVENTORY.md',
        'LEGALNEXUS_QUICK_REFERENCE.md',
        'PRESENTATION_PACKAGE_README.md'
    ]

    # Create output directory
    output_dir = Path("documentation_pdfs")
    output_dir.mkdir(exist_ok=True)

    success_count = 0
    fail_count = 0

    # Convert each file
    for filename in files_to_convert:
        md_file = Path(filename)

        if not md_file.exists():
            print(f"[SKIP] {filename} - File not found")
            fail_count += 1
            continue

        # Output filename
        pdf_filename = md_file.stem + '.pdf'
        pdf_file = output_dir / pdf_filename

        # Convert
        if parse_markdown_to_pdf(md_file, pdf_file):
            success_count += 1
        else:
            fail_count += 1

        print()

    # Summary
    print("=" * 60)
    print("CONVERSION COMPLETE!")
    print("=" * 60)
    print(f"Successful: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Total: {success_count + fail_count}")
    print()
    print(f"Output directory: {output_dir.absolute()}")
    print()

    if success_count > 0:
        print("PDF files created:")
        for pdf_file in sorted(output_dir.glob('*.pdf')):
            size_kb = pdf_file.stat().st_size / 1024
            print(f"  - {pdf_file.name} ({size_kb:.1f} KB)")

    print()
    print("Ready to distribute!")

if __name__ == "__main__":
    main()
