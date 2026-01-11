/* ==================  ADMIN.JS  ================== */
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

// Init Logic
document.addEventListener('DOMContentLoaded', () => {
  // Default load
  loadMembers();
  loadStats(); // Logic for "Home" stats if we had a dedicated home tab, 
  // but we'll inject stats into the top of Members tab for now 
  // or just calculate them for the user to see.
});

/* ---------- LOGOUT ---------- */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});

/* ---------- HELPERS ---------- */
function getHeaders() {
  return { Authorization: `Bearer ${token}` };
}

/* ---------- TAB SWITCHING (Handled in HTML mostly, but data loading here) ---------- */
const sidebarLinks = document.querySelectorAll('.nav-link');
sidebarLinks.forEach(link => {
  link.addEventListener('click', e => {
    const tabId = link.dataset.tab;
    if (tabId === 'members') loadMembers();
    if (tabId === 'posts') loadPosts();
    if (tabId === 'payments') loadPayments();
    if (tabId === 'profile') loadProfile();
  });
});

/* ---------- STATS (Client Side Calc) ---------- */
// Simple summary of members
async function loadStats() {
  try {
    // Just for demo, we might fetch real stats if API existed. 
    // For now, loadMembers() does the heavy lifting.
  } catch (e) { console.error(e); }
}

/* ---------- MEMBERS ---------- */
async function loadMembers() {
  try {
    const res = await fetch('/api/admin/members', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load members');

    // OFFLINE MOCK DATA (If DB is down)
    let data;
    try { data = await res.json(); }
    catch (err) {
      console.warn('Using Mock Data for Demo');
      data = [
        { _id: '1', fullName: 'Ramesh Powar', phone: '9876543210', joiningDate: new Date(), subscriptionPlan: 'Monthly', amount: 1500, remainingDays: 28 },
        { _id: '2', fullName: 'Sneha Gupta', phone: '9988776655', joiningDate: new Date("2024-01-01"), subscriptionPlan: 'Yearly', amount: 12000, remainingDays: 300 },
        { _id: '3', fullName: 'Amit Sharma', phone: '7766554433', joiningDate: new Date("2024-02-15"), subscriptionPlan: '3 Months', amount: 4000, remainingDays: 12 },
      ];
    }

    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = '';

    data.forEach(m => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
      tr.innerHTML = `
        <td class="p-4"><img src="${m.profilePicture || 'https://i.pravatar.cc/150?u=' + m._id}" class="w-10 h-10 rounded-full border border-white/20 object-cover"></td>
        <td class="p-4 font-bold text-white">${m.fullName}</td>
        <td class="p-4 text-gray-500 font-mono">${m.phone}</td>
        <td class="p-4 text-gray-400">${new Date(m.joiningDate).toLocaleDateString()}</td>
        <td class="p-4"><span class="px-2 py-0.5 bg-[#FF4500]/10 text-[#FF4500] text-xs rounded border border-[#FF4500]/20">${m.subscriptionPlan}</span></td>
        <td class="p-4 text-white font-mono">₹${m.amount || 0}</td>
        <td class="p-4 ${m.remainingDays < 10 ? 'text-red-500 font-bold' : 'text-green-400'}">${m.remainingDays} Days</td>
        <td class="p-4 text-right">
          <button onclick="editSubscription('${m._id}')" class="text-blue-400 hover:text-blue-300 mr-3" title="Extend Plan"><i data-lucide="calendar-plus" class="w-4 h-4"></i></button>
          <button onclick="deleteMember('${m._id}')" class="text-red-500 hover:text-red-400" title="Delete Member"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Refresh Icons after DOM update
    if (window.lucide) lucide.createIcons();

  } catch (e) {
    console.error('Members Error:', e);
  }
}

window.deleteMember = async id => {
  if (!confirm('Are you sure you want to delete this member?')) return;
  // Mock delete
  document.querySelector(`button[onclick="deleteMember('${id}')"]`).closest('tr').remove();

  // Real delete try
  await fetch(`/api/admin/members/${id}`, { method: 'DELETE', headers: getHeaders() });
};

window.editSubscription = async id => {
  const days = prompt('Extend subscription by (days):', 30);
  if (!days) return;
  // Mock update
  alert(`Subscription extended by ${days} days! (Demo)`);

  await fetch(`/api/admin/members/${id}/subscription`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getHeaders() },
    body: JSON.stringify({ expiryDate: new Date(), subscriptionPlan: 'Custom' }) // Simplified for demo
  });
};

/* ---------- POSTS ---------- */
async function loadPosts() {
  try {
    const res = await fetch('/api/posts', { headers: getHeaders() });
    let posts = [];
    try { posts = await res.json(); } catch (e) {
      posts = [
        { _id: 'p1', textContent: 'New batch starting at 6 AM!', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=500', adminId: { username: 'Admin' }, createdAt: new Date() },
        { _id: 'p2', textContent: 'Nutrition seminar this Sunday.', image: null, adminId: { username: 'Admin' }, createdAt: new Date() }
      ];
    }

    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    posts.forEach(p => {
      const div = document.createElement('div');
      div.className = 'bg-[#111] border border-white/5 rounded-lg overflow-hidden group hover:border-[#32CD32]/50 transition-all';
      div.innerHTML = `
          ${p.image ? `<div class="h-48 overflow-hidden"><img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div>` : ''}
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
               <span class="text-xs text-[#32CD32] font-mono border border-[#32CD32]/20 px-2 py-1 rounded">NEWS</span>
               <small class="text-gray-600 text-xs">${new Date(p.createdAt).toLocaleDateString()}</small>
            </div>
            <p class="text-gray-300 text-sm mb-6 leading-relaxed">${p.textContent}</p>
            <div class="flex justify-between items-center pt-4 border-t border-white/5">
                <small class="text-gray-500">By <span class="text-white">${p.adminId ? p.adminId.username : 'Admin'}</span></small>
                <button onclick="deletePost('${p._id}')" class="text-red-500 hover:text-red-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1">
                    <i data-lucide="trash" class="w-3 h-3"></i> Delete
                </button>
            </div>
          </div>`;
      container.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
  } catch (e) { console.error(e); }
}

window.deletePost = async id => {
  if (!confirm('Delete this post?')) return;
  document.querySelector(`button[onclick="deletePost('${id}')"]`).closest('.group').remove();
  await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: getHeaders() });
};


/* ---------- PAYMENTS ---------- */
async function loadPayments() {
  try {
    const res = await fetch('/api/payments', { headers: getHeaders() });
    let data = [];
    try { data = await res.json(); } catch (e) {
      data = [
        { memberId: { fullName: 'Ramesh Powar' }, amount: 1500, date: new Date(), remarks: 'Monthly Fee' },
        { memberId: { fullName: 'Amit Sharma' }, amount: 4000, date: new Date(), remarks: 'Quarterly Package' },
      ];
    }

    const tbody = document.querySelector('#paymentsTable tbody');
    tbody.innerHTML = '';
    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
      tr.innerHTML = `
              <td class="p-4 text-white">${p.memberId ? p.memberId.fullName : 'Unknown'}</td>
              <td class="p-4 text-blue-400 font-mono">₹${p.amount}</td>
              <td class="p-4 text-gray-500 text-xs">${new Date(p.date).toLocaleDateString()}</td>
              <td class="p-4 text-gray-400 text-sm italic">"${p.remarks}"</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error(e); }
}

/* ---------- PROFILE ---------- */
async function loadProfile() {
  try {
    const res = await fetch('/api/admin/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed');
    const admin = await res.json();
    document.getElementById('username').value = admin.username;
    document.getElementById('email').value = admin.email;
    const av = document.getElementById('adminAvatar');
    av.src = admin.avatar ? admin.avatar : '/img/default-avatar.png';
  } catch (e) {
    // Fallback
    document.getElementById('email').value = "admin@gym.com";
  }
}

/* ---------- FORMS ---------- */
// Add Member
document.getElementById('memberModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  // Simulate Success
  alert("Member Added Successfully! (Demo)");
  document.getElementById('memberModal').classList.add('hidden');
  document.getElementById('memberModal').classList.remove('flex');
  loadMembers(); // Reload mock list
});

// Add Post
document.getElementById('postModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  alert("Post Published! (Demo)");
  document.getElementById('postModal').classList.add('hidden');
  document.getElementById('postModal').classList.remove('flex');
  loadPosts();
});
