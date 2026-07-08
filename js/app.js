// SPDX-License-Identifier: AGPL-3.0-only

(function() {
  'use strict';
  window.dh = window.dh || {};
  var loadScript = window.dh.loadScript;
  var idxLoaded = loadScript('lang/index.js');
  idxLoaded.then(function() {
    window.dh.chapterEnds = window.__dh_index.chapterEnds;
    window.dh.chapterNames = window.__dh_index.chapterNames;
    window.dh.langList = window.__dh_index.languages;
    window.dh.totalChapters = window.dh.chapterEnds.length;
    var start = 1;
    for (var ei = 0; ei < window.dh.chapterEnds.length; ei++) {
      var verses = [];
      for (var v = start; v <= window.dh.chapterEnds[ei]; v++) verses.push(String(v));
      window.dh.chapters.push(verses);
      start = window.dh.chapterEnds[ei] + 1;
    }
    for (var li = 0; li < window.dh.langList.length; li++) {
      var opt = document.createElement('option');
      opt.value = window.dh.langList[li].code;
      opt.textContent = window.dh.langList[li].name;
      window.dh.langSelect.appendChild(opt);
    }
    window.dh.loadSettings();
    window.dh.langSelect.value = window.dh.currentLang;
    window.dh.paliToggle.checked = window.dh.paliEnabled;
    window.dh.darkToggle.checked = window.dh.darkMode;
    window.dh.fontSlider.value = window.dh.fontSize;
    if (window.dh.darkMode) document.body.classList.add('dark');
    var langLoad = loadScript('lang/' + window.dh.currentLang + '.js');
    var paliLoad = loadScript('lang/pi.js');
    Promise.all([langLoad, paliLoad]).then(function() {
      window.dh.langData = window.__dh_data[window.dh.currentLang];
      window.dh.paliData = window.__dh_data.pi;
      window.dh.buildSidebar(true);
      if (window.dh.savedScrollPos > 0) {
        window.dh.mainContent.scrollTop = window.dh.savedScrollPos;
        requestAnimationFrame(function() { window.dh.updateSidebarChapter(); });
      } else if (window.dh.currentChapter !== null) {
        window.dh.scrollToChapter(window.dh.currentChapter);
      } else {
        window.dh.currentChapter = 0;
        window.dh.updateSidebarChapter();
      }
    });
  });
  window.dh.menuBtn.addEventListener('click', window.dh.toggleSidebar);
  window.dh.sidebarBackdrop.addEventListener('click', window.dh.closeSidebar);
  window.addEventListener('resize', function() {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  });
  window.dh.mainContent.addEventListener('scroll', function() {
    if (!window.dh.scrollTicking) {
      requestAnimationFrame(function() {
        window.dh.updateSidebarChapter();
        window.dh.scrollTicking = false;
      });
      window.dh.scrollTicking = true;
    }
  }, { passive: true });
  window.dh.langSelect.onchange = function() { window.dh.switchLang(window.dh.langSelect.value); };
  window.dh.paliToggle.onchange = function() {
    window.dh.paliEnabled = window.dh.paliToggle.checked;
    var saved = window.dh.mainContent.scrollTop;
    window.dh.renderAllVerses();
    requestAnimationFrame(function() { window.dh.mainContent.scrollTop = saved; window.dh.updateSidebarChapter(); });
    window.dh.saveSettings();
  };
  window.dh.darkToggle.onchange = function() {
    window.dh.darkMode = window.dh.darkToggle.checked;
    document.body.classList.toggle('dark', window.dh.darkMode);
    window.dh.saveSettings();
  };
  window.dh.fontSlider.oninput = function() {
    window.dh.fontSize = +window.dh.fontSlider.value;
    window.dh.applyFontSize();
    window.dh.saveSettings();
  };
  window.dh.shareClose.addEventListener('click', window.dh.closeShareModal);
  window.dh.shareOverlay.addEventListener('click', function(e) { if (e.target === window.dh.shareOverlay) window.dh.closeShareModal(); });
  window.dh.shareCopy.addEventListener('click', function() {
    window.dh.copyToClipboard(window.dh.shareVerse.textContent);
    window.dh.shareCopy.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    setTimeout(function() { window.dh.shareCopy.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="12" height="17" rx="1"/><path d="M4 7v13a1 1 0 0 0 1 1h11"/></svg>'; }, 1200);
  });
  setInterval(window.dh.saveSettings, 3000);
  window.addEventListener('beforeunload', window.dh.saveSettings);
})();
