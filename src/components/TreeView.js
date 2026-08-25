import { calculateAge } from '../utils/ageCalculator.js';

export class TreeView {
  constructor(containerId, onMemberClick) {
    this.container = document.getElementById(containerId);
    this.onMemberClick = onMemberClick;
  }

  render(members) {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (!members || members.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <p>Belum ada anggota keluarga. Klik tombol + untuk menambahkan anggota pertama.</p>
        </div>
      `;
      return;
    }

    // Group members by generation level
    const generations = this.calculateGenerations(members);

    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'tree-container';

    // SVG for connecting lines
    const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.setAttribute('id', 'tree-svg-lines');
    svgOverlay.style.position = 'absolute';
    svgOverlay.style.top = '0';
    svgOverlay.style.left = '0';
    svgOverlay.style.width = '100%';
    svgOverlay.style.height = '100%';
    svgOverlay.style.pointerEvents = 'none';
    svgOverlay.style.zIndex = '1';
    treeWrapper.appendChild(svgOverlay);

    // Render generation levels
    generations.forEach((levelMembers, genIdx) => {
      const levelDiv = document.createElement('div');
      levelDiv.className = 'tree-level';
      levelDiv.setAttribute('data-gen', genIdx + 1);

      const levelTitle = document.createElement('span');
      levelTitle.className = 'level-title';
      levelTitle.textContent = `Generasi ${genIdx + 1}`;
      levelDiv.appendChild(levelTitle);

      levelMembers.forEach(member => {
        const nodeCard = this.createMemberNode(member);
        levelDiv.appendChild(nodeCard);
      });

      treeWrapper.appendChild(levelDiv);
    });

    this.container.appendChild(treeWrapper);

    const updateLines = () => {
      this.drawConnectingLines(members, treeWrapper, svgOverlay);
    };

    requestAnimationFrame(updateLines);

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.resizeHandler = updateLines;
    window.addEventListener('resize', this.resizeHandler);
  }

  calculateGenerations(members) {
    const memberMap = new Map(members.map(m => [m.id, m]));
    const genMap = new Map();

    // Find roots (members with no parents in database)
    members.forEach(m => {
      if (!m.fatherId && !m.motherId) {
        genMap.set(m.id, 0);
      }
    });

    // Iteratively resolve generations for children
    let changed = true;
    let passes = 0;
    while (changed && passes < 10) {
      changed = false;
      passes++;
      members.forEach(m => {
        const fatherGen = m.fatherId ? genMap.get(m.fatherId) : undefined;
        const motherGen = m.motherId ? genMap.get(m.motherId) : undefined;

        const maxParentGen = Math.max(
          fatherGen !== undefined ? fatherGen : -1,
          motherGen !== undefined ? motherGen : -1
        );

        if (maxParentGen >= 0) {
          const currentGen = genMap.get(m.id);
          const newGen = maxParentGen + 1;
          if (currentGen !== newGen) {
            genMap.set(m.id, newGen);
            changed = true;
          }
        }
      });
    }

    // Assign default 0 for unassigned
    members.forEach(m => {
      if (!genMap.has(m.id)) {
        genMap.set(m.id, 0);
      }
    });

    // Sync spouses to same generation (spouse with parent-derived gen takes precedence)
    for (let i = 0; i < 3; i++) {
      members.forEach(m => {
        if (m.spouseId && genMap.has(m.spouseId)) {
          const myGen = genMap.get(m.id);
          const spouseGen = genMap.get(m.spouseId);
          const targetGen = Math.max(myGen, spouseGen);
          genMap.set(m.id, targetGen);
          genMap.set(m.spouseId, targetGen);
        }
      });
    }

    // Group into arrays
    const maxGen = Math.max(...Array.from(genMap.values()), 0);
    const result = Array.from({ length: maxGen + 1 }, () => []);

    members.forEach(m => {
      const g = genMap.get(m.id) || 0;
      result[g].push(m);
    });

    return result;
  }

  createMemberNode(member) {
    const ageInfo = calculateAge(member.dob, member.deathDate);
    const card = document.createElement('div');
    card.className = 'member-node';
    card.setAttribute('data-id', member.id);

    const isAlive = member.status === 'alive';

    card.innerHTML = `
      <div class="avatar-wrapper">
        <img src="${member.photoUrl}" alt="${member.name}" class="avatar-img" />
        <span class="status-dot ${isAlive ? 'alive' : 'deceased'}" title="${isAlive ? 'Hidup' : 'Meninggal'}"></span>
      </div>
      <div class="member-name">${member.name}</div>
      <div class="member-age-badge">${ageInfo.shortString}</div>
      <div class="member-role">${member.role || (member.gender === 'male' ? 'Pria' : 'Wanita')}</div>
    `;

    card.addEventListener('click', () => {
      if (this.onMemberClick) this.onMemberClick(member);
    });

    return card;
  }

  drawConnectingLines(members, wrapper, svg) {
    const wrapperRect = wrapper.getBoundingClientRect();
    svg.setAttribute('width', wrapperRect.width);
    svg.setAttribute('height', wrapperRect.height);
    svg.innerHTML = '';

    members.forEach(m => {
      if (!m.fatherId && !m.motherId) return;

      const childEl = wrapper.querySelector(`[data-id="${m.id}"]`);
      if (!childEl) return;

      const childRect = childEl.getBoundingClientRect();
      const childX = childRect.left + childRect.width / 2 - wrapperRect.left;
      const childY = childRect.top - wrapperRect.top;

      let parentEl = null;
      if (m.fatherId) parentEl = wrapper.querySelector(`[data-id="${m.fatherId}"]`);
      if (!parentEl && m.motherId) parentEl = wrapper.querySelector(`[data-id="${m.motherId}"]`);

      if (parentEl) {
        const parentRect = parentEl.getBoundingClientRect();
        const parentX = parentRect.left + parentRect.width / 2 - wrapperRect.left;
        const parentY = parentRect.bottom - wrapperRect.top;

        const midY = parentY + (childY - parentY) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${parentX} ${parentY} V ${midY} H ${childX} V ${childY}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#6366f1');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.6');
        path.setAttribute('stroke-dasharray', '4 2');
        svg.appendChild(path);
      }
    });
  }
}
