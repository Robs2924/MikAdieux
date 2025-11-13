document.addEventListener('DOMContentLoaded', () => {
    // --- GESTION DU THÈME ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const updateThemeAppearance = () => {
        if (document.documentElement.classList.contains('dark')) {
            themeToggleDarkIcon.classList.add('hidden');
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }
    };

    updateThemeAppearance();

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
        updateThemeAppearance();
    });

    // --- CHARGEMENT ET GÉNÉRATION DES DÉCOMPTES ---
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('countdown-container');
            data.forEach((personne, index) => {
                const countdownCard = document.createElement('div');
                countdownCard.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transition-colors duration-300 relative';
                
                countdownCard.dataset.clickCount = 0;
                countdownCard.dataset.easterEggUnlocked = 'false';

                let dromCountdownHTML = '';
                if (personne.dateDepartDrom) {
                    dromCountdownHTML = `
                        <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Départ des dorms dans :</p>
                        <div id="timer-drom-${index}" class="text-3xl font-mono text-cyan-500"></div>
                    `;
                } else {
                    dromCountdownHTML = `<p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Roger te garde en captivité</p>`;
                }
                
                const retourDate = new Date(personne.dateRetourFrance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                
                countdownCard.innerHTML = `
                    <h2 class="text-2xl font-bold mb-2">${personne.prenom} ${personne.nom}</h2>
                    ${dromCountdownHTML} 
                    <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">On se parle plus dans :</p>
                    <div id="timer-retour-${index}" class="text-3xl font-mono text-indigo-500"></div>
                    <p class="text-xs mt-4 text-gray-400">${retourDate}</p>
                `;
                container.appendChild(countdownCard);

                setInterval(() => {
                    updateCountdown(personne.dateRetourFrance, `timer-retour-${index}`);
                    if (personne.dateDepartDrom) {
                        updateCountdown(personne.dateDepartDrom, `timer-drom-${index}`);
                    }
                }, 1000);

                countdownCard.addEventListener('click', () => {
                    const isUnlocked = countdownCard.dataset.easterEggUnlocked === 'true';

                    if (isUnlocked) {
                        triggerEmojiConfetti(countdownCard);
                        return;
                    }
                    
                    let clickCount = parseInt(countdownCard.dataset.clickCount) + 1;
                    countdownCard.dataset.clickCount = clickCount;

                    if (clickCount >= 10) {
                        countdownCard.dataset.easterEggUnlocked = 'true';
                        triggerEmojiConfetti(countdownCard);
                    }
                });
            });
        });

    // --- ANIMATION DE PLUIE TRISTE ---
    const canvas = document.getElementById('rain-canvas');
    const ctx = canvas.getContext('2d');

    const RAIN_COUNT = 200;
    const RAIN_COLOR_LIGHT = 'rgba(17, 24, 39, 0.5)';
    const RAIN_COLOR_DARK = 'rgba(156, 163, 175, 0.5)';
    let raindrops = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class RainDrop {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height; 
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -100;
            this.length = Math.random() * 20 + 10;
            this.speed = Math.random() * 4 + 2;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        draw() {
            const isDark = document.documentElement.classList.contains('dark');
            ctx.strokeStyle = isDark ? RAIN_COLOR_DARK : RAIN_COLOR_LIGHT;
            
            ctx.lineWidth = 2;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        update() {
            this.y += this.speed;
            if (this.y > canvas.height) {
                this.reset();
            }
        }
    }

    function setupRain() {
        resizeCanvas();
        for (let i = 0; i < RAIN_COUNT; i++) {
            raindrops.push(new RainDrop());
        }
    }

    function animateRain() {
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(17, 24, 39, 0.1)' : 'rgba(241, 245, 249, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const drop of raindrops) {
            drop.update();
            drop.draw();
        }
        requestAnimationFrame(animateRain);
    }

    window.addEventListener('resize', resizeCanvas);
    setupRain();
    animateRain();
});

// --- FONCTIONS UTILITAIRES (HORS DU DOMCONTENTLOADED) ---

function updateCountdown(targetDate, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    if (difference <= 0) {
        element.innerText = "C'est Ciaooooo !";
        return;
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    element.innerText = `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

function triggerEmojiConfetti(parentElement) {
    const rect = parentElement.getBoundingClientRect();
    const emojis = ['😂', '🎉', '✈️', '🍻', '🍜', '🥳', '🤯', '💸', '🔥'];
    const emojiCount = 7; 

    for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('span');
        emoji.className = 'emoji-confetti';
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(emoji);
        const startX = rect.left + Math.random() * rect.width;
        const startY = rect.bottom - 20;
        emoji.style.left = `${startX}px`;
        emoji.style.top = `${startY}px`;
        emoji.style.animationDelay = `${Math.random() * 0.2}s`;
        setTimeout(() => { emoji.remove(); }, 4000);
    }
}