// Dark mode switcher
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeIcon = document.getElementById('dark-mode-icon');

function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark');
    darkModeIcon.classList.remove('fa-moon');
    darkModeIcon.classList.add('fa-sun');
    darkModeToggle.setAttribute('title', 'Switch to light mode');
    localStorage.setItem('darkMode', '1');
  } else {
    document.body.classList.remove('dark');
    darkModeIcon.classList.remove('fa-sun');
    darkModeIcon.classList.add('fa-moon');
    darkModeToggle.setAttribute('title', 'Switch to dark mode');
    localStorage.setItem('darkMode', '0');
  }
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    setDarkMode(!document.body.classList.contains('dark'));
  });
}

// Aktifkan dark mode jika pernah dipilih
if (localStorage.getItem('darkMode') === '1') {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const imuTopic = document.getElementById('imu-topic').value.trim();
  const vibrationTopic = document.getElementById('vibration-topic').value.trim();
  const errorDiv = document.getElementById('login-error');
  const submitBtn = document.querySelector('#login-form button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  if (!imuTopic && !vibrationTopic) {
    errorDiv.classList.remove('hidden');
    // Add shake animation to form
    const form = document.getElementById('login-form');
    form.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      form.style.animation = '';
    }, 500);
    return;
  }
  
  errorDiv.classList.add('hidden');
  
  // Add ripple effect
  const rect = submitBtn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  submitBtn.appendChild(ripple);
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, 600);
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connecting...';
  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-75');
  
  // Simpan ke localStorage
  localStorage.setItem('imuTopic', imuTopic);
  localStorage.setItem('vibrationTopic', vibrationTopic);
  
  // Simulate connection process
  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Connected!';
    submitBtn.classList.remove('opacity-75');
    submitBtn.classList.add('bg-green-500');
    
    // Redirect after showing success
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  }, 1000);
}); 