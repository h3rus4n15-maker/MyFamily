import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STORAGE_MODES,
  ensureDemoMode,
  ensureProMode,
  getActiveStorageMode,
  exportLocalFamilyData,
  importLocalFamilyData,
  getAdapter,
} from './storageAdapter.js';

test('active storage mode defaults to demo', () => {
  localStorage.clear();
  assert.equal(getActiveStorageMode(), STORAGE_MODES.DEMO);
});

test('demo mode can be activated explicitly', () => {
  ensureDemoMode();
  assert.equal(getActiveStorageMode(), STORAGE_MODES.DEMO);
});

test('pro mode can be activated explicitly', () => {
  ensureProMode();
  assert.equal(getActiveStorageMode(), STORAGE_MODES.PRO);
});

test('export/import JSON roundtrip works for local demo data', async () => {
  const members = [
    { id: 'm-1', name: 'Demo User', dob: '2000-01-01', gender: 'male' },
    { id: 'm-2', name: 'Demo Partner', dob: '2001-02-02', gender: 'female' }
  ];

  await importLocalFamilyData(members);
  const exported = await exportLocalFamilyData();

  assert.deepEqual(
    exported.members.map(({ createdAt, updatedAt, ...rest }) => rest),
    members,
  );
  const adapter = getAdapter();
  const listed = await adapter.listMembers();
  assert.equal(listed.length, 2);
  assert.deepEqual(new Set(listed.map((item) => item.id)), new Set(['m-1', 'm-2']));
});
