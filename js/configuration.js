// -----------------------------
// Gestion des onglets (tabs)
// -----------------------------

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
let currentTab = 1;

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const tab = parseInt(btn.dataset.tab);
        switchTab(tab);
    });
});

function switchTab(tab) {
    currentTab = tab;

    // Met à jour l'affichage des onglets
    tabButtons.forEach(btn => {
        btn.classList.remove("tab-active", "border-primary-500", "text-primary-500");
        if (parseInt(btn.dataset.tab) === tab) {
            btn.classList.add("tab-active", "border-primary-500", "text-primary-500");
            document.getElementById("breadcrumb-title").textContent = btn.dataset.title || "Configuration";
        }
    });

    // Affiche le contenu correspondant
    tabContents.forEach(content => {
        content.classList.add("hidden");
    });
    document.getElementById(`tab-${tab}`).classList.remove("hidden");
}

// Fonctions Suivant / Précédent
function nextTab() {
    if (currentTab < 3) switchTab(currentTab + 1);
}
function prevTab() {
    if (currentTab > 1) switchTab(currentTab - 1);
}

// Active le premier onglet au chargement
document.addEventListener("DOMContentLoaded", () => {
    switchTab(1);
    chargerInfosGenerales(); // Charge les infos générales au démarrage
    chargerClasses(); // Charge les classes au démarrage
    chargerAnneesScolaires(); // Charge les années scolaires au démarrage

});


// -----------------------------
// Accordéon Responsables
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
    const headers = document.querySelectorAll(".accordion-header");

    headers.forEach(header => {
        header.addEventListener("click", () => {
            const panelId = header.dataset.accordion;
            const panel = document.querySelector(`.accordion-panel[data-panel="${panelId}"]`);
            const icon = header.querySelector(".accordion-icon");

            const isOpen = !panel.classList.contains("hidden");

            // Ferme tous les panels
            document.querySelectorAll(".accordion-panel").forEach(p => p.classList.add("hidden"));
            document.querySelectorAll(".accordion-icon").forEach(i => i.classList.remove("rotate-180"));

            // Si fermé, alors on l’ouvre
            if (!isOpen) {
                panel.classList.remove("hidden");
                icon.classList.add("rotate-180");
            }
        });
    });
});




// -----------------------------
// Preview des images uploadées
// -----------------------------

function previewImage(inputElement, previewContainerId) {
    const file = inputElement.files?.[0];
    const previewContainer = document.getElementById(previewContainerId);

    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
            previewContainer.innerHTML = `<img src="${reader.result}" alt="Aperçu" class="w-24 h-24 rounded object-cover shadow">`;
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.innerHTML = ""; // Clear preview if not valid
    }
}

// Gestion des champs : logo, signatures, cachets
document.addEventListener("DOMContentLoaded", () => {
    const fileInputs = [
        { id: "logoEcole", preview: "logoPreview" },
        { id: "signature1", preview: "signature1Preview" },
        { id: "signature2", preview: "signature2Preview" },
        { id: "signature3", preview: "signature3Preview" },
        { id: "cachet1", preview: "cachet1Preview" },
        { id: "cachet2", preview: "cachet2Preview" },
        { id: "cachet3", preview: "cachet3Preview" },
    ];

    fileInputs.forEach(({ id, preview }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("change", () => previewImage(input, preview));
        }
    });
});




// -----------------------------
// Chargement des infos générales
// -----------------------------


async function chargerInfosGenerales() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:5000/api/settings/info`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const { success, data } = await response.json();

        if (success && data) {
            document.getElementById('nomEcole').value = data.name || '';
            document.getElementById('addresse').value = data.address || '';
            document.getElementById('telephone').value = data.phone || '';
            document.getElementById('emailEcole').value = data.email || '';

            if (data.logo) {
                document.getElementById('logoPreview').innerHTML =
                    `<img src="${data.logo}" alt="Logo" class="w-24 h-24 rounded object-cover shadow">`;
            }

            if (Array.isArray(data.responsibles)) {
                data.responsibles.forEach((respo, i) => {
                    const index = i + 1;
                    document.getElementById(`prenomsResponsable${index}`).value = respo.firstname || '';
                    document.getElementById(`nomResponsable${index}`).value = respo.lastname || '';
                    document.getElementById(`fonctionResponsable${index}`).value = respo.role || '';
                    document.getElementById(`emailResponsable${index}`).value = respo.email || '';

                    if (respo.signature) {
                        document.getElementById(`signature${index}Preview`).innerHTML =
                            `<img src="${respo.signature}" alt="Signature" class="w-24 h-24 rounded object-cover shadow">`;
                    }

                    if (respo.stamp) {
                        document.getElementById(`cachet${index}Preview`).innerHTML =
                            `<img src="${respo.stamp}" alt="Cachet" class="w-24 h-24 rounded object-cover shadow">`;
                    }
                });
            }
        }

    } catch (error) {
        console.error(error);
        showNotification("Erreur lors du chargement des informations.", "error");
    }
}

//Fonction pour afficher les notifications
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 p-4 rounded shadow-lg text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}



// -----------------------------
// Enregistrement des infos générales
// Cette fonction est appelée lors du clic sur le bouton "Enregistrer"
// -----------------------------

document.getElementById("save-general").addEventListener("click", async () => {
    const nom = document.getElementById("nomEcole").value.trim();
    const adresse = document.getElementById("addresse").value.trim();
    const phone = document.getElementById("telephone").value.trim();
    const email = document.getElementById("emailEcole").value.trim();

    const formData = new FormData();

    formData.append("name", nom);
    formData.append("address", adresse);
    formData.append("phone", phone);
    formData.append("email", email);

    // Logo
    const logoFile = document.getElementById("logoEcole").files[0];
    const logoPreview = document.getElementById("logoPreview").querySelector("img");

    if (logoFile) {
        formData.append("logo", logoFile);
    } else if (logoPreview) {
        formData.append("existingLogo", logoPreview.src);
    }

    // Responsables
    const responsibles = [];

    for (let i = 1; i <= 3; i++) {
        const prenoms = document.getElementById(`prenomsResponsable${i}`).value.trim();
        const nom = document.getElementById(`nomResponsable${i}`).value.trim();
        const fonction = document.getElementById(`fonctionResponsable${i}`).value.trim();
        const mail = document.getElementById(`emailResponsable${i}`).value.trim();

        if (prenoms || nom || fonction || mail) {
            const signatureInput = document.getElementById(`signature${i}`);
            const stampInput = document.getElementById(`cachet${i}`);

            const signatureFile = signatureInput.files[0];
            const stampFile = stampInput.files[0];

            const signaturePreview = document.getElementById(`signature${i}Preview`).querySelector("img");
            const stampPreview = document.getElementById(`cachet${i}Preview`).querySelector("img");

            if (signatureFile) formData.append(`signature${i}`, signatureFile);
            if (stampFile) formData.append(`stamp${i}`, stampFile);

            responsibles.push({
                firstname: prenoms,
                lastname: nom,
                role: fonction,
                email: mail,
                signature: !signatureFile && signaturePreview ? signaturePreview.src : "",
                stamp: !stampFile && stampPreview ? stampPreview.src : ""
            });
        }
    }

    formData.append("responsibles", JSON.stringify(responsibles));

    // Appel API
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/settings/update-general", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification("Configuration enregistrée avec succès !");
            document.getElementById("check-1").classList.remove("hidden");
        } else {
            showNotification("Erreur : " + data.message, "error");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        showNotification("Erreur réseau lors de l'enregistrement.", "error");
    }
});



// -----------------------------
// Chargement des classes
// -----------------------------

async function chargerClasses() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:5000/api/classes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();

        const tbody = document.getElementById("classeTableBody");
        tbody.innerHTML = "";

        if (data.success && data.data.length > 0) {
            document.getElementById("emptyState").classList.add("hidden");

            data.data.forEach(classe => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td class="border-b px-6 py-3 font-medium text-gray-800">${classe.name}</td>
          <td class="border-b px-4 py-3 text-gray-700">${classe.fees.tranche1 || 0} FCFA</td>
          <td class="border-b px-4 py-3 text-gray-700">${classe.fees.tranche2 || 0} FCFA</td>
          <td class="border-b px-4 py-3 text-gray-700">${classe.fees.tranche3 || 0} FCFA</td>
          <td class="border-b px-4 py-3 font-semibold text-gray-900">${classe.fees.total || 0} FCFA</td>
          <td class="border-b px-4 py-3 text-center">
            <button type="button" onclick="supprimerClasse('${classe._id}')" class="text-red-500 hover:text-red-700">
              <i class="ri-delete-bin-line text-xl"></i>
            </button>
          </td>
        `;
                tbody.appendChild(tr);
            });

        } else {
            document.getElementById("emptyState").classList.remove("hidden");
        }

    } catch (error) {
        console.error("Erreur chargement classes :", error);
    }
}



// -----------------------------
// Ajout de classe
// -----------------------------

document.getElementById("btn-save-classe").addEventListener("click", async () => {
    const nom = document.getElementById("nomClasse").value.trim();
    const tranche1 = parseInt(document.getElementById("tranche1").value) || 0;
    const tranche2 = parseInt(document.getElementById("tranche2").value) || 0;
    const tranche3 = parseInt(document.getElementById("tranche3").value) || 0;

    if (!nom) {
        showNotification("Le nom de la classe est requis.");
        return;
    }

    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:5000/api/classes/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: nom, tranche1, tranche2, tranche3 })
        });

        const data = await res.json();
        if (data.success) {
            fermerModalClasse();
            chargerClasses();
            document.getElementById("check-2").classList.remove("hidden"); // coche verte onglet 2
        } else {
            showNotification("Erreur : " + data.message);
        }
    } catch (error) {
        console.error("Erreur ajout classe :", error);
        showNotification("Erreur lors de l'ajout de la classe.");
    }
});


// -----------------------------
// Suppression de classe
// -----------------------------

async function supprimerClasse(classeId) {
    if (!confirm("Supprimer cette classe ?")) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://localhost:5000/api/classes/${classeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            chargerClasses();
        } else {
            showNotification("Erreur : " + data.message);
        }
    } catch (error) {
        console.error("Erreur suppression classe :", error);
    }
}

// -----------------------------
// Modal Ajout Classe
// -----------------------------
function ouvrirModalClasse() {
    document.getElementById("modalClasse").classList.remove("hidden");
    document.getElementById("nomClasse").value = "";
    document.getElementById("tranche1").value = "";
    document.getElementById("tranche2").value = "";
    document.getElementById("tranche3").value = "";
}
function fermerModalClasse() {
    document.getElementById("modalClasse").classList.add("hidden");
    document.getElementById("nomClasse").value = "";
    document.getElementById("tranche1").value = "";
    document.getElementById("tranche2").value = "";
    document.getElementById("tranche3").value = "";
}


// -----------------------------
// Chargement des années scolaires
// -----------------------------

async function chargerAnneesScolaires() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/api/years", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const tbody = document.getElementById("schoolYearTableBody");
        tbody.innerHTML = "";

        if (data.success && data.data.length > 0) {
            document.getElementById("emptyStateAnnee").classList.add("hidden");

            data.data.forEach(annee => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td class="border-b px-6 py-3 font-medium text-gray-800">${annee.name}</td>
          <td class="border-b px-4 py-3 text-gray-700">
            ${annee.isActive ? `<span class="text-green-600 font-semibold">Active</span>` : ""}
          </td>
          <td class="border-b px-4 py-3 text-center space-x-2">
            ${!annee.isActive ? `<button type="button" onclick="activerAnnee('${annee._id}')" title="Activer" class="text-blue-500 hover:text-blue-700"><i class="ri-check-double-line text-lg"></i></button>` : ""}
            <button type="button" onclick="supprimerAnnee('${annee._id}')" title="Supprimer" class="text-red-500 hover:text-red-700"><i class="ri-delete-bin-line text-lg"></i></button>
          </td>
        `;
                tbody.appendChild(tr);
            });

        } else {
            document.getElementById("emptyStateAnnee").classList.remove("hidden");
        }

    } catch (err) {
        console.error("Erreur chargement années :", err);
    }
}



// -----------------------------
// Ajouter une année
// -----------------------------

document.getElementById("btn-save-annee").addEventListener("click", async () => {
    const annee = document.getElementById("anneeScolaire").value.trim();
    if (!annee) {
        showNotification("Veuillez saisir une année scolaire.");
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/api/years/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: annee })
        });

        const data = await res.json();
        if (data.success) {
            fermerModalAnnee();
            chargerAnneesScolaires();
            document.getElementById("check-3").classList.remove("hidden"); // coche verte onglet 3
        } else {
            showNotificationt("Erreur : " + data.message);
        }
    } catch (err) {
        console.error("Erreur ajout année :", err);
    }
});

// -----------------------------
// Activer une année
// -----------------------------

async function activerAnnee(anneeId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://localhost:5000/api/years/${anneeId}/activate`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            chargerAnneesScolaires();
        } else {
            showNotification("Erreur : " + data.message);
        }
    } catch (err) {
        console.error("Erreur activation :", err);
    }
}




// -----------------------------
// Supprimer une année
// -----------------------------

async function supprimerAnnee(anneeId) {
    if (!confirm("Supprimer cette année scolaire ?")) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://localhost:5000/api/years/${anneeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            chargerAnneesScolaires();
        } else {
            showNotification("Erreur : " + data.message);
        }
    } catch (err) {
        console.error("Erreur suppression année :", err);
    }
}

// -----------------------------
// Modal Ajout Année Scolaire   
// -----------------------------
function ouvrirModalAnnee() {
    document.getElementById("modalAnnee").classList.remove("hidden");
    document.getElementById("anneeScolaire").value = "";
}
function fermerModalAnnee() {
    document.getElementById("modalAnnee").classList.add("hidden");
    document.getElementById("anneeScolaire").value = "";
}



// C'est tout pour la configuration de l'application !
// N'oubliez pas de tester chaque fonctionnalité pour vous assurer que tout fonctionne comme prévu.
// Si vous avez des questions ou des suggestions, n'hésitez pas à les partager !
// -----------------------------
// Fin du script de configuration
// -----------------------------
// -----------------------------