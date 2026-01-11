document.getElementById('regForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    fullName: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    password: document.getElementById('password').value
  };
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert(data.msg);
  if (res.ok) location.href = 'login.html';
});