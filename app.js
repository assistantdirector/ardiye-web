/* ==========================================
   APP.JS - GALLERY INTERACTIONS
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        mobileDrawer.classList.remove('is-open');
        menuBtn.textContent = 'menu';
      } else {
        mobileDrawer.classList.add('is-open');
        menuBtn.textContent = 'close';
      }
    });

    // Linke tıklandığında menüyü kapat
    const navLinks = mobileDrawer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        menuBtn.textContent = 'menu';
      });
    });
  }
});
