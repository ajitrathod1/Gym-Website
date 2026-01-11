/* =======  MOBILE NAV-TOGGLE  ======= */
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
hamburger?.addEventListener('click', () => navMenu.classList.toggle('active'));

/* =======  LOAD PUBLIC POSTS ON HOME  ======= */
(async () => {
  try {
    const res = await fetch('/api/posts/public');   // public feed
    const posts = await res.json();
    const container = document.getElementById('homePosts');
    if (!container) return;           // agar home page pe section nahin hai to exit
    container.innerHTML = '';
    posts.forEach(p => {
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        ${p.image ? `<img src="${p.image}" alt="Post image" loading="lazy"/>` : ''}
        <div class="body">
          <p>${p.textContent}</p>
          <small>By ${p.adminId.username} – ${new Date(p.createdAt).toLocaleString()}</small>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error('Home posts load error:', e);
  }
})();

/* =======  SCROLL REVEAL OBSERVER  ======= */
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: "0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
});