#include <WiFiManager.h>
#include <strings_en.h>
#include <wm_consts_en.h>
#include <wm_strings_en.h>
#include <wm_strings_es.h>

#include <WiFi.h>

#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// MPU6050 I2C addresses
#define MPU6050_ADDRESS_AD0_LOW 0x68  // MPU6050 default address
#define MPU6050_ADDRESS_AD0_HIGH 0x69  // Alternative address when AD0 is high

// SW420 Vibration Sensor Pin
const int SW420_PIN = 19;  // SW420 sensor connected to GPIO 19
const int SW1801P_PIN = 34;  // SW1801P sensor connected to GPIO 34

// Buzzer Pins
const int BUZZER_1_PIN = 12;  // G12
const int BUZZER_2_PIN = 14;  // G14

// Peak-to-Peak Detection Parameters
const int PEAK_BUFFER_SIZE = 100;  // Buffer untuk menyimpan nilai accelerometer
const float PEAK_DETECTION_THRESHOLD = 5;  // Threshold untuk deteksi peak
const unsigned long EARTHQUAKE_TIMEOUT = 500;  // 0.5 detik timeout untuk event gempa

// Peak-to-Peak Variables
float accelBuffer[PEAK_BUFFER_SIZE];
int bufferIndex = 0;
bool bufferFull = false;
float currentPeak = 0;
float maxPeakToPeak = 0;
float lastPeakValue = 0;
bool peakDetected = false;
unsigned long lastPeakTime = 0;
unsigned long earthquakeStartTime = 0;
bool earthquakeEventActive = false;
float richterScale = 0;

// Buzzer Control Variables
unsigned long lastBeepTime = 0;
bool earthquakeDetected = false;
int earthquakeLevel = 0;  // 0=none, 1=light, 2=moderate, 3=strong

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker settings
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_client_id = "esp32-client";
const char* topic_imu = "YOUR_MQTT_TOPIC/data";
const char* topic_vibration = "YOUR_MQTT_TOPIC/vibration";

WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_MPU6050 mpu;

// SW420 Variables
int vibrationState = 0;
int lastVibrationState = 0;
unsigned long lastVibrationTime = 0;
unsigned long vibrationCount = 0;
bool vibrationDetected = false;
unsigned long vibrationTimeout = 0;  // Timeout for vibration detection
const unsigned long VIBRATION_TIMEOUT_MS = 1500;  // 1.5 seconds timeout

// WiFi and MQTT status variables
bool wifiConnected = false;
bool mqttConnected = false;
unsigned long lastWifiCheck = 0;
unsigned long lastMqttAttempt = 0;
const unsigned long WIFI_CHECK_INTERVAL = 10000; // Check WiFi every 10 seconds
const unsigned long MQTT_RETRY_INTERVAL = 10000; // Retry MQTT every 10 seconds

// Function to calculate magnitude from peak-to-peak amplitude
float calculateRichterScale(float peakToPeak) {
  // Formula berdasarkan hubungan amplitudo dengan skala Richter
  // Richter = log10(amplitude) + distance correction
  // Untuk jarak dekat (local magnitude), kita gunakan formula sederhana
  if (peakToPeak <= 0) return 0;
  
  // Konversi dari m/s² ke mm/s² (1 m/s² = 1000 mm/s²)
  float amplitudeMM = peakToPeak * 1000;
  
  // Formula Richter scale: M = log10(A) + C
  // Dimana A adalah amplitudo dalam mm/s²
  // C adalah konstanta koreksi (biasanya antara 1.5-2.5)
  float richter = log10(amplitudeMM) + 2.0;
  
  // Batasi nilai Richter antara 0-10
  if (richter < 0) richter = 0;
  if (richter > 10) richter = 10;
  
  return richter;
}

// Function to detect peaks in accelerometer data
void detectPeaks(float accelMagnitude) {
  // Tambahkan nilai ke buffer
  accelBuffer[bufferIndex] = accelMagnitude;
  bufferIndex = (bufferIndex + 1) % PEAK_BUFFER_SIZE;
  if (bufferIndex == 0) bufferFull = true;
  
  // Cari peak dalam buffer
  if (bufferFull || bufferIndex > 10) {
    int startIdx = bufferFull ? 0 : 0;
    int endIdx = bufferFull ? PEAK_BUFFER_SIZE : bufferIndex;
    
    // Cari nilai maksimum dalam buffer
    float maxVal = accelBuffer[startIdx];
    float minVal = accelBuffer[startIdx];
    
    for (int i = startIdx + 1; i < endIdx; i++) {
      if (accelBuffer[i] > maxVal) maxVal = accelBuffer[i];
      if (accelBuffer[i] < minVal) minVal = accelBuffer[i];
    }
    
    // Hitung peak-to-peak saat ini
    float currentPeakToPeak = maxVal - minVal;
    
    // Update nilai peak-to-peak secara real-time jika signifikan
    if (currentPeakToPeak > PEAK_DETECTION_THRESHOLD) {
      // Jika ada osilasi signifikan
      if (currentPeakToPeak > maxPeakToPeak * 0.8) {
        // Peak baru yang lebih besar
        maxPeakToPeak = currentPeakToPeak;
        Serial.print("New peak detected! Peak-to-Peak: ");
        Serial.print(maxPeakToPeak);
        Serial.print(" m/s²");
      } else {
        // Update dengan nilai saat ini (bisa lebih kecil)
        maxPeakToPeak = currentPeakToPeak;
      }
      
      peakDetected = true;
      lastPeakTime = millis();
      
      // Mulai event gempa jika belum aktif
      if (!earthquakeEventActive) {
        earthquakeEventActive = true;
        earthquakeStartTime = millis();
        Serial.println("=== EARTHQUAKE EVENT STARTED ===");
      }
      
      // Update Richter scale berdasarkan nilai saat ini
      richterScale = calculateRichterScale(maxPeakToPeak);
      
      Serial.print(", Richter: ");
      Serial.println(richterScale);
    } else {
      // Jika osilasi sangat kecil, kurangi nilai peak-to-peak secara bertahap
      if (maxPeakToPeak > 0) {
        maxPeakToPeak *= 0.55; // Kurangi 5% setiap sampling
        if (maxPeakToPeak < PEAK_DETECTION_THRESHOLD) {
          maxPeakToPeak = 0; // Reset ke 0 jika sudah terlalu kecil
        }
        richterScale = calculateRichterScale(maxPeakToPeak);
      }
    }
  }
}

// Function to analyze earthquake based on peak-to-peak amplitude
void analyzeEarthquakePeakToPeak() {
  unsigned long currentTime = millis();
  
  // Cek timeout event gempa
  if (earthquakeEventActive && (currentTime - lastPeakTime) > EARTHQUAKE_TIMEOUT) {
    // Event gempa selesai
    earthquakeEventActive = false;
    earthquakeDetected = false;
    earthquakeLevel = 0;
    
    Serial.println("=== EARTHQUAKE EVENT ENDED ===");
    Serial.print("Final Richter Scale: ");
    Serial.println(richterScale);
    Serial.print("Maximum Peak-to-Peak: ");
    Serial.print(maxPeakToPeak);
    Serial.println(" m/s²");
    
    // Reset nilai
    maxPeakToPeak = 0;
    richterScale = 0;
  }
  
  // Tentukan level gempa berdasarkan Richter scale saat ini
  if (richterScale > 0) {
    earthquakeDetected = true;
    
    if (richterScale >= 6.2) {
      earthquakeLevel = 3;  // Strong (≥6.2)
    } else if (richterScale >= 5.9) {
      earthquakeLevel = 2;  // Moderate (≥5.9)
    } else if (richterScale >= 5) {
      earthquakeLevel = 1;  // Light (5-5.9)
    } else {
      earthquakeDetected = false;
      earthquakeLevel = 0;  // Minor (<3.0)
    }
    
    // Jika nilai sangat kecil, anggap tidak ada gempa
    if (richterScale < 3) {
      earthquakeDetected = false;
      earthquakeLevel = 0;
    }
  } else {
    earthquakeDetected = false;
    earthquakeLevel = 0;
  }
  
  // Update event status berdasarkan nilai saat ini
  if (richterScale < 1 && earthquakeEventActive) {
    earthquakeEventActive = false;
    Serial.println("=== EARTHQUAKE EVENT ENDED (Low activity) ===");
  }
}

// Fungsi untuk memainkan suara R2D2 pada buzzer
void playR2D2() {
  int melody[] = { 2000, 2500, 3000, 3500, 3000, 2500, 2000, 1500, 1800, 2200 };
  int noteDurations[] = { 100, 80, 60, 80, 100, 80, 60, 80, 100, 120 };
  int notes = sizeof(melody) / sizeof(melody[0]);
  for (int i = 0; i < notes; i++) {
    tone(BUZZER_1_PIN, melody[i]);
    tone(BUZZER_2_PIN, melody[i]);
    delay(noteDurations[i]);
    noTone(BUZZER_1_PIN);
    noTone(BUZZER_2_PIN);
    delay(20); // jeda antar nada
  }
}

// Function to control dual buzzer system with new patterns
void controlBuzzer() {
    static unsigned long lastStateChangeTime = 0;
    static bool buzzerOn = false;
    static int lastEarthquakeLevel = 0;
    unsigned long currentTime = millis();

    // Jika tidak ada gempa atau tidak ada getaran, matikan buzzer
    if (!(earthquakeLevel > 0 && vibrationDetected)) {
        noTone(BUZZER_1_PIN);
        noTone(BUZZER_2_PIN);        
        buzzerOn = false;
        lastEarthquakeLevel = 0;
        return;
    }

    switch (earthquakeLevel) {
        case 3: // Strong: bunyi cepat, 2.5kHz
            if (buzzerOn) {
                if (currentTime - lastStateChangeTime >= 800) {
                    noTone(BUZZER_1_PIN);
                    noTone(BUZZER_2_PIN);
                    buzzerOn = false;
                    lastStateChangeTime = currentTime;
                }
            } else {
                if (currentTime - lastStateChangeTime >= 100) {
                    tone(BUZZER_1_PIN, 2250);
                    tone(BUZZER_2_PIN, 2250);
                    buzzerOn = true;
                    delay(10);
                    lastStateChangeTime = currentTime;
                }
            } 
            break;
        case 2: // Moderate: bunyi bareng 2.2kHz, 300ms ON 200ms OFF
            if (buzzerOn) {
                if (currentTime - lastStateChangeTime >= 300) {
                    noTone(BUZZER_1_PIN);
                    noTone(BUZZER_2_PIN);
                    buzzerOn = false;
                    lastStateChangeTime = currentTime;
                }
            } else {
                if (currentTime - lastStateChangeTime >= 200) {
                    tone(BUZZER_1_PIN, 2200);
                    tone(BUZZER_2_PIN, 2200);
                    buzzerOn = true;
                    delay(10);
                    lastStateChangeTime = currentTime;
                }
            }
            break;
        case 1: // Light: bunyi bareng 2kHz, 200ms ON 800ms OFF
            if (buzzerOn) {
                if (currentTime - lastStateChangeTime >= 300) {
                    noTone(BUZZER_1_PIN);
                    noTone(BUZZER_2_PIN);
                    buzzerOn = false;
                    lastStateChangeTime = currentTime;
                }
            } else {
                if (currentTime - lastStateChangeTime >= 800) {
                    tone(BUZZER_1_PIN, 2000);
                    tone(BUZZER_2_PIN, 2000);
                    buzzerOn = true;
                    delay(10);
                    lastStateChangeTime = currentTime;
                }
            }
            break;
    }
}

void WiFiEvent(WiFiEvent_t event){
  switch (event){
    case WIFI_EVENT_STA_DISCONNECTED:
      Serial.println("WiFi disconnected, attempting to reconnect...");
      wifiConnected = false;
      mqttConnected = false;
      WiFi.reconnect();
      break;
    case WIFI_EVENT_STA_CONNECTED:
      Serial.println("WiFi connected to AP");
      break;
    case IP_EVENT_STA_GOT_IP:
      Serial.print("WiFi connected! IP address: ");
      Serial.println(WiFi.localIP());
      Serial.print("WiFi RSSI: ");
      Serial.println(WiFi.RSSI());
      wifiConnected = true;
      break;
    default:
      break;
  }
}

void setup_wifi() {
  Serial.println("Setting up WiFi...");
  WiFi.onEvent(WiFiEvent);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  // Wait for initial connection
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength (RSSI): ");
    Serial.println(WiFi.RSSI());
    wifiConnected = true;
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    wifiConnected = false;
  }
}

void reconnect() {
  // Check if WiFi is connected first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot connect to MQTT");
    wifiConnected = false;
    mqttConnected = false;
    return;
  }
  
  if (!client.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(mqtt_server);
    Serial.print(":");
    Serial.println(mqtt_port);
    
    // Generate unique client ID with timestamp
    String clientId = String(mqtt_client_id) + "-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("MQTT connected successfully!");
      mqttConnected = true;
    } else {
      Serial.print("MQTT connection failed, rc=");
      Serial.print(client.state());
      Serial.print(" - ");
      
      // Provide more detailed error information
      switch (client.state()) {
        case -4:
          Serial.println("MQTT_CONNECTION_TIMEOUT");
          break;
        case -3:
          Serial.println("MQTT_CONNECTION_LOST");
          break;
        case -2:
          Serial.println("MQTT_CONNECT_FAILED");
          break;
        case -1:
          Serial.println("MQTT_DISCONNECTED");
          break;
        case 1:
          Serial.println("MQTT_CONNECT_BAD_PROTOCOL");
          break;
        case 2:
          Serial.println("MQTT_CONNECT_BAD_CLIENT_ID");
          break;
        case 3:
          Serial.println("MQTT_CONNECT_UNAVAILABLE");
          break;
        case 4:
          Serial.println("MQTT_CONNECT_BAD_CREDENTIALS");
          break;
        case 5:
          Serial.println("MQTT_CONNECT_UNAUTHORIZED");
          break;
        default:
          Serial.println("Unknown error");
      }
      mqttConnected = false;
    }
  }
}

void setup() {
  Serial.begin(115200);
  // Initialize random seed for unique client IDs
  randomSeed(analogRead(0) + millis());

  Serial.println("Initializing I2C...");
  Wire.begin();
  
  // Scan I2C first
  byte error, address;
  Serial.println("Scanning I2C bus...");
  for(address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.println(address, HEX);
    }
  }

  // Try to initialize MPU6050
  Serial.println("Looking for MPU6050...");
  
  // Manual reset of MPU6050
  Wire.beginTransmission(0x68);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0x00);  // set to zero (wakes up the MPU-6050)
  Wire.endTransmission(true);
  delay(100);

  // Read WHO_AM_I register
  Wire.beginTransmission(0x68);
  Wire.write(0x75);  // WHO_AM_I register
  Wire.endTransmission(false);
  Wire.requestFrom(0x68, 1);
  
  if(Wire.available()){
    byte whoAmI = Wire.read();
    Serial.print("WHO_AM_I register value: 0x");
    Serial.println(whoAmI, HEX);
  }

  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  
  // Set highest sensitivity and fast response filter
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_184_HZ);

  Serial.println("MPU6050 Found!");

  // Initialize SW420 sensor
  pinMode(SW420_PIN, INPUT_PULLUP);
  Serial.println("SW420 sensor initialized on GPIO 19");

  // Initialize buzzer pins
  pinMode(BUZZER_1_PIN, OUTPUT);
  pinMode(BUZZER_2_PIN, OUTPUT);
  Serial.println("Dual buzzer system initialized on G12 and G14");

  // Wifi Manager
  WiFiManager wm;
  wm.setConnectTimeout(15); // Timeout (detik)
  WiFi.onEvent(WiFiEvent); // (opsional, untuk monitoring event)
  if (!wm.autoConnect("WONDER_Wifi", "wonderwonder")){
    playR2D2(); // Mainkan suara R2D2 sebelum masuk mode AP WiFi Manager
    playR2D2();
    playR2D2();
    ESP.restart();
  }

  // setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024); // Increase buffer size for larger JSON payload

  // indikasi start
  playR2D2();
}

void handleWiFi() {
  unsigned long currentTime = millis();
  if (currentTime - lastWifiCheck >= WIFI_CHECK_INTERVAL) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi connection lost, attempting to reconnect...");
      wifiConnected = false;
      mqttConnected = false;
      WiFi.reconnect();
    } else if (!wifiConnected) {
      Serial.println("WiFi reconnected!");
      wifiConnected = true;
    }
    lastWifiCheck = currentTime;
  }
}

void handleMQTT() {
  unsigned long currentTime = millis();
  if (wifiConnected) {
    if (!client.connected()) {
      if (currentTime - lastMqttAttempt >= MQTT_RETRY_INTERVAL) {
        reconnect();
        lastMqttAttempt = currentTime;
      }
    } else {
      client.loop();
      mqttConnected = true;
    }
  }
}


void readSensors() {
  // Get SW1801P voltage (ESP32 ADC 12-bit: 0-4095)
  int sw1801pRaw = analogRead(SW1801P_PIN);
  float vibrationVoltage = (sw1801pRaw * 3.3) / 4095.0;
  vibrationVoltage = vibrationVoltage * 1000;
  Serial.print("SW1801P Raw: ");
  Serial.print(sw1801pRaw);
  Serial.print(" | Voltage: ");
  Serial.print(vibrationVoltage);
  Serial.println(" mV");

  // Read SW420 vibration sensor
  vibrationState = digitalRead(SW420_PIN);
  if (vibrationState == LOW && vibrationVoltage <= 3300 && lastVibrationState == HIGH) {
    vibrationDetected = true;
    vibrationCount++;
    lastVibrationTime = millis();
    Serial.print("Vibration detected! Count: ");
    Serial.println(vibrationCount);
  } else if (vibrationState == HIGH && lastVibrationState == LOW) {
    unsigned long vibrationDuration = millis() - lastVibrationTime;
    Serial.print("Vibration stopped. Duration: ");
    Serial.print(vibrationDuration);
    Serial.println(" ms");
  }
  if (vibrationState == HIGH && vibrationDetected) {
    unsigned long timeSinceLastVibration = millis() - lastVibrationTime;
    if (timeSinceLastVibration > VIBRATION_TIMEOUT_MS) {
      vibrationDetected = false;
      Serial.println("Vibration timeout - sensor stable, stopping detection");
    }
  }
  lastVibrationState = vibrationState;

  // Get MPU6050 data
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float accelMagnitude = sqrt(a.acceleration.x * a.acceleration.x + 
                             a.acceleration.y * a.acceleration.y + 
                             (a.acceleration.z - 9.8) * (a.acceleration.z - 9.8));
  detectPeaks(accelMagnitude);
  analyzeEarthquakePeakToPeak();
  controlBuzzer();
}

void publishData() {
  // Create JSON string for IMU data with peak-to-peak and Richter scale info
  String imuData = "{";
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float accelMagnitude = sqrt(a.acceleration.x * a.acceleration.x + 
                             a.acceleration.y * a.acceleration.y + 
                             (a.acceleration.z - 9.8) * (a.acceleration.z - 9.8));
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
  imuData += "\"earthquakeEventActive\":" + String(earthquakeEventActive ? "true" : "false") + ",";
  imuData += "\"earthquakeLevel\":" + String(earthquakeLevel) + ",";
  imuData += "\"wifiConnected\":" + String(wifiConnected ? "true" : "false") + ",";
  imuData += "\"mqttConnected\":" + String(mqttConnected ? "true" : "false") + ",";
  imuData += "\"wifiRSSI\":" + String(WiFi.RSSI());
  imuData += "}";

  String vibrationData = "{";
  vibrationData += "\"sw420\":" + String(vibrationState) + ",";
  vibrationData += "\"vibrationDetected\":" + String(vibrationDetected ? "true" : "false") + ",";
  vibrationData += "\"vibrationCount\":" + String(vibrationCount) + ",";
  vibrationData += "\"sw1801p_voltage\":" + String((analogRead(SW1801P_PIN) * 3.3) / 4095.0 * 1000) + ",";
  vibrationData += "\"earthquakeDetected\":" + String(earthquakeDetected ? "true" : "false");
  vibrationData += "}";

  if (client.connected()) {
    client.publish(topic_imu, imuData.c_str());
    client.publish(topic_vibration, vibrationData.c_str());
    Serial.print(" | IMU: ");
    Serial.println(imuData);
    Serial.print(" | SW: ");
    Serial.println(vibrationData);
  } else {
    Serial.println(" | MQTT not connected, skipping publish");
    mqttConnected = false;
  }
}

void debugStatus() {
  static unsigned long lastDebugTime = 0;
  unsigned long currentTime = millis();
  if (currentTime - lastDebugTime >= 5000) {
    Serial.println("=== System Status ===");
    Serial.print("WiFi Status: ");
    Serial.print(wifiConnected ? "Connected" : "Disconnected");
    Serial.print(" | RSSI: ");
    Serial.println(WiFi.RSSI());
    Serial.print("MQTT Status: ");
    Serial.println(mqttConnected ? "Connected" : "Disconnected");
    Serial.print("SW420 - State: ");
    Serial.print(vibrationState);
    Serial.print(" | Detected: ");
    Serial.print(vibrationDetected ? "YES" : "NO");
    Serial.print(" | Count: ");
    Serial.print(vibrationCount);
    Serial.print(" | Time since last vibration: ");
    Serial.print(millis() - lastVibrationTime);
    Serial.println(" ms");
    Serial.print("Earthquake - Peak-to-Peak: ");
    Serial.print(maxPeakToPeak);
    Serial.print(" m/s² | Richter: ");
    Serial.print(richterScale);
    Serial.print(" | Level: ");
    Serial.print(earthquakeLevel);
    Serial.print(" | Event Active: ");
    Serial.println(earthquakeEventActive ? "YES" : "NO");
    lastDebugTime = currentTime;
  }
}

// Perbaiki decay peak-to-peak dan richterScale agar selalu turun
void decayPeakToPeak() {
  if (!earthquakeEventActive && maxPeakToPeak > 0) {
    maxPeakToPeak *= 0.5; // decay 50% per loop
    if (maxPeakToPeak < PEAK_DETECTION_THRESHOLD) {
      maxPeakToPeak = 0;
    }
    richterScale = calculateRichterScale(maxPeakToPeak);
  }
}

void loop() {
  handleWiFi();
  handleMQTT();
  readSensors();
  decayPeakToPeak();
  publishData();
  debugStatus();
}