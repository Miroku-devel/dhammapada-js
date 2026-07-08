// SPDX-License-Identifier: AGPL-3.0-only

(function() {
  'use strict';
  window.dh = window.dh || {};
  window.dh.applyFontSize = function() {
    var els = document.querySelectorAll('.verse-text');
    for (var ei = 0; ei < els.length; ei++) els[ei].style.fontSize = window.dh.fontSize + 'px';
  };
  window.dh.renderAllVerses = function() {
    window.dh.versesContainer.innerHTML = '';
    for (var ci = 0; ci < window.dh.chapters.length; ci++) {
      var section = document.createElement('div');
      section.className = 'chapter-section';
      section.dataset.chapter = ci;
      var verseIds = window.dh.chapters[ci];
      for (var vi = 0; vi < verseIds.length; vi++) {
        var vId = verseIds[vi];
        var text = window.dh.langData[vId] || '';
        var paliText = window.dh.paliData ? (window.dh.paliData[vId] || '') : '';
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
        if (window.dh.paliEnabled && paliText) {
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
          shareBtn.onclick = function() { window.dh.openShareModal(ptext); };
        })(window.dh.paliEnabled && paliText ? vId + '\n' + text + '\n\n(' + vId + ' Pāḷi)\n' + paliText : vId + '\n' + text);
        footer.appendChild(shareBtn);
        card.appendChild(footer);
        section.appendChild(card);
      }
      window.dh.versesContainer.appendChild(section);
    }
    window.dh.applyFontSize();
  };
})();
