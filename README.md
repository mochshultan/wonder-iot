<div align="center">

# 🌍 WONDER v.2.1
## Wireless Observation for Natural Detection Earthquake Response

> **IoT-based earthquake monitoring system with real-time detection, analysis, and alerting capabilities**

[![ESP32](https://img.shields.io/badge/ESP32-Development%20Board-blue?style=for-the-badge&logo=arduino)](https://www.espressif.com/en/products/socs/esp32)
[![MQTT](https://img.shields.io/badge/MQTT-Protocol-green?style=for-the-badge&logo=mqtt)](https://mqtt.org/)
[![Web Dashboard](https://img.shields.io/badge/Web-Dashboard-orange?style=for-the-badge&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Android App](https://img.shields.io/badge/Android-App-brightgreen?style=for-the-badge&logo=android)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)]()

[🚀 Quick Start](#-quick-start-web-dashboard) • [📋 Features](#-uiux--dashboard-features-v21) • [🛠️ Installation](#️-installation) • [📊 Architecture](#-system-architecture) • [🔬 Technical Details](#-technical-specifications)

---

</div>

## 📖 About Project

**WONDER** is an advanced IoT-based earthquake monitoring system that provides real-time detection, analysis, and alerting capabilities. The system combines multiple sensor technologies to deliver accurate earthquake intensity measurements and comprehensive monitoring through web and mobile interfaces.

### 🖼️ Prototype Reference
![WONDER 2.1 Prototype](src/images/proto.jpg)
*Physical prototype showing ESP32 board with connected sensors and buzzer system*

### 🗺️ Schematic Diagram
![WONDER 2.1 Schematic](/src/images/schematic/Schematic_iot_esp32_gempa.png)
*Complete wiring diagram showing all component connections and pin assignments*

### 🎯 Objectives
- Provide accurate earthquake detection using peak-to-peak amplitude analysis
- Calculate Richter scale in real-time based on sensor data
- Deliver multi-level alerting system with dual buzzer warnings
- Offer comprehensive monitoring through web dashboard and mobile app
- Demonstrate IoT implementation for natural disaster monitoring

---

## 🌟 Key Features

### 🔍 **Real-time Detection**
- ✨ Peak-to-peak amplitude analysis with 100-sample buffer
- 📊 Richter scale calculation using logarithmic formula
- 🔄 Multi-sensor validation (SW420 + SW1801P)
- 🎯 Event classification system (4 levels)
- ⚡ Real-time data processing and analysis

### 🤖 **Advanced Analytics**
- 🌐 3D IMU visualization with interactive cube model
- 📈 Real-time data streaming via MQTT
- 📝 Comprehensive event logging and history
- 📊 Performance metrics and system monitoring
- 🔄 Auto-reconnect WiFi and MQTT capabilities

### 🚨 **Alert System**
- 🔊 Dual buzzer warning system with frequency control
- 🎛️ Multi-level earthquake classification
- 📱 Real-time notifications across platforms
- 🎨 Audio-visual indicators with color coding
- ⚡ Vibration-integrated alert activation

### 📱 **Multi-Platform Access**
- 🌐 Web dashboard interface with modern UI
- 📱 Android mobile application (APK/AAB)
- ☁️ MQTT cloud connectivity
- 🔄 Cross-platform compatibility
- 📊 Data export and logging capabilities

---

## 🛠️ Technology Stack

### 🔧 **Hardware Components**
| Component | Specification | Details |
|-----------|---------------|---------|
| ![ESP32](https://img.shields.io/badge/ESP32-Development%20Board-blue?style=flat&logo=arduino) | ESP32 Dev Module | Dual-core 32-bit LX6, 240MHz, WiFi/Bluetooth |
| ![MPU6050](https://img.shields.io/badge/MPU6050-IMU%20Sensor-green?style=flat) | MPU6050 IMU | 3-axis accelerometer (±2g), gyroscope (±250°/s) |
| ![SW420](https://img.shields.io/badge/SW420-Vibration%20Sensor-orange?style=flat) | SW420 Digital | Digital vibration sensor, GPIO 19 |
| ![SW1801P](https://img.shields.io/badge/SW1801P-Analog%20Sensor-purple?style=flat) | SW1801P Analog | Analog vibration sensor, ADC GPIO 34 |
| ![Buzzer](https://img.shields.io/badge/Dual%20Buzzer-Alert%20System-red?style=flat) | Dual Buzzer | GPIO 12 & 14, 2.0-2.5kHz frequency range |

### 💻 **Software Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| ![Arduino](https://img.shields.io/badge/Arduino-IDE-blue?style=flat&logo=arduino) | 2.0+ | ESP32 firmware development |
| ![WiFiManager](https://img.shields.io/badge/WiFiManager-Library-green?style=flat) | Latest | WiFi configuration management |
| ![PubSubClient](https://img.shields.io/badge/PubSubClient-MQTT-orange?style=flat) | Latest | MQTT communication |
| ![Adafruit MPU6050](https://img.shields.io/badge/Adafruit%20MPU6050-Sensor%20Library-purple?style=flat) | Latest | IMU sensor interface |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | 5.0 | Web dashboard structure |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | 3.0+ | CSS framework |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | ES6+ | Dashboard interactivity |
| ![MQTT.js](https://img.shields.io/badge/MQTT.js-Client%20Library-green?style=flat) | 4.3.7 | Web MQTT communication |

### 🛠️ **Development Tools**
| Tool | Purpose |
|------|---------|
| ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) | Version control |
| ![WebIntoApp](https://img.shields.io/badge/WebIntoApp-Android%20Builder-blue?style=flat) | Android app generation |
| ![MQTT Broker](https://img.shields.io/badge/EMQX-Broker-green?style=flat) | Cloud MQTT broker |

---

## 🌟 UI/UX & Dashboard Features (v2.1)

### 🎨 **Visual Design & Animations**

#### 🌈 **Animated Background System**
- **Dynamic Gradient Animation**: Multi-layered CSS gradients with smooth color transitions
- **Shimmer Effect**: Subtle light reflection animation across the interface
- **Noise Texture Overlay**: Custom noise.png texture for organic, tactile feel
- **Responsive Animation**: Background adapts to screen size and device orientation
- **Performance Optimized**: Hardware-accelerated CSS animations for smooth 60fps

#### 🪟 **Glassmorphism & Neumorphic Design**
- **Glassmorphism (Mica)**: Translucent glass-like panels with backdrop blur effects
- **Neumorphic Elements**: Soft, extruded UI components with realistic shadows
- **Inset Effects**: Pressed-in appearance for data panels and control elements
- **Layered Depth**: Multiple z-index layers creating 3D visual hierarchy

#### 🌙 **Dark Mode System**
- **LocalStorage Persistence**: User preference saved across browser sessions
- **Smooth Transitions**: Animated color changes between light/dark themes
- **Dynamic Color Adaptation**: All UI elements automatically adapt to theme changes
- **Accessibility Compliant**: High contrast ratios for better readability

### 📱 **Interactive Features**

#### 🎛️ **Navigation & Layout**
- **Modular Tab System**: Dashboard, Vibration, 3D IMU, Graphs with smooth transitions
- **Responsive Grid Layout**: Adaptive design for desktop, tablet, and mobile devices
- **Touch-Friendly Interface**: Optimized for both mouse and touch interactions

#### 🎯 **Data Visualization**
- **3D IMU Cube**: Interactive 3D visualization with real-time rotation and scaling
- **Seven-Segment Font**: Retro-style digital display for primary data values
- **Real-time Charts**: Dynamic graph updates with smooth animations
- **Status Indicators**: Color-coded connection and sensor status displays

#### 🔄 **Real-time Updates**
- **MQTT Status Monitoring**: Live connection status with visual indicators
- **Data Streaming**: Smooth real-time data updates without page refresh
- **Event Logging**: Chronological data log with timestamp and event classification
- **Performance Metrics**: System health monitoring with visual feedback

---

## 🚀 Quick Start (Web Dashboard)

### 1️⃣ Jalankan server lokal (wajib, agar resource termuat dengan benar)
```bash
# Python
python -m http.server 8000
# atau Node.js
npx http-server -p 8000
```
Akses di: http://localhost:8000/login.html

### 2️⃣ Login MQTT
- Buka `login.html` (bukan langsung index.html!)
- Masukkan **topik MQTT apapun** sesuai kebutuhan Anda (IMU wajib, vibration opsional)
- Topik sepenuhnya custom, tidak ada batasan format atau hardcoded
- Setelah login, akan otomatis redirect ke dashboard (`index.html`)

### 3️⃣ Pastikan resource lokal tersedia
- Semua gambar, noise, dsb, ada di folder `src/images/`
- CSS & JS modular ada di `src/`

### 4️⃣ MQTT
- Gunakan broker public (misal: broker.emqx.io:1883) atau private
- Masukkan **topik MQTT custom** di halaman login (bisa topik IMU dan/atau vibration sesuai device Anda)

---

## 🎮 How to Use

### 📝 **Monitoring Steps**

1. **🔧 Hardware Setup**
   - Connect all sensors according to pin diagram
   - Power ESP32 with stable 3.3V supply
   - Place device on stable surface

2. **🌐 Akses Dashboard**
   - Buka `login.html` di browser (bukan langsung index.html)
   - Login dengan **topik MQTT custom** (bisa topik IMU dan/atau vibration apapun)
   - Setelah login, akan otomatis masuk ke dashboard (`index.html`)
   - Tunggu koneksi MQTT, lalu monitor data real-time

3. **📊 View Data**
   - **Richter Scale**: Real-time earthquake intensity
   - **Peak-to-Peak**: Amplitude measurements
   - **3D Visualization**: IMU orientation display
   - **Sensor Status**: Vibration detection indicators

4. **🚨 Alert System**
   - **Level 0** (< 5.0): No alert
   - **Level 1** (5.0-5.9): Light alert (2.0kHz, 200ms ON 800ms OFF)
   - **Level 2** (5.9-6.2): Moderate alert (2.2kHz, 200ms ON 300ms OFF)
   - **Level 3** (≥ 6.2): Strong alert (2.5kHz, continuous)

### ⚠️ **Important Notes**
- Ensure stable power supply for accurate readings
- Calibrate sensors on stable surface before use
- Results are for monitoring purposes, not official seismic data
- Consult professional seismic monitoring services for official data
- Regular sensor calibration and maintenance required

---

## 🏗️ System Architecture

![WONDER 2.1 System Architecture](src/images/system-architecture.svg)

*System architecture showing ESP32 board, sensors, data processing, and output platforms*

---

## 📊 Technical Specifications

### 🔧 **ESP32 Configuration**
| Parameter | Value | Description |
|-----------|-------|-------------|
| **CPU** | Dual-core 32-bit LX6 | 240 MHz max frequency |
| **Memory** | 520 KB SRAM | 4 MB Flash storage |
| **ADC Resolution** | 12-bit | 0-4095 range |
| **I2C Frequency** | Default | Standard I2C speed |
| **WiFi** | 802.11 b/g/n | Auto-reconnect enabled |
| **MQTT Buffer** | 1024 bytes | Message buffer size |

### 📡 **Sensor Specifications**
| Sensor | Type | Range | Resolution | Sample Rate |
|--------|------|-------|------------|-------------|
| **MPU6050 Accel** | 3-axis | ±2g | 16-bit | 184 Hz |
| **MPU6050 Gyro** | 3-axis | ±250°/s | 16-bit | 184 Hz |
| **SW420** | Digital | HIGH/LOW | 1-bit | Real-time |
| **SW1801P** | Analog | 0-3.3V | 12-bit | Real-time |

### 🌐 **Network Configuration**
| Parameter | Value | Description |
|-----------|-------|-------------|
| **MQTT Broker** | broker.emqx.io | Public EMQX broker |
| **Port** | 1883 | Standard MQTT port |
| **Client ID** | esp32-client | Unique identifier |
| **Topics** | Custom (user-defined) | MQTT topic(s) for IMU and vibration data |
| **QoS** | 0 | At most once delivery |

### 📱 **App Specifications**
| Platform | Version | Size | Package |
|----------|---------|------|---------|
| **Android APK** | 2.1 | 939KB | com.bangtanniot.wonder |
| **Android AAB** | 2.1 | 1.0MB | com.bangtanniot.wonder |
| **Web Dashboard** | 1.0 | 32KB | HTML5 application |

---

## 📈 Data Flow

### 🔄 **Real-time Data Pipeline**

![Real-time Data Flow](src/images/data-flow.svg)

*Real-time data flow showing sensor readings, processing pipeline, and output distribution*

### 📊 **Data Structure**

#### 🔍 **IMU Data Topic** (`YOUR_MQTT_TOPICS/data`)
```json
{
  "accelX": 0.12,
  "accelY": -0.05,
  "accelZ": 9.85,
  "gyroX": 0.01,
  "gyroY": 0.02,
  "gyroZ": -0.01,
  "temp": 25.6,
  "accelMagnitude": 9.85,
  "maxPeakToPeak": 0.0,
  "richterScale": 0.0,
  "earthquakeEventActive": false,
  "earthquakeLevel": 0,
  "wifiConnected": true,
  "mqttConnected": true,
  "wifiRSSI": -45
}
```

#### 🔔 **Vibration Data Topic** (`YOUR_MQTT_TOPICS/vibration`)
```json
{
  "sw420": 1,
  "vibrationDetected": false,
  "vibrationCount": 0,
  "sw1801p_voltage": 3.2,
  "earthquakeDetected": false
}
```

---

## 🔍 API Documentation

### 📡 **MQTT Topics**
| Topic | Type | Description | Payload |
|-------|------|-------------|---------|
| `YOUR_MQTT_TOPICS/data` | Publish | IMU sensor data | JSON object |
| `YOUR_MQTT_TOPICS/vibration` | Publish | Vibration sensor data | JSON object |

### 🔧 **Configuration Parameters**

#### 📊 **Detection Parameters**
```cpp
// Peak Detection
const int PEAK_BUFFER_SIZE = 100;           // Circular buffer size
const float PEAK_DETECTION_THRESHOLD = 5;   // m/s² minimum threshold
const unsigned long EARTHQUAKE_TIMEOUT = 500; // Event timeout (ms)

// Vibration Detection
const unsigned long VIBRATION_TIMEOUT_MS = 1500; // Vibration timeout (ms)
const int SW1801P_THRESHOLD = 3300;        // mV threshold for SW1801P
```

#### 🌐 **Network Parameters**
```cpp
// WiFi Configuration
const char* ssid = "FTMM@AIRLANGGA-HOTSPOT";
const char* password = "@irlangg@";

// MQTT Configuration
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_client_id = "esp32-client";
```

#### 🔔 **Alert Parameters**
```cpp
// Buzzer Frequencies
const int BUZZER_LIGHT_FREQ = 2000;    // 2.0kHz for light earthquake
const int BUZZER_MODERATE_FREQ = 2200; // 2.2kHz for moderate earthquake
const int BUZZER_STRONG_FREQ = 2500;   // 2.5kHz for strong earthquake

// Timing Patterns
const int BUZZER_ON_TIME = 200;        // 200ms ON time
const int BUZZER_LIGHT_OFF = 800;      // 800ms OFF for light
const int BUZZER_MODERATE_OFF = 300;   // 300ms OFF for moderate
```

### 📊 **Data Processing Functions**

#### **calculateRichterScale(float peakToPeak)**
```cpp
float calculateRichterScale(float peakToPeak) {
  if (peakToPeak <= 0) return 0;
  
  // Convert m/s² to mm/s²
  float amplitudeMM = peakToPeak * 1000;
  
  // Richter scale formula: M = log10(A) + C
  float richter = log10(amplitudeMM) + 2.0;
  
  // Limit to 0-10 range
  if (richter < 0) richter = 0;
  if (richter > 10) richter = 10;
  
  return richter;
}
```

#### **detectPeaks(float accelMagnitude)**
```cpp
void detectPeaks(float accelMagnitude) {
  // Add to circular buffer
  accelBuffer[bufferIndex] = accelMagnitude;
  bufferIndex = (bufferIndex + 1) % PEAK_BUFFER_SIZE;
  
  // Calculate peak-to-peak from buffer
  float currentPeakToPeak = maxVal - minVal;
  
  // Update if significant oscillation detected
  if (currentPeakToPeak > PEAK_DETECTION_THRESHOLD) {
    maxPeakToPeak = currentPeakToPeak;
    peakDetected = true;
    // Start earthquake event if not active
  }
}
```

---

## 📂 Project Structure

```
WONDER-2.1/
├── android/                    # Android application files
├── src/
│   ├── css/style.css           # Modular CSS (Tailwind + custom)
│   ├── js/                     # Modular JS (main.js, mqtt.js, ui.js, chart.js, login.js)
│   └── images/                 # Project diagrams, noise, and images
│       └─ schematic/           # Hardware schematics and wiring
├── index.html                  # Web dashboard utama (redirect dari login)
├── login.html                  # Halaman login MQTT (wajib akses pertama)
├── LICENSE
├── README.md
└── ...
```

---

## 📝 Important Notes

### ⚠️ **Warnings**
- Ensure all dependencies are properly installed
- This system uses pre-trained algorithms for earthquake detection
- **Results are for monitoring purposes, not official seismic data**
- Consult professional seismic monitoring services for official data
- Regular sensor calibration and maintenance required

### 📋 **Technical Information**
- Firmware runs on ESP32 with real-time processing
- Web dashboard requires modern browser with JavaScript enabled
- MQTT broker is public service, consider private broker for production
- Android app generated using WebIntoApp.com platform
- All data is transmitted in JSON format

### 🔧 **Future Development**
- Integration with official seismic monitoring networks
- Machine learning algorithms for improved accuracy
- Cloud storage for historical data analysis
- Mobile app with native Android features
- Multi-device network for wider coverage

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Key Points:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability assumed

---

## 🧑‍💻 Developer

<div align="center">

### **Moch. Shultan Ali Saifuddin**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mochshultan)

**Developed with ❤️ for Internet of Things course project**

---

### 🌟 **Star History**

[![Star History Chart](https://api.star-history.com/svg?repos=mochshultan/wonder-iot&type=Date)](https://star-history.com/#mochshultan/wonder-iot&Date)

---

<div align="center">

**If this project helps you, give it a ⭐ star!**

[![GitHub stars](https://img.shields.io/github/stars/mochshultan/wonder-iot?style=social)](https://github.com/mochshultan/wonder-iot)
[![GitHub forks](https://img.shields.io/github/forks/mochshultan/wonder-iot?style=social)](https://github.com/mochshultan/wonder-iot)
[![GitHub issues](https://img.shields.io/github/issues/mochshultan/wonder-iot)](https://github.com/mochshultan/wonder-iot/issues)

</div>
