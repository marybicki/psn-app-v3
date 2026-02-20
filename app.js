import { PSN, resetPSN, setAdmin } from './utils/state.js';
import { validateStep01, validateStep02, canProceedPersons, validateFinalize } from './utils/validator.js';
import { saveDraft, loadDraft, setToken, getToken, api } from './utils/storage.js';
import { generatePDF } from './utils/pdf.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

document.getElementById('modal-close').addEventListener('click', () => modal.classList.add('hidden'));

// -----------------------------
//  NAWIGACJA GÓRNA
// -----------------------------

function renderNav() {
  const token = getToken();

  nav.innerHTML = token
    ? `
      <button class="ghost" id="nav-reg">Rejestr</button>
      <button class="ghost" id="nav-new">Nowe</button>
      <button class="ghost" id="nav-admin">Admin</button>
      <button class="ghost" id="nav-logout">Wyloguj</button>
    `
    : `<button class="ghost" id="nav-login">Zaloguj</button>`;

  document.getElementById('nav-login')?.addEventListener('click', () => goTo('login'));
  document.getElementById('nav-new')?.addEventListener('click', startNew);
  document.getElementById('nav-logout')?.addEventListener('click', logout);
  document.getElementById('nav-reg')?.addEventListener('click', () => goTo('registry'));
  document.getElementById('nav-admin')?.addEventListener('click', () => goTo('admin/dashboard'));
}

function logout() {
  setToken(null);
  renderNav();
  goTo('login');
}

function startNew() {
  resetPSN();
  saveDraft(PSN);
  goTo('step01');
}

export function goTo(screen) {
  fetch(`./screens/${screen}.html`)
    .then(r => r.text())
    .then(h => {
      app.innerHTML = h;
      attach(screen);
      window.scrollTo(0, 0);
    });
}

// -----------------------------
//  ZAŁĄCZENIA EKRANÓW
// -----------------------------

function attach(screen) {
  if (screen === 'login') attachLogin();
  if (screen === 'step01') attachStep01();
  if (screen === 'step02') attachStep02();
  if (screen === 'hotwork') attachHotwork();
  if (screen === 'confined') attachConfined();
  if (screen === 'persons') attachPersons();
  if (screen === 'step03') attachStep03();
  if (screen === 'registry') attachRegistry();
  if (screen === 'admin/dashboard') attachAdmin();
}

// -----------------------------
//  LOGIN
// -----------------------------

async function attachLogin() {
  renderNav();
  const form = app.querySelector('#login-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await api('/api/auth/login', { method: 'POST', body: { email, password } });

      setToken(res.token);
      setAdmin(res.user?.role === 'admin');

      renderNav();
      startNew();
    } catch (err) {
      alert(err.message || 'Błąd logowania');
    }
  });
}

// -----------------------------
//  KROK 1
// -----------------------------

async function attachStep01() {
  renderNav();

  const works = await (await fetch('./data/works.json')).json();
  const sel = app.querySelector('#wykazPrac');

  sel.innerHTML = `<option value="">— wybierz z wykazu —</option>`
    + works.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

  if (PSN.workId) sel.value = PSN.workId;
  app.querySelector('#pracaWlasna').value = PSN.workCustom || '';

  ['ppn', 'ppe', 'ppz', 'ppzna'].forEach(id =>
    app.querySelector('#' + id).checked = !!PSN[id]
  );

  if (PSN.groupG) {
    app.querySelector(`input[name='g'][value='${PSN.groupG}']`)
      ?.setAttribute('checked', 'checked');
  }

  app.querySelector('#btn-next').addEventListener('click', () => {
    if (!validateStep01()) return;

    PSN.ppn = app.querySelector('#ppn').checked;
    PSN.ppe = app.querySelector('#ppe').checked;
    PSN.ppz = app.querySelector('#ppz').checked;
    PSN.ppzna = app.querySelector('#ppzna').checked;

    const g = app.querySelector("input[name='g']:checked");
    PSN.groupG = g ? g.value : null;

    PSN.workId = sel.value || null;
    PSN.workCustom = app.querySelector('#pracaWlasna').value.trim() || null;

    saveDraft(PSN);
    goTo('step02');
  });
}

// -----------------------------
//  KROK 2
// -----------------------------

async function attachStep02() {
  renderNav();

  const issuers = await (await fetch('./data/issuers.json')).json();
  const time = await (await fetch('./data/time.json')).json();

  const wydSel = app.querySelector('#wydajacy');
  wydSel.innerHTML = `<option value="">— wybierz z listy —</option>`
    + issuers.map(x => `<option value="${x}">${x}</option>`).join('');

  const listPocz = app.querySelector('#listPocz');
  const listKoniec = app.querySelector('#listKoniec');

  listPocz.innerHTML = time.start.map(x => `<option value="${x.value}">${x.label}</option>`).join('');
  listKoniec.innerHTML = time.duration.map(x => `<option value="${x.value}">${x.label}</option>`).join('');

  if (PSN.wydajacy) wydSel.value = PSN.wydajacy;

  ['koord', 'dop', 'kier', 'przerwy', 'tel'].forEach(id =>
    app.querySelector('#' + id).value = PSN[id] || ''
  );

  if (PSN.startChoice) listPocz.value = PSN.startChoice;
  if (PSN.durationChoice) listKoniec.value = PSN.durationChoice;

  app.querySelector('#btn-hotwork').addEventListener('click', () => goTo('hotwork'));
  app.querySelector('#btn-confined').addEventListener('click', () => goTo('confined'));

  app.querySelector('#btn-next').addEventListener('click', () => {
    if (!validateStep02()) return;

    PSN.wydajacy = wydSel.value || '';

    ['koord', 'dop', 'kier', 'przerwy', 'tel']
      .forEach(id => PSN[id] = app.querySelector('#' + id).value.trim());

    PSN.startChoice = listPocz.value;
    PSN.durationChoice = listKoniec.value;

    saveDraft(PSN);
    goTo('persons');
  });
}

// -----------------------------
//  PPN
// -----------------------------

async function attachHotwork() {
  renderNav();

  const sit = await (await fetch('./data/siting.json')).json();
  const met = await (await fetch('./data/methods.json')).json();

  const selSit = app.querySelector('#siting');
  const selMet = app.querySelector('#methods');

  selSit.innerHTML = sit.map(x => `<option value="${x.id}">${x.name}</option>`).join('');
  selMet.innerHTML = met.map(x => `<option value="${x.id}">${x.name}</option>`).join('');

  if (PSN.hwSiting) selSit.value = PSN.hwSiting;
  if (PSN.hwMethod) selMet.value = PSN.hwMethod;

  app.querySelector('#katRyzyka').checked = !!PSN.hwHighRisk;

  app.querySelector('#btn-save').addEventListener('click', () => {
    PSN.hwSiting = selSit.value;
    PSN.hwMethod = selMet.value;
    PSN.hwHighRisk = app.querySelector('#katRyzyka').checked;

    saveDraft(PSN);
    alert('Zapisano PPN');
    goTo('step02');
  });
}

// -----------------------------
//  PPZ
// -----------------------------

async function attachConfined() {
  renderNav();

  const time = await (await fetch('./data/time.json')).json();

  const selStart = app.querySelector('#timeStart');
  const selDur = app.querySelector('#timeDur');

  selStart.innerHTML = time.hours.map(x => `<option value="${x}">${x}</option>`).join('');
  selDur.innerHTML = time.durations.map(x => `<option value="${x}">${x}</option>`).join('');

  if (PSN.czStart) selStart.value = PSN.czStart;
  if (PSN.czDur) selDur.value = PSN.czDur;

  app.querySelector('#opisPZ').value = PSN.opisPZ || '';
  app.querySelector('#powodPZ').value = PSN.powodPZ || '';

  app.querySelector('#btn-save').addEventListener('click', () => {
    PSN.czStart = selStart.value;
    PSN.czDur = selDur.value;
    PSN.opisPZ = app.querySelector('#opisPZ').value.trim();
    PSN.powodPZ = app.querySelector('#powodPZ').value.trim();

    saveDraft(PSN);
    alert('Zapisano PPZ');
    goTo('step02');
  });
}

// -----------------------------
//  OSOBY
// -----------------------------

async function attachPersons() {
  renderNav();

  const persons = PSN.osoby || [];
  const list = app.querySelector('#osoby-list');

  const render = () => {
    list.innerHTML = persons.map((p, i) =>
      `<tr>
          <td>${i + 1}</td>
          <td>${p.name}</td>
          <td>${p.role || ''}</td>
          <td class="small">${p.company || ''}</td>
          <td><button data-i="${i}" class="ghost">Usuń</button></td>
        </tr>`
    ).join('');

    list.querySelectorAll('button').forEach(btn =>
      btn.addEventListener('click', () => {
        persons.splice(parseInt(btn.dataset.i), 1);
        render();
      })
    );
  };

  render();

  app.querySelector('#add-person').addEventListener('click', () => {
    const name = app.querySelector('#p-name').value.trim();
    const role = app.querySelector('#p-role').value.trim();
    const company = app.querySelector('#p-company').value.trim();

    if (!name) {
      alert('Dodaj minimum 2 osoby');
      return;
    }

    persons.push({ name, role, company });

    ['#p-name', '#p-role', '#p-company']
      .forEach(s => app.querySelector(s).value = '');

    render();
  });

  app.querySelector('#btn-next').addEventListener('click', () => {
    if (!canProceedPersons(persons)) return;

    PSN.osoby = persons;
    saveDraft(PSN);

    goTo('step03');
  });
}

// -----------------------------
//  KROK 3
// -----------------------------

async function attachStep03() {
  renderNav();

  const buildings = await (await fetch('./data/buildings.json')).json();
  const rooms = await (await fetch('./data/rooms.json')).json();

  const bSel = app.querySelector('#building');
  const rSel = app.querySelector('#room');

  bSel.innerHTML = `<option value="">— wybierz —</option>`
    + buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');

  rSel.innerHTML = `<option value="">— wybierz —</option>`
    + rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

  if (PSN.building) bSel.value = PSN.building;
  if (PSN.room) rSel.value = PSN.room;

  app.querySelector('#zakres').value = PSN.zakresPrac || '';
  app.querySelector('#soi').value = PSN.soibhp || '';
  app.querySelector('#uwagi').value = PSN.uwagi || '';

  app.querySelector('#btn-save').addEventListener('click', () => {
    if (!validateFinalize()) return;

    PSN.building = bSel.value;
    PSN.room = rSel.value;
    PSN.zakresPrac = app.querySelector('#zakres').value.trim();
    PSN.soibhp = app.querySelector('#soi').value.trim();
    PSN.uwagi = app.querySelector('#uwagi').value.trim();

    saveDraft(PSN);
    alert('Zapisano szkic');
  });

  app.querySelector('#btn-preview').addEventListener('click', async () => {
    const blob = await (await import('./utils/pdf.js')).then(m => m.generatePDF(PSN, { returnBlob: true }));
    const url = URL.createObjectURL(blob);

    modalContent.innerHTML = `<iframe class="pdf-frame" src="${url}"></iframe>`;
    modal.classList.remove('hidden');
  });

  app.querySelector('#btn-pdf').addEventListener('click', () => generatePDF(PSN));

  app.querySelector('#btn-submit').addEventListener('click', async () => {
    if (!validateFinalize()) return;

    try {
      const created = await api('/api/psn', { method: 'POST', body: PSN });
      await api('/api/registry', {
        method: 'POST',
        body: {
          id: created.id,
          number: created.number,
          wydajacy: PSN.wydajacy,
          rodzaj: {
            ppn: PSN.ppn,
            ppe: PSN.ppe,
            ppz: PSN.ppz,
            ppzna: PSN.ppzna,
            g: PSN.groupG
          },
          miejsce: {
            building: PSN.building,
            room: PSN.room
          },
          start: PSN.startChoice,
          koniec: PSN.durationChoice,
          createdAt: new Date().toISOString()
        }
      });

      alert('Zapisano zezwolenie i rejestr');

      resetPSN();
      saveDraft(PSN);
      goTo('registry');
    } catch (err) {
      alert(err.message || 'Błąd zapisu');
    }
  });
}

// -----------------------------
//  REJESTR
// -----------------------------

async function attachRegistry() {
  renderNav();

  const table = app.querySelector('#reg-list');
  const btnCsv = app.querySelector('#btn-csv');
  const btnXlsx = app.querySelector('#btn-xlsx');

  try {
    const reg = await api('/api/registry');

    table.innerHTML = reg.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.number || ''}</td>
        <td>${r.wydajacy || ''}</td>
        <td>${r.rodzaj?.g || ''}</td>
        <td>${r.miejsce?.building || ''}/${r.miejsce?.room || ''}</td>
        <td>${r.start || ''}</td>
        <td>${r.koniec || ''}</td>
        <td class="small">${new Date(r.createdAt).toLocaleString('pl-PL')}</td>
      </tr>
    `).join('');

    btnCsv.addEventListener('click', () => exportCSV(reg));
    btnXlsx.addEventListener('click', () => exportXLSX(reg));

  } catch (err) {
    table.innerHTML = `<tr><td colspan="8">${err.message}</td></tr>`;
  }
}

function exportCSV(rows) {
  const head = ['#', 'Numer', 'Wydający', 'Grupa', 'Miejsce', 'Początek', 'Koniec', 'Utworzono'];

  const csv = [head.join(';')]
    .concat(
      rows.map((r, i) =>
        [
          i + 1,
          r.number || '',
          r.wydajacy || '',
          r.rodzaj?.g || '',
          `${r.miejsce?.building || ''}/${r.miejsce?.room || ''}`,
          r.start || '',
          r.koniec || '',
          r.createdAt || ''
        ].join(';')
      )
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);
  a.download = 'rejestr-psn.csv';
  a.click();
}

async function exportXLSX(rows) {
  if (!window.XLSX) {
    alert('Ładowanie biblioteki...');
    await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
  }

  const data = rows.map((r, i) => ({
    Lp: i + 1,
    Numer: r.number || '',
    Wydajacy: r.wydajacy || '',
    Grupa: r.rodzaj?.g || '',
    Miejsce: `${r.miejsce?.building || ''}/${r.miejsce?.room || ''}`,
    Poczatek: r.start || '',
    Koniec: r.koniec || '',
    Utworzono: r.createdAt || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Rejestr');
  XLSX.writeFile(wb, 'rejestr-psn.xlsx');
}

// -----------------------------
//  ADMIN
// -----------------------------

async function attachAdmin() {
  renderNav();

  const ulist = app.querySelector('#user-list');

  try {
    const users = await api('/api/admin/users');

    ulist.innerHTML = users
      .map((u, i) =>
        `<tr>
          <td>${i + 1}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
        </tr>`
      )
      .join('');

  } catch (err) {
    ulist.innerHTML = `<tr><td colspan="3">${err.message}</td></tr>`;
  }
}

// -----------------------------
//  START
// -----------------------------

renderNav();
const token = getToken();

if (!token) {
  goTo('login');
} else {
  goTo('step01');
}
