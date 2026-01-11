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