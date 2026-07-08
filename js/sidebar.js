// SPDX-License-Identifier: AGPL-3.0-only

(function() {
  'use strict';
  window.dh = window.dh || {};
  window.dh.isMobile = function() {
    return window.innerWidth <= 768;
  };
  window.dh.toggleSidebar = function() {
    window.dh.sidebar.classList.toggle('open');
    window.dh.sidebarBackdrop.classList.toggle('open');
    if (window.dh.sidebar.classList.contains('open')) {
      requestAnimationFrame(function() {
        var activeBtn = window.dh.sidebar.querySelector('.chapter-btn.active');
        if (activeBtn) {
          var br = activeBtn.getBoundingClientRect();
          var sr = window.dh.sidebar.getBoundingClientRect();
          var of = br.top - sr.top + window.dh.sidebar.scrollTop;
          if (of < window.dh.sidebar.scrollTop) {
            window.dh.sidebar.scrollTop = of;
          } else if (of + br.height > window.dh.sidebar.scrollTop + window.dh.sidebar.clientHeight) {
            window.dh.sidebar.scrollTop = of + br.height - window.dh.sidebar.clientHeight;
          }
        }
      });
    }
  };
  window.dh.closeSidebar = function() {
    window.dh.sidebar.classList.remove('open');
    window.dh.sidebarBackdrop.classList.remove('open');
  };
  window.dh.updateSidebarChapter = function(skipScroll) {
    var sections = window.dh.versesContainer.querySelectorAll('.chapter-section');
    var containerTop = window.dh.mainContent.getBoundingClientRect().top;
    var midPoint = containerTop + window.dh.mainContent.clientHeight / 2;
    var bestIdx = window.dh.currentChapter !== null ? window.dh.currentChapter : 0;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= midPoint) {
        bestIdx = i;
      }
    }
    if (bestIdx !== window.dh.currentChapter) {
      window.dh.currentChapter = bestIdx;
    }
    var btns = window.dh.sidebar.querySelectorAll('.chapter-btn');
    for (var bi = 0; bi < btns.length; bi++) {
      btns[bi].classList.toggle('active', +btns[bi].dataset.id === bestIdx);
    }
    if (!skipScroll && window.dh.sidebar.offsetParent !== null) {
      var activeBtn = window.dh.sidebar.querySelector('.chapter-btn.active');
      if (activeBtn) {
        var br = activeBtn.getBoundingClientRect();
        var sr = window.dh.sidebar.getBoundingClientRect();
        var of = br.top - sr.top + window.dh.sidebar.scrollTop;
        if (of < window.dh.sidebar.scrollTop) {
          window.dh.sidebar.scrollTop = of;
        } else if (of + br.height > window.dh.sidebar.scrollTop + window.dh.sidebar.clientHeight) {
          window.dh.sidebar.scrollTop = of + br.height - window.dh.sidebar.clientHeight;
        }
      }
    }
  };
  window.dh.scrollToChapter = function(idx) {
    if (idx < 0 || idx >= window.dh.totalChapters) return;
    var section = window.dh.versesContainer.querySelector('.chapter-section[data-chapter="' + idx + '"]');
    if (section) {
      var mainRect = window.dh.mainContent.getBoundingClientRect();
      var sectionRect = section.getBoundingClientRect();
      var scrollPadding = parseInt(getComputedStyle(window.dh.mainContent).scrollPaddingTop) || 0;
      window.dh.mainContent.scrollTop += sectionRect.top - mainRect.top - scrollPadding;
    }
    window.dh.updateSidebarChapter();
  };
  window.dh.buildSidebar = function(skipChapterUpdate) {
    document.getElementById('chaptersTitle').textContent = window.dh.langData.chaps || 'Chapters';
    var existing = window.dh.sidebar.querySelectorAll('.chapter-btn');
    for (var bi = 0; bi < existing.length; bi++) existing[bi].remove();
    for (var i = 0; i < window.dh.totalChapters; i++) {
      var name = window.dh.langData[window.dh.chapterNames[i]] || window.dh.chapterNames[i];
      var btn = document.createElement('button');
      btn.className = 'chapter-btn';
      btn.textContent = (i + 1) + '. ' + name;
      btn.dataset.id = i;
      btn.onclick = function(idx) { return function() { window.dh.scrollToChapter(idx); if (window.dh.isMobile()) window.dh.closeSidebar(); }; }(i);
      window.dh.sidebar.appendChild(btn);
    }
    window.dh.renderAllVerses();
    if (!skipChapterUpdate) window.dh.updateSidebarChapter();
  };
})();
