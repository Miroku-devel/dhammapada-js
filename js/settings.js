// SPDX-License-Identifier: AGPL-3.0-only

(function() {
  'use strict';
  window.dh = window.dh || {};
  window.dh.saveSettings = function() {
    try {
      localStorage.setItem('dhammapada', JSON.stringify({
        lang: window.dh.currentLang,
        fontSize: window.dh.fontSize,
        dark: window.dh.darkMode,
        pali: window.dh.paliEnabled,
        chapter: window.dh.currentChapter,
        scrollPos: window.dh.mainContent.scrollTop
      }));
    } catch (_) {}
  };
  window.dh.loadSettings = function() {
    try {
      var saved = JSON.parse(localStorage.getItem('dhammapada'));
      if (saved) {
        if (saved.lang) window.dh.currentLang = saved.lang;
        if (saved.fontSize) window.dh.fontSize = saved.fontSize;
        window.dh.darkMode = saved.dark || false;
        window.dh.paliEnabled = saved.pali || false;
        window.dh.currentChapter = saved.chapter;
        window.dh.savedScrollPos = saved.scrollPos || 0;
      }
    } catch (_) {}
  };
  window.dh.switchLang = function(code) {
    window.dh.currentLang = code;
    window.dh.loadScript('lang/' + code + '.js').then(function() {
      window.dh.langData = window.__dh_data[code];
      window.dh.buildSidebar();
      window.dh.saveSettings();
    });
  };
})();
