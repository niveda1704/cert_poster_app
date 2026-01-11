import os
import json
import google.generativeai as genai

class AIEngine:
    def __init__(self, api_key):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            # Dynamically find a supported model
            self.model = None
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        if 'gemini' in m.name:
                            self.model = genai.GenerativeModel(m.name)
                            print(f"Selected AI Model: {m.name}")
                            break
            except Exception as e:
                print(f"Error listing models: {e}")
            
            # Fallback if auto-discovery fails
            if not self.model:
                 print("Warning: Could not auto-discover model. Defaulting to gemini-pro.")
                 self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None

    def parse_prompt(self, prompt, language="English"):
        """
        Uses Gemini to extract structured data from a natural language prompt.
        """
        if not self.model:
            return {
                "name": "Candidate Name",
                "event": "AI Innovation Challenge",
                "title": "Certificate of Excellence",
                "colors": {"primary": "#1a2a6c", "secondary": "#b21f1f", "accent": "#fdbb2d"},
                "font_style": "Serif",
                "theme": "Modern Professional",
                "language": language
            }

        sys_prompt = f"""
        Extract certificate details from the user prompt into JSON.
        Required keys: 
        - name
        - event
        - title
        - colors (keys: primary, secondary, accent - all hex)
        - font_style
        - theme
        - date (e.g. "January 22, 2026")
        - time (e.g. "9:00 AM")
        - venue (e.g. "Main Hall")
        - tagline (short description)
        
        Target Language: {language}
        Return ONLY valid JSON.
        """
        
        response = self.model.generate_content(f"{sys_prompt}\n\nUser Input: {prompt}")
        
        # Clean response text (Gemini sometimes adds markdown code blocks)
        text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(text)
        except Exception as e:
            print(f"JSON Parsing Error: {e} | Text: {text}")
            return self.parse_prompt("fallback", language) # Simple recursive fallback

    def generate_poster_image(self, spec):
        """
        Note: Standard Gemini SDK is primarily for Text/Multimodal INPUT.
        For high-quality Image Generation (OUTPUT), Imagen via Vertex AI or 
        a third-party fallback is typically used.
        Here we use a thematic gradient generator or Image Search API if Imagen isn't linked.
        """
        # Since Imagen 3 often requires specific permissions in the standard SDK,
        # we will provide a beautiful thematic fallback URL that matches the extracted theme.
        theme = spec.get('theme', 'abstract')
        primary = spec.get('colors', {}).get('primary', '#1a2a6c').replace('#', '')
        
        # Using Pollinations.ai for real AI image generation (No API key needed)
        # We clean the prompt to be URL safe
        import urllib.parse
        safe_prompt = urllib.parse.quote(f"{spec.get('theme', 'abstract')} background in {spec.get('colors', {}).get('primary', 'blue')} colors, high quality, 4k, without text")
        return f"https://image.pollinations.ai/prompt/{safe_prompt}?nologo=true"
