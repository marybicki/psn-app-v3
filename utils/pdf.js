export async function generatePDF(psn, { returnBlob = false } = {}) {

  if (!window.html2canvas) {
    await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  }
  if (!window.jspdf) {
    await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
  }

  const template = await (await fetch('./screens/pdf-template.html')).text();
  const doc = document.implementation.createHTMLDocument('pdf');

  doc.documentElement.innerHTML = template;

  const d = (sel) => doc.querySelector(sel);

  // Wypełnianie danych
  d('#p_nr').textContent = psn.number || '(nadany przy zapisie)';
  d('#p_data').textContent = new Date().toLocaleDateString('pl-PL');

  const rodz = [];
  if (psn.ppn) rodz.push('PPN');
  if (psn.ppe) rodz.push('PPE ' + (psn.groupG || ''));
  if (psn.ppz) rodz.push('PPZ');
  if (psn.ppzna) rodz.push('PPZNA');

  d('#p_rodzaj').textContent = rodz.join(' + ');

  d('#p_wyd').textContent = psn.wydajacy;
  d('#p_tel').textContent = psn.tel;
  d('#p_koord').textContent = psn.koord;
  d('#p_dop').textContent = psn.dop;
  d('#p_kier').textContent = psn.kier;

  d('#p_czas').textContent = `${psn.startChoice || ''} / ${psn.durationChoice || ''}`;
  d('#p_miejsce').textContent = `${psn.building || ''} / ${psn.room || ''}`;

  d('#p_zakres').textContent = psn.zakresPrac;
  d('#p_soi').textContent = psn.soibhp;
  d('#p_uwagi').textContent = psn.uwagi;

  const tblOs = d('#p_osoby');
  (psn.osoby || []).forEach((o, i) => {
    const tr = doc.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${o.name}</td>
      <td>${o.role || ''}</td>
      <td>${o.company || ''}</td>
    `;
    tblOs.appendChild(tr);
  });

  // Checklisty PPN / PPZ
  const tblPPN = d('#tbl_ppn');
  const tblPPZ = d('#tbl_ppz');

  function add(tbl, arr) {
    arr.forEach(t => {
      const tr = doc.createElement('tr');
      tr.innerHTML = `<td class="small">${t}</td>`;
      tbl.appendChild(tr);
    });
  }

  if (psn.ppn) {
    add(tblPPN, [
      'Gaśnice przygotowane i sprawne',
      'Strefa 10 m od materiałów palnych zabezpieczona',
      'Ekrany spawalnicze ustawione',
      'Wentylacja zapewniona',
      'Usunięto substancje palne'
    ]);
  }

  if (psn.ppz || psn.ppzna) {
    add(tblPPZ, [
      'Zespół przeszkolony i poinformowany',
      'Odłączenia energii / LOTO wykonane',
      'Rurociągi opróżnione i zabezpieczone',
      'ŚOI dobrane i kompletne',
      'Kontrola atmosfery wykonana'
    ]);
  }

  // PDF — renderowanie
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  async function renderPage(id, add) {
    const el = d('#' + id);
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    if (add) pdf.addPage();
    pdf.addImage(img, 'PNG', 0, 0, 210, 297);
  }

  await renderPage('p1', false);
  await renderPage('p2', true);

  if (returnBlob) return pdf.output('blob');

  pdf.save('PSN.pdf');
}
