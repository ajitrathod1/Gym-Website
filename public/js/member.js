const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

/* ---------- HELPERS ---------- */
function getHeaders() {
  return { Authorization: `Bearer ${token}` };
}

/* ---------- TAB LOGIC ---------- */
const sidebarLinks = document.querySelectorAll('.nav-link');
sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // Logic handled in HTML inline script for immediate UI, 
    // but we hook data loading here
    const tabId = link.dataset.tab;
    if (tabId === 'profile') loadProfile();
    if (tabId === 'posts') loadPosts();
    if (tabId === 'payments') loadPayments();
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});

/* ---------- PROFILE + Digital ID ---------- */
async function loadProfile() {
  try {
    const res = await fetch('/api/member/profile', { headers: getHeaders() });

    let user;
    try {
      if (!res.ok) throw new Error("Offline");
      user = await res.json();
    } catch (err) {
      // MOCK DATA
      user = {
        _id: '123',
        fullName: 'Demo Member',
        phone: '9876543210',
        email: 'test@fit.com',
        age: 25,
        gender: 'Male',
        address: 'Gym Street, Cyber City',
        subscriptionPlan: 'Gold Plan',
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 24)),
        profilePicture: null
      };
    }

    localStorage.setItem('userId', user._id);

    // Form Fill
    document.getElementById('fullName').value = user.fullName;
    document.getElementById('phone').value = user.phone;
    document.getElementById('email').value = user.email;
    document.getElementById('age').value = user.age;
    document.getElementById('gender').value = user.gender;
    document.getElementById('address').value = user.address || '';

    // Stats Cards
    document.getElementById('plan').value = user.subscriptionPlan;
    document.getElementById('expiry').value = new Date(user.expiryDate).toLocaleDateString();
    const rem = Math.ceil((new Date(user.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24));
    document.getElementById('remaining').value = (rem > 0 ? rem : 0) + " Days";

    // Photo
    const av = document.getElementById('profPic');
    av.src = user.profilePicture ? user.profilePicture : 'https://i.pravatar.cc/150?u=test@fit.com';

    // Digital ID (QR Code Simulation)
    // We'll create a simple QR simulation if we had the container, 
    // but for now the profile card acts as the digital ID.

  } catch (e) { console.error(e); }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Mock Update
  alert("Profile Updated! (Demo)");
});

/* ---------- POSTS ---------- */
async function loadPosts() {
  try {
    const res = await fetch('/api/posts', { headers: getHeaders() });
    let posts = [];
    try { posts = await res.json(); } catch (e) {
      posts = [
        { image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=500', textContent: 'Trainer Tip: Stay hydrated!', createdAt: new Date() },
        { image: null, textContent: 'Gym closed on sunday for maintenance.', createdAt: new Date() }
      ];
    }

    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    posts.forEach(p => {
      const div = document.createElement('div');
      div.className = 'bg-[#111] border border-white/5 rounded-lg overflow-hidden group hover:border-[#32CD32]/50 transition-all shadow-lg';
      div.innerHTML = `
          ${p.image ? `<div class="h-48 overflow-hidden"><img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div>` : ''}
          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-[#32CD32] font-mono border border-[#32CD32]/20 px-2 py-1 rounded">TRAINER</span>
                <small class="text-gray-600 text-xs">${new Date(p.createdAt).toLocaleDateString()}</small>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">${p.textContent}</p>
          </div>
        `;
      container.appendChild(div);
    });
  } catch (e) { console.error(e); }
}

/* ---------- PAYMENTS ---------- */
async function loadPayments() {
  try {
    // Mock Payments
    const data = [
      { amount: 1500, date: new Date(), remarks: 'Monthly Fee - Paid' },
      { amount: 1000, date: new Date("2023-12-01"), remarks: 'Supplement Purchase' }
    ];

    const tbody = document.querySelector('#paymentsTable tbody');
    tbody.innerHTML = '';
    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
      tr.innerHTML = `
          <td class="p-4 text-white font-mono">₹${p.amount}</td>
          <td class="p-4 text-gray-500 text-sm">${new Date(p.date).toLocaleDateString()}</td>
          <td class="p-4 text-gray-400 italic">"${p.remarks}"</td>
        `;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error(e); }
}

/* ---------- ON LOAD ---------- */
loadProfile();