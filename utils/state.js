export let PSN = {
  ppn: false,
  ppe: false,
  ppz: false,
  ppzna: false,

  groupG: null,
  workId: null,
  workCustom: null,

  wydajacy: '',
  koord: '',
  dop: '',
  kier: '',
  przerwy: '',
  tel: '',

  startChoice: null,
  durationChoice: null,

  hwSiting: null,
  hwMethod: null,
  hwHighRisk: false,

  opisPZ: '',
  powodPZ: '',
  czStart: null,
  czDur: null,

  osoby: [],

  building: null,
  room: null,
  zakresPrac: '',
  soibhp: '',
  uwagi: '',

  number: null
};

export function resetPSN() {
  Object.keys(PSN).forEach(k => {
    if (Array.isArray(PSN[k])) PSN[k] = [];
    else PSN[k] = (typeof PSN[k] === 'boolean') ? false : null;
  });

  PSN.osoby = [];
  PSN.soibhp = '';
  PSN.uwagi = '';
  PSN.zakresPrac = '';
  PSN.tel = '';
}

export function setAdmin(is) {
  localStorage.setItem('psnIsAdmin', is ? '1' : '0');
}
