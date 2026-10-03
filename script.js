const balanceButton = document.getElementById('toggleBalance');
const balanceValue = document.getElementById('balanceValue');
const searchInput = document.getElementById('searchInput');
const searchShortcut = document.getElementById('searchShortcut');
const actionTiles = [...document.querySelectorAll('.action-tile')];
const transactionCards = [...document.querySelectorAll('.txn-card')];
const categoryItems = [...document.querySelectorAll('.category-item')];
const navItems = [...document.querySelectorAll('.nav-item')];
const serviceGrid = document.getElementById('serviceGrid');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const menuDialog = document.getElementById('menuDialog');
const shortcutDialog = document.getElementById('shortcutDialog');
const shortcutForm = document.getElementById('shortcutForm');
const shortcutError = document.getElementById('shortcutError');
const historyButton = document.getElementById('historyButton');

const balanceText = 'Rp 24.850.000';
const shortcutsStorageKey = 'livin-preview-shortcuts';
const services = [
  { name: 'Transfer', category: 'Keuangan', detail: 'Kirim dana antar rekening', icon: '↗' },
  { name: 'QRIS', category: 'Keuangan', detail: 'Pembayaran praktis pakai QR', icon: '▦' },
  { name: 'Bayar Tagihan', category: 'Keuangan', detail: 'Listrik, air, dan tagihan lain', icon: '✓' },
  { name: 'Top Up e-money', category: 'Keuangan', detail: 'Isi saldo e-money dengan mudah', icon: '+' },
  { name: 'Belanja Online', category: 'Belanja', detail: 'Inspirasi belanja pilihan', icon: '◇' },
  { name: 'Promo Merchant', category: 'Belanja', detail: 'Penawaran dari merchant pilihan', icon: '%' },
  { name: 'Kartu Debit', category: 'Produk', detail: 'Informasi kartu debit Mandiri', icon: '▤' },
  { name: 'Deposito', category: 'Produk', detail: 'Kenali pilihan simpanan berjangka', icon: '◷' },
  { name: 'Investasi', category: 'Investasi', detail: 'Jelajahi pilihan investasi', icon: '↗' },
  { name: 'Reksa Dana', category: 'Investasi', detail: 'Informasi produk reksa dana', icon: '⌁' },
];

let balanceHidden = false;
let historyExpanded = false;
let toastTimer;
let pendingInstallPrompt;

searchShortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
document.getElementById('currentDate').textContent = dateFormatter.format(new Date());

const hour = new Date().getHours();
const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
document.getElementById('greetingText').textContent = greeting;

function announce(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

function setBalanceVisibility(hidden) {
  balanceHidden = hidden;
  balanceValue.textContent = hidden ? 'Rp ••••••••' : balanceText;
  balanceValue.classList.toggle('is-masked', hidden);
  balanceButton.setAttribute('aria-label', hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo');
  balanceButton.setAttribute('aria-pressed', String(hidden));
  balanceButton.innerHTML = `<svg class="icon"><use href="#${hidden ? 'icon-eye-off' : 'icon-eye'}" /></svg>`;
}

function renderServices() {
  const selectedCategory = document.querySelector('.category-item.active')?.dataset.category;
  const term = searchInput.value.trim().toLocaleLowerCase('id');
  const matches = services.filter((service) => {
    const matchesCategory = Boolean(term) || !selectedCategory || service.category === selectedCategory;
    const matchesTerm = !term || `${service.name} ${service.detail} ${service.category}`.toLocaleLowerCase('id').includes(term);
    return matchesCategory && matchesTerm;
  });

  serviceGrid.innerHTML = matches.map((service) => `
    <button class="service-card" type="button" data-name="${service.name}" data-category="${service.category}" aria-label="${service.name}: ${service.detail}">
      <span class="service-card-icon">${service.icon}</span>
      <span class="service-card-copy"><strong>${service.name}</strong><small>${service.detail}</small></span>
      <svg class="icon icon-small"><use href="#icon-chevron" /></svg>
    </button>
  `).join('');

  serviceGrid.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('click', () => announce(`Simulasi: ${card.dataset.name}. Tidak ada transaksi nyata yang diproses.`));
  });

  return matches.length;
}

function filterContent() {
  const term = searchInput.value.trim().toLocaleLowerCase('id');
  let visibleResults = renderServices();

  actionTiles.forEach((tile) => {
    const matches = !term || tile.dataset.name.toLocaleLowerCase('id').includes(term);
    const selected = tile.dataset.enabled === 'true';
    tile.hidden = !selected || !matches;
    if (!tile.hidden) visibleResults += 1;
  });

  transactionCards.forEach((card, index) => {
    const text = `${card.dataset.name} ${card.dataset.type}`.toLocaleLowerCase('id');
    const matches = !term || text.includes(term);
    const withinRecent = historyExpanded || index < 3;
    card.hidden = !matches || (!withinRecent && !term);
    if (!card.hidden) visibleResults += 1;
  });

  emptyState.hidden = !term || visibleResults > 0;
}

balanceButton.addEventListener('click', () => setBalanceVisibility(!balanceHidden));
searchInput.addEventListener('input', filterContent);

actionTiles.forEach((tile) => {
  tile.dataset.enabled = 'true';
  tile.addEventListener('click', () => announce(`Simulasi: membuka ${tile.dataset.name}. Transaksi tidak diproses.`));
});

try {
  const savedShortcuts = localStorage.getItem(shortcutsStorageKey);
  if (savedShortcuts !== null) {
    const names = JSON.parse(savedShortcuts);
    const availableNames = new Set(actionTiles.map((tile) => tile.dataset.name));
    if (!Array.isArray(names) || names.length === 0 || names.some((name) => !availableNames.has(name))) {
      throw new Error('Saved shortcut preferences are invalid.');
    }
    actionTiles.forEach((tile) => {
      tile.dataset.enabled = String(names.includes(tile.dataset.name));
    });
  }
} catch (error) {
  console.error('Could not restore shortcut preferences:', error);
  announce('Preferensi pintasan tersimpan tidak dapat dibaca; pintasan default digunakan.');
}

document.getElementById('accountDetailsButton').addEventListener('click', () => {
  announce('Rekening Mandiri Tabungan •••• 2021 berstatus aktif (data simulasi).');
});

document.getElementById('notificationsButton').addEventListener('click', () => {
  document.querySelector('.notification-dot').hidden = true;
  document.getElementById('notificationsButton').setAttribute('aria-label', 'Notifikasi sudah dilihat');
  announce('Kamu sudah melihat semua notifikasi terbaru.');
});

document.getElementById('profileButton').addEventListener('click', () => {
  announce('Profil Kelvin — Pengaturan akun demo.');
});

document.getElementById('editShortcutsButton').addEventListener('click', () => {
  shortcutError.hidden = true;
  shortcutForm.querySelectorAll('input[name="shortcut"]').forEach((input) => {
    input.checked = actionTiles.find((tile) => tile.dataset.name === input.value)?.dataset.enabled === 'true';
  });
  shortcutDialog.showModal();
});

document.getElementById('closeShortcutButton').addEventListener('click', () => shortcutDialog.close());
document.getElementById('cancelShortcutButton').addEventListener('click', () => shortcutDialog.close());
shortcutForm.querySelectorAll('input[name="shortcut"]').forEach((input) => {
  input.addEventListener('change', () => {
    shortcutError.hidden = true;
  });
});

shortcutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = new Set([...shortcutForm.querySelectorAll('input[name="shortcut"]:checked')].map((input) => input.value));
  if (selected.size === 0) {
    shortcutError.textContent = 'Pilih minimal satu pintasan untuk ditampilkan.';
    shortcutError.hidden = false;
    shortcutForm.querySelector('input[name="shortcut"]')?.focus();
    return;
  }

  shortcutError.hidden = true;
  actionTiles.forEach((tile) => {
    tile.dataset.enabled = String(selected.has(tile.dataset.name));
  });
  shortcutDialog.close();
  filterContent();
  try {
    localStorage.setItem(shortcutsStorageKey, JSON.stringify([...selected]));
    announce('Pintasan beranda diperbarui dan disimpan di perangkat ini.');
  } catch (error) {
    console.error('Could not save shortcut preferences:', error);
    announce('Pintasan diperbarui untuk sesi ini, tetapi tidak dapat disimpan di perangkat.');
  }
});

document.getElementById('allServicesButton').addEventListener('click', () => {
  document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
  announce('Pilih kategori untuk melihat layanan yang tersedia.');
});

document.getElementById('promoButton').addEventListener('click', () => {
  announce('Promo cashback merupakan konten contoh untuk preview desain.');
});

historyButton.addEventListener('click', () => {
  historyExpanded = !historyExpanded;
  historyButton.setAttribute('aria-expanded', String(historyExpanded));
  document.getElementById('historyButtonText').textContent = historyExpanded ? 'Ringkas' : 'Lihat semua';
  filterContent();
  announce(historyExpanded ? 'Semua transaksi contoh ditampilkan.' : 'Hanya transaksi terbaru yang ditampilkan.');
});

categoryItems.forEach((item) => {
  item.addEventListener('click', () => {
    categoryItems.forEach((category) => {
      const isSelected = category === item;
      category.classList.toggle('active', isSelected);
      category.setAttribute('aria-pressed', String(isSelected));
    });
    filterContent();
    announce(`Kategori ${item.dataset.category} dipilih.`);
  });
});

function setActiveNavigation(item) {
  navItems.forEach((navItem) => {
    const isSelected = navItem === item;
    navItem.classList.toggle('active', isSelected);
    if (isSelected) {
      navItem.setAttribute('aria-current', 'page');
    } else {
      navItem.removeAttribute('aria-current');
    }
  });
}

document.getElementById('closeMenuButton').addEventListener('click', () => menuDialog.close());
menuDialog.querySelectorAll('[data-menu-target]').forEach((option) => {
  option.addEventListener('click', () => {
    menuDialog.close();
    document.querySelector(`.nav-item[data-page="${option.dataset.menuTarget}"]`)?.click();
  });
});

for (const dialog of [menuDialog, shortcutDialog]) {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    if (item.dataset.page === 'Beranda') {
      setActiveNavigation(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (item.dataset.page === 'Riwayat') {
      setActiveNavigation(item);
      document.querySelector('.transactions-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (item.dataset.page === 'Lifestyle') {
      setActiveNavigation(item);
      document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    menuDialog.showModal();
  });
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    filterContent();
    searchInput.blur();
  }
});

const installButton = document.getElementById('installButton');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  pendingInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!pendingInstallPrompt) {
    announce('Gunakan menu browser lalu pilih “Tambahkan ke layar utama”.');
    return;
  }
  pendingInstallPrompt.prompt();
  const choice = await pendingInstallPrompt.userChoice;
  announce(choice.outcome === 'accepted' ? 'Aplikasi ditambahkan ke perangkat.' : 'Instalasi dibatalkan.');
  pendingInstallPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => document.documentElement.setAttribute('data-offline-ready', 'true'))
      .catch((error) => {
        console.error('Offline mode could not be enabled:', error);
        announce('Mode offline tidak tersedia; aplikasi tetap bisa digunakan saat online.');
      });
  });
}

setBalanceVisibility(false);
filterContent();
