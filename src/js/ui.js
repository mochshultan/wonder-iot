// UI Helper
function updateConnectionStatus(connected, type, connecting) {
  const indicator = document.getElementById(`${type}-dot`);
  const status = document.getElementById(`${type}-status`);
  if (!indicator || !status) return;
  indicator.classList.remove('connected', 'disconnected', 'pulse');
  if (connecting) {
    indicator.classList.add('pulse');
    status.textContent = type === 'broker' ? 'Broker: Connecting...' : type === 'client' ? 'Client: Connecting...' : 'Connecting...';
  } else if (connected) {
    indicator.classList.add('connected');
    status.textContent = type === 'broker' ? 'Broker: Connected' : type === 'client' ? 'Client: Connected' : 'Connected';
  } else {
    indicator.classList.add('disconnected');
    status.textContent = type === 'broker' ? 'Broker: Disconnected' : type === 'client' ? 'Client: Disconnected' : 'Disconnected';
  }
}

function addToLog(message) {
  const logElement = document.getElementById('data-log');
  if (!logElement) return;
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = 'mb-1';
  logEntry.innerHTML = `<span class="text-blue-500">[${timestamp}]</span> ${message}`;
  logElement.appendChild(logEntry);
  logElement.scrollTop = logElement.scrollHeight;
  if (logElement.children.length > 100) {
    logElement.removeChild(logElement.children[0]);
  }
}

function playBeep(audioCtx, isMuted) {
  if (!audioCtx || audioCtx.state === 'suspended' || isMuted) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
  oscillator.start(audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
  oscillator.stop(audioCtx.currentTime + 0.2);
}

function updateChart(chart, newData) {
  chart.data.datasets.forEach((dataset, i) => {
    dataset.data.push(newData[i]);
    if (dataset.data.length > 20) {
      dataset.data.shift();
    }
  });
  chart.update();
}

window.uiHelper = { updateConnectionStatus, addToLog, playBeep, updateChart }; 