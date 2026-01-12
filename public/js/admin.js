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
    if (tabId === 'attendance') loadAttendance();
    if (tabId === 'profile') {
      loadProfile();
      loadPricing();
    }
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
async function loadPricing() {
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

/* ---------- ATTENDANCE ---------- */
async function loadAttendance() {
  try {
    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';

    const mockData = [
      { id: 1, name: "Amit Sharma", time: "06:30 AM", type: "QR Scan", status: "On Time" },
      { id: 2, name: "Sneha Gupta", time: "06:45 AM", type: "Manual", status: "Late" },
      { id: 3, name: "Ramesh Powar", time: "07:00 AM", type: "QR Scan", status: "On Time" },
      { id: 4, name: "Rahul Verma", time: "Yesterday", type: "QR Scan", status: "On Time" }
    ];

    // Check LocalStorage
    const localAtt = JSON.parse(localStorage.getItem('attendance') || '[]');
    if (localAtt.length > 0) {
      const today = new Date().toLocaleDateString();
      if (localAtt.includes(today)) {
        mockData.unshift({ id: 'mock-123', name: "Test Member (You)", time: "Just Now", type: "QR Scan", status: "Active Now" });
      }
    }

    mockData.forEach(m => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer group';
      tr.onclick = () => toggleHistory(tr, m); // Click to Expand

      tr.innerHTML = `
                <td class="p-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#32CD32]/20 text-[#32CD32] flex items-center justify-center font-bold text-xs border border-[#32CD32]/40 transition-transform group-hover:scale-110">
                            ${m.name.charAt(0)}
                        </div>
                        <div>
                            <span class="text-white font-bold text-sm block">${m.name}</span>
                            <span class="text-[10px] text-gray-500 font-mono">Click to view history</span>
                        </div>
                    </div>
                </td>
                <td class="p-3 text-gray-400 font-mono text-xs">${m.time}</td>
                <td class="p-3 text-gray-500 text-xs uppercase tracking-wider">${m.type}</td>
                <td class="p-3 text-right">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${m.status === 'Late' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#32CD32]/10 text-[#32CD32] border border-[#32CD32]/20'}">
                        ${m.status}
                    </span>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 ml-2 inline transition-transform group-aria-expanded:rotate-180"></i>
                </td>
             `;
      tbody.appendChild(tr);
    });
    if (window.lucide) lucide.createIcons();

  } catch (e) { console.error(e); }
}

function toggleHistory(row, member) {
  // Check if next row is already details
  const nextRow = row.nextElementSibling;
  if (nextRow && nextRow.classList.contains('detail-row')) {
    nextRow.remove();
    row.removeAttribute('aria-expanded');
    return;
  }

  // Close other open rows (optional - single accordion feel)
  const existing = document.querySelector('.detail-row');
  if (existing) {
    existing.previousElementSibling.removeAttribute('aria-expanded');
    existing.remove();
  }

  row.setAttribute('aria-expanded', 'true');

  // Create Detail Row
  const tr = document.createElement('tr');
  tr.className = 'detail-row bg-[#0a0a0a] animate-fade-in-up';

  // Generate Mock Calendar History
  let historyHtml = '<div class="grid grid-cols-7 gap-2 text-center">';
  // Week Days Header
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach(d => historyHtml += `<div class="text-[10px] text-gray-600 font-mono">${d}</div>`);

  // 30 Days Grid
  let presentCount = 0;
  for (let i = 1; i <= 30; i++) {
    const isPresent = Math.random() > 0.3;
    if (isPresent) presentCount++;
    const color = isPresent ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/20 opacity-50';
    historyHtml += `
            <div class="aspect-square flex items-center justify-center rounded text-xs font-bold ${color} hover:contrast-125 cursor-default group/day relative">
                ${i}
                <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover/day:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                    ${isPresent ? 'Present (6:00 AM)' : 'Absent'}
                </div>
            </div>
        `;
  }
  historyHtml += '</div>';

  tr.innerHTML = `
        <td colspan="4" class="p-6 border-b border-white/5 shadow-inner">
            <div class="flex gap-8">
                <!-- Monthly Stats -->
                <div class="w-1/3">
                    <h4 class="text-white font-oswald uppercase mb-4 text-lg">Monthly Report</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                             <span class="text-gray-400">Total Days</span>
                             <span class="text-white font-mono">30</span>
                        </div>
                        <div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                             <span class="text-gray-400">Present</span>
                             <span class="text-green-400 font-mono">${presentCount}</span>
                        </div>
                         <div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                             <span class="text-gray-400">Absent</span>
                             <span class="text-red-400 font-mono">${30 - presentCount}</span>
                        </div>
                         <div class="flex justify-between items-center text-sm pt-2">
                             <span class="text-gray-400">Attendance Rate</span>
                             <span class="text-[#FF4500] font-bold font-mono">${Math.round((presentCount / 30) * 100)}%</span>
                        </div>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="w-2/3 border-l border-white/5 pl-8">
                    <div class="flex justify-between items-end mb-4">
                        <span class="text-xs text-gray-500 uppercase tracking-widest">January 2026</span>
                        <div class="flex gap-3 text-[10px]">
                            <span class="flex items-center text-gray-500"><div class="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Present</span>
                            <span class="flex items-center text-gray-500"><div class="w-2 h-2 rounded-full bg-red-500 mr-1"></div> Absent</span>
                        </div>
                    </div>
                    ${historyHtml}
                </div>
            </div>
        </td>
    `;

  row.after(tr);
  if (window.lucide) lucide.createIcons();
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
// Add Member (Dynamic Mock)
document.getElementById('memberModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Construct new member object
  const newMember = {
    _id: 'new-' + Date.now(),
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    joiningDate: new Date(formData.get('joinDate')),
    subscriptionPlan: formData.get('plan'),
    amount: formData.get('amount'),
    remainingDays: 30,
    profilePicture: null
  };

  // Close Modal
  document.getElementById('memberModal').classList.add('hidden');
  document.getElementById('memberModal').classList.remove('flex');
  e.target.reset();

  // Add to Table UI directly
  const tbody = document.querySelector('#membersTable tbody');
  const tr = document.createElement('tr');
  tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 animate-fade-in-up';
  tr.innerHTML = `
    <td class="p-4"><img src="https://i.pravatar.cc/150?u=${newMember._id}" class="w-10 h-10 rounded-full border border-white/20 object-cover"></td>
    <td class="p-4 font-bold text-white">${newMember.fullName}</td>
    <td class="p-4 text-gray-500 font-mono">${newMember.phone}</td>
    <td class="p-4 text-gray-400">${newMember.joiningDate.toLocaleDateString()}</td>
    <td class="p-4"><span class="px-2 py-0.5 bg-[#FF4500]/10 text-[#FF4500] text-xs rounded border border-[#FF4500]/20">${newMember.subscriptionPlan}</span></td>
    <td class="p-4 text-white font-mono">₹${newMember.amount}</td>
    <td class="p-4 text-green-400">30 Days</td>
    <td class="p-4 text-right">
      <button class="text-blue-400 hover:text-blue-300 mr-3"><i data-lucide="calendar-plus" class="w-4 h-4"></i></button>
      <button class="text-red-500 hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </td>`;
  tbody.prepend(tr);

  alert("✅ Member Added Successfully!");
  if (window.lucide) lucide.createIcons();
});

// Add Post
document.getElementById('postModalForm').addEventListener('submit', async e => {
  e.preventDefault();
  alert("Post Published! (Demo)");
  document.getElementById('postModal').classList.add('hidden');
  document.getElementById('postModal').classList.remove('flex');
  loadPosts();
});
