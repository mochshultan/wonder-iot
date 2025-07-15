document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const imuTopic = document.getElementById('imu-topic').value.trim();
  const vibrationTopic = document.getElementById('vibration-topic').value.trim();
  const errorDiv = document.getElementById('login-error');

  if (!imuTopic && !vibrationTopic) {
    errorDiv.classList.remove('hidden');
    return;
  }
  errorDiv.classList.add('hidden');
  // Simpan ke localStorage
  localStorage.setItem('imuTopic', imuTopic);
  localStorage.setItem('vibrationTopic', vibrationTopic);
  // Redirect ke dashboard
  window.location.href = 'index.html';
}); 