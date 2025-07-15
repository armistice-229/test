document.addEventListener('DOMContentLoaded', async () => {
    const tbody = $('#eleves-body');
    const searchInput = $('#search-input');
    const classFilter = $('#filter-class');
    const refreshBtn = $('#refresh-btn');
    const bulkDeleteBtn = $('#bulk-delete');
    const pagination = $('#pagination');
    const selectAllHeader = $('#select-all-header');
    const bulkActions = $('#bulk-actions');
    const selectedCount = $('#selected-count');
    const bulkEmailBtn = $('#bulk-email');
    const bulkDocsBtn = $('#bulk-docs');

    const token = localStorage.getItem('token');
    let activeYearId = null;

    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    const showNotification = (message) => {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.className = `
            fixed top-4 right-4 z-50 px-4 py-2 bg-green-600 text-white text-sm rounded shadow
            opacity-0 transition-opacity duration-300
        `;
        document.body.appendChild(notif);
        requestAnimationFrame(() => notif.classList.add('opacity-100'));
        setTimeout(() => {
            notif.classList.remove('opacity-100');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    };

    const apiFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, ...options.headers },
            ...options
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur serveur');
        return json;
    };

    const loadClasses = async () => {
        classFilter.innerHTML = `<option value="">Toutes les classes</option>`;
        try {
            const json = await apiFetch(`http://localhost:5000/api/classes`);
            json.data.forEach(classe => {
                const opt = new Option(classe.name, classe._id);
                classFilter.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            const opt = new Option('Erreur de chargement', '');
            classFilter.appendChild(opt);
        }
    };

    const getActiveYear = async () => {
        try {
            const json = await apiFetch(`http://localhost:5000/api/years/active`);
            return json.data._id;
        } catch (err) {
            alert("Impossible de récupérer l'année scolaire active.");
            return null;
        }
    };

    const renderPagination = (total, currentPage, limit) => {
        const totalPages = Math.ceil(total / limit) || 1;
        const start = (currentPage - 1) * limit + 1;
        const end = Math.min(currentPage * limit, total);

        pagination.innerHTML = `
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-700">
                    Affichage de <span class="font-medium">${start}</span> à <span class="font-medium">${end}</span> sur <span class="font-medium">${total}</span> élèves
                </p>
                <nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    ${renderPageButton(currentPage > 1, currentPage - 1, 'Précédent', 'ri-arrow-left-s-line', 'rounded-l')}
                    ${renderPageNumbers(currentPage, totalPages)}
                    ${renderPageButton(currentPage < totalPages, currentPage + 1, 'Suivant', 'ri-arrow-right-s-line', 'rounded-r')}
                </nav>
            </div>`;

        pagination.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                loadEleves({ page: parseInt(btn.dataset.page) });
            });
        });
    };

    const renderPageButton = (enabled, page, label, icon, rounded) => {
        if (!enabled) {
            return `<span class="px-2 py-2 ${rounded} border bg-gray-100 text-gray-400 cursor-not-allowed"><i class="${icon}"></i></span>`;
        }
        return `<button data-page="${page}" class="px-2 py-2 ${rounded} border bg-white text-gray-500 hover:bg-gray-50"><i class="${icon}"></i></button>`;
    };

    const renderPageNumbers = (current, total) => {
        return getPageRange(current, total).map(p =>
            p === '…'
                ? `<span class="px-2">…</span>`
                : `<button data-page="${p}" class="px-3 py-1 ${p === current ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-50'} border">${p}</button>`
        ).join('');
    };

    const getPageRange = (current, total) => {
        const pages = [1];
        if (current > 4) pages.push('…');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
        if (current < total - 3) pages.push('…');
        if (total > 1) pages.push(total);
        return pages;
    };

    async function loadEleves({ yearId = activeYearId, name = '', classId = '', page = 1 } = {}) {
        tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">Chargement...</td>
      </tr>`;

        const params = new URLSearchParams();
        if (yearId) params.append('year', yearId);
        if (classId) params.append('class', classId);
        if (name) params.append('name', name);
        params.append('page', page);
        params.append('limit', 10);

        try {
            const res = await fetch(`http://localhost:5000/api/eleves?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const json = await res.json();
            const { data: eleves, total, page: currentPage, limit } = json;

            tbody.innerHTML = '';

            if (!eleves || eleves.length === 0) {
                tbody.innerHTML = `
              <tr>
                <td colspan="7" class="text-center text-gray-500 py-4">Aucun élève trouvé.</td>
              </tr>`;
                renderPagination(0, 1, 10);
                return;
            }

            eleves.forEach(eleve => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.dataset.id = eleve._id;

                const avatar = eleve.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(eleve.firstName + ' ' + eleve.lastName)}&background=random`;
                const parent = eleve.parents?.[0] || { name: '—', email: '' };

                row.innerHTML = `
                <td class="px-4 py-3">
                    <label class="custom-checkbox">
                        <input type="checkbox" class="student-checkbox">
                        <span class="checkbox-mark"></span>
                    </label>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            <img src="${avatar}" alt="${eleve.firstName} ${eleve.lastName}"
                                class="w-full h-full object-cover object-top">
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${eleve.lastName} ${eleve.firstName}</div>
                            <div class="text-xs text-gray-500">${eleve.matricule}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">${eleve.gender}</div>
                    <div class="text-xs text-gray-500">${eleve.gender === 'Masculin' ? 'Garçon' : 'Fille'}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">${formatDate(eleve.birthdate)}</div>
                    <div class="text-xs text-gray-500">${eleve.birthPlace || '—'}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">${eleve.classId?.name || '—'}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">${parent.name}</div>
                    <div class="text-xs text-gray-500">${parent.email || '—'}</div>
                </td>
                <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn-edit w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded" title="Modifier">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn-delete w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded" title="Supprimer">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded" title="Plus d'options">
                            <i class="ri-more-2-fill"></i>
                        </button>
                    </div>
                </td>
            `;

                tbody.appendChild(row);

                // ✅ attacher les actions
                row.querySelector('.btn-edit').addEventListener('click', () => editEleve(eleve._id));
                row.querySelector('.btn-delete').addEventListener('click', () => deleteEleve(eleve._id));
            });

            renderPagination(total, currentPage, limit);
        } catch (err) {
            console.error('Erreur chargement élèves :', err);
            tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-red-600 py-4">Erreur serveur. Veuillez recharger la page</td>
          </tr>`;
            renderPagination(0, 1, 10);
        }
    }

    await loadClasses();
    activeYearId = await getActiveYear();
    if (!activeYearId) return;
    loadEleves();

    const applyFilters = debounce(() => loadEleves({ name: searchInput.value.trim(), classId: classFilter.value }), 300);
    searchInput.addEventListener('input', applyFilters);
    classFilter.addEventListener('change', applyFilters);

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('animate-spin');
        await loadEleves();
        setTimeout(() => {
            refreshBtn.classList.remove('animate-spin');
            showNotification("✅ Liste actualisée");
        }, 500);
    });

    bulkDeleteBtn.addEventListener('click', async () => {
        const ids = Array.from($$('.student-checkbox:checked')).map(cb => cb.closest('tr').dataset.id);
        if (!ids.length || !confirm(`Voulez-vous archiver ${ids.length} élève(s) ?`)) return;

        bulkDeleteBtn.disabled = true;
        try {
            const json = await apiFetch(`http://localhost:5000/api/eleves/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            alert(json.message);
            loadEleves();
            selectAllHeader.checked = false;
        } catch (err) {
            alert("Erreur suppression en masse");
        } finally {
            bulkDeleteBtn.disabled = false;
        }
    });

    selectAllHeader.addEventListener('change', () => {
        $$('.student-checkbox').forEach(cb => cb.checked = selectAllHeader.checked);
        updateBulkUI();
    });

    document.addEventListener('change', e => {
        if (e.target.classList.contains('student-checkbox')) updateBulkUI();
    });

    const updateBulkUI = () => {
        const count = $$('.student-checkbox:checked').length;
        if (count) {
            bulkActions.classList.remove('hidden');
            selectedCount.textContent = `${count} sélectionné(s)`;
        } else {
            bulkActions.classList.add('hidden');
        }
    };

    bulkEmailBtn.addEventListener('click', () => console.log('📧 email'));
    bulkDocsBtn.addEventListener('click', () => console.log('📄 docs'));


    async function deleteEleve(id) {
        if (!confirm("Voulez-vous vraiment supprimer cet élève ?")) return;

        try {
            const json = await apiFetch(`http://localhost:5000/api/eleves/${id}`, {
                method: 'DELETE'
            });
            alert("✅ Élève supprimé avec succès");
            loadEleves({ name: $('#search-input').value.trim(), classId: $('#filter-class').value });
        } catch (err) {
            console.error(err);
            alert(`❌ ${err.message || 'Erreur lors de la suppression de l\'élève'}`);
        }
    }

    async function editEleve(id) {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:5000/api/eleves/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Erreur lors de la récupération des données");
            }

            const eleve = await res.json();

            if (!eleve || !eleve._id) {
                alert("Élève introuvable.");
                return;
            }

            // Pré-remplir les champs du formulaire
            document.getElementById('edit-id').value = eleve._id;
            document.getElementById('edit-lastName').value = eleve.lastName || '';
            document.getElementById('edit-firstName').value = eleve.firstName || '';
            document.getElementById('edit-gender').value = eleve.gender || 'Masculin';
            document.getElementById('edit-birthdate').value =
                eleve.birthdate ? eleve.birthdate.substring(0, 10) : '';
            document.getElementById('edit-birthPlace').value = eleve.birthPlace || '';

            // Afficher le modal d'édition
            document.getElementById('editModal').classList.remove('hidden');

        } catch (err) {
            console.error('Erreur récupération élève :', err);
            alert(`❌ ${err.message || "Impossible de charger les informations de l'élève"}`);
        }
    }

    $('#editForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = $('#edit-id').value;

        const body = {
            lastName: $('#edit-lastName').value,
            firstName: $('#edit-firstName').value,
            gender: $('#edit-gender').value,
            birthdate: $('#edit-birthdate').value,
            birthPlace: $('#edit-birthPlace').value,
        };

        try {
            const json = await apiFetch(`http://localhost:5000/api/eleves/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            alert("✅ Élève mis à jour avec succès.");
            $('#editModal').classList.add('hidden');
            loadEleves({ name: $('#search-input').value.trim(), classId: $('#filter-class').value });
        } catch (err) {
            console.error(err);
            alert("❌ Échec de la mise à jour.");
        }
    });

    $('#closeEditModal').addEventListener('click', () => {
        $('#editModal').classList.add('hidden');
    });


});

// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
