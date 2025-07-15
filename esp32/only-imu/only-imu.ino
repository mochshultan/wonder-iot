#include <WiFiManager.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi and MQTT settings
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_client_id = "esp32-imu-client";
const char* topic_imu = "YOUR_MQTT_TOPIC/data";

WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_MPU6050 mpu;

// IMU data buffer
float maxPeakToPeak = 0;
float richterScale = 0;

// WiFi and MQTT status
bool wifiConnected = false;
bool mqttConnected = false;

// Function to calculate magnitude from peak-to-peak amplitude
float calculateRichterScale(float peakToPeak) {
  if (peakToPeak <= 0) return 0;
  float amplitudeMM = peakToPeak * 1000;
  float richter = log10(amplitudeMM) + 2.0;
  if (richter < 0) richter = 0;
  if (richter > 10) richter = 10;
  return richter;
}

void WiFiEvent(WiFiEvent_t event){
  switch (event){
    case WIFI_EVENT_STA_DISCONNECTED:
      wifiConnected = false;
      mqttConnected = false;
      WiFi.reconnect();
      break;
    case WIFI_EVENT_STA_CONNECTED:
      break;
    case IP_EVENT_STA_GOT_IP:
      wifiConnected = true;
      break;
    default:
      break;
  }
}

void setup_wifi() {
  WiFi.onEvent(WiFiEvent);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.mode(WIFI_STA);
}

void reconnect() {
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    mqttConnected = false;
    return;
  }
  if (!client.connected()) {
    String clientId = String(mqtt_client_id) + "-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      mqttConnected = true;
    } else {
      mqttConnected = false;
    }
  }
}

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0) + millis());
  Wire.begin();

  // Scan I2C
  for(byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
    }
  }

  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_184_HZ);
  Serial.println("MPU6050 Found!");

  // WiFiManager
  WiFiManager wm;
  wm.setConnectTimeout(15);
  WiFi.onEvent(WiFiEvent);
  if (!wm.autoConnect("WONDER_Wifi", "wonderwonder")){
    ESP.restart();
  }

  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024);
}

void handleWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    mqttConnected = false;
    WiFi.reconnect();
  } else if (!wifiConnected) {
    wifiConnected = true;
  }
}

void handleMQTT() {
  if (wifiConnected) {
    if (!client.connected()) {
      reconnect();
    } else {
      client.loop();
      mqttConnected = true;
    }
  }
}

void publishIMU() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float accelMagnitude = sqrt(a.acceleration.x * a.acceleration.x +
                             a.acceleration.y * a.acceleration.y +
                             (a.acceleration.z - 9.8) * (a.acceleration.z - 9.8));
  // Dummy peak-to-peak for demo (bisa diimprove jika ingin deteksi peak)
  maxPeakToPeak = accelMagnitude;
  richterScale = calculateRichterScale(maxPeakToPeak);

  String imuData = "{";
  imuData += "\"accelX\":" + String(a.acceleration.x) + ",";
  imuData += "\"accelY\":" + String(a.acceleration.y) + ",";
  imuData += "\"accelZ\":" + String(a.acceleration.z) + ",";
  imuData += "\"gyroX\":" + String(g.gyro.x) + ",";
  imuData += "\"gyroY\":" + String(g.gyro.y) + ",";
  imuData += "\"gyroZ\":" + String(g.gyro.z) + ",";
  imuData += "\"temp\":" + String(temp.temperature) + ",";
  imuData += "\"accelMagnitude\":" + String(accelMagnitude) + ",";
  imuData += "\"maxPeakToPeak\":" + String(maxPeakToPeak) + ",";
  imuData += "\"richterScale\":" + String(richterScale, 2) + ",";
  imuData += "\"wifiConnected\":" + String(wifiConnected ? "true" : "false") + ",";
  imuData += "\"mqttConnected\":" + String(mqttConnected ? "true" : "false") + ",";
  imuData += "\"wifiRSSI\":" + String(WiFi.RSSI());
  imuData += "}";

  if (client.connected()) {
    client.publish(topic_imu, imuData.c_str());
    Serial.print("Published IMU: ");
    Serial.println(imuData);
  }
}

void loop() {
  handleWiFi();
  handleMQTT();
  publishIMU();
  delay(200); // Adjust as needed
}
