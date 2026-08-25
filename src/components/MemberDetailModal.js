import { calculateAge, formatDateIndonesian } from '../utils/ageCalculator.js';

export class MemberDetailModal {
  constructor(onEdit, onDelete) {
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.modalEl = null;
    this.currentMember = null;
    this.initModal();
  }

  initModal() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-overlay';
    this.modalEl.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Detail Anggota Keluarga</h3>
          <button class="btn-icon" id="btn-close-detail">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body" id="detail-modal-body">
          <!-- Dynamic details content -->
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-danger" id="btn-delete-member">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Hapus
          </button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary" id="btn-cancel-detail">Tutup</button>
            <button class="btn btn-primary" id="btn-edit-member">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Ubah (Edit)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Event listeners
    const closeBtn = this.modalEl.querySelector('#btn-close-detail');
    const cancelBtn = this.modalEl.querySelector('#btn-cancel-detail');
    const editBtn = this.modalEl.querySelector('#btn-edit-member');
    const deleteBtn = this.modalEl.querySelector('#btn-delete-member');

    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());

    editBtn.addEventListener('click', () => {
      if (this.onEdit && this.currentMember) {
        const m = this.currentMember;
        this.hide();
        this.onEdit(m);
      }
    });

    deleteBtn.addEventListener('click', () => {
      if (this.currentMember) {
        if (confirm(`Apakah Anda yakin ingin menghapus "${this.currentMember.name}" dari pohon keluarga?`)) {
          if (this.onDelete) {
            this.onDelete(this.currentMember.id);
          }
          this.hide();
        }
      }
    });
  }

  show(member, allMembers = []) {
    this.currentMember = member;
    const bodyEl = this.modalEl.querySelector('#detail-modal-body');
    const ageInfo = calculateAge(member.dob, member.deathDate);
    const isAlive = member.status === 'alive';

    // Lookup relatives names
    const father = member.fatherId ? allMembers.find(m => m.id === member.fatherId) : null;
    const mother = member.motherId ? allMembers.find(m => m.id === member.motherId) : null;
    const spouse = member.spouseId ? allMembers.find(m => m.id === member.spouseId) : null;

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px;">
        <img src="${member.photoUrl}" alt="${member.name}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--primary);" />
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">${member.name}</h2>
          <div style="display:flex; gap:8px; justify-content:center; margin-top:4px;">
            <span style="font-size:0.75rem; padding:2px 8px; border-radius:12px; background:${isAlive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${isAlive ? '#34d399' : '#fca5a5'}; font-weight:600;">
              ${isAlive ? '🟢 Hidup' : '🔴 Meninggal'}
            </span>
            <span style="font-size:0.75rem; padding:2px 8px; border-radius:12px; background:rgba(255,255,255,0.08); color:var(--text-muted);">
              ${member.gender === 'male' ? '👨 Pria' : '👩 Wanita'}
            </span>
          </div>
        </div>
      </div>

      <!-- Prominent Computed Age Box -->
      <div class="age-highlight-box" style="margin-top:10px;">
        <div class="age-title">Perhitungan Umur Otomatis</div>
        <div class="age-value">${ageInfo.formattedString}</div>
        ${ageInfo.isBirthdayToday ? '<div style="color:var(--accent); font-size:0.8rem; font-weight:bold; margin-top:4px;">🎂 Ulang Tahun Hari Ini!</div>' : ''}
      </div>

      <div class="detail-list" style="margin-top:8px;">
        <div class="detail-item">
          <span class="detail-label">Tanggal Lahir</span>
          <span class="detail-val">${formatDateIndonesian(member.dob)}</span>
        </div>

        ${member.status === 'deceased' && member.deathDate ? `
        <div class="detail-item">
          <span class="detail-label">Tanggal Wafat</span>
          <span class="detail-val">${formatDateIndonesian(member.deathDate)}</span>
        </div>
        ` : ''}

        <div class="detail-item">
          <span class="detail-label">Peran Keluarga</span>
          <span class="detail-val">${member.role || '-'}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Ayah</span>
          <span class="detail-val">${father ? father.name : '-'}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Ibu</span>
          <span class="detail-val">${mother ? mother.name : '-'}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Pasangan</span>
          <span class="detail-val">${spouse ? spouse.name : '-'}</span>
        </div>

        ${member.notes ? `
        <div class="detail-item" style="flex-direction:column; gap:4px; align-items:flex-start;">
          <span class="detail-label">Catatan</span>
          <span style="font-size:0.85rem;">${member.notes}</span>
        </div>
        ` : ''}
      </div>
    `;

    this.modalEl.classList.add('active');
  }

  hide() {
    this.modalEl.classList.remove('active');
  }
}
