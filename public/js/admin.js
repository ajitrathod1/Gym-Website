/* ==================  ADMIN.JS  ================== */
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

/* ---------- TAB SWITCHING ---------- */
const sidebarLinks = document.querySelectorAll('.nav-link');
const tabs         = document.querySelectorAll('.tab');
sidebarLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    tabs.forEach(t => t.classList.remove('active'));
    const tabId = link.dataset.tab;
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'members')  loadMembers();
    if (tabId === 'posts')    loadPosts();
    if (tabId === 'payments') loadPayments();
    if (tabId === 'profile')  loadProfile();   // NEW
  });
});

/* ---------- LOGOUT ---------- */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});

/* ---------- MEMBERS ---------- */
async function loadMembers() {
  const res = await fetch('/api/admin/members', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector('#membersTable tbody');
  tbody.innerHTML = '';
  data.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${m.profilePicture || '/img/default-avatar.png'}" width="40" height="40" style="border-radius:50%"></td>
      <td>${m.fullName}</td>
      <td>${m.phone}</td>
      <td>${new Date(m.joiningDate).toLocaleDateString()}</td>
      <td>${m.subscriptionPlan}</td>
      <td>₹${m.amount||0}</td>
      <td>${m.remainingDays}</td>
      <td>
        <button onclick="deleteMember('${m._id}')">Delete</button>
        <button onclick="editSubscription('${m._id}')">Extend</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
window.deleteMember = async id => {
  if (!confirm('Delete member?')) return;
  await fetch(`/api/admin/members/${id}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadMembers();
};
window.editSubscription = async id => {
  const days = prompt('Extend subscription by (days):', 30);
  if (!days) return;
  const expiry = new Date(); expiry.setDate(expiry.getDate() + parseInt(days));
  await fetch(`/api/admin/members/${id}/subscription`, {
    method : 'PUT',
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
    body   : JSON.stringify({ expiryDate: expiry, subscriptionPlan:'Custom' })
  });
  loadMembers();
};

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
        <small>By ${p.adminId.username} – ${new Date(p.createdAt).toLocaleString()}</small>
        <button onclick="deletePost('${p._id}')">Delete</button>
      </div>`;
    container.appendChild(div);
  });
}
window.deletePost = async id => {
  if (!confirm('Delete post?')) return;
  await fetch(`/api/posts/${id}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadPosts();
};

/* ---------- PAYMENTS ---------- */
async function loadPayments() {
  const res = await fetch('/api/payments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector('#paymentsTable tbody');
  tbody.innerHTML = '';
  data.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.memberId.fullName}</td>
      <td>₹${p.amount}</td>
      <td>${new Date(p.date).toLocaleDateString()}</td>
      <td>${p.remarks}</td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- PROFILE + AVATAR ---------- */
async function loadProfile() {
  const res = await fetch('/api/admin/me', {          // own details
    headers: { Authorization: `Bearer ${token}` }
  });
  const admin = await res.json();
  document.getElementById('username').value = admin.username;
  document.getElementById('email').value    = admin.email;
  const av = document.getElementById('adminAvatar');
  av.src = admin.avatar ? admin.avatar : '/img/default-avatar.png';
}

/* avatar upload */
document.getElementById('avatarInput').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  const fd = new FormData(); fd.append('avatar', file);
  const res = await fetch('/api/admin/avatar', {
    method : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body   : fd
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('adminAvatar').src = data.avatar; // new pic instantly
  } else {
    alert(data.msg||'Upload failed');
  }
});

/* ---------- MODALS ---------- */
const memberModal = document.getElementById('memberModal');
const postModal   = document.getElementById('postModal');

document.getElementById('addMemberBtn').onclick = () => memberModal.classList.add('active');
document.getElementById('addPostBtn').onclick   = () => postModal.classList.add('active');
document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = () => btn.closest('.modal').classList.remove('active');
});

document.getElementById('memberModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res  = await fetch('/api/admin/members', {
    method : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body   : form
  });
  const data = await res.json();
  alert(data.msg);
  if (res.ok) { memberModal.classList.remove('active'); loadMembers(); }
});

document.getElementById('postModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res  = await fetch('/api/posts', {
    method : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body   : form
  });
  const data = await res.json();
  alert(data.msg);
  if (res.ok) { postModal.classList.remove('active'); loadPosts(); }
});

/* ---------- PROFILE UPDATE (username / password) ---------- */
document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const newPass  = document.getElementById('newPass').value.trim();
  const body = { username };
  if (newPass) body.newPassword = newPass;
  const res = await fetch('/api/auth/change-password', {
    method : 'POST',
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
    body   : JSON.stringify(body)
  });
  const data = await res.json();
  alert(data.msg);
});

/* ---------- BOOTSTRAP ---------- */
loadMembers();