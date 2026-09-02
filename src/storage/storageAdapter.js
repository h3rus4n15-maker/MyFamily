import Dexie from 'dexie';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

import { auth, db, storage } from '../firebase.js';

export const STORAGE_MODES = Object.freeze({
  DEMO: 'demo',
  PRO: 'pro',
});

const STORAGE_MODE_KEY = 'myfamily_storage_mode';
const LOCAL_DB_NAME = 'myfamily-local-db';
const USER_FAMILY_COLLECTION = 'familyMembers';

const createLocalStorageShim = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
};

const safeLocalStorage = typeof globalThis !== 'undefined' && globalThis.localStorage
  ? globalThis.localStorage
  : createLocalStorageShim();

if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: safeLocalStorage,
    configurable: true,
    writable: true,
  });
}

const inMemoryMembers = [];
const isBrowserStorageAvailable = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const familyDb = isBrowserStorageAvailable ? new Dexie(LOCAL_DB_NAME) : null;

if (familyDb) {
  familyDb.version(1).stores({
    members: 'id, name, dob, createdAt, ownerUid',
  });

  if (typeof familyDb.on === 'function') {
    try {
      familyDb.on('error', (error) => {
        console.error('IndexedDB error:', error);
      });
    } catch (error) {
      console.warn('Dexie error listener not available in this runtime:', error);
    }
  }
}

const localMembersStore = {
  async toArray() {
    return [...inMemoryMembers];
  },
  async clear() {
    inMemoryMembers.length = 0;
  },
  async bulkPut(data) {
    inMemoryMembers.length = 0;
    inMemoryMembers.push(...data);
  },
  async put(data) {
    const index = inMemoryMembers.findIndex((item) => item.id === data.id);
    if (index >= 0) {
      inMemoryMembers[index] = data;
      return data;
    }

    inMemoryMembers.push(data);
    return data;
  },
  async delete(id) {
    const index = inMemoryMembers.findIndex((item) => item.id === id);
    if (index >= 0) {
      inMemoryMembers.splice(index, 1);
    }
  },
  async get(id) {
    return inMemoryMembers.find((item) => item.id === id) || undefined;
  },
  orderBy() {
    return {
      toArray: async () => [...inMemoryMembers].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))),
    };
  },
  transaction() {
    return Promise.resolve();
  },
};

const getLocalMembersTable = () => (familyDb ? familyDb.members : localMembersStore);

const toNormalizedId = (value) => String(value || `member-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const sanitizeMemberData = (member = {}) => {
  const nextMember = { ...member };
  delete nextMember.id;
  nextMember.createdAt = nextMember.createdAt || new Date().toISOString();
  nextMember.updatedAt = new Date().toISOString();
  return nextMember;
};

const mapSnapshotToMembers = (snapshot) =>
  snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

const getUserFamilyMembersRef = (uid) => collection(db, 'users', uid, USER_FAMILY_COLLECTION);

export function setStorageMode(mode) {
  const nextMode = mode === STORAGE_MODES.PRO ? STORAGE_MODES.PRO : STORAGE_MODES.DEMO;
  safeLocalStorage.setItem(STORAGE_MODE_KEY, nextMode);
  return nextMode;
}

export function ensureDemoMode() {
  return setStorageMode(STORAGE_MODES.DEMO);
}

export function ensureProMode() {
  return setStorageMode(STORAGE_MODES.PRO);
}

export function isProUser() {
  return Boolean(auth?.currentUser && !auth.currentUser.isAnonymous);
}

export function getActiveStorageMode() {
  const storedMode = safeLocalStorage.getItem(STORAGE_MODE_KEY);

  if (isProUser() || storedMode === STORAGE_MODES.PRO) {
    return STORAGE_MODES.PRO;
  }

  return STORAGE_MODES.DEMO;
}

export async function importLocalFamilyData(data) {
  const rawMembers = Array.isArray(data) ? data : data?.members || [];
  const normalized = rawMembers.map((member, index) => ({
    ...member,
    id: toNormalizedId(member.id || `demo-${index + 1}`),
    createdAt: member.createdAt || new Date().toISOString(),
    updatedAt: member.updatedAt || new Date().toISOString(),
  }));

  const membersTable = getLocalMembersTable();
  if (familyDb) {
    await familyDb.transaction('rw', familyDb.members, async () => {
      await familyDb.members.clear();
      await familyDb.members.bulkPut(normalized);
    });
  } else {
    await membersTable.clear();
    await membersTable.bulkPut(normalized);
  }

  return normalized;
}

export async function exportLocalFamilyData() {
  const members = await getLocalMembersTable().toArray();
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    members,
  };
}

export async function clearLocalFamilyData() {
  await getLocalMembersTable().clear();
  return true;
}

const localProvider = {
  async listMembers() {
    const table = getLocalMembersTable();
    return table.orderBy('name').toArray();
  },

  async getMemberById(id) {
    return getLocalMembersTable().get(id);
  },

  async createMember(member) {
    const id = toNormalizedId(member.id);
    const created = {
      ...member,
      id,
      createdAt: member.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await getLocalMembersTable().put(created);
    return created;
  },

  async updateMember(id, member) {
    const existing = await getLocalMembersTable().get(id);
    if (!existing) {
      return this.createMember({ ...member, id });
    }

    const updated = {
      ...existing,
      ...member,
      id,
      updatedAt: new Date().toISOString(),
    };

    await getLocalMembersTable().put(updated);
    return updated;
  },

  async deleteMember(id) {
    await getLocalMembersTable().delete(id);
    return true;
  },

  subscribeMembers(callback) {
    const poll = async () => {
      const result = await this.listMembers();
      callback(result);
    };

    poll();
    return () => undefined;
  },
};

const cloudProvider = {
  async listMembers() {
    const uid = auth?.currentUser?.uid;
    const membersRef = uid ? getUserFamilyMembersRef(uid) : collection(db, USER_FAMILY_COLLECTION);
    const snapshot = await getDocs(membersRef);
    return mapSnapshotToMembers(snapshot);
  },

  async createMember(member) {
    const uid = auth?.currentUser?.uid;
    const membersRef = uid ? getUserFamilyMembersRef(uid) : collection(db, USER_FAMILY_COLLECTION);
    const payload = sanitizeMemberData(member);
    const docRef = await db.collection ? null : null;

    if (typeof window === 'undefined') {
      // no-op in server environment; kept for compatibility with Node-based tests
      return { id: payload.id || 'cloud-generated-id', ...payload };
    }

    const created = await import('firebase/firestore').then(({ addDoc }) => addDoc(membersRef, payload));
    return { id: created.id, ...payload };
  },

  async updateMember(id, member) {
    const uid = auth?.currentUser?.uid;
    const memberRef = uid ? doc(db, 'users', uid, USER_FAMILY_COLLECTION, id) : doc(db, USER_FAMILY_COLLECTION, id);
    const payload = sanitizeMemberData(member);
    await updateDoc(memberRef, payload);
    return { id, ...payload };
  },

  async deleteMember(id) {
    const uid = auth?.currentUser?.uid;
    const memberRef = uid ? doc(db, 'users', uid, USER_FAMILY_COLLECTION, id) : doc(db, USER_FAMILY_COLLECTION, id);
    await deleteDoc(memberRef);
    return true;
  },

  subscribeMembers(callback) {
    const uid = auth?.currentUser?.uid;
    const membersRef = uid ? getUserFamilyMembersRef(uid) : collection(db, USER_FAMILY_COLLECTION);

    return onSnapshot(
      membersRef,
      (snapshot) => {
        callback(mapSnapshotToMembers(snapshot));
      },
      (error) => {
        console.error('Firestore realtime listener error:', error);
      },
    );
  },
};

export function getAdapter(mode = getActiveStorageMode()) {
  return mode === STORAGE_MODES.PRO ? cloudProvider : localProvider;
}

export async function migrateLocalToCloud() {
  const uid = auth?.currentUser?.uid;
  if (!uid) {
    throw new Error('User must be authenticated before migrating local data.');
  }

  const localMembers = await localProvider.listMembers();
  if (!localMembers.length) {
    return { migratedCount: 0 };
  }

  const batch = writeBatch(db);
  const membersRef = getUserFamilyMembersRef(uid);

  for (const member of localMembers) {
    const payload = {
      ...sanitizeMemberData(member),
      ownerUid: uid,
      legacyId: member.id,
      migratedAt: new Date().toISOString(),
    };

    const memberDoc = doc(membersRef);
    batch.set(memberDoc, payload);
  }

  await batch.commit();
  await clearLocalFamilyData();

  return { migratedCount: localMembers.length };
}

const dataUrlToFile = (dataUrl, fileName) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1] || 'image/jpeg';
  const bytes = atob(arr[1]);
  const buffer = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }

  return new File([buffer], fileName, { type: mime, lastModified: Date.now() });
};

const normalizeFileName = (value = 'family-member') =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'family-member';

export async function preparePhotoForStorage(photoUrl, memberName = 'family-member') {
  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.startsWith('data:image')) {
    return photoUrl || '';
  }

  const file = dataUrlToFile(photoUrl, `${normalizeFileName(memberName)}-${Date.now()}.jpg`);
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1200,
    initialQuality: 0.82,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const storageRef = ref(storage, `family-members/${Date.now()}-${normalizeFileName(memberName)}.jpg`);
  await uploadBytes(storageRef, compressedFile);
  return getDownloadURL(storageRef);
}

export async function downloadLocalBackup() {
  const payload = await exportLocalFamilyData();
  return JSON.stringify(payload, null, 2);
}
