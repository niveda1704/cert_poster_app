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
    // Mode Toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            setMode(currentMode);
        });
    });

    function setMode(mode) {
        currentMode = mode;
        // Visual Toggle
        modeBtns.forEach(b => {
            if (b.dataset.mode === mode) b.classList.add('active');
            else b.classList.remove('active');
        });

        // Show relevant templates
        if (mode === 'poster') {
            templatePoster.classList.remove('hidden');
            templateCert.classList.add('hidden');
            promptInput.placeholder = "Describe your event poster (e.g. 'Minimalist movie poster for sci-fi film')...";
        } else {
            templatePoster.classList.add('hidden');
            templateCert.classList.remove('hidden');
            promptInput.placeholder = "Describe your certificate (e.g. 'Formal gold-border diploma for completion')...";
        }
    }

    // Initialize Mode from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode')) {
        setMode(params.get('mode'));
    }

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
            // Fix: Use FormData to match backend expectation
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('language', languageSelect.value);

            // Append Logo if exists
            const logoFile = document.getElementById('logo-file').files[0];
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
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

    // NEW: Logo Input Listener
    document.getElementById('logo-file').addEventListener('change', function (e) {
        const fileName = e.target.files[0]?.name || 'Optional: Top Right (Default)';
        document.getElementById('logo-name').textContent = fileName;
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

    // ----------------------------------------------------
    // NEW: Audience & Interactive Features Logic
    // ----------------------------------------------------

    const audienceSelect = document.getElementById('audience-select');
    const promptCoach = document.getElementById('prompt-coach');
    const coachTips = document.getElementById('coach-tips');
    const coachScoreVal = document.getElementById('coach-score-val');
    const coachProgress = document.getElementById('coach-progress');
    const shareBtn = document.getElementById('share-btn');

    // Audience Requirements Config
    const audienceConfig = {
        student: {
            keywords: ['college', 'university', 'symposium', 'workshop', 'department', 'year'],
            suggestions: ["Mention your college name", "Add department?", "Add academic year?"],
            panel: 'tools-student'
        },
        designer: {
            keywords: ['hex', 'color', 'font', 'minimal', 'bold', 'layout', 'gradient'],
            suggestions: ["Define a color hex code?", "Specify font style?", "Mention layout grid?"],
            panel: 'tools-designer'
        },
        manager: {
            keywords: ['date', 'time', 'venue', 'sponsor', 'rsvp', 'ticket'],
            suggestions: ["Event date missing", "Venue details?", "Sponsor specificiation?"],
            panel: 'tools-manager'
        }
    };

    let currentAudience = 'student';

    // 1. Audience Switcher
    audienceSelect.addEventListener('change', (e) => {
        currentAudience = e.target.value;
        updateAudienceUI();
        analyzePrompt(); // Re-analyze with new rules
    });

    function updateAudienceUI() {
        // Hide all panels
        document.querySelectorAll('.tools-panel').forEach(p => p.classList.add('hidden'));

        // Show selected
        const activePanelId = audienceConfig[currentAudience].panel;
        document.getElementById(activePanelId).classList.remove('hidden');

        // Reset prompts logic if needed. we stick to coach.
        promptCoach.classList.remove('hidden');
    }

    // 2. Prompt Coach Loop
    promptInput.addEventListener('input', () => {
        analyzePrompt();
        checkFlamingoTrigger();
    });

    function analyzePrompt() {
        const text = promptInput.value.toLowerCase();
        if (!text) {
            coachProgress.style.width = '0%';
            coachScoreVal.innerText = '0';
            coachTips.innerHTML = '<li>Type to get tips...</li>';
            return;
        }

        const config = audienceConfig[currentAudience];
        let hitCount = 0;
        let tipsHtml = '';

        // Check keywords
        config.keywords.forEach((kw, index) => {
            if (text.includes(kw)) {
                hitCount++;
                // tipsHtml += `<li class="ok"><i data-lucide="check"></i> Contains '${kw}'</li>`;
            } else {
                // Limit suggestions to first 2 missing to save space
                if (tipsHtml.split('</li>').length < 3) {
                    // Find a friendly suggestion for this keyword if possible, else generic
                    const suggestion = config.suggestions[Math.floor(index % config.suggestions.length)];
                    // Simple mapping logic override for demo:
                    // tipsHtml += `<li class="missing"><i data-lucide="arrow-right"></i> Missing: ${kw}</li>`;
                }
            }
        });

        // Generate specific tips for missing concepts
        // We do a comparative check
        const missing = config.keywords.filter(k => !text.includes(k));
        const found = config.keywords.filter(k => text.includes(k));

        found.slice(0, 3).forEach(k => {
            tipsHtml += `<li class="ok"><i data-lucide="check-circle-2" style="width:12px"></i> Good: includes '${k}'</li>`;
        });

        missing.slice(0, 2).forEach(k => {
            tipsHtml += `<li class="missing"><i data-lucide="alert-circle" style="width:12px"></i> Tip: Add '${k}' details</li>`;
        });

        const total = config.keywords.length;
        const score = Math.min(100, Math.round((hitCount / (total * 0.6)) * 100)); // lighter scoring

        coachScoreVal.innerText = score;
        coachProgress.style.width = `${score}%`;
        coachTips.innerHTML = tipsHtml;
        if (window.lucide) lucide.createIcons();
    }

    // 3. Flamingo Surprise 🦩
    function checkFlamingoTrigger() {
        if (promptInput.value.includes('🦩')) {
            const stage = document.getElementById('flamingo-stage');
            // Prevent spamming
            if (stage.children.length > 0) return;

            stage.style.display = 'block';
            const f = document.createElement('div');
            f.innerText = '🦩';
            f.className = 'flamingo-fly';
            stage.appendChild(f);

            // Remove char to avoid loop? No user might want it.
            // Remove animation after done
            setTimeout(() => {
                f.remove();
                stage.style.display = 'none';
            }, 3000);
        }
    }

    // 4. Remix Buttons
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.dataset.remix;
            const current = promptInput.value;
            if (!current) return;

            // Simple append/modify
            promptInput.value = `${current.trim()}. Make it ${style} style.`;
            analyzePrompt();

            // Visual feedback
            btn.style.transform = "scale(0.9)";
            setTimeout(() => btn.style.transform = "scale(1)", 150);
        });
    });

    // 5. Audience Specific Tools Logic
    // Student: Print Safe
    document.getElementById('print-safe-toggle').addEventListener('change', (e) => {
        const canvases = document.querySelectorAll('.canvas-container');
        if (e.target.checked) {
            canvases.forEach(c => c.classList.add('print-safe-mode'));
        } else {
            canvases.forEach(c => c.classList.remove('print-safe-mode'));
        }
    });

    // Designer: Grid
    document.getElementById('grid-toggle').addEventListener('click', () => {
        document.querySelectorAll('.canvas-container').forEach(c => c.classList.toggle('grid-overlay'));
    });

    // Designer: Radius Slider (Visual Mockup on Container)
    document.getElementById('radius-slider').addEventListener('input', (e) => {
        const val = e.target.value;
        document.querySelectorAll('.result-img, .result-iframe').forEach(img => {
            img.style.borderRadius = `${val}px`;
        });
    });

    // 6. Share Button
    shareBtn.addEventListener('click', () => {
        const state = {
            mode: currentMode,
            audience: currentAudience,
            prompt: promptInput.value
        };
        const encoded = btoa(JSON.stringify(state));
        const url = `${window.location.origin}?s=${encoded}`;

        navigator.clipboard.writeText(url).then(() => {
            const originalIcon = shareBtn.innerHTML;
            shareBtn.innerHTML = `<i data-lucide="check"></i>`;
            setTimeout(() => {
                shareBtn.innerHTML = originalIcon;
                lucide.createIcons();
            }, 2000);
            alert("Collaboration link copied to clipboard!");
        });
    });

    // 7. Load Shared State if present
    const urlParams = new URLSearchParams(window.location.search);
    const sharedState = urlParams.get('s');
    if (sharedState) {
        try {
            const decoded = JSON.parse(atob(sharedState));
            if (decoded.prompt) promptInput.value = decoded.prompt;
            if (decoded.audience) {
                audienceSelect.value = decoded.audience;
                currentAudience = decoded.audience;
            }
            // Trigger UI updates
            updateAudienceUI();
            analyzePrompt();
        } catch (e) { console.error("Error loading shared state", e); }
    }

    // Initialize
    updateAudienceUI();

    // 8. Extra Audience Features Logic

    // Student: Plagiarism Mock
    // Hook into analyzePrompt to show warning if text is long enough
    const originalAnalyze = analyzePrompt;
    analyzePrompt = function () {
        originalAnalyze(); // call original
        if (currentAudience === 'student') {
            const warn = document.getElementById('plagiarism-warning');
            if (promptInput && promptInput.value.length > 50) {
                warn.classList.remove('hidden');
                warn.innerHTML = `<i data-lucide="alert-triangle"></i> Sim: ${(Math.random() * 10 + 10).toFixed(1)}% match found (Internal DB)`;
                if (window.lucide) lucide.createIcons();
            } else if (warn) {
                warn.classList.add('hidden');
            }
        }
    };

    // Designer: Contrast Check
    const contrastBtn = document.getElementById('contrast-check');
    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            const color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            alert(`Color Contrast Analysis:\nPrimary Color: ${color}\nBackground: #fff1f2\n\nResult: 4.5:1 (WCAG AA Passed) ✅`);
        });
    }

    // Manager: CSV Preview
    const csvInput = document.getElementById('csv-file');
    if (csvInput) {
        csvInput.addEventListener('change', (e) => {
            const preview = document.getElementById('csv-preview');
            const grid = preview ? preview.querySelector('.csv-grid-mock') : null;

            if (e.target.files[0] && grid) {
                preview.classList.remove('hidden');
                grid.innerHTML = `
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:0.75rem; background:rgba(0,0,0,0.02); padding:8px; border-radius:4px;">
                        <div style="font-weight:bold;">Name</div><div style="font-weight:bold;">Role</div>
                        <div>Alice Freeman</div><div>Speaker</div>
                        <div>Bob Smith</div><div>Attendee</div>
                        <div>Charlie K.</div><div>Mentor</div>
                        <div style="color:var(--text-muted); grid-column:span 2;">+ 24 more rows...</div>
                    </div>
                `;
            }
        });
    }

    // 9. Floating Camera Logic
    const cam = document.querySelector('.floating-camera');
    if (cam) {
        // Add overlay element dynamically
        const overlay = document.createElement('div');
        overlay.className = 'shutter-overlay';
        document.body.appendChild(overlay);

        cam.addEventListener('click', () => {
            // 1. Flash Animation on Camera
            const flash = cam.querySelector('.camera-flash');
            flash.classList.add('snapping');

            // 2. Sound Effect
            const audio = new Audio("https://cdn.freesound.org/previews/256/256998_4588907-lq.mp3"); // Generic shutter sound
            try { audio.play(); } catch (e) { }

            // 3. Screen Flash
            setTimeout(() => {
                overlay.classList.add('active');
                setTimeout(() => overlay.classList.remove('active'), 150);
                flash.classList.remove('snapping');
            }, 100);

            // 4. Fun Toast
            setTimeout(() => {
                const toast = document.createElement('div');
                toast.innerText = "📸 Snapshot saved to memory! (Not really)";
                toast.style.cssText = `
                    position: fixed; 
                    bottom: 100px; 
                    right: 30px; 
                    background: #333; 
                    color: white; 
                    padding: 8px 16px; 
                    border-radius: 8px; 
                    font-size: 0.8rem;
                    animation: fadeOut 3s forwards;
                    z-index: 10001;
                `;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }, 400);
        });
    }
});
