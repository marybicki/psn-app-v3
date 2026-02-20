export function validateStep01() {
  const isPPE = document.getElementById('ppe').checked;
  const g = document.querySelector("input[name='g']:checked");

  if (isPPE && !g) {
    alert('Wybierz G1/G2/G3');
    return false;
  }

  const wyk = document.getElementById('wykazPrac').value;
  const own = document.getElementById('pracaWlasna').value.trim();

  if (!wyk && !own) {
    alert('Określ pracę (wybór z listy lub własna)');
    return false;
  }

  const ppz = document.getElementById('ppz').checked;
  const ppzna = document.getElementById('ppzna').checked;

  if (ppzna && !ppz) {
    alert('PPZNA wymaga PPZ');
    return false;
  }

  return true;
}

export function validateStep02() {
  if (!document.getElementById('wydajacy').value) {
    alert('Wybierz wydającego z listy');
    return false;
  }
  if (!document.getElementById('dop').value.trim()) {
    alert('Podaj dopuszczającego');
    return false;
  }
  if (!document.getElementById('kier').value.trim()) {
    alert('Podaj kierującego');
    return false;
  }
  if (!document.getElementById('listPocz').value) {
    alert('Podaj początek obowiązywania');
    return false;
  }
  if (!document.getElementById('listKoniec').value) {
    alert('Podaj okres obowiązywania');
    return false;
  }
  return true;
}

export function canProceedPersons(arr) {
  if (!arr || arr.length < 2) {
    alert('Dodaj conajmniej 2 osoby');
    return false;
  }
  return true;
}

export function validateFinalize() {
  if (!document.getElementById('building').value) {
    alert('Wybierz budynek');
    return false;
  }
  if (!document.getElementById('room').value) {
    alert('Wybierz pomieszczenie');
    return false;
  }
  if (!document.getElementById('zakres').value.trim()) {
    alert('Wpisz zakres prac');
    return false;
  }
  if (!document.getElementById('soi').value.trim()) {
    alert('Wpisz wymagania ŚOI/BHP');
    return false;
  }
  if (!document.getElementById('uwagi').value.trim()) {
    alert('Wpisz warunki wznowienia pracy lub ND');
    return false;
  }
  return true;
}
