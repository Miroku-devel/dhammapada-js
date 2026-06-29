// SPDX-License-Identifier: AGPL-3.0-only
(function() {
  'use strict';
  window.dh = window.dh || {};

  window.dh.loadScript = function(url) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  };
})();