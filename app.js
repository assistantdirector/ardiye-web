/* ==========================================
   APP.JS - RESPONSIVE MENU
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
        menuBtn.style.color = '';
        menuBtn.style.backgroundColor = '';
      } else {
        mobileDrawer.classList.add('is-open');
        menuBtn.textContent = 'close';
        menuBtn.style.backgroundColor = 'var(--b-red)';
        menuBtn.style.color = 'var(--b-bg)';
      }
    });

    const navLinks = mobileDrawer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        menuBtn.textContent = 'menu';
        menuBtn.style.backgroundColor = '';
        menuBtn.style.color = '';
      });
    });
  }
});
