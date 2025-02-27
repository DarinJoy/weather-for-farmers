const apiKey = "Replace with your WeatherAPI key"; // Replace with your WeatherAPI key

// Detect User Location on Page Load
window.onload = function () {
  detectLocation();
};

// Detect User Location
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(`${lat},${lon}`);
      },
      () => {
        alert("Location access denied. Using default location (Pune).");
        fetchWeather("Pune");
      }
    );
  } else {
    alert("Geolocation not supported. Using default location (Pune).");
    fetchWeather("Pune");
  }
}

// Fetch weather data based on user input
function getWeather() {
  const location = document.getElementById("locationInput").value || "Pune";
  fetchWeather(location);
}

// Fetch weather from API
async function fetchWeather(location) {
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7&alerts=yes`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.location) {
      document.getElementById("weather").innerHTML =
        "<p>Location not found.</p>";
      return;
    }

    // Show Weather Alerts
    if (data.alerts && data.alerts.alert.length > 0) {
      document.getElementById(
        "alerts"
      ).innerHTML = `<h3>⚠️ Alert: ${data.alerts.alert[0].headline}</h3><p>${data.alerts.alert[0].msg}</p>`;
    } else {
      document.getElementById("alerts").innerHTML = "";
    }

    // Display Weather Cards
    const forecast = data.forecast.forecastday;
    let output = `<h2>Weather for ${data.location.name}</h2><div id="forecast-container">`;

    forecast.forEach((day) => {
      let condition = day.day.condition.text.toLowerCase();
      let recommendedCrops = getCropRecommendation(condition);

      output += `
                <div class="weather-card">
                    <h3>${day.date}</h3>
                    <p>☁️ ${day.day.condition.text}</p>
                    <p>🌡️ ${day.day.maxtemp_c}°C / ${day.day.mintemp_c}°C</p>
                    <p>💧 ${day.day.daily_chance_of_rain}% Rain</p>
                    <p>🌱 ${recommendedCrops}</p>
                    <img src="${day.day.condition.icon}" alt="weather-icon">
                </div>
            `;
    });

    output += "</div>";
    document.getElementById("weather").innerHTML = output;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("weather").innerHTML =
      "<p>Failed to load weather data.</p>";
  }
}

// Crop Recommendations Based on Weather Conditions
const cropSuggestions = {
  rain: "🌾 Rice, 🌽 Maize, 🥦 Leafy Greens",
  sunny: "🌻 Sunflowers, 🌾 Wheat, 🥕 Carrots",
  cloudy: "🍇 Grapes, 🍉 Melons, 🥔 Potatoes",
  cold: "🥬 Spinach, 🥕 Carrots, 🥦 Broccoli",
  hot: "🌶️ Chili, 🍅 Tomatoes, 🥭 Mango",
};

// Function to Get Recommended Crops
function getCropRecommendation(condition) {
  if (condition.includes("rain") || condition.includes("drizzle"))
    return cropSuggestions["rain"];
  if (condition.includes("sun")) return cropSuggestions["sunny"];
  if (condition.includes("cloud") || condition.includes("overcast"))
    return cropSuggestions["cloudy"];
  if (condition.includes("cold") || condition.includes("snow"))
    return cropSuggestions["cold"];
  if (condition.includes("hot") || condition.includes("heat"))
    return cropSuggestions["hot"];
  return "No specific recommendation";
}
