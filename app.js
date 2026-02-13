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

const SWATCHES_PER_PAGE = 8;

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
  modal: {
    activeZoneIndex: 0,
    swatchPage: 0,
  },
};

const dom = {
  navItems: null,
  styleTiles: null,
  btnEditStyle: null,
  modalOverlay: null,
  modal: null,
  modalClose: null,
  zoneTabs: null,
  swatchGrid: null,
  swatchPrev: null,
  swatchNext: null,
  swatchDots: null,
  previewContainer: null,
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
  const config = getConfig();
  const zoneIds = config.zones.map(z => z.id);

  dom.styleTiles.innerHTML = styles.map(style => {
    const selected = style.id === selectedId;
    const c1 = style.colors[zoneIds[0]] || DEFAULT_COLOR;
    const c2 = style.colors[zoneIds[1]] || DEFAULT_COLOR;
    const c3 = style.colors[zoneIds[2]] || DEFAULT_COLOR;
    return `
      <button type="button" class="style-tile ${selected ? 'selected' : ''}" data-style-id="${style.id}">
        <div class="style-tile-mock">${style.name}</div>
        <div class="tile-chip" aria-hidden="true">
          <span style="background:${c1}" title="${zoneIds[0]}"></span>
          <span style="background:${c2}" title="${zoneIds[1]}"></span>
          <span style="background:${c3}" title="${zoneIds[2]}"></span>
        </div>
      </button>
    `;
  }).join('');

  dom.styleTiles.querySelectorAll('.style-tile').forEach(btn => {
    btn.addEventListener('click', () => selectStyle(btn.dataset.styleId));
  });

  dom.btnEditStyle.disabled = !selectedId;
}

function selectStyle(styleId) {
  const current = getSelectedStyleId();
  state.selectedStyleId[state.currentGearType] = current === styleId ? null : styleId;
  renderStyleTiles();
}

function openModal() {
  if (!getSelectedStyleId()) return;
  state.modal.activeZoneIndex = 0;
  state.modal.swatchPage = 0;
  dom.modalOverlay.hidden = false;
  renderModalZoneTabs();
  renderSwatchGrid();
  renderSwatchDots();
  renderPreview();
  updateSwatchNavState();
}

function closeModal() {
  dom.modalOverlay.hidden = true;
  renderStyleTiles();
}

function renderModalZoneTabs() {
  const config = getConfig();
  const idx = state.modal.activeZoneIndex;
  dom.zoneTabs.innerHTML = config.zones.map((z, i) =>
    `<button type="button" class="zone-tab ${i === idx ? 'active' : ''}" data-zone-index="${i}" role="tab">${z.label}</button>`
  ).join('');

  dom.zoneTabs.querySelectorAll('.zone-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.modal.activeZoneIndex = parseInt(btn.dataset.zoneIndex, 10);
      renderModalZoneTabs();
      renderSwatchGrid();
      renderPreview();
    });
  });
}

function getActiveZoneId() {
  return getConfig().zones[state.modal.activeZoneIndex].id;
}

function applyColorToStyle(hex) {
  const style = getSelectedStyle();
  if (!style) return;
  const zoneId = getActiveZoneId();
  style.colors[zoneId] = hex;
  renderPreview();
  renderSwatchGrid();
}

function renderSwatchGrid() {
  const start = state.modal.swatchPage * SWATCHES_PER_PAGE;
  const slice = PALETTE.slice(start, start + SWATCHES_PER_PAGE);
  const style = getSelectedStyle();
  const zoneId = getActiveZoneId();
  const currentHex = style ? style.colors[zoneId] : DEFAULT_COLOR;

  dom.swatchGrid.innerHTML = slice.map(({ name, hex }) =>
    `<button type="button" class="swatch ${hex === currentHex ? 'selected' : ''}" data-hex="${hex}" title="${name}" style="background:${hex}"></button>`
  ).join('');

  dom.swatchGrid.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyColorToStyle(btn.dataset.hex);
    });
  });
}

function renderSwatchDots() {
  const totalPages = Math.ceil(PALETTE.length / SWATCHES_PER_PAGE);
  dom.swatchDots.innerHTML = Array.from({ length: totalPages }, (_, i) =>
    `<button type="button" class="swatch-dot ${i === state.modal.swatchPage ? 'active' : ''}" data-page="${i}" aria-label="Page ${i + 1}"></button>`
  ).join('');

  dom.swatchDots.querySelectorAll('.swatch-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      state.modal.swatchPage = parseInt(btn.dataset.page, 10);
      renderSwatchGrid();
      renderSwatchDots();
      updateSwatchNavState();
    });
  });
}

function updateSwatchNavState() {
  const totalPages = Math.ceil(PALETTE.length / SWATCHES_PER_PAGE);
  dom.swatchPrev.disabled = state.modal.swatchPage === 0;
  dom.swatchNext.disabled = state.modal.swatchPage >= totalPages - 1;
}

function nextSwatchPage() {
  const totalPages = Math.ceil(PALETTE.length / SWATCHES_PER_PAGE);
  if (state.modal.swatchPage < totalPages - 1) {
    state.modal.swatchPage++;
    renderSwatchGrid();
    renderSwatchDots();
    updateSwatchNavState();
  }
}

function prevSwatchPage() {
  if (state.modal.swatchPage > 0) {
    state.modal.swatchPage--;
    renderSwatchGrid();
    renderSwatchDots();
    updateSwatchNavState();
  }
}

function renderPreview() {
  const config = getConfig();
  const style = getSelectedStyle();
  const activeIndex = state.modal.activeZoneIndex;

  const zoneDivs = config.zones.map((z, i) => {
    const hex = style ? (style.colors[z.id] || DEFAULT_COLOR) : DEFAULT_COLOR;
    const active = i === activeIndex;
    return `<div class="preview-zone zone-${z.id} ${active ? 'active' : 'dim'}" style="background:${hex}" data-zone="${z.id}"></div>`;
  }).join('');

  dom.previewContainer.innerHTML = `<div class="${config.previewClass}">${zoneDivs}</div>`;
}

function switchGearType(gearType) {
  state.currentGearType = gearType;
  renderNav();
  renderStyleTiles();
}

function init() {
  dom.navItems = document.querySelectorAll('.nav-item');
  dom.styleTiles = document.getElementById('style-tiles');
  dom.btnEditStyle = document.querySelector('.btn-edit-style');
  dom.modalOverlay = document.getElementById('modal-overlay');
  dom.modal = document.getElementById('edit-modal');
  dom.modalClose = document.getElementById('modal-close');
  dom.zoneTabs = document.getElementById('zone-tabs');
  dom.swatchGrid = document.getElementById('swatch-grid');
  dom.swatchPrev = document.getElementById('swatch-prev');
  dom.swatchNext = document.getElementById('swatch-next');
  dom.swatchDots = document.getElementById('swatch-dots');
  dom.previewContainer = document.getElementById('preview-container');

  dom.navItems.forEach(btn => {
    btn.addEventListener('click', () => switchGearType(btn.dataset.gear));
  });

  dom.btnEditStyle.addEventListener('click', openModal);
  dom.modalClose.addEventListener('click', closeModal);
  dom.swatchPrev.addEventListener('click', prevSwatchPage);
  dom.swatchNext.addEventListener('click', nextSwatchPage);

  dom.modalOverlay.addEventListener('click', (e) => {
    if (e.target === dom.modalOverlay) closeModal();
  });

  renderNav();
  renderStyleTiles();
}

init();
