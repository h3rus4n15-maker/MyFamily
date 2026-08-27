import React, { useState, useEffect } from 'react'
import { calculateAge } from '../utils/ageCalculator.js'
import { db } from '../firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'

export default function MemberFormModal({ isOpen, member, allMembers, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'male',
    status: 'alive',
    deathDate: '',
    role: '',
    fatherId: '',
    motherId: '',
    spouseId: '',
    notes: '',
    photoUrl: ''
  })

  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        dob: member.dob || '',
        gender: member.gender || 'male',
        status: member.status || 'alive',
        deathDate: member.deathDate || '',
        role: member.role || '',
        fatherId: member.fatherId || '',
        motherId: member.motherId || '',
        spouseId: member.spouseId || '',
        notes: member.notes || '',
        photoUrl: member.photoUrl || ''
      })
      setPhotoPreview(member.photoUrl || '')
    } else {
      setFormData({
        name: '',
        dob: '',
        gender: 'male',
        status: 'alive',
        deathDate: '',
        role: '',
        fatherId: '',
        motherId: '',
        spouseId: '',
        notes: '',
        photoUrl: ''
      })
      setPhotoPreview('')
    }
  }, [member, isOpen])

  if (!isOpen) return null

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 300
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        const compressedUrl = canvas.toDataURL('image/jpeg', 0.85)
        setPhotoPreview(compressedUrl)
        setFormData((prev) => ({ ...prev, photoUrl: compressedUrl }))
      }
      img.src = event.target?.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      status: formData.status,
      deathDate: formData.status === 'deceased' ? formData.deathDate || null : null,
      role: formData.role || '',
      fatherId: formData.fatherId || null,
      motherId: formData.motherId || null,
      spouseId: formData.spouseId || null,
      notes: formData.notes || '',
      photoUrl: formData.photoUrl || '',
      createdAt: new Date()
    }

    try {
      if (member?.id) {
        await updateDoc(doc(db, 'members', member.id), payload)
        alert('Berhasil! Data anggota diperbarui di Firestore.')
      } else {
        const docRef = await addDoc(collection(db, 'members'), payload)
        alert('Berhasil! Data tersimpan di Firestore dengan ID: ' + docRef.id)
      }
      onSave(member ? member.id : null, payload)
      onClose()
    } catch (error) {
      console.error('Gagal simpan ke Firebase:', error)
      alert('Error: ' + error.message)
    }
  }

  const ageInfo = calculateAge(
    formData.dob,
    formData.status === 'deceased' ? formData.deathDate : null
  )

  const potentialFathers = allMembers.filter(
    (m) => m.gender === 'male' && (!member || m.id !== member.id)
  )
  const potentialMothers = allMembers.filter(
    (m) => m.gender === 'female' && (!member || m.id !== member.id)
  )
  const potentialSpouses = allMembers.filter((m) => !member || m.id !== member.id)

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {member ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
          </h3>
          <button className="btn-icon" onClick={onClose} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Photo Upload */}
            <div className="form-group">
              <label className="form-label" htmlFor="form-photo-input">Foto / Gambar Anggota</label>
              <div className="image-picker-container">
                <img
                  src={
                    photoPreview ||
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23334155" rx="40"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="32">📷</text></svg>'
                  }
                  alt="Preview"
                  className="image-preview"
                />
                <div>
                  <label className="btn-upload" htmlFor="form-photo-picker">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Pilih Foto
                    <input id="form-photo-picker" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Format JPG, PNG (Max 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="form-group">
              <label className="form-label" htmlFor="form-name">Nama Lengkap *</label>
              <input
                id="form-name"
                name="name"
                type="text"
                className="form-control"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Tanggal Lahir & Gender */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="form-dob">Tanggal Lahir *</label>
                <input
                  id="form-dob"
                  name="dob"
                  type="date"
                  className="form-control"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="form-gender">Jenis Kelamin</label>
                <select
                  id="form-gender"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="male">👨 Pria</option>
                  <option value="female">👩 Wanita</option>
                </select>
              </div>
            </div>

            {/* Live Age Display */}
            <div className="age-highlight-box">
              <div className="age-title">Umur Otomatis Hari Ini</div>
              <div className="age-value">
                {formData.dob ? ageInfo.formattedString : 'Pilih tanggal lahir'}
              </div>
            </div>

            {/* Status Keberadaan & Tanggal Meninggal */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="form-status">Status Keberadaan</label>
                <select
                  id="form-status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="alive">🟢 Hidup</option>
                  <option value="deceased">🔴 Meninggal</option>
                </select>
              </div>
              {formData.status === 'deceased' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="form-death-date">Tanggal Meninggal</label>
                  <input
                    id="form-death-date"
                    name="deathDate"
                    type="date"
                    className="form-control"
                    value={formData.deathDate}
                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Peran Dalam Keluarga */}
            <div className="form-group">
              <label className="form-label" htmlFor="form-role">Peran Dalam Keluarga</label>
              <input
                id="form-role"
                name="role"
                type="text"
                className="form-control"
                placeholder="Contoh: Kakek, Ayah, Ibu, Anak, Cucu"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            {/* Relations */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="form-father-id">Ayah (Orang Tua Pria)</label>
                <select
                  id="form-father-id"
                  name="fatherId"
                  className="form-control"
                  value={formData.fatherId}
                  onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                >
                  <option value="">-- Tanpa Ayah --</option>
                  {potentialFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="form-mother-id">Ibu (Orang Tua Wanita)</label>
                <select
                  id="form-mother-id"
                  name="motherId"
                  className="form-control"
                  value={formData.motherId}
                  onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                >
                  <option value="">-- Tanpa Ibu --</option>
                  {potentialMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="form-spouse-id">Pasangan (Suami / Istri)</label>
              <select
                id="form-spouse-id"
                name="spouseId"
                className="form-control"
                value={formData.spouseId}
                onChange={(e) => setFormData({ ...formData, spouseId: e.target.value })}
              >
                <option value="">-- Tanpa Pasangan --</option>
                {potentialSpouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan */}
            <div className="form-group">
              <label className="form-label" htmlFor="form-notes">Catatan Tambahan</label>
              <textarea
                id="form-notes"
                name="notes"
                className="form-control"
                rows={2}
                placeholder="Catatan khusus, pekerjaan, hobi..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Simpan Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
