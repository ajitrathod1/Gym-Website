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

/* ---------- CHECK-IN LOGIC ---------- */
const checkInBtn = document.getElementById('checkInBtn');
const checkInModal = document.getElementById('checkInModal');
const scanCompleteBtn = document.getElementById('scanCompleteBtn');
const closeBtns = document.querySelectorAll('.close-modal');

checkInBtn.addEventListener('click', () => {
  checkInModal.classList.remove('hidden');
  checkInModal.classList.add('flex');
});

closeBtns.forEach(btn => btn.addEventListener('click', () => {
  checkInModal.classList.add('hidden');
  checkInModal.classList.remove('flex');
}));

scanCompleteBtn.addEventListener('click', () => {
  // Simulate Backend Call
  showToast('Attendance Marked Successfully!', 'success');
  checkInModal.classList.add('hidden');
  checkInModal.classList.remove('flex');
  // Store in local storage for persistence (demo)
  const today = new Date().toLocaleDateString();
  let attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  if (!attendance.includes(today)) attendance.push(today);
  localStorage.setItem('attendance', JSON.stringify(attendance));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});

/* ---------- PROFILE + Digital ID ---------- */
async function loadProfile() {
  if (token === 'mock-member-token') {
    // Immediate Mock Render
    const user = {
      _id: 'mock-123',
      fullName: 'Test User',
      phone: '9999999999',
      email: 'member@fit.com',
      age: 24,
      gender: 'Male',
      address: 'Vijayapur, Karnataka',
      subscriptionPlan: 'Gold Plan',
      expiryDate: new Date(Date.now() + 86400000 * 30),
      profilePicture: null
    };
    renderUser(user);
    return;
  }

  try {
    const res = await fetch('/api/member/profile', { headers: getHeaders() });

    let user;
    if (!res.ok) throw new Error("Offline");
    user = await res.json();
    renderUser(user);

  } catch (err) {
    // Fallback Mock Data
    const user = {
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
    renderUser(user);
  }
}

function renderUser(user) {
  localStorage.setItem('userId', user._id);
  if (document.getElementById('fullName')) document.getElementById('fullName').value = user.fullName;
  if (document.getElementById('phone')) document.getElementById('phone').value = user.phone;
  if (document.getElementById('email')) document.getElementById('email').value = user.email;
  if (document.getElementById('age')) document.getElementById('age').value = user.age;
  if (document.getElementById('gender')) document.getElementById('gender').value = user.gender;
  if (document.getElementById('address')) document.getElementById('address').value = user.address || '';

  if (document.getElementById('plan')) document.getElementById('plan').value = user.subscriptionPlan;
  if (document.getElementById('expiry')) document.getElementById('expiry').value = new Date(user.expiryDate).toLocaleDateString();

  const rem = Math.ceil((new Date(user.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24));
  if (document.getElementById('remaining')) document.getElementById('remaining').value = (rem > 0 ? rem : 0) + " Days";

  const av = document.getElementById('profPic');
  if (av) av.src = user.profilePicture ? user.profilePicture : 'https://i.pravatar.cc/150?u=test@fit.com';
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

/* ---------- TOAST NOTIFICATIONS ---------- */
window.showToast = function (msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colorClass = type === 'error' ? 'border-red-500 text-red-500' : 'border-[#32CD32] text-[#32CD32]';
  const iconName = type === 'error' ? 'alert-circle' : 'check-circle';

  toast.className = `toast bg-[#0a0a0a] border-l-4 ${colorClass} text-white px-6 py-4 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 min-w-[320px] border-y border-r border-white/5 backdrop-blur-md`;

  toast.innerHTML = `
        <div class="bg-white/5 p-2 rounded-full">
            <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <div>
            <p class="font-bold text-sm uppercase tracking-wider">${type}</p>
            <p class="text-xs text-gray-400 font-mono mt-0.5">${msg}</p>
        </div>
    `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
};

/* ---------- ON LOAD ---------- */
loadProfile();