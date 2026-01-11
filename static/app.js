document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const promptInput = document.getElementById('prompt');
    const languageSelect = document.getElementById('language');
    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');

    const posterImg = document.getElementById('poster-img');
    const certPdf = document.getElementById('cert-pdf');
    const posterActions = document.getElementById('poster-actions');
    const certActions = document.getElementById('cert-actions');

    const downloadPoster = document.getElementById('download-poster');
    const downloadCert = document.getElementById('download-cert');

    // --- MODE & TEMPLATES LOGIC ---
    let currentMode = 'poster';
    const modeBtns = document.querySelectorAll('.mode-btn');
    const templatePoster = document.getElementById('templates-poster');
    const templateCert = document.getElementById('templates-certificate');

    const templates = {
        // Posters
        tech_hackathon: "Futuristic Hackathon Poster for 'AI Sprint 2026'. Dark background #0f172a, Neon Cyan accents. Glitch effect. Bold, monospace typography. Date: Oct 12, Venue: Cyber Hall. Tagline: 'Code the Future'.",
        music_concert: "Vibrant Music Concert Poster for 'Summer Vibes'. Sunset gradients (orange/pink/purple). Silhouette of crowd and guitar. Bold retro font. Date: July 15, Venue: Beach Arena.",
        workshop: "Professional Workshop Flyer for 'Digital Marketing 101'. Clean white layout with Blue #2563eb geometry. Modern sans-serif text. Photo of speaker. Date: Sept 05.",
        sale: "Bold 'Year End Sale' Poster. Bright Red #dc2626 background. Large White % text. Minimalist and punchy. Tagline: 'Up to 70% Off'.",

        // Certificates
        corp_award: "Elegant Award of Excellence for 'John Smith'. Navy Blue #1e3a8a background. Gold #d97706 foil decorative border. Serif font (Merriweather). High-end professional look. Date: Dec 10, 2026.",
        diploma: "Classic Diploma Certificate. Cream #fffdd0 parchment background. Traditional ornamental borders in Oxford Blue. Old English font for title. Watermark seal.",
        appreciation: "Certificate of Appreciation for 'Jane Doe'. Clean white background with Green #059669 leafy accents. Modern minimal style. Sans-serif font.",
        participation: "Vibrant Certificate of Participation. Geometric patterns in Pink #db2777 and Purple. Playful but organized. Suitable for coding bootcamp."
    };

    // Mode Toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;

            // Visual Toggle
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show relevant templates
            if (currentMode === 'poster') {
                templatePoster.classList.remove('hidden');
                templateCert.classList.add('hidden');
                promptInput.placeholder = "Describe your event poster (e.g. 'Minimalist movie poster for sci-fi film')...";
                // Hide Cert Preview? Maybe keep both visible but focus on one. 
                // For now, let's keep the dashboard as is, just the input presets change.
            } else {
                templatePoster.classList.add('hidden');
                templateCert.classList.remove('hidden');
                promptInput.placeholder = "Describe your certificate (e.g. 'Formal gold-border diploma for completion')...";
            }
        });
    });

    // Template Click
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.template;
            if (templates[type]) {
                promptInput.value = templates[type];
                promptInput.style.borderColor = "var(--primary)";
                setTimeout(() => promptInput.style.borderColor = "var(--border-subtle)", 500);
            }
        });
    });

    // 0. Custom Cursor Logic
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight delay
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // 1. Generation Logic
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return alert('Please enter a description!');

        // UI State
        statusContainer.classList.remove('hidden');
        generateBtn.disabled = true;
        document.querySelectorAll('.empty-state').forEach(m => m.classList.add('hidden')); // Logic inverted in new design? No.

        // Actually, distinct empty-state handling needed logic:
        // When generating, we want to perhaps keep them until replaced, or hide them.
        // Let's hide them for cleaner loading.
        document.querySelectorAll('.empty-state').forEach(m => m.classList.add('hidden'));

        posterImg.classList.add('hidden');
        certPdf.classList.add('hidden');
        posterActions.classList.add('hidden');
        certActions.classList.add('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    language: languageSelect.value
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update Previews
                posterImg.src = data.poster_url;
                certPdf.src = data.cert_url;

                downloadPoster.href = data.poster_url;
                downloadCert.href = data.cert_url;

                // Show results
                posterImg.classList.remove('hidden');
                certPdf.classList.remove('hidden');
                posterActions.classList.remove('hidden');
                certActions.classList.remove('hidden');

                // Ensure empty states stay hidden
                document.querySelectorAll('.empty-state').forEach(m => m.classList.add('hidden'));

                // TRIGGER CONFETTI
                if (window.confetti) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#e11d48', '#fb7185', '#be123c', '#ffffff'] // Flamingo Palette
                    });
                }
                certActions.classList.remove('hidden');

                // Ensure empty states stay hidden
                document.querySelectorAll('.empty-state').forEach(m => m.classList.add('hidden'));
            } else {
                alert('Generation failed: ' + data.error);
                // Restore empty states if failed
                document.querySelectorAll('.empty-state').forEach(m => m.classList.remove('hidden'));
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while generating.');
            document.querySelectorAll('.empty-state').forEach(m => m.classList.remove('hidden'));
        } finally {
            statusContainer.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    // 2. Voice Input (Web Speech API)
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceBtn.addEventListener('click', () => {
            voiceBtn.classList.add('listening');
            statusText.innerText = "Listening...";
            // Don't cover screen, just indicate
            // statusContainer.classList.remove('hidden'); 
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            promptInput.value = transcript;
            voiceBtn.classList.remove('listening');
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('listening');
            alert('Voice recognition error.');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };

    } else {
        voiceBtn.style.display = 'none';
    }

    // 3. Bulk Upload Handler
    const bulkBtn = document.getElementById('bulk-btn');
    bulkBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('csv-file');
        if (!fileInput.files[0]) return alert('Upload a CSV first!');

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        statusText.innerText = "Processing bulk data...";
        statusContainer.classList.remove('hidden');

        try {
            const response = await fetch('/bulk', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            alert('Bulk process initiated! Download link: ' + data.zip_url);
        } catch (e) {
            alert('Bulk error.');
        } finally {
            statusContainer.classList.add('hidden');
        }
    });

    // 4. Theme Memory (LocalStorage) - Updated for Sidebar
    const saveThemeBtn = document.createElement('button');
    saveThemeBtn.innerHTML = "<i data-lucide='bookmark-plus'></i> Save Prompt";
    saveThemeBtn.className = "secondary-btn";
    saveThemeBtn.style.marginTop = "8px";
    saveThemeBtn.style.display = "flex";
    saveThemeBtn.style.alignItems = "center";
    saveThemeBtn.style.justifyContent = "center";
    saveThemeBtn.style.gap = "8px";

    // Insert after textarea
    document.querySelector('.textarea-wrapper').after(saveThemeBtn);

    // Refresh icons since we added one dynamically
    if (window.lucide) lucide.createIcons();

    const themesContainer = document.createElement('div');
    themesContainer.className = "themes-section";
    themesContainer.style.marginTop = "20px";
    themesContainer.innerHTML = "<label class='section-label'><i data-lucide='history'></i> Saved Prompts</label><div id='themes-list' style='display:flex; flex-wrap:wrap; gap:8px;'></div>";

    // Append to controls wrapper
    document.querySelector('.controls-wrapper').appendChild(themesContainer);
    if (window.lucide) lucide.createIcons();

    const updateThemesUI = () => {
        const themes = JSON.parse(localStorage.getItem('ai_themes') || '[]');
        const list = document.getElementById('themes-list');
        if (themes.length === 0) {
            list.innerHTML = "<span style='color:var(--text-muted); font-size:0.8rem;'>No saved prompts yet.</span>";
        } else {
            list.innerHTML = themes.map((t, i) => `
                <div class="theme-chip" 
                     style="background:rgba(255,255,255,0.05); border:1px solid var(--panel-border); padding:6px 12px; border-radius:12px; cursor:pointer; font-size:0.8rem; color:var(--text-muted); transition:0.2s;" 
                     onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                     onmouseout="this.style.background='rgba(255,255,255,0.05)'"
                     onclick="document.getElementById('prompt').value='${t.replace(/'/g, "\\'")}'">
                     ${t.substring(0, 25)}${t.length > 25 ? '...' : ''}
                </div>
            `).join('');
        }
    };

    saveThemeBtn.addEventListener('click', () => {
        const themes = JSON.parse(localStorage.getItem('ai_themes') || '[]');
        const current = promptInput.value.trim();
        if (current && !themes.includes(current)) {
            themes.push(current);
            localStorage.setItem('ai_themes', JSON.stringify(themes));
            updateThemesUI();
        }
    });

    updateThemesUI();
});
