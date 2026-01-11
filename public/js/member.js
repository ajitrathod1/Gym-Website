const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const sidebarLinks = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab');
sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById(link.dataset.tab).classList.add('active');
    if (link.dataset.tab === 'profile') loadProfile();
    if (link.dataset.tab === 'posts') loadPosts();
    if (link.dataset.tab === 'payments') loadPayments();
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});

/* ---------- PROFILE ---------- */
async function loadProfile() {
  const res = await fetch('/api/member/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await res.json();
  document.getElementById('fullName').value = user.fullName;
  document.getElementById('phone').value = user.phone;
  document.getElementById('email').value = user.email;
  document.getElementById('age').value = user.age;
  document.getElementById('gender').value = user.gender;
  document.getElementById('address').value = user.address || '';
  document.getElementById('plan').value = user.subscriptionPlan;
  document.getElementById('expiry').value = new Date(user.expiryDate).toLocaleDateString();
  const rem = Math.ceil((new Date(user.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24));
  document.getElementById('remaining').value = rem > 0 ? rem : 0;

  // PHOTO – leading slash pakka
  document.getElementById('profPic').src = user.profilePicture ? user.profilePicture: '/assets/avatar.png';
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch('/api/member/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const data = await res.json();
  alert(data.msg);
  if (res.ok) {
    // fresh data le ke photo update
    loadProfile();
  }
});

/* ---------- POSTS ---------- */
async function loadPosts() {
  const res = await fetch('/api/posts', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const posts = await res.json();
  const container = document.getElementById('postsContainer');
  container.innerHTML = '';
  posts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
      ${p.image ? `<img src="${p.image}" alt=""/>` : ''}
      <div class="body">
        <p>${p.textContent}</p>
        <small>By Trainer – ${new Date(p.createdAt).toLocaleString()}</small>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ---------- PAYMENTS ---------- */
async function loadPayments() {
  const res = await fetch('/api/payments/member/' + localStorage.getItem('userId'), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector('#paymentsTable tbody');
  tbody.innerHTML = '';
  data.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>₹${p.amount}</td>
      <td>${new Date(p.date).toLocaleDateString()}</td>
      <td>${p.remarks}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- ON LOAD ---------- */
(async () => {
  const res = await fetch('/api/member/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) { localStorage.clear(); location.href = 'login.html'; return; }
  const user = await res.json();
  localStorage.setItem('userId', user._id);
  loadProfile();
})();