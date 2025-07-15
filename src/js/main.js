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

// --- MQTT Client Connection Status Timer ---
let clientMessageTimeout = null;
function setClientStatus(connected) {
  window.uiHelper.updateConnectionStatus(connected, 'client');
}
// Set initial client status to disconnected
setClientStatus(false);
function handleClientMessage() {
  setClientStatus(true);
  if (clientMessageTimeout) clearTimeout(clientMessageTimeout);
  clientMessageTimeout = setTimeout(() => setClientStatus(false), 5000);
}
// --- END ---

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
    handleClientMessage();
    // Use default value 0 or false if field is missing
    const richterScale = typeof data.richterScale === 'number' ? data.richterScale : 0;
    const maxPeakToPeak = typeof data.maxPeakToPeak === 'number' ? data.maxPeakToPeak : 0;
    const accelMagnitude = typeof data.accelMagnitude === 'number' ? data.accelMagnitude : 0;
    const earthquakeEventActive = typeof data.earthquakeEventActive === 'boolean' ? data.earthquakeEventActive : false;
    const earthquakeLevel = typeof data.earthquakeLevel === 'number' ? data.earthquakeLevel : 0;
    const temp = typeof data.temp === 'number' ? data.temp : 0;
    const accelX = typeof data.accelX === 'number' ? data.accelX : 0;
    const accelY = typeof data.accelY === 'number' ? data.accelY : 0;
    const accelZ = typeof data.accelZ === 'number' ? data.accelZ : 0;
    const gyroX = typeof data.gyroX === 'number' ? data.gyroX : 0;
    const gyroY = typeof data.gyroY === 'number' ? data.gyroY : 0;
    const gyroZ = typeof data.gyroZ === 'number' ? data.gyroZ : 0;
    const wifiConnected = typeof data.wifiConnected === 'boolean' ? data.wifiConnected : false;
    const mqttConnected = typeof data.mqttConnected === 'boolean' ? data.mqttConnected : false;
    const wifiRSSI = typeof data.wifiRSSI === 'number' ? data.wifiRSSI : 0;

    window.uiHelper.updateConnectionStatus(mqttConnected, 'client');
    window.uiHelper.updateConnectionStatus(wifiConnected, 'wifi');
    document.getElementById('richter-scale').textContent = richterScale.toFixed(2);
    document.getElementById('peak-to-peak').textContent = maxPeakToPeak.toFixed(2);
    const intensityPercentage = Math.min(richterScale * 10, 100);
    document.getElementById('intensity-bar').style.width = `${intensityPercentage}%`;
    const statusElement = document.getElementById('earthquake-status');
    const eventIndicator = document.getElementById('event-status-indicator');
    if (earthquakeEventActive) {
      statusElement.textContent = 'Earthquake!';
      statusElement.className = 'text-xl font-semibold text-red-500';
      eventIndicator.className = 'w-3 h-3 rounded-full mr-2 bg-red-500 animate-pulse';
      document.getElementById('event-status').textContent = 'Active';
      document.getElementById('event-level').textContent = `Level: ${earthquakeLevel}`;
      startBeeping();
    } else {
      statusElement.textContent = 'Normal';
      statusElement.className = 'text-xl font-semibold text-green-500';
      eventIndicator.className = 'w-3 h-3 rounded-full mr-2 bg-green-500';
      document.getElementById('event-status').textContent = 'Inactive';
      document.getElementById('event-level').textContent = 'Level: --';
      stopBeeping();
    }
    document.getElementById('temperature').textContent = temp.toFixed(2);
    document.getElementById('accel-magnitude').textContent = accelMagnitude.toFixed(2);
    document.getElementById('wifi-rssi').textContent = `RSSI: ${wifiRSSI} dBm`;
    document.getElementById('accel-x').textContent = accelX.toFixed(2);
    document.getElementById('accel-y').textContent = accelY.toFixed(2);
    document.getElementById('accel-z').textContent = accelZ.toFixed(2);
    document.getElementById('gyro-x').textContent = gyroX.toFixed(2);
    document.getElementById('gyro-y').textContent = gyroY.toFixed(2);
    document.getElementById('gyro-z').textContent = gyroZ.toFixed(2);
    document.getElementById('front-value').textContent = `${accelX.toFixed(1)}, ${accelY.toFixed(1)}`;
    document.getElementById('right-value').textContent = `${accelY.toFixed(1)}, ${accelZ.toFixed(1)}`;
    document.getElementById('bottom-value').textContent = `${accelX.toFixed(1)}, ${accelZ.toFixed(1)}`;
    const cube = document.querySelector('.cube');
    const tiltX = Math.min(Math.max(accelX * 10, -45), 45);
    const tiltY = Math.min(Math.max(accelY * 10, -45), 45);
    cube.style.transform = `rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
    window.uiHelper.updateChart(window.charts.accelChart, [accelX, accelY, accelZ]);
    window.uiHelper.updateChart(window.charts.gyroChart, [gyroX, gyroY, gyroZ]);
  }
  function processVibrationData(data) {
    handleClientMessage();
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