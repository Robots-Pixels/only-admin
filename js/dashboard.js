// const API_URL = "http://localhost:3000/api";

const API_URL = "https://mjp-backend-nzf2.onrender.com/api";
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Non autorisé. Veuillez vous reconnecter.");
  location.href = "/index.html";
}

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};


fetch(`https://mjp-backend-nzf2.onrender.com/api/contacts/test`, {headers})


let contacts = [], convertis = [], arrivants = [];

const elements = {
  allContactsTable: document.querySelector('#all-contacts tbody'),
  convertisTable: document.querySelector('#selected-contacts tbody'),
  arrivantsTable: document.querySelector('#newcomers-contacts tbody'),
  repertoireTable: document.querySelector('#repertoire-contacts tbody'),
};

const pages = {
  contacts: document.getElementById('contacts-page'),
  convertis: document.getElementById('convertis-page'),
  arrivants: document.getElementById('arrivants-page'),
  repertoire: document.getElementById('repertoire-page'),
  statistics: document.getElementById('statistics-page') // 👈 ici
};

function showPage(pageId) {
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  pages[pageId].classList.remove('hidden');

  switch (pageId) {
    case 'contacts': return displayAllContacts();
    case 'convertis': return fetchConvertis();
    case 'arrivants': return fetchArrivants();
    case 'repertoire': return displayRepertoire();
    case 'statistics': return displayStatistics();

  }
}

document.getElementById('nav-contacts').onclick = () => showPage('contacts');
document.getElementById('nav-convertis').onclick = () => showPage('convertis');
document.getElementById('nav-arrivants').onclick = () => showPage('arrivants');
document.getElementById('nav-repertoire').onclick = () => showPage('repertoire');
document.getElementById('nav-statistics').onclick = () => showPage('statistics');


function fetchContacts() {
  fetch(`${API_URL}/contacts`,
    
    {headers})
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        contacts = data.map(c => ({
          nom: c.nom, prenom: c.prenom, telephone: c.telephone,
          profession: c.profession || "", quartier: c.quartier || "", sexe: c.sexe || "", createdAt: c.createdAt
        }));
        displayAllContacts();
      }
    });
}

function fetchConvertis() {
  fetch(`${API_URL}/contacts/convertis`, { headers })
    .then(res => res.json())
    .then(data => convertis = data)
    .then(displayConvertis)
    .catch(err => console.error("Erreur chargement convertis:", err));
}

function fetchArrivants() {
  fetch(`${API_URL}/contacts/arrivants`, { headers })
    .then(res => res.json())
    .then(data => arrivants = data)
    .then(displayArrivants)
    .catch(err => console.error("Erreur chargement arrivants:", err));
}

function createRow(contact, actions = '') {
  return `
    <td>${contact.nom}</td>
    <td>${contact.prenom}</td>
    <td>${contact.sexe}</td>
    <td>${contact.quartier}</td>
    <td>${contact.profession}</td>
    <td>${contact.telephone}</td>
    <td><div class="action-group">${actions}</div></td>`;
}

function displayAllContacts() {
  elements.allContactsTable.innerHTML = '';
  contacts.forEach((c, i) => {
    const row = document.createElement('tr');
    row.innerHTML = createRow(c, `
      <button class="action-btn add" onclick="addToList('convertis', ${i})">+ Converti</button>
      <button class="action-btn arrivant" onclick="addToList('arrivants', ${i})">+ Arrivant</button>
      <button class="action-btn delete" onclick="deleteContact(${i})">Supprimer</button>
    `);
    elements.allContactsTable.appendChild(row);
  });
}

function displayConvertis() {
  elements.convertisTable.innerHTML = '';
  convertis.forEach((c, i) => {
    const row = document.createElement('tr');
    row.innerHTML = createRow(c, `
      <button class="action-btn delete" onclick="removeFromList('convertis', ${i})">Retirer</button>
    `);
    elements.convertisTable.appendChild(row);
  });
}

function displayArrivants() {
  elements.arrivantsTable.innerHTML = '';
  arrivants.forEach((c, i) => {
    const row = document.createElement('tr');
    row.innerHTML = createRow(c, `
      <button class="action-btn delete" onclick="removeFromList('arrivants', ${i})">Retirer</button>
    `);
    elements.arrivantsTable.appendChild(row);
  });
}

function displayRepertoire() {
  elements.repertoireTable.innerHTML = '';
  contacts.forEach((c, i) => {
    const row = document.createElement('tr');
    row.innerHTML = createRow(c, `
      <button class="action-btn save" onclick="exportVCard(${i})">📁 Exporter</button>
    `);
    elements.repertoireTable.appendChild(row);
  });
}

window.addToList = (listName, i) => {
  const contact = contacts[i];
  const endpoint = listName === 'convertis' ? 'convertis/add' : 'arrivants/add';

  fetch(`${API_URL}/contacts/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(contact)
  })
  .then(res => {
    if (!res.ok) throw new Error("Échec de l'ajout");
    // alert("Ajouté avec succès.");
    listName === "convertis" ? fetchConvertis() : fetchArrivants();
  })
  .catch(err => {
    console.error(err);
    alert("Erreur d’ajout.");
  });
};

window.removeFromList = (listName, i) => {
  const list = listName === 'convertis' ? convertis : arrivants;
  const contact = list[i];
  const endpoint = listName;

  fetch(`${API_URL}/contacts/${endpoint}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ telephone: contact.telephone })
  })
  .then(res => {
    if (!res.ok) throw new Error("Échec suppression");
    // alert("Retiré avec succès.");
    listName === "convertis" ? fetchConvertis() : fetchArrivants();
  })
  .catch(err => {
    console.error(err);
    // alert("Erreur de suppression.");
  });
};

window.deleteContact = (i) => {
  const c = contacts[i];
  if (!confirm(`Supprimer ${c.prenom} ${c.nom} ?`)) return;

  fetch(`${API_URL}/contacts/delete`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ telephone: c.telephone })
  })
  .then(res => {
    if (!res.ok) throw new Error("Erreur serveur");
    contacts.splice(i, 1);
    displayAllContacts();
  })
  .catch(err => {
    console.error(err);
    // alert("Erreur de suppression.");
  });
};

window.exportVCard = (i) => {
  const c = contacts[i];
  const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${c.prenom} ${c.nom}\nTEL:${c.telephone}\nADR:${c.quartier}\nNOTE:Sexe: ${c.sexe}\nEND:VCARD`;
  const blob = new Blob([vCard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.prenom}_${c.nom}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};

function displayStatistics() {
  const totalContacts = contacts.length;
  const totalConvertis = convertis.length;
  const totalArrivants = arrivants.length;

  const sexes = { Homme: 0, Femme: 0 };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let thisMonth = 0, previousMonth = 0;

  contacts.forEach(c => {
    // Comptage hommes/femmes
    if (c.sexe === "Homme") sexes.Homme++;
    else if (c.sexe === "Femme") sexes.Femme++;

    // Comptage par date
    const d = new Date(c.createdAt);
    console.log(c);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      thisMonth++;
    } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
      previousMonth++;
    }
  });

  const statsHTML = `
    <p><strong>Total de personnes :</strong> ${totalContacts}</p>
    <p><strong>Nouveaux arrivants :</strong> ${totalArrivants}</p>
    <p><strong>Nouveaux convertis :</strong> ${totalConvertis}</p>
    <p><strong>Hommes :</strong> ${sexes.Homme} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Femmes :</strong> ${sexes.Femme}</p>
    <hr>
    <p><strong>📅 Inscriptions ce mois-ci :</strong> ${thisMonth}</p>
    <p><strong>📅 Inscriptions le mois dernier :</strong> ${previousMonth}</p>
  `;

  document.getElementById('stats-overview').innerHTML = statsHTML;
}

// Initialisation
fetchContacts();
showPage('contacts');

