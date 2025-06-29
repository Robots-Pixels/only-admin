document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;

  // https://mjp-backend.onrender.com/api/auth/login

  const res = await fetch('https://mjp-backend.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (data.status === true && data.token) {
    localStorage.setItem('adminToken', data.token);
    window.location.href = '/dashboard.html';
  } else {
    console.log(data.error);
    document.getElementById('error-msg').textContent = data.error || data.message;
  }
});

