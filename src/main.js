import { FamilyDB } from './storage/db.js';
import { TreeView } from './components/TreeView.js';
import { ListView } from './components/ListView.js';
import { StatsView } from './components/StatsView.js';
import { MemberFormModal } from './components/MemberFormModal.js';
import { MemberDetailModal } from './components/MemberDetailModal.js';

class FamilyTreeApp {
  constructor() {
    this.members = [];
    this.currentTab = 'tree';

    // Components
    this.treeView = null;
    this.listView = null;
    this.statsView = null;
    this.formModal = null;
    this.detailModal = null;

    this.init();
  }

  init() {
    // Load members from Database / LocalStorage
    this.members = FamilyDB.getMembers();

    // Initialize Modals
    this.formModal = new MemberFormModal((id, data) => this.handleSaveMember(id, data));
    this.detailModal = new MemberDetailModal(
      (member) => this.handleEditMember(member),
      (id) => this.handleDeleteMember(id)
    );

    // Initialize Views
    this.treeView = new TreeView('tree-view-wrapper', (member) => this.handleSelectMember(member));
    this.listView = new ListView('list-view-wrapper', (member) => this.handleSelectMember(member));
    this.statsView = new StatsView('stats-view-wrapper');

    // Bind UI Events
    this.bindEvents();

    // Render Initial View
    this.renderCurrentView();
  }

  bindEvents() {
    // Bottom Nav Tabs
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // FAB Add Member
    const fabBtn = document.getElementById('fab-add-member');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
        this.formModal.show(null, this.members);
      });
    }

    // Reset Data Button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset data ke silsilah contoh awal (3 Generasi)?')) {
          this.members = FamilyDB.resetToDefault();
          this.renderCurrentView();
        }
      });
    }
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Update active tab buttons
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Show/Hide view wrappers
    const treeWrap = document.getElementById('tree-view-wrapper');
    const listWrap = document.getElementById('list-view-wrapper');
    const statsWrap = document.getElementById('stats-view-wrapper');

    treeWrap.style.display = tab === 'tree' ? 'block' : 'none';
    listWrap.style.display = tab === 'list' ? 'block' : 'none';
    statsWrap.style.display = tab === 'stats' ? 'block' : 'none';

    this.renderCurrentView();
  }

  renderCurrentView() {
    if (this.currentTab === 'tree') {
      this.treeView.render(this.members);
    } else if (this.currentTab === 'list') {
      this.listView.render(this.members);
    } else if (this.currentTab === 'stats') {
      this.statsView.render(this.members);
    }
  }

  handleSelectMember(member) {
    this.detailModal.show(member, this.members);
  }

  handleEditMember(member) {
    this.formModal.show(member, this.members);
  }

  handleSaveMember(id, memberData) {
    if (id) {
      FamilyDB.updateMember(id, memberData);
    } else {
      FamilyDB.addMember(memberData);
    }
    this.members = FamilyDB.getMembers();
    this.renderCurrentView();
  }

  handleDeleteMember(id) {
    FamilyDB.deleteMember(id);
    this.members = FamilyDB.getMembers();
    this.renderCurrentView();
  }
}

// Instantiate on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  new FamilyTreeApp();
});
