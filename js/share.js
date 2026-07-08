// SPDX-License-Identifier: AGPL-3.0-only

(function() {
  'use strict';
  window.dh = window.dh || {};
  window.dh.copyToClipboard = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() { window.dh.fallbackCopy(text); });
    } else {
      window.dh.fallbackCopy(text);
    }
  };
  window.dh.fallbackCopy = function(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  };
  window.dh.openShareModal = function(text) {
    window.dh.shareVerse.textContent = text;
    var enc = encodeURIComponent(text);
    window.dh.shareWhatsapp.href = 'https://api.whatsapp.com/send?text=' + enc;
    window.dh.shareFacebook.href = 'https://www.facebook.com/sharer/sharer.php?quote=' + enc;
    window.dh.shareX.href = 'https://twitter.com/intent/tweet?text=' + enc;
    window.dh.shareReddit.href = 'https://reddit.com/submit?title=Dhammapada&selftext=' + enc;
    window.dh.shareTelegram.href = 'https://t.me/share/url?url=&text=' + enc;
    window.dh.shareEmail.href = 'mailto:?subject=Dhammapada&body=' + enc;
    window.dh.shareOverlay.classList.add('open');
  };
  window.dh.closeShareModal = function() {
    window.dh.shareOverlay.classList.remove('open');
  };
})();
