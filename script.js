const balanceButton = document.getElementById('toggleBalance');
const balanceValue = document.getElementById('balanceValue');
const searchInput = document.getElementById('searchInput');
const actionTiles = [...document.querySelectorAll('.action-tile')];
const transactionCards = [...document.querySelectorAll('.txn-card')];
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const categoryItems = [...document.querySelectorAll('.category-item')];
const navItems = [...document.querySelectorAll('.nav-item')];
const searchShortcut = document.getElementById('searchShortcut');
const menuDialog = document.getElementById('menuDialog');

let balanceHidden = false;
let toastTimer;
const balanceText = 'Rp 24.850.000';
searchShortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
document.getElementById('currentDate').textContent = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date());

function announce(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function setBalanceVisibility(hidden) {
  balanceHidden = hidden;
  balanceValue.textContent = hidden ? 'Rp ••••••••' : balanceText;
  balanceValue.classList.toggle('is-masked', hidden);
  balanceButton.setAttribute('aria-label', hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo');
  balanceButton.innerHTML = `<svg class="icon"><use href="#${hidden ? 'icon-eye-off' : 'icon-eye'}" /></svg>`;
}

balanceButton.addEventListener('click', () => setBalanceVisibility(!balanceHidden));

function filterContent() {
  const term = searchInput.value.trim().toLocaleLowerCase('id');
  let visibleResults = 0;

  actionTiles.forEach((tile) => {
    const matches = !term || tile.dataset.name.toLocaleLowerCase('id').includes(term);
    tile.hidden = !matches;
    if (matches) visibleResults += 1;
  });

  transactionCards.forEach((card) => {
    const text = `${card.dataset.name} ${card.dataset.type}`.toLocaleLowerCase('id');
    const matches = !term || text.includes(term);
    card.hidden = !matches;
    if (matches) visibleResults += 1;
  });

  emptyState.hidden = !term || visibleResults > 0;
}

searchInput.addEventListener('input', filterContent);

actionTiles.forEach((tile) => {
  tile.addEventListener('click', () => announce(`Simulasi: membuka ${tile.dataset.name}. Transaksi tidak diproses.`));
});

document.getElementById('accountDetailsButton').addEventListener('click', () => {
  announce('Rekening Mandiri Tabungan •••• 2021 berstatus aktif.');
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
  announce('Pintasan favorit siap diatur pada aplikasi Livin’.');
});

document.getElementById('allServicesButton').addEventListener('click', () => {
  document.getElementById('categoryRow').scrollIntoView({ behavior: 'smooth', block: 'center' });
  announce('Semua kategori layanan ditampilkan.');
});

document.getElementById('promoButton').addEventListener('click', () => {
  announce('Promo cashback merupakan konten contoh untuk preview desain.');
});

document.getElementById('historyButton').addEventListener('click', () => {
  document.querySelector('.transactions-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  announce('Menampilkan transaksi terakhir pada preview.');
});

categoryItems.forEach((item) => {
  item.addEventListener('click', () => {
    categoryItems.forEach((category) => {
      const isSelected = category === item;
      category.classList.toggle('active', isSelected);
      category.setAttribute('aria-pressed', String(isSelected));
    });
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

setBalanceVisibility(false);
