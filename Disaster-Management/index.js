// ✅ Replace with your OpenWeatherMap API Key
const API_KEY = "c28b491be96770198cffa360a06cc923";
const ctx = document.getElementById("forecastChart").getContext("2d");
let chart;

// Fetch Current Weather and Forecast
async function getWeather(city) {
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!currentRes.ok || !forecastRes.ok) throw new Error("City not found.");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    return { current: currentData, forecast: forecastData };
  } catch (error) {
    alert("⚠️ Error: " + error.message);
  }
}

// Update Current Weather Details
function updateWeather(current) {
  document.getElementById("temperature").textContent = current.main.temp;
  document.getElementById("humidity").textContent = current.main.humidity;
  document.getElementById("wind-speed").textContent = current.wind.speed;
  document.getElementById("risk-level").textContent =
    current.main.temp > 35 ? "⚠️ High Risk" : "✅ Low Risk";
}

// Process 5-Day Forecast Data
function processForecast(forecast) {
  const dates = [];
  const tempData = [];
  const humidityData = [];
  const windSpeedData = [];

  // Loop through every 8th forecast (one per day)
  for (let i = 0; i < forecast.list.length; i += 8) {
    const item = forecast.list[i];
    dates.push(new Date(item.dt_txt).toLocaleDateString());
    tempData.push(item.main.temp);
    humidityData.push(item.main.humidity);
    windSpeedData.push(item.wind.speed);
  }

  return { dates, tempData, humidityData, windSpeedData };
}

// Create or Update Chart
function createChart(data) {
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [
        {
          label: "🌡️ Temperature (°C)",
          data: data.tempData,
          borderColor: "#3b82f6",
          borderWidth: 2,
          hidden: !document.getElementById("temp-toggle").checked, // ✅ FIX: Check checkbox state
        },
        {
          label: "💧 Humidity (%)",
          data: data.humidityData,
          borderColor: "#10b981",
          borderWidth: 2,
          hidden: !document.getElementById("hum-toggle").checked, // ✅ FIX: Check checkbox state
        },
        {
          label: "🌬️ Wind Speed (km/h)",
          data: data.windSpeedData,
          borderColor: "#facc15",
          borderWidth: 2,
          hidden: !document.getElementById("wind-toggle").checked, // ✅ FIX: Check checkbox state
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Event Listener for "Get Prediction"
document.getElementById("getPrediction").addEventListener("click", async () => {
  const city = document.getElementById("location").value;
  if (!city) return alert("Please enter a city.");

  const data = await getWeather(city);
  if (data) {
    updateWeather(data.current);
    const forecastData = processForecast(data.forecast);
    createChart(forecastData);
  }
});

// ✅ Toggle Visibility of Chart Lines (Fixed)
document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (chart) {
      chart.data.datasets.forEach((dataset) => {
        if (dataset.label.includes("Temperature")) {
          dataset.hidden = !document.getElementById("temp-toggle").checked;
        } else if (dataset.label.includes("Humidity")) {
          dataset.hidden = !document.getElementById("hum-toggle").checked;
        } else if (dataset.label.includes("Wind Speed")) {
          dataset.hidden = !document.getElementById("wind-toggle").checked;
        }
      });
      chart.update();
    }
  });
});

// SOS Button Event
document.getElementById("sos-btn").addEventListener("click", () => {
  alert("🚨 SOS Alert Sent!");
});
