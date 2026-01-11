import os
import requests
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch
import qrcode
from io import BytesIO

class GeneratorEngine:
    def __init__(self):
        self.output_dir = "generated"

    def create_outputs(self, spec, image_url, cert_id):
        """
        Creates both the PNG poster and the PDF certificate.
        """
        # 1. Download/Load Background
        bg_img = None
        try:
            if image_url and image_url.startswith('http'):
                print(f"Downloading image from: {image_url}")
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                bg_img = Image.open(BytesIO(response.content))
                bg_img.verify() # Verify it's an image
                bg_img = Image.open(BytesIO(response.content)) # Re-open after verify
        except Exception as e:
            print(f"Image download failed ({e}). Using fallback color.")
            bg_img = None

        if not bg_img:
            bg_img = Image.new('RGB', (1024, 1024), color=spec.get('colors', {}).get('primary', '#1a2a6c'))

        # 2. Save Poster (PNG)
        poster_filename = f"poster_{cert_id}.png"
        poster_path = os.path.join(self.output_dir, poster_filename)
        
        # Overlay content on poster
        draw = ImageDraw.Draw(bg_img)
        width, height = bg_img.size
        
        # Try to load a font
        font_path = "arial.ttf"
        try:
            # Common Windows paths
            if os.path.exists("C:/Windows/Fonts/Arial.ttf"): font_path = "C:/Windows/Fonts/Arial.ttf"
            elif os.path.exists("C:/Windows/Fonts/Seguibl.ttf"): font_path = "C:/Windows/Fonts/Seguibl.ttf"
            
            title_font = ImageFont.truetype(font_path, int(width/10))
            subtitle_font = ImageFont.truetype(font_path, int(width/20))
            detail_font = ImageFont.truetype(font_path, int(width/30))
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            detail_font = ImageFont.load_default()

        # Helper to draw centered text
        def draw_centered(text, y, font, color="white"):
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            draw.text(((width - text_w) / 2, y), text, font=font, fill=color)
            return bbox[3] - bbox[1] # height

        # Draw Poster Text
        primary_color = "white" # High contrast default
        # If background is light, switch to black, else white. Simple heuristic?
        # For now, let's assume the user might provide a "TextColor" or we pick white/black based on primary.
        # But looking at prompt "colors": {"primary":...}, the primary IS the background usually.
        # So text should be white or secondary. 
        # Let's default to white for dark/colorful backgrounds.
        
        y_pos = height * 0.2
        
        # 1. Event Title
        title_text = spec.get('event', spec.get('title', 'Event Name')).upper()
        draw_centered(title_text, y_pos, title_font, color="white")
        y_pos += int(width/8)

        # 2. Tagline
        tagline = spec.get('tagline', '')
        if tagline:
            draw_centered(tagline, y_pos, subtitle_font, color="#ddd")
            y_pos += int(width/15)

        # 3. Details (Date, Time, Venue)
        details = []
        if spec.get('date'): details.append(f"📅 {spec['date']}")
        if spec.get('time'): details.append(f"⏰ {spec['time']}")
        if spec.get('venue'): details.append(f"📍 {spec['venue']}")
        
        y_pos = height * 0.7 # Push to bottom
        for det in details:
            draw_centered(det, y_pos, detail_font, color="#eee")
            y_pos += int(width/25)

        # 4. Composite Logo if present
        if 'logo_path' in spec and spec['logo_path']:
             try:
                 logo = Image.open(spec['logo_path']).convert("RGBA")
                 # Resize logo to be reasonable (e.g. 15% of width)
                 target_w = int(width * 0.15)
                 ratio = target_w / logo.width
                 target_h = int(logo.height * ratio)
                 logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
                 
                 # Position (Default Top Right)
                 # Margin
                 m = int(width * 0.05)
                 logo_x = width - target_w - m
                 logo_y = m
                 
                 # Paste (using logo itself as mask for transparency)
                 bg_img.paste(logo, (logo_x, logo_y), logo)
             except Exception as e:
                 print(f"Error adding logo: {e}")

        bg_img.save(poster_path)

        # 3. Generate QR Code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f"https://yourdomain.com/verify/{cert_id}")
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_path = os.path.join(self.output_dir, f"qr_{cert_id}.png")
        qr_img.save(qr_path)

        # 4. Generate PDF Certificate
        pdf_filename = f"cert_{cert_id}.pdf"
        pdf_path = os.path.join(self.output_dir, pdf_filename)
        c = canvas.Canvas(pdf_path, pagesize=landscape(A4))
        width, height = landscape(A4)

        # Draw background image on PDF
        c.drawImage(poster_path, 0, 0, width=width, height=height)

        # Add Design Elements
        c.setStrokeColor(spec['colors']['accent'])
        c.setLineWidth(5)
        c.rect(20, 20, width-40, height-40) # Border

        # Text Layout
        c.setFillColor(spec['colors']['primary'])
        c.setFont("Helvetica-Bold", 40)
        c.drawCentredString(width/2, height - 150, spec['title'].upper())

        c.setFillColor("black")
        c.setFont("Helvetica", 20)
        c.drawCentredString(width/2, height - 220, "This is to certify that")

        c.setFillColor(spec['colors']['secondary'])
        c.setFont("Helvetica-Bold", 50)
        c.drawCentredString(width/2, height - 300, spec['name'])

        c.setFillColor("black")
        c.setFont("Helvetica", 18)
        c.drawCentredString(width/2, height - 360, f"has successfully participated in {spec['event']}")

        # Add QR Code to PDF
        c.drawImage(qr_path, width - 120, 50, width=80, height=80)
        c.setFont("Helvetica", 8)
        c.drawString(width - 120, 40, f"Verify: {cert_id}")

        c.save()

        return poster_path, pdf_path
