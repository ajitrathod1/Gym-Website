const roleBtns = document.querySelectorAll('.role-btn');
const memberForm = document.getElementById('memberForm');
const adminForm = document.getElementById('adminForm');

roleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    roleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.role === 'admin') {
      memberForm.classList.add('hidden');
      adminForm.classList.remove('hidden');
    } else {
      memberForm.classList.remove('hidden');
      adminForm.classList.add('hidden');
    }
  });
});

memberForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('memEmail').value;
  const password = document.getElementById('memPass').value;
  /* Testing Shortcut */
  if (email === 'member@fit.com' && password === '123') {
    localStorage.setItem('token', 'mock-member-token');
    localStorage.setItem('role', 'member');
    location.href = 'member-dashboard.html';
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    location.href = 'member-dashboard.html';
  } else {
    alert(data.msg);
  }
});

adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('admUser').value;
  const password = document.getElementById('admPass').value;
  /* Testing Shortcut */
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem('token', 'mock-admin-token');
    localStorage.setItem('role', 'admin');
    location.href = 'admin-dashboard.html';
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    location.href = 'admin-dashboard.html';
  } else {
    alert(data.msg);
  }
});