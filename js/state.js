// SPDX-License-Identifier: AGPL-3.0-only
(function() {
  'use strict';
  window.dh = window.dh || {};

  // State variables
  window.dh.currentLang = 'en';
  window.dh.currentChapter = null;
  window.dh.paliEnabled = false;
  window.dh.darkMode = false;
  window.dh.fontSize = 16;
  window.dh.savedScrollPos = 0;
  window.dh.langData = null;
  window.dh.paliData = null;
  window.dh.scrollTicking = false;
  window.dh.chapterEnds = null;
  window.dh.chapterNames = null;
  window.dh.langList = null;
  window.dh.totalChapters = 0;
  window.dh.chapters = [];

  // DOM elements
  window.dh.langSelect = document.getElementById('langSelect');
  window.dh.sidebar = document.getElementById('sidebar');
  window.dh.mainContent = document.getElementById('mainContent');
  window.dh.versesContainer = document.getElementById('versesContainer');
  window.dh.paliToggle = document.getElementById('paliToggle');
  window.dh.darkToggle = document.getElementById('darkToggle');
  window.dh.fontSlider = document.getElementById('fontSlider');
  window.dh.menuBtn = document.getElementById('menuBtn');
  window.dh.sidebarBackdrop = document.getElementById('sidebarBackdrop');
  window.dh.shareOverlay = document.getElementById('shareOverlay');
  window.dh.shareClose = document.getElementById('shareClose');
  window.dh.shareVerse = document.getElementById('shareVerse');
  window.dh.shareWhatsapp = document.getElementById('shareWhatsapp');
  window.dh.shareFacebook = document.getElementById('shareFacebook');
  window.dh.shareX = document.getElementById('shareX');
  window.dh.shareReddit = document.getElementById('shareReddit');
  window.dh.shareTelegram = document.getElementById('shareTelegram');
  window.dh.shareEmail = document.getElementById('shareEmail');
  window.dh.shareCopy = document.getElementById('shareCopy');
})();