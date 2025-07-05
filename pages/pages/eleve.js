document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('toggle-sidebar');

    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('content-expanded');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const selectAllHeader = document.getElementById('select-all-header');
    const selectAll = document.getElementById('select-all');
    const studentCheckboxes = document.querySelectorAll('.student-checkbox');
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');

    function updateBulkActionsVisibility() {
        let checkedCount = 0;
        studentCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedCount++;
            }
        });

        if (checkedCount > 0) {
            bulkActions.classList.remove('hidden');
            bulkActions.classList.add('flex');
            selectedCount.textContent = `${checkedCount} sélectionné(s)`;
        } else {
            bulkActions.classList.add('hidden');
            bulkActions.classList.remove('flex');
        }

        // Update select all checkboxes
        selectAll.checked = checkedCount === studentCheckboxes.length;
        selectAllHeader.checked = checkedCount === studentCheckboxes.length;
    }

    selectAllHeader.addEventListener('change', function () {
        studentCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        selectAll.checked = this.checked;
        updateBulkActionsVisibility();
    });

    selectAll.addEventListener('change', function () {
        studentCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        selectAllHeader.checked = this.checked;
        updateBulkActionsVisibility();
    });

    studentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionsVisibility);
    });
});

 

document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('export-btn');
    const exportModal = document.getElementById('export-modal');
    const cancelExport = document.getElementById('cancel-export');

    const deleteModal = document.getElementById('delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const deleteButtons = document.querySelectorAll('button[title="Supprimer"]');

    exportBtn.addEventListener('click', function () {
        exportModal.classList.remove('hidden');
    });

    cancelExport.addEventListener('click', function () {
        exportModal.classList.add('hidden');
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            deleteModal.classList.remove('hidden');
        });
    });

    cancelDelete.addEventListener('click', function () {
        deleteModal.classList.add('hidden');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === exportModal) {
            exportModal.classList.add('hidden');
        }
        if (event.target === deleteModal) {
            deleteModal.classList.add('hidden');
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const refreshBtn = document.getElementById('refresh-btn');

    refreshBtn.addEventListener('click', function () {
        this.classList.add('animate-spin');

        // Simulate refresh delay
        setTimeout(() => {
            this.classList.remove('animate-spin');
        }, 1000);
    });
});



/*-----------------------------Interaction backend-------------------------------------*/
async function chargerEleves(page = 1) {
  const token = localStorage.getItem('token');
  if (!token) return alert("Utilisateur non connecté");

  const search = document.getElementById('search-input').value;
  const classe = document.getElementById('filter-classe').value;
  const sexe = document.getElementById('filter-statut').value; // statut = sexe
  const dateStart = document.getElementById('filter-date-start').value;
  const dateEnd = document.getElementById('filter-date-end').value;

  const params = new URLSearchParams({ page, limit: 10 });
  if (search) params.append('search', search);
  if (classe) params.append('classe', classe);
  if (sexe) params.append('sexe', sexe);
  if (dateStart && dateEnd) {
    params.append('dateStart', dateStart);
    params.append('dateEnd', dateEnd);
  }

  try {
    const res = await fetch(`http://localhost:5000/api/eleve?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    afficherEleves(data.eleves);
    afficherPagination(data.page, data.total, data.limit);
  } catch (error) {
    console.error("Erreur de chargement :", error);
  }

  

}

function afficherEleves(eleves) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = '';

  eleves.forEach(eleve => {
    const tr = document.createElement('tr');
    tr.classList.add('hover:bg-gray-50');

    tr.innerHTML = `
      <td class="px-4 py-3">
        <label class="custom-checkbox">
          <input type="checkbox" class="student-checkbox">
          <span class="checkbox-mark"></span>
        </label>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full overflow-hidden">
            <img src="${eleve.photoUrl || 'https://res.cloudinary.com/dxixqdrpm/image/upload/v1750720559/eleves/oa7ikqypx2vwvbucvjsj.png'}" class="w-full h-full object-cover" />
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-gray-900">${eleve.prenom} ${eleve.nom}</div>
            <div class="text-xs text-gray-500">Matricule: ${eleve.matricule || '—'}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-3">${eleve.sexe}</td>
      <td class="px-4 py-3">${eleve.classe?.nom || '—'}</td>
      <td class="px-4 py-3">
        <div class="text-sm">${eleve.parent1?.prenom || ''} ${eleve.parent1?.nom || ''}</div>
        <div class="text-xs text-gray-500">${eleve.parent1?.email || ''}</div>
      </td>
      <td class="px-4 py-3">${new Date(eleve.dateInscription).toLocaleDateString()}</td>
      <td class="px-4 py-3 text-right">
        <div class="flex items-center justify-end space-x-2">
                                       <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded" title="Voir détails">
                                            <i class="ri-eye-line"></i>
                                        </button>
                                        <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded btn-edit" data-id="${eleve._id}" title="Modifier">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        <button
                                            class="btn-supprimer w-8 h-8 flex items-center justify-center text-red-500 hover:bg-gray-100 rounded"
                                            title="Supprimer"
                                            data-id="${eleve._id}"
                                            >
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                        <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded" title="Plus d'options">
                                            <i class="ri-more-2-fill"></i>
                                        </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  chargerEleves(); // Appelle dès le chargement
});



document.getElementById('search-input').addEventListener('input', () => chargerEleves(1));
document.getElementById('apply-filters-btn').addEventListener('click', () => chargerEleves(1));
document.getElementById('reset-filters-btn').addEventListener('click', () => {
  document.getElementById('filter-classe').value = '';
  document.getElementById('filter-statut').value = '';
  document.getElementById('filter-date-start').value = '';
  document.getElementById('filter-date-end').value = '';
  chargerEleves(1);
});


/*----------------------------------------Afficher la pagination---------------------------------*/
function afficherPagination(pageActuelle, total, limit) {
  const container = document.getElementById('pagination-links');
  const info = document.getElementById('eleve-count');
  const totalPages = Math.ceil(total / limit);

  if (!container) return;

  container.innerHTML = ''; // vide le contenu

  const creerLien = (label, page, isActif = false, isDisabled = false) => {
    const el = document.createElement('button');
    el.innerHTML = label;
    el.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
      isActif
        ? 'z-10 bg-primary border-primary text-white'
        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
    }`;

    if (!isDisabled) {
      el.addEventListener('click', () => chargerEleves(page));
    } else {
      el.classList.add('cursor-not-allowed', 'opacity-50');
      el.disabled = true;
    }

    return el;
  };

  // Précédent
  container.appendChild(creerLien(`<i class="ri-arrow-left-s-line"></i>`, pageActuelle - 1, false, pageActuelle === 1));

  // Pages (affiche max 5 pages autour de l’actuelle)
  const delta = 2;
  const startPage = Math.max(1, pageActuelle - delta);
  const endPage = Math.min(totalPages, pageActuelle + delta);

  if (startPage > 1) {
    container.appendChild(creerLien('1', 1));
    if (startPage > 2) {
      const span = document.createElement('span');
      span.textContent = '...';
      span.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
      container.appendChild(span);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    container.appendChild(creerLien(i, i, i === pageActuelle));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const span = document.createElement('span');
      span.textContent = '...';
      span.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
      container.appendChild(span);
    }
    container.appendChild(creerLien(totalPages, totalPages));
  }

  // Suivant
  container.appendChild(creerLien(`<i class="ri-arrow-right-s-line"></i>`, pageActuelle + 1, false, pageActuelle === totalPages));

  // Affichage du message "Affichage de x à y sur z"
  if (info) {
    const start = (pageActuelle - 1) * limit + 1;
    const end = Math.min(pageActuelle * limit, total);
    info.textContent = `Affichage de ${start} à ${end} sur ${total} élèves`;
  }
}

/*

/*------------------------------Gestioin dess actions---------------------------------------------------
let idEleveASupprimer = null;

// Ouvre la modale quand on clique sur une corbeille
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-supprimer')) {
    const btn = e.target.closest('.btn-supprimer');
    idEleveASupprimer = btn.getAttribute('data-id');
    document.getElementById('delete-modal').classList.remove('hidden');
  }
});
/*
// Ferme la modale sans rien faire
document.getElementById('cancel-delete').addEventListener('click', () => {
  document.getElementById('delete-modal').classList.add('hidden');
  idEleveASupprimer = null;
});

// Confirme et supprime
document.getElementById('confirm-delete').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  if (!token || !idEleveASupprimer) return;

  try {
    await fetch(`http://localhost:5000/api/eleves/${idEleveASupprimer}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Ferme la modale et recharge
    document.getElementById('delete-modal').classList.add('hidden');
    chargerEleves(); // recharge la liste
  } catch (err) {
    console.error('Erreur suppression :', err);
    alert("Une erreur est survenue lors de la suppression.");
  }
});



async function ouvrirModalEditionEleve(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/eleves/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const eleve = await res.json();

  // ID (pour soumission)
  document.getElementById('recap-id').value = eleve._id;

  // Photo
  if (eleve.photoUrl) {
    document.getElementById('recap-photo').src = eleve.photoUrl;
    document.getElementById('recap-photo').classList.remove('hidden');
    document.getElementById('recap-photo-placeholder').classList.add('hidden');
  }

  // Élève
  document.getElementById('recap-nom').value = eleve.nom || '';
  document.getElementById('recap-prenom').value = eleve.prenom || '';
  document.getElementById('recap-sexe').value = eleve.sexe || '';
  document.getElementById('recap-date-naissance').value = eleve.dateNaissance?.substring(0, 10) || '';
  document.getElementById('recap-lieu-naissance').value = eleve.lieuNaissance || '';
  document.getElementById('recap-nationalite').value = eleve.nationalite || '';
  document.getElementById('recap-etablissement-precedent').value = eleve.etablissementPrecedent || '';
  document.getElementById('recap-informations-sante').value = eleve.informationsSante || '';

  // Parents
  const p1 = eleve.parent1 || {};
  document.getElementById('recap-parent1-nom').value = p1.nom || '';
  document.getElementById('recap-parent1-prenom').value = p1.prenom || '';
  document.getElementById('recap-parent1-relation').value = p1.relation || '';
  document.getElementById('recap-parent1-profession').value = p1.profession || '';
  document.getElementById('recap-parent1-telephone').value = p1.telephone || '';
  document.getElementById('recap-parent1-email').value = p1.email || '';

  const p2 = eleve.parent2 || {};
  document.getElementById('recap-parent2-nom').value = p2.nom || '';
  document.getElementById('recap-parent2-prenom').value = p2.prenom || '';
  document.getElementById('recap-parent2-relation').value = p2.relation || '';
  document.getElementById('recap-parent2-profession').value = p2.profession || '';
  document.getElementById('recap-parent2-telephone').value = p2.telephone || '';
  document.getElementById('recap-parent2-email').value = p2.email || '';

  // Adresse
  const adr = eleve.adresse || {};
  document.getElementById('recap-adresse-rue').value = adr.rue || '';
  document.getElementById('recap-adresse-ville').value = adr.ville || '';
  document.getElementById('recap-adresse-pays').value = adr.pays || '';

  // Scolarité
  document.getElementById('recap-annee-scolaire').value = eleve.anneeScolaire || '';
  document.getElementById('recap-date-inscription').value = eleve.dateInscription?.substring(0, 10) || '';
  document.getElementById('recap-niveau').value = eleve.niveau || '';
  document.getElementById('recap-classe').value = eleve.classe?._id || '';
  // Afficher la modale
  document.getElementById('modal-recap').classList.remove('hidden');
}


document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-edit');
  if (btn) {
    ouvrirModalEditionEleve(btn.dataset.id);
  }
});




document.getElementById('form-recap-eleve').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('recap-id').value;
  const token = localStorage.getItem('token');

  const data = {
    nom: document.getElementById('recap-nom').value,
    prenom: document.getElementById('recap-prenom').value,
    sexe: document.getElementById('recap-sexe').value,
    dateNaissance: document.getElementById('recap-date-naissance').value,
    lieuNaissance: document.getElementById('recap-lieu-naissance').value,
    nationalite: document.getElementById('recap-nationalite').value,
    etablissementPrecedent: document.getElementById('recap-etablissement-precedent').value,
    informationsSante: document.getElementById('recap-informations-sante').value,
    anneeScolaire: document.getElementById('recap-annee-scolaire').value,
    dateInscription: document.getElementById('recap-date-inscription').value,
    niveau: document.getElementById('recap-niveau').value,
    classe: document.getElementById('recap-classe').value,
    parent1: {
      nom: document.getElementById('recap-parent1-nom').value,
      prenom: document.getElementById('recap-parent1-prenom').value,
      relation: document.getElementById('recap-parent1-relation').value,
      profession: document.getElementById('recap-parent1-profession').value,
      telephone: document.getElementById('recap-parent1-telephone').value,
      email: document.getElementById('recap-parent1-email').value
    },
    parent2: {
      nom: document.getElementById('recap-parent2-nom').value,
      prenom: document.getElementById('recap-parent2-prenom').value,
      relation: document.getElementById('recap-parent2-relation').value,
      profession: document.getElementById('recap-parent2-profession').value,
      telephone: document.getElementById('recap-parent2-telephone').value,
      email: document.getElementById('recap-parent2-email').value
    },
    adresse: {
      rue: document.getElementById('recap-adresse-rue').value,
      ville: document.getElementById('recap-adresse-ville').value,
      pays: document.getElementById('recap-adresse-pays').value
    }
  };

  try {
    await fetch(`http://localhost:5000/api/eleves/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    document.getElementById('modal-recap').classList.add('hidden');
    chargerEleves();
  } catch (err) {
     console.error(err);
  }
});


function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
*/