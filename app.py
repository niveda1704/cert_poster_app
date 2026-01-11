import os
import uuid
import zipfile
from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
from werkzeug.utils import secure_filename
from utils.ai_engine import AIEngine
from utils.pdf_generator import GeneratorEngine
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'data'
app.config['GENERATED_FOLDER'] = 'generated'

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)

ai_engine = AIEngine(api_key=os.getenv("GEMINI_API_KEY"))
gen_engine = GeneratorEngine()

@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/generate/poster')
def generate_poster_page():
    return render_template('poster/generator.html')

@app.route('/generate/certificate')
def generate_certificate_page():
    # Reuse poster template for now or create specific one
    return render_template('poster/generator.html') 

@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Handle Form Data (Multipart)
        prompt = request.form.get('prompt')
        logo_file = request.files.get('logo')
        
        # ... (rest of logic)
        language = request.form.get('language', 'English')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Save logo if uploaded
        logo_path = None
        if logo_file:
            filename = secure_filename(logo_file.filename)
            logo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            logo_file.save(logo_path)

        # 1. Parse prompt with AI
        design_spec = ai_engine.parse_prompt(prompt, language)
        if logo_path: design_spec['logo_path'] = logo_path # Pass logo to spec
        cert_id = str(uuid.uuid4())[:8]
        design_spec['id'] = cert_id
        
        # 2. Generate Poster Background using AI Image model
        image_url = ai_engine.generate_poster_image(design_spec)
        
        # 3. Generate Final PDF and Image
        poster_path, cert_path = gen_engine.create_outputs(design_spec, image_url, cert_id)

        return jsonify({
            "status": "success",
            "poster_url": url_for('get_generated', filename=os.path.basename(poster_path)),
            "cert_url": url_for('get_generated', filename=os.path.basename(cert_path)),
            "design_spec": design_spec
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/bulk', methods=['POST'])
def bulk_generate():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        prompt = request.form.get('prompt', 'Certificate of Participation')
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process CSV
        import csv
        zip_filename = f"bulk_{uuid.uuid4().hex[:6]}.zip"
        zip_path = os.path.join(app.config['GENERATED_FOLDER'], zip_filename)
        
        generated_files = []
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                name = row.get('name', 'Participant')
                event = row.get('event', 'the Event')
                custom_prompt = f"Create a certificate for {name} for participating in {event}. {prompt}"
                
                # In bulk, we reuse design but change name
                spec = ai_engine.parse_prompt(custom_prompt)
                cert_id = str(uuid.uuid4())[:8]
                image_url = "https://images.unsplash.com/photo-1557683316-973673baf926" # Fast fallback for bulk
                _, cert_path = gen_engine.create_outputs(spec, image_url, cert_id)
                generated_files.append(cert_path)

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for f in generated_files:
                zipf.write(f, os.path.basename(f))

        return jsonify({"status": "bulk_completed", "zip_url": url_for('get_generated', filename=zip_filename)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify/<cert_id>')
def verify(cert_id):
    # Mock verification logic
    return render_template('index.html', verified_id=cert_id)

@app.route('/generated/<filename>')
def get_generated(filename):
    return send_from_directory(app.config['GENERATED_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
