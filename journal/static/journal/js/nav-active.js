document.addEventListener('DOMContentLoaded', function () {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const map = {
    '/': 'page-home',
    '/entries': 'page-entries',
  };

  const cls = map[path];
  if (cls) document.body.classList.add(cls);

  const navLinks = document.querySelectorAll('.bottom-nav__item[href]');
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace(/\/+$/, '') || '/';
    if (href === path) {
      a.setAttribute('aria-current', 'page');
      a.classList.add('active');
    } else {
      a.removeAttribute('aria-current');
      a.classList.remove('active');
    }
  });
});