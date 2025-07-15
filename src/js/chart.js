// Inisialisasi Chart.js
const accelCtx = document.getElementById('accelChart')?.getContext('2d');
const gyroCtx = document.getElementById('gyroChart')?.getContext('2d');

const accelChart = accelCtx ? new Chart(accelCtx, {
  type: 'line',
  data: {
    labels: Array(20).fill(''),
    datasets: [
      { label: 'X', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.3 },
      { label: 'Y', data: [], borderColor: '#f6a823', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3 },
      { label: 'Z', data: [], borderColor: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.1)', tension: 0.3 }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false, title: { display: true, text: 'Acceleration (m/s²)' } }
    },
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' }
  }
}) : null;

const gyroChart = gyroCtx ? new Chart(gyroCtx, {
  type: 'line',
  data: {
    labels: Array(20).fill(''),
    datasets: [
      { label: 'X', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.3 },
      { label: 'Y', data: [], borderColor: '#f6a823', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3 },
      { label: 'Z', data: [], borderColor: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.1)', tension: 0.3 }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false, title: { display: true, text: 'Rotation (°/s)' } }
    },
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' }
  }
}) : null;

window.charts = { accelChart, gyroChart }; 