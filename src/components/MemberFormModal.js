import { calculateAge } from '../utils/ageCalculator.js';
import confetti from 'canvas-confetti';

export class MemberFormModal {
  constructor(onSave) {
    this.onSave = onSave;
    this.modalEl = null;
    this.currentMemberId = null;
    this.uploadedPhotoUrl = '';
    this.initModal();
  }

  initModal() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-overlay';
    this.modalEl.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="form-modal-title">Tambah Anggota Keluarga</h3>
          <button class="btn-icon" id="btn-close-form">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="member-form">
          <div class="modal-body">
            
            <!-- Photo Upload -->
            <div class="form-group">
              <label class="form-label">Foto / Gambar Anggota</label>
              <div class="image-picker-container">
                <img id="form-photo-preview" src="" alt="Preview" class="image-preview" />
                <div>
                  <label class="btn-upload">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Pilih Foto
                    <input type="file" id="form-photo-input" accept="image/*" style="display:none;" />
                  </label>
                  <p style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">Format JPG, PNG (Max 2MB)</p>
                </div>
              </div>
            </div>

            <!-- Nama Lengkap -->
            <div class="form-group">
              <label class="form-label">Nama Lengkap *</label>
              <input type="text" class="form-control" id="form-name" placeholder="Contoh: Budi Santoso" required />
            </div>

            <!-- Row: Tanggal Lahir & Gender -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tanggal Lahir *</label>
                <input type="date" class="form-control" id="form-dob" required />
              </div>
              <div class="form-group">
                <label class="form-label">Jenis Kelamin</label>
                <select class="form-control" id="form-gender">
                  <option value="male">👨 Pria</option>
                  <option value="female">👩 Wanita</option>
                </select>
              </div>
            </div>

            <!-- Live Calculated Age Display -->
            <div class="age-highlight-box" id="form-live-age-box">
              <div class="age-title">Umur Otomatis Hari Ini</div>
              <div class="age-value" id="form-live-age-text">Pilih tanggal lahir</div>
            </div>

            <!-- Row: Status & Tanggal Wafat -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status Keberadaan</label>
                <select class="form-control" id="form-status">
                  <option value="alive">🟢 Hidup</option>
                  <option value="deceased">🔴 Meninggal</option>
                </select>
              </div>
              <div class="form-group" id="group-death-date" style="display:none;">
                <label class="form-label">Tanggal Meninggal</label>
                <input type="date" class="form-control" id="form-death-date" />
              </div>
            </div>

            <!-- Peran Dalam Keluarga -->
            <div class="form-group">
              <label class="form-label">Peran Dalam Keluarga</label>
              <input type="text" class="form-control" id="form-role" placeholder="Contoh: Kakek, Ayah, Ibu, Anak, Cucu" />
            </div>

            <!-- Relationships (Ayah, Ibu, Pasangan) -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Ayah (Orang Tua Pria)</label>
                <select class="form-control" id="form-father">
                  <option value="">-- Tanpa Ayah / Generasi 1 --</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ibu (Orang Tua Wanita)</label>
                <select class="form-control" id="form-mother">
                  <option value="">-- Tanpa Ibu / Generasi 1 --</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Pasangan (Suami / Istri)</label>
              <select class="form-control" id="form-spouse">
                <option value="">-- Tanpa Pasangan / Lajang --</option>
              </select>
            </div>

            <!-- Catatan -->
            <div class="form-group">
              <label class="form-label">CatatanTambahan</label>
              <textarea class="form-control" id="form-notes" rows="2" placeholder="Catatan khusus, pekerjaan, hobi..."></textarea>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-form">Batal</button>
            <button type="submit" class="btn btn-primary" id="btn-save-member">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Simpan Anggota
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Event listeners
    const closeBtn = this.modalEl.querySelector('#btn-close-form');
    const cancelBtn = this.modalEl.querySelector('#btn-cancel-form');
    const form = this.modalEl.querySelector('#member-form');
    const dobInput = this.modalEl.querySelector('#form-dob');
    const statusSelect = this.modalEl.querySelector('#form-status');
    const deathDateInput = this.modalEl.querySelector('#form-death-date');
    const deathGroup = this.modalEl.querySelector('#group-death-date');
    const photoInput = this.modalEl.querySelector('#form-photo-input');

    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());

    // Live age calculation listener
    const updateAge = () => {
      const dobVal = dobInput.value;
      const statusVal = statusSelect.value;
      const deathVal = deathDateInput.value;
      const ageBoxText = this.modalEl.querySelector('#form-live-age-text');

      if (!dobVal) {
        ageBoxText.textContent = 'Pilih tanggal lahir';
        return;
      }

      const ageObj = calculateAge(dobVal, statusVal === 'deceased' ? deathVal : null);
      ageBoxText.textContent = ageObj.formattedString;
    };

    dobInput.addEventListener('change', updateAge);
    statusSelect.addEventListener('change', () => {
      if (statusSelect.value === 'deceased') {
        deathGroup.style.display = 'flex';
      } else {
        deathGroup.style.display = 'none';
        deathDateInput.value = '';
      }
      updateAge();
    });
    deathDateInput.addEventListener('change', updateAge);

    // Photo input FileReader with Canvas Image Compression
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
            this.uploadedPhotoUrl = compressedUrl;
            this.modalEl.querySelector('#form-photo-preview').src = compressedUrl;
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  show(member = null, allMembers = []) {
    this.currentMemberId = member ? member.id : null;
    const titleEl = this.modalEl.querySelector('#form-modal-title');
    titleEl.textContent = member ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga';

    // Populate Parent & Spouse Dropdowns
    const fatherSelect = this.modalEl.querySelector('#form-father');
    const motherSelect = this.modalEl.querySelector('#form-mother');
    const spouseSelect = this.modalEl.querySelector('#form-spouse');

    fatherSelect.innerHTML = '<option value="">-- Tanpa Ayah --</option>';
    motherSelect.innerHTML = '<option value="">-- Tanpa Ibu --</option>';
    spouseSelect.innerHTML = '<option value="">-- Tanpa Pasangan --</option>';

    allMembers.forEach(m => {
      if (member && m.id === member.id) return; // Don't list self

      if (m.gender === 'male') {
        fatherSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
      }
      if (m.gender === 'female') {
        motherSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
      }
      spouseSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
    });

    // Populate Form Fields
    if (member) {
      this.uploadedPhotoUrl = member.photoUrl || '';
      this.modalEl.querySelector('#form-photo-preview').src = this.uploadedPhotoUrl;
      this.modalEl.querySelector('#form-name').value = member.name || '';
      this.modalEl.querySelector('#form-dob').value = member.dob || '';
      this.modalEl.querySelector('#form-gender').value = member.gender || 'male';
      this.modalEl.querySelector('#form-status').value = member.status || 'alive';
      this.modalEl.querySelector('#form-death-date').value = member.deathDate || '';
      this.modalEl.querySelector('#form-role').value = member.role || '';
      this.modalEl.querySelector('#form-father').value = member.fatherId || '';
      this.modalEl.querySelector('#form-mother').value = member.motherId || '';
      this.modalEl.querySelector('#form-spouse').value = member.spouseId || '';
      this.modalEl.querySelector('#form-notes').value = member.notes || '';
    } else {
      this.uploadedPhotoUrl = '';
      this.modalEl.querySelector('#form-photo-preview').src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23334155" rx="40"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="32">📷</text></svg>';
      this.modalEl.querySelector('#member-form').reset();
      this.modalEl.querySelector('#form-status').value = 'alive';
    }

    // Trigger initial age update
    this.modalEl.querySelector('#form-status').dispatchEvent(new Event('change'));
    this.modalEl.classList.add('active');
  }

  hide() {
    this.modalEl.classList.remove('active');
  }

  handleFormSubmit() {
    const name = this.modalEl.querySelector('#form-name').value.trim();
    const dob = this.modalEl.querySelector('#form-dob').value;
    const gender = this.modalEl.querySelector('#form-gender').value;
    const status = this.modalEl.querySelector('#form-status').value;
    const deathDate = status === 'deceased' ? this.modalEl.querySelector('#form-death-date').value : null;
    const role = this.modalEl.querySelector('#form-role').value.trim();
    const fatherId = this.modalEl.querySelector('#form-father').value || null;
    const motherId = this.modalEl.querySelector('#form-mother').value || null;
    const spouseId = this.modalEl.querySelector('#form-spouse').value || null;
    const notes = this.modalEl.querySelector('#form-notes').value.trim();

    const memberData = {
      name,
      dob,
      gender,
      status,
      deathDate,
      role,
      fatherId,
      motherId,
      spouseId,
      notes,
      photoUrl: this.uploadedPhotoUrl
    };

    if (this.onSave) {
      this.onSave(this.currentMemberId, memberData);
    }

    // Celebrate adding a member!
    if (!this.currentMemberId) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    this.hide();
  }
}
