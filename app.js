/**
 * ARDIYÉ // CORE INTERACTION CONTROLLER
 * Optimized with requestAnimationFrame & Touch-safe checks
 */
document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
     1. MOBIL MENU YÖNETİMİ & ARIA ACCESSIBILITY
     ------------------------------------------------------------- */
  const menuBtn = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerLinks = mobileDrawer ? mobileDrawer.querySelectorAll('.nav-link') : [];

  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      menuBtn.textContent = isOpen ? '[ close ]' : '[ menu ]';
      menuBtn.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        menuBtn.textContent = '[ menu ]';
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* -------------------------------------------------------------
     2. PÜRÜZSÜZ BÖLÜM GEZİNTİSİ (ANCHOR NAVIGATION)
     ------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-drawer .nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetElement = document.getElementById(href.substring(1));
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  /* -------------------------------------------------------------
     3. OPTİMİZE EDİLMİŞ PARALAKS MOTORU (rAF THROTTLED)
     ------------------------------------------------------------- */
  const parallaxImgs = document.querySelectorAll('.parallax-img');
  let isTicking = false;

  const updateParallax = () => {
    const vh = window.innerHeight;
    const halfVh = vh / 2;

    parallaxImgs.forEach(img => {
      const parent = img.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        const shiftY = (rect.top - halfVh) * 0.05;
        img.style.transform = `scale(1.08) translate3d(0, ${shiftY.toFixed(2)}px, 0)`;
      }
    });

    isTicking = false;
  };

  if (parallaxImgs.length > 0) {
    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateParallax);
        isTicking = true;
      }
    }, { passive: true });
    
    updateParallax();
  }

  /* -------------------------------------------------------------
     4. SAF X & Y MANYETİK HOVER (YALNIZCA DESKTOP İÇİN)
     ------------------------------------------------------------- */
  const isPrecisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isPrecisePointer) {
    const cards = document.querySelectorAll('.b-card');

    cards.forEach(card => {
      let cardRafId = null;
      let targetX = 0;
      let targetY = 0;

      const renderMagnetic = () => {
        card.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`;
        cardRafId = null;
      };

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) - 0.5;
        const normY = ((e.clientY - rect.top) / rect.height) - 0.5;

        targetX = normX * 12;
        targetY = normY * 12;

        if (!cardRafId) {
          cardRafId = window.requestAnimationFrame(renderMagnetic);
        }
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (cardRafId) {
          window.cancelAnimationFrame(cardRafId);
          cardRafId = null;
        }
        card.style.transform = 'translate3d(0px, 0px, 0)';
      });
    });
  }

});
