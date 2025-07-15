// MQTT.js harus sudah di-bundle lokal dan di-include sebelum file ini
const mqttConfig = {
  server: "broker.emqx.io",
  port: 8084, // WebSocket port
  clientId: "web-client-" + Math.random().toString(16).substr(2, 8),
  imuTopic: localStorage.getItem('imuTopic') || '',
  vibrationTopic: localStorage.getItem('vibrationTopic') || ''
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
    window.uiHelper.updateConnectionStatus(true, 'client', false);
    if (mqttConfig.imuTopic) client.subscribe(mqttConfig.imuTopic);
    if (mqttConfig.vibrationTopic) client.subscribe(mqttConfig.vibrationTopic);
    if (onLog) onLog('Subscribed to topics');
  });
  client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting...');
    window.uiHelper.updateConnectionStatus(false, 'broker', true);
    window.uiHelper.updateConnectionStatus(false, 'client', true);
    if (onLog) onLog('Attempting to reconnect to MQTT broker...');
  });
  client.on('close', () => {
    console.log('[MQTT] Connection closed');
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    window.uiHelper.updateConnectionStatus(false, 'client', false);
    if (onLog) onLog('Disconnected from MQTT broker');
  });
  client.on('error', err => {
    console.error('[MQTT] Error:', err);
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    window.uiHelper.updateConnectionStatus(false, 'client', false);
    if (onLog) onLog('MQTT Error: ' + err.message);
  });
  client.on('offline', () => {
    console.log('[MQTT] Client offline');
    window.uiHelper.updateConnectionStatus(false, 'broker', false);
    window.uiHelper.updateConnectionStatus(false, 'client', false);
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

window.mqttHelper = { subscribeTopics }; 