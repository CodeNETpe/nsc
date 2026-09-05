/* ==========================================================================
   I.E.M. "NUESTRA SEÑORA DEL CARMEN" – LIRCAY · scripts
   --------------------------------------------------------------------------
   1  Swiper (fade + autoplay)          5  Header + enlace activo
   2  AOS                               6  Contadores de estadísticas
   3  Menú hamburguesa + dropdowns      7  Formulario de contacto
   4  Scroll suave                      8  Utilidades (año, volver arriba)
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* =================================================================
       1 · SWIPER — slider principal con efecto FADE
    ================================================================= */
    if (typeof Swiper !== 'undefined' && document.querySelector('.heroSwiper')) {
      new Swiper('.heroSwiper', {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 1100,
        loop: true,
        autoplay: { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.hero__dots', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        keyboard: { enabled: true },
        a11y: { prevSlideMessage: 'Slide anterior', nextSlideMessage: 'Slide siguiente' },
        on: {
          init: function () { animateSlide(this.slides[this.activeIndex]); },
          slideChangeTransitionStart: function () { animateSlide(this.slides[this.activeIndex]); }
        }
      });
    }

    /* Animación de entrada del texto en cada slide */
    function animateSlide(slide) {
      if (!slide) return;
      var items = slide.querySelectorAll('.hero__eyebrow, .hero__title, .hero__text, .hero__actions');
      items.forEach(function (el, i) {
        el.style.animation = 'none';
        void el.offsetWidth;                       // reinicia la animación
        el.style.animation = 'heroIn .85s cubic-bezier(.22,.61,.36,1) both';
        el.style.animationDelay = (0.12 + i * 0.13) + 's';
      });
    }

    /* Keyframes inyectados (evita duplicar reglas en el CSS) */
    var kf = document.createElement('style');
    kf.textContent = '@keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}';
    document.head.appendChild(kf);

    /* =================================================================
       2 · AOS — animaciones al hacer scroll
    ================================================================= */
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 90,
        disable: function () {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
      });
    }

    /* =================================================================
       3 · MENÚ HAMBURGUESA + SUBMENÚS EN MÓVIL
    ================================================================= */
    var hamburger = document.getElementById('hamburger');
    var nav       = document.getElementById('nav');
    var overlay   = document.getElementById('navOverlay');
    var MOBILE    = '(max-width: 1180px)';
    var overlayCloseTimer;

    function isMobile() { return window.matchMedia(MOBILE).matches; }

    function openMenu() {
      clearTimeout(overlayCloseTimer);
      nav.classList.add('is-open');
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Cerrar menú');
      document.body.classList.add('is-locked');
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menú');
      document.body.classList.remove('is-locked');
      overlay.classList.remove('is-visible');
      clearTimeout(overlayCloseTimer);
      overlayCloseTimer = setTimeout(function () { overlay.hidden = true; }, 320);
      document.querySelectorAll('.has-drop.is-open').forEach(function (li) { li.classList.remove('is-open'); });
    }

    if (hamburger && nav && overlay) {
      hamburger.addEventListener('click', function () {
        nav.classList.contains('is-open') ? closeMenu() : openMenu();
      });
      overlay.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
      });
      window.addEventListener('resize', function () {
        if (!isMobile() && nav.classList.contains('is-open')) closeMenu();
      });
    }

    /* Acordeón de submenús: el primer toque abre, el segundo navega */
    document.querySelectorAll('.has-drop > .nav__link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!isMobile()) return;
        var parent = link.parentElement;
        if (!parent.classList.contains('is-open')) {
          e.preventDefault();
          // Primer toque: abrir el submenú sin cerrar el panel ni hacer scroll.
          e.stopImmediatePropagation();
          document.querySelectorAll('.has-drop.is-open').forEach(function (li) {
            if (li !== parent) li.classList.remove('is-open');
          });
          parent.classList.add('is-open');
        }
      });
    });

    /* Cerrar el menú al pulsar cualquier enlace de navegación real */
    nav && nav.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (nav.classList.contains('is-open')) closeMenu();
      });
    });

    /* =================================================================
       4 · SCROLL SUAVE para enlaces internos
    ================================================================= */
    var header = document.getElementById('header');

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (!id || id === '#') { e.preventDefault(); return; }
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();

        var headerH = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
        history.replaceState(null, '', id);
      });
    });

    /* =================================================================
       5 · HEADER con sombra + resaltado del enlace activo
    ================================================================= */
    // Solo las anclas de esta página participan en el resaltado por scroll.
    // Las rutas como ../#servicios no son selectores CSS.
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list > li > .nav__link[href^="#"]'));
    var sections = navLinks
      .map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); })
      .filter(Boolean);
    var toTop = document.getElementById('toTop');
    var ticking = false;

    function onScroll() {
      var y = window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 10);
      if (toTop)  toTop.classList.toggle('is-visible', y > 520);

      var headerH = header ? header.offsetHeight : 0;
      var current = sections[0];
      sections.forEach(function (sec) {
        if (sec.getBoundingClientRect().top - headerH - 40 <= 0) current = sec;
      });
      if (current) {
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id);
        });
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* =================================================================
       6 · CONTADORES ANIMADOS
    ================================================================= */
    var counters = document.querySelectorAll('.stat__num');

    function animateCount(el) {
      var end      = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix   = el.getAttribute('data-suffix') || '';
      var duration = 1800;
      var start    = null;

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * end).toLocaleString('es-PE') + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (counters.length) {
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
          });
        }, { threshold: 0.45 });
        counters.forEach(function (c) { obs.observe(c); });
      } else {
        counters.forEach(function (c) {
          c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || '');
        });
      }
    }

    /* =================================================================
       7 · FORMULARIO DE CONTACTO (validación en el navegador)
    ================================================================= */
    var form = document.getElementById('contactForm');
    var msg  = document.getElementById('formMsg');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nombre = form.nombre, email = form.email, mensaje = form.mensaje, ok = true;

        [nombre, email, mensaje].forEach(function (input) {
          var valid = input.value.trim() !== '';
          if (input === email) valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
          input.parentElement.classList.toggle('has-error', !valid);
          if (!valid) ok = false;
        });

        if (!ok) {
          msg.textContent = 'Por favor completa todos los campos correctamente.';
          msg.className = 'form-msg is-error';
          return;
        }

        msg.textContent = '¡Gracias, ' + nombre.value.trim().split(' ')[0] + '! Tu mensaje fue enviado. Te responderemos pronto.';
        msg.className = 'form-msg is-ok';
        form.reset();
        setTimeout(function () { msg.textContent = ''; msg.className = 'form-msg'; }, 6500);
      });

      form.querySelectorAll('input, textarea').forEach(function (input) {
        input.addEventListener('input', function () {
          input.parentElement.classList.remove('has-error');
        });
      });
    }

    /* =================================================================
       8 · AÑO ACTUAL
    ================================================================= */
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

  });
})();
