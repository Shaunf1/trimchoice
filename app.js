/**
 * TOTF2 Gear Multi-Zone Customization — Prototype
 * State in memory only. No backend.
 */

const PALETTE = [
  { name: 'Red', hex: '#C0392B' },
  { name: 'Blue', hex: '#2E86C1' },
  { name: 'Black', hex: '#1C1C1C' },
  { name: 'White', hex: '#F4F6F6' },
  { name: 'Grey', hex: '#7F8C8D' },
  { name: 'Green', hex: '#2E8B57' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Pink', hex: '#EBDEF0' },
  { name: 'Purple', hex: '#7D3C98' },
  { name: 'Teal', hex: '#16A085' },
  { name: 'Tan', hex: '#D2B48C' },
];

const GEAR_LABELS = { gloves: 'GLOVES', shorts: 'SHORTS', boots: 'BOOTS' };

const GEAR_CONFIG = {
  gloves: {
    zones: [
      { id: 'body', label: 'BODY' },
      { id: 'cuff', label: 'CUFF' },
      { id: 'stripe', label: 'STRIPE' },
    ],
    previewClass: 'preview-gloves',
  },
  shorts: {
    zones: [
      { id: 'body', label: 'BODY' },
      { id: 'waist', label: 'WAIST' },
      { id: 'stripe', label: 'STRIPE' },
    ],
    previewClass: 'preview-shorts',
  },
  boots: {
    zones: [
      { id: 'body', label: 'BODY' },
      { id: 'trim', label: 'TRIM' },
      { id: 'accent', label: 'ACCENT' },
    ],
    previewClass: 'preview-boots',
  },
};

const DEFAULT_COLOR = '#7F8C8D';

// Boxing glove images (Unsplash) — one per style tile
const STYLE_IMAGES = {
  gloves: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=280&h=280&fit=crop',
  ],
  shorts: [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=280&h=280&fit=crop',
  ],
  boots: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=280&h=280&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=280&h=280&fit=crop',
  ],
};

function createInitialStyles(gearType) {
  const zones = GEAR_CONFIG[gearType].zones.map(z => z.id);
  return [
    { id: 'style-1', name: 'Style 1', colors: { [zones[0]]: '#C0392B', [zones[1]]: '#1C1C1C', [zones[2]]: '#D2B48C' } },
    { id: 'style-2', name: 'Style 2', colors: { [zones[0]]: '#2E86C1', [zones[1]]: '#F4F6F6', [zones[2]]: '#F1C40F' } },
    { id: 'style-3', name: 'Style 3', colors: { [zones[0]]: '#1C1C1C', [zones[1]]: '#E67E22', [zones[2]]: '#16A085' } },
  ];
}

const state = {
  currentGearType: 'gloves',
  selectedStyleId: { gloves: null, shorts: null, boots: null },
  styles: {
    gloves: createInitialStyles('gloves'),
    shorts: createInitialStyles('shorts'),
    boots: createInitialStyles('boots'),
  },
};

const dom = {
  navItems: null,
  styleTiles: null,
  btnEditStyle: null,
  viewStyles: null,
  viewEdit: null,
  btnBack: null,
  editClose: null,
  editTitle: null,
  editTabLabel: null,
  colourPrimary: null,
  colourSecondary: null,
  colourTrim: null,
};

function getSelectedStyleId() {
  return state.selectedStyleId[state.currentGearType];
}

function getCurrentStyles() {
  return state.styles[state.currentGearType];
}

function getSelectedStyle() {
  const id = getSelectedStyleId();
  if (!id) return null;
  return getCurrentStyles().find(s => s.id === id);
}

function getConfig() {
  return GEAR_CONFIG[state.currentGearType];
}

function renderNav() {
  const active = state.currentGearType;
  dom.navItems.forEach(btn => {
    const gear = btn.dataset.gear;
    btn.classList.toggle('active', gear === active);
  });
}

function renderStyleTiles() {
  const styles = getCurrentStyles();
  const selectedId = getSelectedStyleId();
  const images = STYLE_IMAGES[state.currentGearType] || STYLE_IMAGES.gloves;

  dom.styleTiles.innerHTML = styles.map((style, i) => {
    const selected = style.id === selectedId;
    const imgSrc = images[i] || images[0];
    return `
      <button type="button" class="style-tile ${selected ? 'selected' : ''}" data-style-id="${style.id}">
        <img class="style-tile-img" src="${imgSrc}" alt="${style.name}" />
      </button>
    `;
  }).join('');

  dom.styleTiles.querySelectorAll('.style-tile').forEach(btn => {
    btn.addEventListener('click', () => selectStyle(btn.dataset.styleId));
  });

  if (dom.btnEditStyle) {
    dom.btnEditStyle.disabled = !selectedId;
  }
}

function selectStyle(styleId) {
  const current = getSelectedStyleId();
  state.selectedStyleId[state.currentGearType] = current === styleId ? null : styleId;
  renderStyleTiles();
}

function enterEditView() {
  const styles = getCurrentStyles();
  if (!getSelectedStyleId() && styles.length) {
    state.selectedStyleId[state.currentGearType] = styles[0].id;
    renderStyleTiles();
  }
  if (!getSelectedStyleId()) return;
  if (!dom.viewEdit || !dom.viewStyles) return;
  dom.viewStyles.setAttribute('hidden', '');
  dom.viewEdit.removeAttribute('hidden');
  dom.viewEdit.classList.add('visible');
  if (dom.editTabLabel) dom.editTabLabel.textContent = GEAR_LABELS[state.currentGearType] || state.currentGearType.toUpperCase();
  renderColourSections();
}

function exitEditView() {
  dom.viewEdit.setAttribute('hidden', '');
  dom.viewEdit.classList.remove('visible');
  dom.viewStyles.removeAttribute('hidden');
  renderStyleTiles();
}

function getZoneIdByIndex(zoneIndex) {
  return getConfig().zones[zoneIndex].id;
}

function applyColourToZone(zoneIndex, hex) {
  const style = getSelectedStyle();
  if (!style) return;
  const zoneId = getZoneIdByIndex(zoneIndex);
  style.colors[zoneId] = hex;
  renderColourSection(zoneIndex);
}

function renderColourSection(zoneIndex) {
  const style = getSelectedStyle();
  const zoneId = getZoneIdByIndex(zoneIndex);
  const currentHex = style ? style.colors[zoneId] || DEFAULT_COLOR : DEFAULT_COLOR;
  const container = [dom.colourPrimary, dom.colourSecondary, dom.colourTrim][zoneIndex];
  if (!container) return;

  container.innerHTML = PALETTE.map(({ name, hex }) =>
    `<button type="button" class="colour-swatch ${hex === currentHex ? 'selected' : ''}" data-hex="${hex}" data-zone-index="${zoneIndex}" title="${name}" style="background:${hex}"></button>`
  ).join('');

  container.querySelectorAll('.colour-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyColourToZone(parseInt(btn.dataset.zoneIndex, 10), btn.dataset.hex);
    });
  });
}

function renderColourSections() {
  renderColourSection(0);
  renderColourSection(1);
  renderColourSection(2);
}

function switchGearType(gearType) {
  state.currentGearType = gearType;
  exitEditView();
  renderNav();
  renderStyleTiles();
}

function init() {
  dom.navItems = document.querySelectorAll('.nav-item');
  dom.styleTiles = document.getElementById('style-tiles');
  dom.btnEditStyle = document.querySelector('.btn-edit-style');
  dom.viewStyles = document.getElementById('view-styles');
  dom.viewEdit = document.getElementById('view-edit');
  dom.btnBack = document.getElementById('btn-back');
  dom.editClose = document.getElementById('edit-close');
  dom.editTitle = document.getElementById('edit-title');
  dom.editTabLabel = document.getElementById('edit-tab-label');
  dom.colourPrimary = document.getElementById('colour-primary');
  dom.colourSecondary = document.getElementById('colour-secondary');
  dom.colourTrim = document.getElementById('colour-trim');

  dom.navItems.forEach(btn => {
    btn.addEventListener('click', () => switchGearType(btn.dataset.gear));
  });

  dom.btnEditStyle.addEventListener('click', (e) => {
    e.preventDefault();
    enterEditView();
  });
  if (dom.btnBack) dom.btnBack.addEventListener('click', exitEditView);
  if (dom.editClose) dom.editClose.addEventListener('click', exitEditView);

  renderNav();
  const styles = getCurrentStyles();
  if (styles.length && !getSelectedStyleId()) {
    state.selectedStyleId[state.currentGearType] = styles[0].id;
  }
  renderStyleTiles();
}

init();
