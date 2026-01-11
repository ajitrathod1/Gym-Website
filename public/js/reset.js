document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    email: document.getElementById('email').value,
    otp: document.getElementById('otp').value,
    newPassword: document.getElementById('newPass').value
  };
  const res = await fetch('/api/auth/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert(data.msg);
  if (res.ok) location.href = 'login.html';
});