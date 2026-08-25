import { calculateAge } from '../utils/ageCalculator.js';

export class StatsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(members) {
    if (!this.container) return;
    this.container.innerHTML = '';

    const list = members || [];
    const total = list.length;
    const aliveCount = list.filter(m => m.status === 'alive').length;
    const deceasedCount = total - aliveCount;
    const maleCount = list.filter(m => m.gender === 'male').length;
    const femaleCount = list.filter(m => m.gender === 'female').length;

    // Calculate Average Age for Alive Members
    let totalAge = 0;
    let validAgeCount = 0;
    list.forEach(m => {
      const ageObj = calculateAge(m.dob, m.deathDate);
      if (ageObj.years >= 0) {
        totalAge += ageObj.years;
        validAgeCount++;
      }
    });
    const avgAge = validAgeCount > 0 ? Math.round(totalAge / validAgeCount) : 0;

    const statsWrapper = document.createElement('div');
    statsWrapper.className = 'stats-container';

    statsWrapper.innerHTML = `
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Ringkasan Silsilah Keluarga</h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">Statistik demografi & usia seluruh anggota yang terdaftar.</p>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-number">${total}</div>
          <div class="stat-label">Total Anggota</div>
        </div>

        <div class="stat-box">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-number">${avgAge} <span style="font-size:0.9rem; font-weight:normal;">Thn</span></div>
          <div class="stat-label">Rata-rata Usia</div>
        </div>

        <div class="stat-box">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-number">${aliveCount}</div>
          <div class="stat-label">Status Hidup (🟢)</div>
        </div>

        <div class="stat-box">
          <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: #fca5a5;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <div class="stat-number">${deceasedCount}</div>
          <div class="stat-label">Telah Wafat (🔴)</div>
        </div>
      </div>

      <div class="stat-box" style="margin-top: 10px;">
        <div class="stat-label" style="margin-bottom: 8px; font-weight:600;">Gender Breakdown</div>
        <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
          <span>👨 Pria: <strong>${maleCount}</strong></span>
          <span>👩 Wanita: <strong>${femaleCount}</strong></span>
        </div>
        <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden; display:flex; margin-top:8px;">
          <div style="width: ${total > 0 ? (maleCount/total)*100 : 0}%; background:#3b82f6;"></div>
          <div style="width: ${total > 0 ? (femaleCount/total)*100 : 0}%; background:#ec4899;"></div>
        </div>
      </div>
    `;

    this.container.appendChild(statsWrapper);
  }
}
