(function() {
  function loadScript(url) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var idxLoaded = loadScript('lang/index.js');
  var chapterEnds, chapterNames, langList, totalChapters;
  var chapters = [];

  idxLoaded.then(function() {
    chapterEnds = window.__dh_index.chapterEnds;
    chapterNames = window.__dh_index.chapterNames;
    langList = window.__dh_index.languages;
    totalChapters = chapterEnds.length;

    var start = 1;
    for (var ei = 0; ei < chapterEnds.length; ei++) {
      var verses = [];
      for (var v = start; v <= chapterEnds[ei]; v++) verses.push(String(v));
      chapters.push(verses);
      start = chapterEnds[ei] + 1;
    }

    for (var li = 0; li < langList.length; li++) {
      var opt = document.createElement('option');
      opt.value = langList[li].code;
      opt.textContent = langList[li].name;
      langSelect.appendChild(opt);
    }

    try {
      var saved = JSON.parse(localStorage.getItem('dhammapada'));
      if (saved) {
        if (saved.lang) currentLang = saved.lang;
        if (saved.fontSize) fontSize = saved.fontSize;
        darkMode = saved.dark || false;
        paliEnabled = saved.pali || false;
        currentChapter = saved.chapter;
        savedScrollPos = saved.scrollPos || 0;
      }
    } catch (_) {}

    langSelect.value = currentLang;
    paliToggle.checked = paliEnabled;
    darkToggle.checked = darkMode;
    fontSlider.value = fontSize;
    if (darkMode) document.body.classList.add('dark');

    var langLoad = loadScript('lang/' + currentLang + '.js');
    var paliLoad = loadScript('lang/pi.js');
    Promise.all([langLoad, paliLoad]).then(function() {
      langData = window.__dh_data[currentLang];
      paliData = window.__dh_data.pi;
      buildSidebar(true);
      if (savedScrollPos > 0) {
        mainContent.scrollTop = savedScrollPos;
        requestAnimationFrame(function() { updateSidebarChapter(); });
      } else if (currentChapter !== null) {
        scrollToChapter(currentChapter);
      } else {
        currentChapter = 0;
        updateSidebarChapter();
      }
    });
  });

  var currentLang = 'en';
  var currentChapter = null;
  var paliEnabled = false;
  var darkMode = false;
  var fontSize = 16;
  var savedScrollPos = 0;
  var langData = null;
  var paliData = null;
  var scrollTicking = false;

  var langSelect = document.getElementById('langSelect');
  var sidebar = document.getElementById('sidebar');
  var mainContent = document.getElementById('mainContent');
  var versesContainer = document.getElementById('versesContainer');
  var paliToggle = document.getElementById('paliToggle');
  var darkToggle = document.getElementById('darkToggle');
  var fontSlider = document.getElementById('fontSlider');
  var menuBtn = document.getElementById('menuBtn');
  var sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function isMobile() { return window.innerWidth <= 768; }

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarBackdrop.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
      requestAnimationFrame(function() {
        var activeBtn = sidebar.querySelector('.chapter-btn.active');
        if (activeBtn) {
          var br = activeBtn.getBoundingClientRect();
          var sr = sidebar.getBoundingClientRect();
          var of = br.top - sr.top + sidebar.scrollTop;
          if (of < sidebar.scrollTop) {
            sidebar.scrollTop = of;
          } else if (of + br.height > sidebar.scrollTop + sidebar.clientHeight) {
            sidebar.scrollTop = of + br.height - sidebar.clientHeight;
          }
        }
      });
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('open');
  }

  menuBtn.addEventListener('click', toggleSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);

  window.addEventListener('resize', function() {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  });

  function applyFontSize() {
    var els = document.querySelectorAll('.verse-text');
    for (var ei = 0; ei < els.length; ei++) els[ei].style.fontSize = fontSize + 'px';
  }

  function switchLang(code) {
    currentLang = code;
    loadScript('lang/' + code + '.js').then(function() {
      langData = window.__dh_data[code];
      buildSidebar();
      saveSettings();
    });
  }

  function updateSidebarChapter(skipScroll) {
    var sections = versesContainer.querySelectorAll('.chapter-section');
    var containerTop = mainContent.getBoundingClientRect().top;
    var midPoint = containerTop + mainContent.clientHeight / 2;
    var bestIdx = currentChapter !== null ? currentChapter : 0;

    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= midPoint) {
        bestIdx = i;
      }
    }

    if (bestIdx !== currentChapter) {
      currentChapter = bestIdx;
    }
    var btns = sidebar.querySelectorAll('.chapter-btn');
    for (var bi = 0; bi < btns.length; bi++) {
      btns[bi].classList.toggle('active', +btns[bi].dataset.id === bestIdx);
    }
    if (!skipScroll && sidebar.offsetParent !== null) {
      var activeBtn = sidebar.querySelector('.chapter-btn.active');
      if (activeBtn) {
        var br = activeBtn.getBoundingClientRect();
        var sr = sidebar.getBoundingClientRect();
        var of = br.top - sr.top + sidebar.scrollTop;
        if (of < sidebar.scrollTop) {
          sidebar.scrollTop = of;
        } else if (of + br.height > sidebar.scrollTop + sidebar.clientHeight) {
          sidebar.scrollTop = of + br.height - sidebar.clientHeight;
        }
      }
    }
  }

  mainContent.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        updateSidebarChapter();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  function renderAllVerses() {
    versesContainer.innerHTML = '';

    for (var ci = 0; ci < chapters.length; ci++) {
      var section = document.createElement('div');
      section.className = 'chapter-section';
      section.dataset.chapter = ci;

      var verseIds = chapters[ci];
      for (var vi = 0; vi < verseIds.length; vi++) {
        var vId = verseIds[vi];
        var text = langData[vId] || '';
        var paliText = paliData ? (paliData[vId] || '') : '';

        var card = document.createElement('div');
        card.className = 'verse-card';

        var content = document.createElement('div');
        content.className = 'verse-content';

        var col1 = document.createElement('div');
        col1.className = 'verse-col';
        var num = document.createElement('span');
        num.className = 'verse-num';
        num.textContent = vId;
        var txt = document.createElement('div');
        txt.className = 'verse-text';
        txt.textContent = text;
        col1.appendChild(num);
        col1.appendChild(txt);
        content.appendChild(col1);

        if (paliEnabled && paliText) {
          var col2 = document.createElement('div');
          col2.className = 'verse-col';
          var pl = document.createElement('span');
          pl.className = 'verse-pali-label';
          pl.textContent = vId + ' (Pāḷi)';
          var pt = document.createElement('div');
          pt.className = 'verse-text';
          pt.textContent = paliText;
          col2.appendChild(pl);
          col2.appendChild(pt);
          content.appendChild(col2);
        }

        card.appendChild(content);

        var footer = document.createElement('div');
        footer.className = 'verse-card-footer';

        var shareBtn = document.createElement('button');
        shareBtn.className = 'copy-btn';
        shareBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v3h8v-3"/><path d="M8 2v8"/><path d="M5 5l3-3 3 3"/></svg>';
        shareBtn.style.cursor = 'pointer';
        (function(ptext) {
          shareBtn.onclick = function() { openShareModal(ptext); };
        })(paliEnabled && paliText ? vId + '\n' + text + '\n\n(' + vId + ' Pāḷi)\n' + paliText : vId + '\n' + text);
        footer.appendChild(shareBtn);

        card.appendChild(footer);

        section.appendChild(card);
      }
      versesContainer.appendChild(section);
    }

    applyFontSize();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  }

  var shareOverlay = document.getElementById('shareOverlay');
  var shareClose = document.getElementById('shareClose');
  var shareVerse = document.getElementById('shareVerse');
  var shareWhatsapp = document.getElementById('shareWhatsapp');
  var shareFacebook = document.getElementById('shareFacebook');
  var shareX = document.getElementById('shareX');
  var shareReddit = document.getElementById('shareReddit');
  var shareTelegram = document.getElementById('shareTelegram');
  var shareEmail = document.getElementById('shareEmail');
  var shareCopy = document.getElementById('shareCopy');

  function openShareModal(text) {
    shareVerse.textContent = text;
    var enc = encodeURIComponent(text);
    shareWhatsapp.href = 'https://api.whatsapp.com/send?text=' + enc;
    shareFacebook.href = 'https://www.facebook.com/sharer/sharer.php?quote=' + enc;
    shareX.href = 'https://twitter.com/intent/tweet?text=' + enc;
    shareReddit.href = 'https://reddit.com/submit?title=Dhammapada&selftext=' + enc;
    shareTelegram.href = 'https://t.me/share/url?url=&text=' + enc;
    shareEmail.href = 'mailto:?subject=Dhammapada&body=' + enc;
    shareOverlay.classList.add('open');
  }

  function closeShareModal() { shareOverlay.classList.remove('open'); }

  shareClose.addEventListener('click', closeShareModal);
  shareOverlay.addEventListener('click', function(e) { if (e.target === shareOverlay) closeShareModal(); });
  shareCopy.addEventListener('click', function() {
    copyToClipboard(shareVerse.textContent);
    shareCopy.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    setTimeout(function() { shareCopy.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="12" height="17" rx="1"/><path d="M4 7v13a1 1 0 0 0 1 1h11"/></svg>'; }, 1200);
  });

  function scrollToChapter(idx) {
    if (idx < 0 || idx >= totalChapters) return;
    var section = versesContainer.querySelector('.chapter-section[data-chapter="' + idx + '"]');
    if (section) {
      var mainRect = mainContent.getBoundingClientRect();
      var sectionRect = section.getBoundingClientRect();
      var scrollPadding = parseInt(getComputedStyle(mainContent).scrollPaddingTop) || 0;
      mainContent.scrollTop += sectionRect.top - mainRect.top - scrollPadding;
    }
    updateSidebarChapter();
  }

  function buildSidebar(skipChapterUpdate) {
    document.getElementById('chaptersTitle').textContent = langData.chaps || 'Chapters';
    var existing = sidebar.querySelectorAll('.chapter-btn');
    for (var bi = 0; bi < existing.length; bi++) existing[bi].remove();

    for (var i = 0; i < totalChapters; i++) {
      var name = langData[chapterNames[i]] || chapterNames[i];
      var btn = document.createElement('button');
      btn.className = 'chapter-btn';
      btn.textContent = (i + 1) + '. ' + name;
      btn.dataset.id = i;
      btn.onclick = function(idx) { return function() { scrollToChapter(idx); if (isMobile()) closeSidebar(); }; }(i);
      sidebar.appendChild(btn);
    }
    renderAllVerses();
    if (!skipChapterUpdate) updateSidebarChapter();
  }

  function saveSettings() {
    try {
      localStorage.setItem('dhammapada', JSON.stringify({
        lang: currentLang, fontSize: fontSize, dark: darkMode,
        pali: paliEnabled, chapter: currentChapter, scrollPos: mainContent.scrollTop
      }));
    } catch (_) {}
  }

  langSelect.onchange = function() { switchLang(langSelect.value); };

  paliToggle.onchange = function() {
    paliEnabled = paliToggle.checked;
    var saved = mainContent.scrollTop;
    renderAllVerses();
    requestAnimationFrame(function() { mainContent.scrollTop = saved; updateSidebarChapter(); });
    saveSettings();
  };

  darkToggle.onchange = function() {
    darkMode = darkToggle.checked;
    document.body.classList.toggle('dark', darkMode);
    saveSettings();
  };

  fontSlider.oninput = function() {
    fontSize = +fontSlider.value;
    applyFontSize();
    saveSettings();
  };

  setInterval(saveSettings, 3000);
  window.addEventListener('beforeunload', saveSettings);
})();
