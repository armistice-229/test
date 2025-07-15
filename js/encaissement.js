document.addEventListener('DOMContentLoaded', () => {
  chargerStats();
  chargerTransactions(pageCourante);

  document.querySelector('.ri-refresh-line').parentElement.addEventListener('click', () => {
    chargerTransactions(pageCourante);
  });

  document.querySelector('#btn-prec').addEventListener('click', () => {
    if (pageCourante > 1) chargerTransactions(pageCourante - 1);
  });

  document.querySelector('#btn-suiv').addEventListener('click', () => {
    chargerTransactions(pageCourante + 1);
  });
});

let pageCourante = 1;
const taillePage = 10; // par défaut


async function chargerTransactions(page = 1) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Chargement...</td></tr>`;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:5000/api/caisse?page=${page}&limit=${taillePage}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.message);

    const { data, meta } = result;
    pageCourante = meta.page;

    const debut = (pageCourante - 1) * meta.limit + 1;
    const fin = Math.min(meta.total, debut + data.length - 1);

    // 🧩 Actualiser la pagination en bas
    document.querySelector('#pagination-info').innerHTML =
      `Affichage de <span class="font-medium">${debut}</span> à <span class="font-medium">${fin}</span> sur <span class="font-medium">${meta.total}</span> encaissements`;

    document.querySelector('#btn-prec').disabled = pageCourante <= 1;
    document.querySelector('#btn-suiv').disabled = fin >= meta.total;

    const rows = data.map(trx => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${new Date(trx.date).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 ">
          <div class="ml-3">
            <p class="text-sm text-gray-900">
              ${trx.eleveNomComplet ? `Paiement pour <span class="font-medium">${trx.eleveNomComplet}</span>` : 'Tiers / Autre'}
            </p>
            <p class="text-xs text-gray-500">${trx.reference}</p>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${trx.montant.toLocaleString()} FCFA
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trx.couleur}">
            ${trx.categorie}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">
          ${trx.description || ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex justify-end space-x-2">
            <button class="text-primary hover:text-indigo-700"><i class="ri-file-list-line"></i></button>
            <button class="text-gray-500 hover:text-gray-700"><i class="ri-printer-line"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows || `<tr><td colspan="6" class="text-center py-4">Aucune transaction trouvée.</td></tr>`;

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-600 py-4">${err.message}</td></tr>`;
  }
}




async function chargerStats() {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/caisse/stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);

    const { today, month, tauxRecouvrement } = result.data;

    document.querySelector('#stat-today').textContent = `${today.toLocaleString()} FCFA`;
    document.querySelector('#stat-month').textContent = `${month.toLocaleString()} FCFA`;
    document.querySelector('#stat-recouvrement').textContent = `${tauxRecouvrement}%`;

    majIndicateur('#delta-today', '#icon-today', result.data.todayDelta, 'par rapport à hier');
    majIndicateur('#delta-month', '#icon-month', result.data.monthDelta, 'par rapport au mois dernier');
    majIndicateur('#delta-recouvrement', '#icon-recouvrement', result.data.recouvrementDelta, 'par rapport au mois dernier');


  } catch (err) {
    console.error(err);
  }
}


function majIndicateur(idSpan, idIcon, delta, texteRef = 'par rapport à hier') {
  const span = document.querySelector(idSpan);
  const icon = document.querySelector(idIcon);

  if (delta === null) {
    span.textContent = 'N/A';
    icon.className = 'ri-arrow-right-line text-gray-400';
    return;
  }

  const value = parseFloat(delta);

  const signe = value >= 0 ? '+' : '-';
  const valeurAbs = Math.abs(value).toFixed(1);

  span.textContent = `${signe}${valeurAbs}% ${texteRef}`;

  if (value >= 0) {
    span.classList.remove('text-red-600');
    span.classList.add('text-green-600');
    icon.className = 'ri-arrow-up-line text-green-600';
  } else {
    span.classList.remove('text-green-600');
    span.classList.add('text-red-600');
    icon.className = 'ri-arrow-down-line text-red-600';
  }
}
