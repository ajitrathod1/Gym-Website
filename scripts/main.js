// scripts/main.js
document.addEventListener('DOMContentLoaded', () => {
  // set year
  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();

  // Sticky nav shadow on scroll
  const nav = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 20) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');
  });

  // Helper POST
  async function postData(url = '', data = {}) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  // Contact form (sends to backend)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm));
      const res = await postData('http://localhost:5000/api/contact', data);
      alert(res.success ? 'Message sent successfully!' : 'Error sending message. Try later.');
      if (res.success) contactForm.reset();
    });
  }

  // Join form (login / membership)
  const joinForm = document.getElementById('joinForm');
  if (joinForm) {
    joinForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(joinForm));
      const res = await postData('http://localhost:5000/api/join', data);
      alert(res.success ? 'Membership request received!' : 'Error submitting. Try later.');
      if (res.success) joinForm.reset();
    });
  }

  // Add red-glow pointer cursor effect (makes cursor pointer inside cards)
  document.querySelectorAll('.card, .price-card, .trainer-card, .gallery-item').forEach(el => {
    el.style.cursor = 'pointer';
  });

  // 🌗 Theme toggle functionality (Dark <-> Light)
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    const icon = toggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme on load
    if (savedTheme === 'light') {
      document.body.classList.add('light');
      icon.classList.replace('ri-sun-line', 'ri-moon-line');
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');

      icon.classList.toggle('ri-sun-line', !isLight);
      icon.classList.toggle('ri-moon-line', isLight);

      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }
});
