// MQTT.js harus sudah di-bundle lokal dan di-include sebelum file ini
const mqttConfig = {
  server: "broker.emqx.io",
  port: 8084, // WebSocket port
  clientId: "web-client-" + Math.random().toString(16).substr(2, 8),
  get imuTopic() { return localStorage.getItem('imuTopic') || ''; },
  get vibrationTopic() { return localStorage.getItem('vibrationTopic') || ''; }
};

const client = mqtt.connect(`wss://${mqttConfig.server}:${mqttConfig.port}/mqtt`, {
  clientId: mqttConfig.clientId,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000
});

function subscribeTopics(onImu, onVibration, onLog) {
  client.on('connect', () => {
    console.log('[MQTT] Connected!');
    window.uiHelper.updateConnectionStatus(true, 'broker', false);
    
    // Subscribe to topics dynamically
    if (mqttConfig.imuTopic) {
      client.subscribe(mqttConfig.imuTopic);
      console.log('[MQTT] Subscribed to IMU topic:', mqttConfig.imuTopic);
    }
    if (mqttConfig.vibrationTopic) {
      client.subscribe(mqttConfig.vibrationTopic);
      console.log('[MQTT] Subscribed to Vibration topic:', mqttConfig.vibrationTopic);
    }
    
    if (onLog) onLog('Connected to MQTT broker and subscribed to topics');
  });
  
  client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting...');
    window.uiHelper.updateConnectionStatus(false, 'broker', true);
    if (onLog) onLog('Attempting to reconnect to MQTT broker...');
  });
  
  client.on('close', () => {
    console.log('[MQTT] Connection closed');
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    if (onLog) onLog('Disconnected from MQTT broker');
  });
  
  client.on('error', err => {
    console.error('[MQTT] Error:', err);
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    if (onLog) onLog('MQTT Error: ' + err.message);
  });
  
  client.on('offline', () => {
    console.log('[MQTT] Client offline');
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    if (onLog) onLog('MQTT client is offline');
  });
  
  client.on('message', (topic, message) => {
    console.log('[MQTT] Message received:', topic, message.toString());
    try {
      const data = JSON.parse(message.toString());
      if (topic === mqttConfig.imuTopic && onImu) onImu(data);
      if (topic === mqttConfig.vibrationTopic && onVibration) onVibration(data);
      if (onLog) onLog(`Data received from ${topic.split('/').pop()}: ${message.toString()}`);
    } catch (e) {
      if (onLog) onLog('Error parsing message: ' + e.message);
    }
  });
}

// Function to refresh topics and reconnect if needed
function refreshTopics() {
  if (client.connected) {
    // Unsubscribe from old topics first
    const oldImuTopic = localStorage.getItem('imuTopic');
    const oldVibrationTopic = localStorage.getItem('vibrationTopic');
    
    if (oldImuTopic) client.unsubscribe(oldImuTopic);
    if (oldVibrationTopic) client.unsubscribe(oldVibrationTopic);
    
    // Subscribe to new topics
    if (mqttConfig.imuTopic) {
      client.subscribe(mqttConfig.imuTopic);
      console.log('[MQTT] Refreshed IMU topic:', mqttConfig.imuTopic);
    }
    if (mqttConfig.vibrationTopic) {
      client.subscribe(mqttConfig.vibrationTopic);
      console.log('[MQTT] Refreshed Vibration topic:', mqttConfig.vibrationTopic);
    }
  }
}

window.mqttHelper = { subscribeTopics, refreshTopics }; 