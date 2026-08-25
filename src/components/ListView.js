import { calculateAge, formatDateIndonesian } from '../utils/ageCalculator.js';

export class ListView {
  constructor(containerId, onMemberClick) {
    this.container = document.getElementById(containerId);
    this.onMemberClick = onMemberClick;
    this.members = [];
    this.searchTerm = '';
    this.statusFilter = 'all';
  }

  render(members) {
    if (!this.container) return;
    this.members = members || [];
    this.container.innerHTML = '';

    // Search and Filter Header
    const filterBar = document.createElement('div');
    filterBar.className = 'search-filter-bar';
    filterBar.innerHTML = `
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" class="search-input" id="search-member-input" placeholder="Cari nama atau peran..." value="${this.searchTerm}" />
      </div>
      <select class="filter-select" id="filter-status-select">
        <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Semua Status</option>
        <option value="alive" ${this.statusFilter === 'alive' ? 'selected' : ''}>🟢 Hidup</option>
        <option value="deceased" ${this.statusFilter === 'deceased' ? 'selected' : ''}>🔴 Meninggal</option>
      </select>
    `;
    this.container.appendChild(filterBar);

    // Event Listeners for Search & Filter
    const searchInput = filterBar.querySelector('#search-member-input');
    const filterSelect = filterBar.querySelector('#filter-status-select');

    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.updateList();
    });

    filterSelect.addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.updateList();
    });

    // List Container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'members-grid';
    gridContainer.id = 'members-grid-container';
    this.container.appendChild(gridContainer);

    this.updateList();
  }

  updateList() {
    const gridContainer = this.container.querySelector('#members-grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const filtered = this.members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(this.searchTerm) ||
        (m.role && m.role.toLowerCase().includes(this.searchTerm));
      const matchStatus = this.statusFilter === 'all' || m.status === this.statusFilter;
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>Anggota keluarga tidak ditemukan.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(member => {
      const ageInfo = calculateAge(member.dob, member.deathDate);
      const isAlive = member.status === 'alive';

      const item = document.createElement('div');
      item.className = 'member-card-item';
      item.innerHTML = `
        <div class="avatar-wrapper">
          <img src="${member.photoUrl}" alt="${member.name}" class="avatar-img" />
          <span class="status-dot ${isAlive ? 'alive' : 'deceased'}"></span>
        </div>
        <div class="card-info">
          <div class="card-name">${member.name}</div>
          <div class="card-details">
            <span>📅 ${formatDateIndonesian(member.dob)} (${ageInfo.formattedString})</span>
            <span>🏷️ ${member.role || 'Anggota Keluarga'}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" title="Lihat Detail">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      `;

      item.addEventListener('click', () => {
        if (this.onMemberClick) this.onMemberClick(member);
      });

      gridContainer.appendChild(item);
    });
  }
}
