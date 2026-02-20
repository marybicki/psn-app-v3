const BASE_URL = localStorage.getItem('psnApi') || 'http://localhost:8080';

let _token = localStorage.getItem('psnToken');

export function setToken(t) {
  _token = t;
  if (!t) localStorage.removeItem('psnToken');
  else localStorage.setItem('psnToken', t);
}

export function getToken() {
  return _token;
}

export function saveDraft(d) {
  localStorage.setItem('psnDraft', JSON.stringify(d));
}

export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem('psnDraft') || 'null');
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = 'Bearer ' + _token;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(json.message || ('HTTP ' + res.status));

  return json;
}
