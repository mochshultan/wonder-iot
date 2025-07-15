// Android WebView performance fix: add class to body
if (/android/i.test(navigator.userAgent)) {
  document.body.classList.add('android-webview');
}

// Redirect ke login jika belum ada topic
const imuTopic = localStorage.getItem('imuTopic');
const vibrationTopic = localStorage.getItem('vibrationTopic');

console.log('[MAIN] Available topics:', { imuTopic, vibrationTopic });

if (!imuTopic && !vibrationTopic) {
  console.log('[MAIN] No topics found, redirecting to login');
  window.location.href = 'login.html';
}

// Refresh MQTT topics after login redirect
if (window.mqttHelper && window.mqttHelper.refreshTopics) {
  console.log('[MAIN] Refreshing MQTT topics');
  window.mqttHelper.refreshTopics();
}

// Tab Navigation
if (document.querySelectorAll('.tab-btn').length) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// Audio Toggle
let isMuted = true;
const audioToggleButton = document.getElementById('audio-toggle-btn');
const audioIcon = document.getElementById('audio-icon');
const audioCtx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;

function updateAudioIcon() {
  if (!audioIcon || !audioToggleButton) return;
  if (isMuted) {
    audioIcon.classList.remove('fa-volume-up');
    audioIcon.classList.add('fa-volume-mute');
    audioToggleButton.setAttribute('title', 'Unmute');
    audioToggleButton.classList.add('neumorphic');
    audioToggleButton.classList.remove('neumorphic-inset');
  } else {
    audioIcon.classList.remove('fa-volume-mute');
    audioIcon.classList.add('fa-volume-up');
    audioToggleButton.setAttribute('title', 'Mute');
    audioToggleButton.classList.add('neumorphic-inset');
    audioToggleButton.classList.remove('neumorphic');
  }
}

if (audioToggleButton) {
  audioToggleButton.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isMuted = !isMuted;
    updateAudioIcon();
  });
}

updateAudioIcon();

// Refresh Topics Button
const refreshTopicsBtn = document.getElementById('refresh-topics-btn');
if (refreshTopicsBtn && window.mqttHelper) {
  refreshTopicsBtn.addEventListener('click', () => {
    console.log('[MAIN] Manual refresh topics requested');
    window.mqttHelper.refreshTopics();
    if (window.uiHelper) {
      window.uiHelper.addToLog('Manual topic refresh requested');
      window.uiHelper.addToLog(`Current IMU Topic: ${localStorage.getItem('imuTopic') || 'Not set'}`);
      window.uiHelper.addToLog(`Current Vibration Topic: ${localStorage.getItem('vibrationTopic') || 'Not set'}`);
    }
  });
}

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
darkModeToggle.addEventListener('click', () => {
  setDarkMode(!document.body.classList.contains('dark'));
});
// Aktifkan dark mode jika pernah dipilih
if (localStorage.getItem('darkMode') === '1') {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

// Inisialisasi MQTT dan data handler
if (window.mqttHelper && window.uiHelper && window.charts) {
  console.log('[MAIN] Initializing MQTT with topics:', {
    imuTopic: localStorage.getItem('imuTopic'),
    vibrationTopic: localStorage.getItem('vibrationTopic')
  });
  
  let beepInterval = null;
  function startBeeping() {
    if (!beepInterval && !isMuted) {
      window.uiHelper.playBeep(audioCtx, isMuted);
      beepInterval = setInterval(() => window.uiHelper.playBeep(audioCtx, isMuted), 1000);
    }
  }
  function stopBeeping() {
    if (beepInterval) {
      clearInterval(beepInterval);
      beepInterval = null;
    }
  }
  function processImuData(data) {
    window.uiHelper.updateConnectionStatus(data.mqttConnected, 'client');
    window.uiHelper.updateConnectionStatus(data.wifiConnected, 'wifi');
    document.getElementById('richter-scale').textContent = data.richterScale.toFixed(2);
    document.getElementById('peak-to-peak').textContent = data.maxPeakToPeak.toFixed(2);
    const intensityPercentage = Math.min(data.richterScale * 10, 100);
    document.getElementById('intensity-bar').style.width = `${intensityPercentage}%`;
    const statusElement = document.getElementById('earthquake-status');
    const eventIndicator = document.getElementById('event-status-indicator');
    if (data.earthquakeEventActive) {
      statusElement.textContent = 'Earthquake!';
      statusElement.className = 'text-xl font-semibold text-red-500';
      eventIndicator.className = 'w-3 h-3 rounded-full mr-2 bg-red-500 animate-pulse';
      document.getElementById('event-status').textContent = 'Active';
      document.getElementById('event-level').textContent = `Level: ${data.earthquakeLevel}`;
      startBeeping();
    } else {
      statusElement.textContent = 'Normal';
      statusElement.className = 'text-xl font-semibold text-green-500';
      eventIndicator.className = 'w-3 h-3 rounded-full mr-2 bg-green-500';
      document.getElementById('event-status').textContent = 'Inactive';
      document.getElementById('event-level').textContent = 'Level: --';
      stopBeeping();
    }
    document.getElementById('temperature').textContent = data.temp.toFixed(2);
    document.getElementById('accel-magnitude').textContent = data.accelMagnitude.toFixed(2);
    document.getElementById('wifi-rssi').textContent = `RSSI: ${data.wifiRSSI} dBm`;
    document.getElementById('accel-x').textContent = data.accelX.toFixed(2);
    document.getElementById('accel-y').textContent = data.accelY.toFixed(2);
    document.getElementById('accel-z').textContent = data.accelZ.toFixed(2);
    document.getElementById('gyro-x').textContent = data.gyroX.toFixed(2);
    document.getElementById('gyro-y').textContent = data.gyroY.toFixed(2);
    document.getElementById('gyro-z').textContent = data.gyroZ.toFixed(2);
    document.getElementById('front-value').textContent = `${data.accelX.toFixed(1)}, ${data.accelY.toFixed(1)}`;
    document.getElementById('right-value').textContent = `${data.accelY.toFixed(1)}, ${data.accelZ.toFixed(1)}`;
    document.getElementById('bottom-value').textContent = `${data.accelX.toFixed(1)}, ${data.accelZ.toFixed(1)}`;
    const cube = document.querySelector('.cube');
    const tiltX = Math.min(Math.max(data.accelX * 10, -45), 45);
    const tiltY = Math.min(Math.max(data.accelY * 10, -45), 45);
    cube.style.transform = `rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
    window.uiHelper.updateChart(window.charts.accelChart, [data.accelX, data.accelY, data.accelZ]);
    window.uiHelper.updateChart(window.charts.gyroChart, [data.gyroX, data.gyroY, data.gyroZ]);
  }
  function processVibrationData(data) {
    document.getElementById('sw420-state').textContent = data.sw420;
    document.getElementById('vibration-detected').textContent = data.vibrationDetected ? 'Yes' : 'No';
    document.getElementById('vibration-count').textContent = data.vibrationCount;
    document.getElementById('earthquake-detected').textContent = data.earthquakeDetected ? 'Yes' : 'No';
    document.getElementById('sw1801p-voltage').textContent = data.sw1801p_voltage.toFixed(2);
    const voltagePercentage = (data.sw1801p_voltage / 3300) * 100;
    document.getElementById('voltage-bar').style.width = `${voltagePercentage}%`;
  }
  
  // Subscribe to topics with current localStorage values
  window.mqttHelper.subscribeTopics(processImuData, processVibrationData, window.uiHelper.addToLog);
  window.uiHelper.addToLog('System initialized. Connecting to MQTT broker...');
  window.uiHelper.addToLog(`IMU Topic: ${localStorage.getItem('imuTopic') || 'Not set'}`);
  window.uiHelper.addToLog(`Vibration Topic: ${localStorage.getItem('vibrationTopic') || 'Not set'}`);
} else {
  console.error('[MAIN] Required helpers not available:', {
    mqttHelper: !!window.mqttHelper,
    uiHelper: !!window.uiHelper,
    charts: !!window.charts
  });
} 