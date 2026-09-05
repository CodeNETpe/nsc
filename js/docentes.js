/* NSC · Fecha de la página Docentes, siempre en la zona horaria de Perú. */
(function () {
  'use strict';

  function initDocentes() {
    if (typeof AOS !== 'undefined') {
      document.documentElement.classList.remove('no-js');
    }

    var dateElement = document.getElementById('docentesDate');
    if (!dateElement || typeof Intl === 'undefined') return;

    var labelFormat = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima', weekday: 'long',
      day: 'numeric', month: 'long', year: 'numeric'
    });
    var isoFormat = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit'
    });

    function updateDate() {
      var now = new Date();
      var label = labelFormat.format(now);
      dateElement.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      var parts = {};
      isoFormat.formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
      dateElement.setAttribute('datetime', parts.year + '-' + parts.month + '-' + parts.day);
    }

    updateDate();
    // Si la página queda abierta durante la noche, la fecha también se actualiza.
    window.setInterval(updateDate, 60000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) updateDate();
    });

    var skip = document.querySelector('.docentes-skip');
    var content = document.getElementById('herramientas');
    if (skip && content) {
      skip.addEventListener('click', function () { content.focus({ preventScroll: true }); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocentes, { once: true });
  } else {
    initDocentes();
  }
})();
