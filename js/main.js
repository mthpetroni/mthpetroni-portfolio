/* ============================================================================
   MAIN.JS — Matheus Petroni Portfolio
   ============================================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     COPYRIGHT YEAR + YEARS OF EXPERIENCE — always current
     -------------------------------------------------------------------------- */
  var currentYear = new Date().getFullYear();
  document.querySelectorAll('.footer-copy-year').forEach(function (el) {
    el.textContent = currentYear;
  });
  var yearsEl = document.getElementById('years-experience');
  if (yearsEl) yearsEl.textContent = currentYear - 2013 + 1;

  /* --------------------------------------------------------------------------
     LIVE CLOCK — São Paulo time
     -------------------------------------------------------------------------- */
  function updateClocks() {
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const time = fmt.format(new Date());
    document.querySelectorAll('.live-clock').forEach(function (el) {
      el.textContent = time;
    });
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* --------------------------------------------------------------------------
     APPBAR — glass effect on scroll
     -------------------------------------------------------------------------- */
  var appbar = document.querySelector('.appbar');
  if (appbar) {
    var onScroll = function () {
      appbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------------------
     HERO-BOTTOM — fade out as user scrolls away from hero
     -------------------------------------------------------------------------- */
  var heroBottom = document.getElementById('hero-bottom');
  if (heroBottom) {
    var fadeHeroBottom = function () {
      /* Fade over the first 25% of viewport height scrolled */
      var fadeRange = window.innerHeight * 0.25;
      var ratio = Math.max(0, 1 - window.scrollY / fadeRange);
      heroBottom.style.opacity = ratio;
      heroBottom.style.pointerEvents = ratio < 0.05 ? 'none' : '';
    };
    window.addEventListener('scroll', fadeHeroBottom, { passive: true });
    fadeHeroBottom();
  }

  /* --------------------------------------------------------------------------
     MOBILE DRAWER
     -------------------------------------------------------------------------- */
  var drawer    = document.getElementById('mobile-drawer');
  var hamburger = document.querySelector('.hamburger');
  var drawerClose   = document.querySelector('.drawer-close');
  var drawerOverlay = document.querySelector('.drawer-overlay');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.removeAttribute('aria-hidden');
    drawer.removeAttribute('inert');
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    var firstFocus = drawer.querySelector('button, a');
    if (firstFocus) firstFocus.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    hamburger && hamburger.focus();
  }

  if (hamburger)    hamburger.addEventListener('click', openDrawer);
  if (drawerClose)  drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* Focus trap inside drawer */
  if (drawer) {
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');

    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(
        drawer.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.closest('[inert]'); });
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    /* Close drawer when navigating */
    drawer.querySelectorAll('.drawer-link').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* --------------------------------------------------------------------------
     ACCORDIONS
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded  = trigger.getAttribute('aria-expanded') === 'true';
      var accordion = trigger.closest('.accordion');
      var bodyId    = trigger.getAttribute('aria-controls');
      var body      = document.getElementById(bodyId);
      var icon      = trigger.querySelector('.accordion-icon');

      accordion.classList.toggle('accordion--open', !expanded);
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) body.setAttribute('aria-hidden', String(expanded));
      if (icon) icon.textContent = !expanded ? '↑' : '↓';
    });

    /* Allow Enter key (buttons already handle Space) */
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') trigger.click();
    });
  });

  /* --------------------------------------------------------------------------
     LAZY IMAGES — Intersection Observer
     -------------------------------------------------------------------------- */
  var lazyImgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        img.onload = function () { img.classList.add('loaded'); };
        img.onerror = function () { img.classList.add('loaded'); };
        img.src = img.dataset.src || '';
        imgObserver.unobserve(img);
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  } else {
    /* Fallback: load all */
    lazyImgs.forEach(function (img) {
      img.onload = function () { img.classList.add('loaded'); };
      img.onerror = function () { img.classList.add('loaded'); };
      img.src = img.dataset.src || '';
    });
  }

  /* --------------------------------------------------------------------------
     IMAGE COMPARISON SLIDER
     -------------------------------------------------------------------------- */
  document.querySelectorAll('[data-compare]').forEach(function (el) {
    var before  = el.querySelector('.img-compare-before');
    var handle  = el.querySelector('.img-compare-handle');
    var dragging = false;

    function setPos(clientX) {
      var rect  = el.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      var pct   = ratio * 100;
      before.style.clipPath   = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left       = pct + '%';
    }

    el.addEventListener('mousedown', function (e) {
      dragging = true;
      setPos(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (dragging) setPos(e.clientX);
    });
    window.addEventListener('mouseup',  function ()  { dragging = false; });

    el.addEventListener('touchstart', function (e) {
      dragging = true;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend',  function ()  { dragging = false; });
  });

  /* --------------------------------------------------------------------------
     MARQUEE TICKER — JS-driven to eliminate loop gap + dynamic center highlight
     -------------------------------------------------------------------------- */
  var marqueeWrapper = document.querySelector('.cs-marquee-wrapper');
  var marqueeTrack   = document.querySelector('.cs-marquee-track');

  if (marqueeWrapper && marqueeTrack) {
    var marqueeItems = Array.from(marqueeTrack.querySelectorAll('.cs-marquee-item'));
    var marqueePosX  = 0;
    var marqueeSpeed = 1.2;
    var halfWidth    = 0;

    function initMarquee() {
      halfWidth = marqueeTrack.scrollWidth / 2;
    }

    function tickMarquee() {
      marqueePosX -= marqueeSpeed;
      if (marqueePosX <= -halfWidth) marqueePosX += halfWidth;
      marqueeTrack.style.transform = 'translateX(' + marqueePosX + 'px)';

      var wrapperRect = marqueeWrapper.getBoundingClientRect();
      var wrapperMid  = wrapperRect.left + wrapperRect.width / 2;
      var closest     = null;
      var closestDist = Infinity;

      marqueeItems.forEach(function (item) {
        var r    = item.getBoundingClientRect();
        var mid  = r.left + r.width / 2;
        var dist = Math.abs(mid - wrapperMid);
        if (dist < closestDist) { closestDist = dist; closest = item; }
      });

      marqueeItems.forEach(function (item) {
        item.classList.toggle('cs-marquee-item--highlight', item === closest);
      });

      requestAnimationFrame(tickMarquee);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('load', function () {
        initMarquee();
        requestAnimationFrame(tickMarquee);
      });
    }
  }

  /* --------------------------------------------------------------------------
     SCROLL FADE-IN — homepage section blocks
     -------------------------------------------------------------------------- */
  var fadeEls = document.querySelectorAll('.project-card, .projects-coming-soon, .vision, .about, .cs-section, .cs-image-block, .cs-hero-image, .cs-achievements, .cs-team-block, .more-cases-wrapper');
  if (fadeEls.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fadeEls.forEach(function (el) { el.classList.add('fade-up'); });
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
  }

  /* --------------------------------------------------------------------------
     SMOOTH ANCHOR SCROLLING with offset for fixed AppBar
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var appbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--appbar-h'),
        10
      ) || 60;
      var top = target.getBoundingClientRect().top + window.scrollY - appbarHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

}());
