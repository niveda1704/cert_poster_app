# 🦩 Flamingo Studio - AI Design Generator

**Flamingo Studio** is a state-of-the-art web application that leverages Generative AI to instantly create professional **Posters** and **Certificates** from simple natural language descriptions.

Built with a focus on modern aesthetics ("Tropical Minimalist"), interactivity, and ease of use, it allows creating marketing assets and recognition documents in seconds.

![Flamingo Studio UI](https://via.placeholder.com/800x400?text=Flamingo+Studio+Dashboard)

## ✨ Key Features

*   **🎨 Dual Design Modes**:
    *   **Poster Mode**: Create marketing materials for Hackathons, Concerts, Workshops, and Sales.
    *   **Certificate Mode**: Generate creating Awards, Diplomas, and Badges.
*   **🧠 AI-Powered Generation**: Uses **Google Gemini** to understand prompts and **Pollinations.ai** to generate high-quality background visuals tailored to your theme.
*   **🏢 Custom Branding**:
    *   Upload your **School/Company Logo**.
    *   AI automatically composites it onto the generated design (Default: Top-Right).
*   **⚡ Interactive & "Juicy" UI**:
    *   **3D Tilt Cards**: Previews react physically to your mouse movement.
    *   **Liquid Cursor**: Custom fluid visual cursor.
    *   **Confetti Celebration**: Bursts of joy when your generation is complete.
*   **🎙️ Voice Input**: Speak your vision instead of typing.
*   **🚀 Quick Templates**: One-click presets for common use cases (e.g., "Tech Hackathon", "Corporate Award").
*   **📦 Bulk Generation**: Upload a CSV file to generate hundreds of personalized certificates/posters in one go.
*   **🌍 Multi-Language Support**: Prompts work in English, Tamil, Hindi, Spanish, etc.

## 🛠️ Technology Stack

*   **Backend**: Python, Flask
*   **AI Core**: Google Gemini (via `google-generativeai`), Pollinations.ai
*   **Image Processing**: Pillow (PIL), ReportLab (PDF Generation), QRCode
*   **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (Vanilla Tilt, Canvas Confetti)
*   **Icons**: Lucide Icons

## 🚀 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/flamingo-studio.git
    cd flamingo-studio
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the Application**
    ```bash
    python app.py
    ```

5.  **Access the Dashboard**
    Open your browser and navigate to: [http://localhost:5000](http://localhost:5000)

## 📂 Project Structure

```
flamingo-studio/
├── app.py                 # Main Flask Application & Routes
├── requirements.txt       # Python Dependencies
├── utils/
│   ├── ai_engine.py       # Gemini AI integration for text analysis
│   └── pdf_generator.py   # Graphics engine for compositing images & PDFs
├── static/
│   ├── style.css          # Modern "Flamingo" Theme CSS
│   ├── app.js             # Frontend logic (Cursor, Confetti, API calls)
│   └── flamingo_logo.png  # Assets
└── templates/
    ├── welcome.html       # Landing Page
    ├── poster/
    │   └── generator.html # Dedicated Poster Generator
    └── shared/
        └── layout.html    # Base Jinja2 Layout
```

## 📝 Usage Guide

1.  **Select Mode**: On the welcome screen, choose **"Create Poster"** or **"Create Certificate"**.
2.  **Upload Logo (Optional)**: Drag & drop your institution's logo to brand your designs.
3.  **Enter Prompt**:
    *   *Type*: "A futuristic sci-fi hackathon poster for AI week."
    *   *Template*: Click a "Quick Template" chip to auto-fill a professional prompt.
    *   *Voice*: Click the Mic icon and speak.
4.  **Generate**: Click the button and watch the magic happen!
5.  **Download**: Get your high-res **PNG** poster or print-ready **PDF** certificate instantly.

---

*Built with ❤️ (and a lot of pink) by the Flamingo Studio Team.*
