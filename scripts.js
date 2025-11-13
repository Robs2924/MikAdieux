document.addEventListener('DOMContentLoaded', () => {
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('countdown-container');
            data.forEach(personne => {
                const countdownCard = document.createElement('div');
                countdownCard.className = 'bg-gray-800 p-6 rounded-lg shadow-lg text-center';

                countdownCard.innerHTML = `
                    <h2 class="text-2xl font-bold mb-2">${personne.prenom} ${personne.nom}</h2>
                    <div id="timer-${personne.prenom}" class="text-4xl font-mono"></div>
                    <p class="text-sm mt-2">Retour prévu le : ${new Date(personne.dateRetour).toLocaleDateString()}</p>
                `;
                container.appendChild(countdownCard);

                setInterval(() => {
                    updateCountdown(personne.dateDepart, `timer-${personne.prenom}`);
                }, 1000);
            });
        });
});

function updateCountdown(targetDate, elementId) {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById(elementId).innerText = `${days}j ${hours}h ${minutes}m ${seconds}s`;
}