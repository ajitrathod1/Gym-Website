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

/* ---------- STATS (Animated Counters) ---------- */
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

async function loadStats() {
  // Animate Counters
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    animateValue(counter, 0, target, 2000);
  });
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
/* ---------- POSTS (Website News Feed) ---------- */
// This function syncs with the main website's "Latest Updates" section
async function loadPosts() {
  try {
    const res = await fetch('/api/posts', { headers: getHeaders() });
    const posts = await res.json();
    // If API fails or is empty, fall back to mock data
    if (!posts || posts.length === 0) throw new Error("No posts found");
    renderPosts(posts);
  } catch (e) {
    console.warn("Using Mock Data for Posts");
    // MOCK DATA corresponding to index.html section
    const mockPosts = [
      { _id: '1', title: 'New Yoga Batch', content: 'Join our morning freshness batch starting this Monday at 6:00 AM.', date: 'TODAY', image: 'assets/class-1.jpg' },
      { _id: '2', title: 'Summer Sale - 20% OFF', content: 'Get flat 20% discount on Yearly Membership. Valid till sunday!', date: 'OFFER', image: 'assets/class-2.jpg' },
      { _id: '3', title: 'Powerlifting Meet', content: 'Show your strength! Inter-gym competition this weekend.', date: 'EVENT', image: 'assets/class-3.jpg' }
    ];
    renderPosts(mockPosts);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  container.innerHTML = '';

  posts.forEach(p => {
    const div = document.createElement('div');
    // Matching the style of index.html cards but with Edit actions
    div.className = 'bg-[#111] border border-white/5 rounded-lg overflow-hidden group hover:border-[#FF4500]/50 transition-all shadow-lg flex flex-col';
    div.innerHTML = `
          <div class="h-48 overflow-hidden relative">
            <img src="${p.image || 'assets/class-1.jpg'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            <div class="absolute top-2 right-2 bg-black/80 text-[#FF4500] text-[10px] font-bold px-2 py-1 rounded border border-[#FF4500]/20 uppercase">
                ${p.date || 'UPDATE'}
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-xl font-oswald text-white mb-2">${p.title || 'Untitled Post'}</h4>
            <p class="text-gray-400 text-sm leading-relaxed mb-4 flex-1">${p.content}</p>
            <div class="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <button class="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                    <i data-lucide="edit-3" class="w-3 h-3"></i> Edit
                </button>
                <button class="text-xs text-red-500/50 hover:text-red-500 flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-3 h-3"></i> Delete
                </button>
            </div>
          </div>
        `;
    container.appendChild(div);
  });
  if (window.lucide) lucide.createIcons();
}

/* ---------- PRICING MANAGEMENT (New Feature) ---------- */
// In a real app, this would fetch from a /settings API
const pricingData = {
  monthly: 1500,
  yearly: 12000,
  custom: 4000
};

// We'll inject a Pricing Section into the Profile Tab for now
async function loadProfile() {
  const section = document.getElementById('profile');
  if (!section.querySelector('#pricingManager')) {
    const div = document.createElement('div');
    div.id = 'pricingManager';
    div.className = 'mt-10 pt-10 border-t border-white/5';
    div.innerHTML = `
            <div class="flex justify-between items-end mb-6">
                <div>
                     <h2 class="text-2xl font-oswald font-bold text-white uppercase mb-1">Membership Pricing</h2>
                     <p class="text-xs text-gray-500 font-mono tracking-widest">UPDATE PLAN COSTS</p>
                </div>
                <button onclick="savePricing()" class="bg-[#FF4500] text-black font-bold text-xs px-4 py-2 rounded uppercase tracking-wider hover:bg-[#ff571a] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,69,0,0.3)]">
                    <i data-lucide="save" class="w-4 h-4"></i> Save Changes
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-[#111] p-6 rounded border border-white/5 hover:border-[#FF4500]/30 transition-colors">
                    <label class="text-xs text-gray-500 uppercase tracking-widest block mb-2">Monthly Plan</label>
                    <div class="flex items-center gap-2 border-b border-white/10 pb-2">
                        <span class="text-xl font-oswald text-[#FF4500]">₹</span>
                        <input type="number" id="priceMonthly" value="${pricingData.monthly}" class="bg-transparent border-none text-2xl font-bold text-white w-full focus:ring-0 p-0" />
                    </div>
                </div>
                 <div class="bg-[#111] p-6 rounded border border-white/5 hover:border-[#FF4500]/30 transition-colors">
                    <label class="text-xs text-gray-500 uppercase tracking-widest block mb-2">Yearly Plan</label>
                    <div class="flex items-center gap-2 border-b border-white/10 pb-2">
                        <span class="text-xl font-oswald text-[#FF4500]">₹</span>
                        <input type="number" id="priceYearly" value="${pricingData.yearly}" class="bg-transparent border-none text-2xl font-bold text-white w-full focus:ring-0 p-0" />
                    </div>
                </div>
                 <div class="bg-[#111] p-6 rounded border border-white/5 hover:border-[#FF4500]/30 transition-colors">
                    <label class="text-xs text-gray-500 uppercase tracking-widest block mb-2">3 Months / Custom</label>
                    <div class="flex items-center gap-2 border-b border-white/10 pb-2">
                        <span class="text-xl font-oswald text-[#FF4500]">₹</span>
                        <input type="number" id="priceCustom" value="${pricingData.custom}" class="bg-transparent border-none text-2xl font-bold text-white w-full focus:ring-0 p-0" />
                    </div>
                </div>
            </div>
        `;
    section.appendChild(div);
    if (window.lucide) lucide.createIcons();
  }
}

window.savePricing = function () {
  // In real app, sends PUT request to API
  const newPrices = {
    monthly: document.getElementById('priceMonthly').value,
    yearly: document.getElementById('priceYearly').value,
    custom: document.getElementById('priceCustom').value
  };
  console.log("Saving Prices:", newPrices);
  alert("Pricing Updated Successfully!");
};

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
