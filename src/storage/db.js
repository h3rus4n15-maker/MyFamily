/**
 * Data Storage Manager for Pohon Keluarga
 * Uses localStorage with fallback to default seed data
 */

const STORAGE_KEY = 'pohon_keluarga_members_v1';

// Default sample avatars using unspash/dicebear or clean SVG data URIs
function getSampleAvatar(gender, name, seed) {
  const isFemale = gender === 'female';
  const bgColors = ['4f46e5', '0d9488', 'e11d48', 'd97706', '2563eb', '7c3aed'];
  const color = bgColors[Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % bgColors.length];
  const initial = name ? name.charAt(0).toUpperCase() : 'F';
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23${color}" rx="60"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="46" font-weight="bold">${initial}</text><circle cx="60" cy="95" r="35" fill="white" opacity="0.2"/></svg>`;
}

export const INITIAL_FAMILY_DATA = [
  // Generasi 1 (Kakek & Nenek)
  {
    id: 'mem-1',
    name: 'H. Sutrisno Wiryo',
    dob: '1948-03-15',
    gender: 'male',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    fatherId: null,
    motherId: null,
    spouseId: 'mem-2',
    role: 'Kakek (Generasi 1)',
    notes: 'Kepala Keluarga Pertama'
  },
  {
    id: 'mem-2',
    name: 'Hj. Siti Aminah',
    dob: '1952-07-22',
    gender: 'female',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
    fatherId: null,
    motherId: null,
    spouseId: 'mem-1',
    role: 'Nenek (Generasi 1)',
    notes: 'Ibu Penyayang'
  },

  // Generasi 2 (Anak Kakek - Budi & Agus)
  {
    id: 'mem-3',
    name: 'Budi Santoso, S.T.',
    dob: '1975-09-10',
    gender: 'male',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    fatherId: 'mem-1',
    motherId: 'mem-2',
    spouseId: 'mem-4',
    role: 'Ayah / Anak Sulung',
    notes: 'Insinyur Sipil'
  },
  {
    id: 'mem-4',
    name: 'Dewi Lestari, M.Pd.',
    dob: '1979-11-28',
    gender: 'female',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    fatherId: null,
    motherId: null,
    spouseId: 'mem-3',
    role: 'Ibu',
    notes: 'Guru SMA'
  },
  {
    id: 'mem-5',
    name: 'Dr. Agus Prasetyo',
    dob: '1981-04-05',
    gender: 'male',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    fatherId: 'mem-1',
    motherId: 'mem-2',
    spouseId: 'mem-6',
    role: 'Paman / Anak Bungsu',
    notes: 'Dokter Spesialis'
  },
  {
    id: 'mem-6',
    name: 'Rina Wati, S.E.',
    dob: '1984-01-18',
    gender: 'female',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'married',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    fatherId: null,
    motherId: null,
    spouseId: 'mem-5',
    role: 'Bibi',
    notes: 'Akuntan'
  },

  // Generasi 3 (Cucu)
  {
    id: 'mem-7',
    name: 'Andi Perkasa Santoso',
    dob: '2004-06-12',
    gender: 'male',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'single',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    fatherId: 'mem-3',
    motherId: 'mem-4',
    spouseId: null,
    role: 'Anak Sulung / Cucu 1',
    notes: 'Mahasiswa Teknik Informatika'
  },
  {
    id: 'mem-8',
    name: 'Maya Putri Santoso',
    dob: '2009-08-25',
    gender: 'female',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'single',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    fatherId: 'mem-3',
    motherId: 'mem-4',
    spouseId: null,
    role: 'Anak Bungsu / Cucu 2',
    notes: 'Siswi SMA'
  },
  {
    id: 'mem-9',
    name: 'Rizky Prasetya',
    dob: '2015-12-03',
    gender: 'male',
    status: 'alive',
    deathDate: null,
    maritalStatus: 'single',
    photoUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=300&q=80',
    fatherId: 'mem-5',
    motherId: 'mem-6',
    spouseId: null,
    role: 'Keponakan / Cucu 3',
    notes: 'Siswa SD'
  }
];

export class FamilyDB {
  static getMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveMembers(INITIAL_FAMILY_DATA);
        return INITIAL_FAMILY_DATA;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return INITIAL_FAMILY_DATA;
    }
  }

  static saveMembers(members) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  static getMemberById(id) {
    const members = this.getMembers();
    return members.find(m => m.id === id) || null;
  }

  static addMember(newMember) {
    const members = this.getMembers();
    const id = 'mem-' + Date.now();
    const memberWithId = {
      ...newMember,
      id,
      photoUrl: newMember.photoUrl || getSampleAvatar(newMember.gender, newMember.name, id)
    };
    
    members.push(memberWithId);

    // If spouse is set, sync spouse relationship
    if (memberWithId.spouseId) {
      const spouseIndex = members.findIndex(m => m.id === memberWithId.spouseId);
      if (spouseIndex !== -1) {
        members[spouseIndex].spouseId = id;
      }
    }

    this.saveMembers(members);
    return memberWithId;
  }

  static updateMember(id, updatedFields) {
    let members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;

    const oldMember = members[index];
    const newSpouseId = updatedFields.spouseId;
    const oldSpouseId = oldMember.spouseId;

    // Update member
    members[index] = {
      ...oldMember,
      ...updatedFields,
      photoUrl: updatedFields.photoUrl || oldMember.photoUrl || getSampleAvatar(updatedFields.gender || oldMember.gender, updatedFields.name || oldMember.name, id)
    };

    // If spouse changed, update reverse references
    if (oldSpouseId && oldSpouseId !== newSpouseId) {
      const oldSpouseIdx = members.findIndex(m => m.id === oldSpouseId);
      if (oldSpouseIdx !== -1 && members[oldSpouseIdx].spouseId === id) {
        members[oldSpouseIdx].spouseId = null;
      }
    }

    if (newSpouseId) {
      const newSpouseIdx = members.findIndex(m => m.id === newSpouseId);
      if (newSpouseIdx !== -1) {
        members[newSpouseIdx].spouseId = id;
      }
    }

    this.saveMembers(members);
    return members[index];
  }

  static deleteMember(id) {
    let members = this.getMembers();
    
    // Remove references in other members (fatherId, motherId, spouseId)
    members = members.map(m => {
      let updated = { ...m };
      if (updated.fatherId === id) updated.fatherId = null;
      if (updated.motherId === id) updated.motherId = null;
      if (updated.spouseId === id) updated.spouseId = null;
      return updated;
    });

    // Remove member
    members = members.filter(m => m.id !== id);
    this.saveMembers(members);
    return true;
  }

  static resetToDefault() {
    this.saveMembers(INITIAL_FAMILY_DATA);
    return INITIAL_FAMILY_DATA;
  }
}
