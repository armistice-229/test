document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inscription-form');
  const photoUpload = document.getElementById('photo-upload');
  const photoPreview = document.getElementById('photo-preview');
  const photoPlaceholder = document.getElementById('photo-placeholder');

  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');

  const additionalInfo = document.getElementById('additionalInfo');
  const charCount = document.getElementById('charCount');
  additionalInfo.addEventListener('input', () => {
    charCount.textContent = additionalInfo.value.length;
  });

  // Gestion du parent 2
  const addParentBtn = document.querySelector('.add-parent-btn');
  const parent2Fields = document.getElementById('parent2Fields');
  addParentBtn.addEventListener('click', () => {
    parent2Fields.classList.toggle('hidden');
    parent2Fields.classList.add('animate-fade-in');
  });

  // Photo preview
  photoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        photoPreview.src = reader.result;
        photoPreview.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  loadClasses();
  loadActiveYear();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return showToast('Session expirée, reconnectez-vous.', 'error');

    // ✅ Vérification des champs obligatoires
    const requiredFields = [
      { id: 'lastName', label: 'Nom de famille' },
      { id: 'firstName', label: 'Prénoms' },
      { id: 'birthDate', label: 'Date de naissance' },
      { id: 'parent1Name', label: 'Nom du parent 1' },
      { id: 'parent1Privilege', label: 'Lien' },
      { id: 'class', label: 'Classe' },
      { id: 'enrollmentDate', label: 'Date d\'inscription' }
      
    ];

    for (const field of requiredFields) {
  const el = document.getElementById(field.id);
  if (!el || el.value.trim() === '') {
    markInvalidField(el, `Le champ ${field.label} est requis`);
    showToast(`Champ requis : ${field.label}`, 'warning');
    el.focus();
    return;
  }
}
    // Vérification du genre

    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    if (!gender) return showToast('Veuillez sélectionner le genre', 'warning');

    const email = document.getElementById('parent1Email').value;
    if (email && !validateEmail(email)) {
      return showToast('Email du parent 1 invalide', 'warning');
    }

    const formData = new FormData();

    // Données principales
    formData.append('lastName', document.getElementById('lastName').value);
    formData.append('firstName', document.getElementById('firstName').value);
    formData.append('gender', gender);
    formData.append('birthdate', document.getElementById('birthDate').value);
    formData.append('birthPlace', document.getElementById('birthPlace').value);
    formData.append('previousSchool', document.getElementById('previousSchool').value);
    formData.append('previousClass', document.getElementById('previousClass').value);
    formData.append('enrollmentDate', document.getElementById('enrollmentDate').value);
    formData.append('schoolYearId', localStorage.getItem('schoolYearId') || '');
    formData.append('classId', document.getElementById('class').value);
    formData.append('additionalInfo', document.getElementById('additionalInfo').value);

    if (photoUpload.files[0]) {
      formData.append('photo', photoUpload.files[0]);
    }

    // Parents
    const parents = [];
    parents.push({
      name: document.getElementById('parent1Name').value,
      lien: document.getElementById('parent1Privilege').value,
      contact: document.getElementById('parent1Contact').value,
      email: document.getElementById('parent1Email').value
    });

    if (!parent2Fields.classList.contains('hidden')) {
      parents.push({
        name: document.getElementById('parent2Name').value,
        lien: document.getElementById('parent2Lien').value,
        contact: document.getElementById('parent2Contact').value,
        email: document.getElementById('parent2Email').value
      });
    }

    formData.append('parents', JSON.stringify(parents));

    // Afficher le spinner
    toggleSubmitLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/eleves', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l’inscription');

      showToast(`✅ Élève inscrit avec succès`, 'success');

      const currentYear = document.getElementById('enrollmentYear').value;
      form.reset();
      document.getElementById('enrollmentYear').value = currentYear;
      photoPreview.classList.add('hidden');
      photoPlaceholder.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      toggleSubmitLoading(false);
    }
  });

  function toggleSubmitLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitText.textContent = isLoading ? 'Enregistrement...' : 'Enregistrer';
    submitSpinner.classList.toggle('hidden', !isLoading);
  }

  function validateEmail(email) {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
  }
});

// Charger classes
async function loadClasses() {
  try {
    const res = await fetch('http://localhost:5000/api/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const { data } = await res.json();
    const select = document.getElementById('class');
    select.innerHTML = '<option value="">Sélectionner une classe...</option>';
    data.forEach(c => {
      const option = document.createElement('option');
      option.value = c._id;
      option.textContent = c.name;
      select.appendChild(option);
    });
  } catch (err) {
    showToast('Erreur chargement classes', 'error');
  }
}

// Charger année active
async function loadActiveYear() {
  try {
    const res = await fetch('http://localhost:5000/api/years/active', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const { data } = await res.json();
    localStorage.setItem('schoolYearId', data._id);
    document.getElementById('enrollmentYear').value = data.name;
  } catch (err) {
    showToast('Erreur chargement année scolaire', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  let bgColor = 'bg-success-600';
  if (type === 'error') bgColor = 'bg-danger-600';
  else if (type === 'info') bgColor = 'bg-info-600';
  else if (type === 'warning') bgColor = 'bg-warning-600';

  toast.textContent = message;
  toast.className = `fixed top-10 right-6 z-50 rounded-xl shadow-lg px-4 py-3 text-white text-sm ${bgColor} animate-slide-in`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function markInvalidField(inputEl, message = '') {
  inputEl.classList.add('input-error');
  inputEl.setAttribute('title', message);

  // Enlève l’erreur dès qu'on tape
  inputEl.addEventListener('input', () => {
    inputEl.classList.remove('input-error');
    inputEl.removeAttribute('title');
  }, { once: true });
}
