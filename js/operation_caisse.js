document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token'); // Assure-toi qu'il contient bien le JWT

  const formEntree = document.getElementById('form-entree');
  const formSortie = document.getElementById('form-sortie');

  // Gestion de l'envoi d'une transaction
  async function envoyerTransaction(data) {
    try {
      const response = await fetch('http://localhost:5000/api/caisse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Erreur lors de la transaction');

      alert('✅ Transaction enregistrée avec succès');
    } catch (error) {
      console.error(error);
      alert('❌ ' + error.message);
    }
  }

  // Gestion du formulaire d'entrée
  formEntree.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const categorie = form.querySelector('select').value;
    const date = form.querySelector('input[type="date"]').value;
    const matricule = form.querySelector('input[type="text"]').value;
    const montant = form.querySelectorAll('input[type="text"]')[1].value;
    const description = form.querySelector('textarea').value;

    const data = {
      type: 'entree',
      categorie,
      date,
      matricule,
      montant: parseFloat(montant),
      description
    };

    await envoyerTransaction(data);
    form.reset();
  });

  // Gestion du formulaire de sortie
  formSortie.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const categorie = form.querySelector('select').value;
    const date = form.querySelector('input[type="date"]').value;
    const montant = form.querySelector('input[type="text"]').value;
    const description = form.querySelector('textarea').value;

    const data = {
      type: 'sortie',
      categorie,
      date,
      montant: parseFloat(montant),
      description
    };

    await envoyerTransaction(data);
    form.reset();
  });

 
const categorieEntree = formEntree.querySelector('select');
const inputMatricule = formEntree.querySelector('input[placeholder="1025XXXX"]');

// 🔽 Crée une zone d'affichage dynamique sous l’input
const feedbackContainer = document.createElement('div');
feedbackContainer.className = "mt-1 text-sm flex items-center space-x-2 h-5"; // hauteur fixe pour pas de saut
inputMatricule.parentNode.appendChild(feedbackContainer);

// 🔁 Spinner HTML (masqué au départ)
const spinner = document.createElement('span');
spinner.className = "loader w-3 h-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin hidden";
feedbackContainer.appendChild(spinner);

// 🔄 Texte feedback
const feedbackText = document.createElement('span');
feedbackText.className = "text-sm";
feedbackContainer.appendChild(feedbackText);

// 🧠 Activer/Désactiver champ matricule selon catégorie
categorieEntree.addEventListener('change', () => {
  const needMatricule = categorieEntree.value === 'Frais de scolarité';

  inputMatricule.disabled = !needMatricule;
  inputMatricule.value = '';
  feedbackText.textContent = '';
  spinner.classList.add('hidden');

  if (needMatricule) {
    inputMatricule.classList.remove('bg-gray-100');
  } else {
    inputMatricule.classList.add('bg-gray-100');
  }
});

// 📡 Vérification lors du blur (ou tu peux aussi utiliser input si tu veux du live)
inputMatricule.addEventListener('blur', async () => {
  const matricule = inputMatricule.value.trim();
  if (!matricule) return;

  // Affiche spinner et reset le texte
  spinner.classList.remove('hidden');
  feedbackText.textContent = '';
  feedbackText.className = 'text-sm';

  try {
    const res = await fetch(`http://localhost:5000/api/eleves/verify/${matricule}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    spinner.classList.add('hidden'); // stop spinner

    if (!result.valid) {
      feedbackText.textContent = "Matricule incorrect";
      feedbackText.className = 'text-sm text-red-600';
    } else {
      feedbackText.textContent = `✓ ${result.lastName} ${result.firstName}`;
      feedbackText.className = 'text-sm text-gray-600';
    }
  } catch (err) {
    console.error(err);
    spinner.classList.add('hidden');
    feedbackText.textContent = "Erreur réseau";
    feedbackText.className = 'text-sm text-red-600';
  }
});

});