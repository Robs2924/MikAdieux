document.addEventListener('DOMContentLoaded', () => {
    // --- CORRECTION 1 : GESTION DU THÈME AVEC LOGS DE DÉBOGAGE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const updateThemeAppearance = () => {
        // Cette fonction met à jour UNIQUEMENT l'icône, en se basant sur la classe de <html>
        if (document.documentElement.classList.contains('dark')) {
            themeToggleDarkIcon.classList.add('hidden');
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }
    };

    // Applique l'état visuel initial au chargement
    console.log('[Theme] Chargement de la page. Thème actuel via localStorage :', localStorage.getItem('color-theme'));
    updateThemeAppearance();

    themeToggleBtn.addEventListener('click', () => {
        console.log('[Theme] Bouton cliqué !');
        
        // 1. On vérifie l'état ACTUEL
        const isDark = document.documentElement.classList.contains('dark');
        console.log('[Theme] Le thème est-il sombre AVANT le clic ?', isDark);

        // 2. On inverse l'état
        if (isDark) {
            console.log('[Theme] Action : Passage au thème CLAIR.');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            console.log('[Theme] Action : Passage au thème SOMBRE.');
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }

        // 3. On met à jour l'apparence des icônes
        updateThemeAppearance();
        
        console.log('[Theme] État final de la classe <html> :', document.documentElement.className);
        console.log('------------------------------------');
    });


    // --- CHARGEMENT ET GÉNÉRATION DES DÉCOMPTES ---
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('countdown-container');
            data.forEach((personne, index) => {
                const countdownCard = document.createElement('div');
                countdownCard.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transition-colors duration-300 relative';
                
                // --- CORRECTION 2 : NOUVELLE LOGIQUE POUR L'EASTER EGG ---
                // On réintroduit les compteurs
                countdownCard.dataset.clickCount = 0;
                countdownCard.dataset.easterEggUnlocked = 'false';

                let dromCountdownHTML = '';
                if (personne.dateDepartDrom) {
                    dromCountdownHTML = `
                        <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Départ du Drom dans :</p>
                        <div id="timer-drom-${index}" class="text-3xl font-mono text-cyan-500"></div>
                    `;
                } else {
                    dromCountdownHTML = `<p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Déjà sur place, veinard !</p>`;
                }
                
                const retourDate = new Date(personne.dateRetourFrance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                
                countdownCard.innerHTML = `
                    <h2 class="text-2xl font-bold mb-2">${personne.prenom} ${personne.nom}</h2>
                    ${dromCountdownHTML} 
                    <p class="text-sm mt-4 text-gray-500 dark:text-gray-400">Retour en France dans :</p>
                    <div id="timer-retour-${index}" class="text-3xl font-mono text-indigo-500"></div>
                    <p class="text-xs mt-4 text-gray-400"> ${retourDate}</p>
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
                        // Si c'est débloqué, on lance les confettis à chaque clic
                        triggerEmojiConfetti(countdownCard);
                        return; // On arrête ici
                    }
                    
                    // Si ce n'est pas débloqué, on incrémente le compteur
                    let clickCount = parseInt(countdownCard.dataset.clickCount) + 1;
                    countdownCard.dataset.clickCount = clickCount;

                    // On vérifie si on a atteint le seuil de 10 clics
                    if (clickCount >= 10) {
                        countdownCard.dataset.easterEggUnlocked = 'true';
                        // On lance les confettis pour la première fois
                        triggerEmojiConfetti(countdownCard);
                    }
                });
            });
        });
});

// Le reste du code (updateCountdown et triggerEmojiConfetti) est identique à la version précédente
function updateCountdown(targetDate, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    if (difference <= 0) {
        element.innerText = "C'est ciao !";
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