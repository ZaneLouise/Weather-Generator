// API key for OpenWeatherMap
const apiKey = '6b432104597c4102d9871740c8c5ad87';

// Function to get the weather data based on the user's query (city name or coordinates)
async function getWeather(query) {
    document.getElementById('loading').style.display = 'block'; // Show loading message

    const unit = document.getElementById('unit').value; // Get the selected unit (Celsius or Fahrenheit)
    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=${unit}`; // Build the API URL

    try {
        const response = await fetch(url); // Fetch the weather data from OpenWeatherMap API
        const data = await response.json(); // Parse the response to JSON

        if (response.ok) {
            // If the response is OK, display the current weather
            document.getElementById('weather').innerHTML = `
                <h3>${data.name}</h3>
                <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
                <p>Temperature: ${data.main.temp}°${unit === 'metric' ? 'C' : 'F'}</p>
                <p>Weather: ${data.weather[0].description}</p>
            `;
            getForecast(data.coord.lat, data.coord.lon, unit); // Fetch forecast data using coordinates
        } else {
            // If the city is not found, display an error message
            document.getElementById('weather').innerHTML = 'City not found!';
        }
    } catch (error) {
        // Handle any errors in fetching weather data
        document.getElementById('weather').innerHTML = 'Error fetching weather data!';
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide loading message
    }
}

// Function to get the forecast data for the given latitude and longitude
async function getForecast(lat, lon, unit) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`; // Build the API URL for forecast

    try {
        const response = await fetch(url); // Fetch the forecast data
        const data = await response.json(); // Parse the response to JSON

        if (response.ok) {
            // If the response is OK, display the 5-day forecast and hourly forecast
            display5DayForecast(data, unit);
            getHourlyForecast(lat, lon, unit);
        }
    } catch (error) {
        // Handle any errors in fetching forecast data
        document.getElementById('forecast-list').innerHTML = 'Error fetching forecast data!';
    }
}

// Function to display the 5-day forecast (one forecast per day)
function display5DayForecast(data, unit) {
    const forecastDiv = document.getElementById('forecast-list');
    forecastDiv.innerHTML = ''; // Clear previous forecast data

    const dailyForecasts = {}; // Object to store forecast data grouped by date
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString(); // Get the date from the timestamp
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item; // Store the first forecast of the day
        }
    });

    Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
        const item = dailyForecasts[date]; // Get the forecast for the day
        const icon = item.weather[0].icon; // Get the weather icon
        const description = item.weather[0].description; // Get the weather description
        const temp = item.main.temp; // Get the temperature

        // Display the forecast for the day
        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <p><strong>${date}</strong></p>
                <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}">
                <p>${temp}°${unit === 'metric' ? 'C' : 'F'}</p>
                <p>${description}</p>
            </div>
        `;
    });
}

// Function to get the hourly forecast for the given latitude and longitude
async function getHourlyForecast(lat, lon, unit) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching hourly forecast');
        }

        const hourlyDiv = document.getElementById('hourly-list');
        hourlyDiv.innerHTML = ''; // Clear previous forecast

        // Select exactly the next 6 hours from the forecast list
        const next6Hours = data.list.slice(0, 6); 

        next6Hours.forEach(hour => {
            const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // Format time
            const icon = hour.weather[0].icon;
            const description = hour.weather[0].description;
            const temp = hour.main.temp;

            hourlyDiv.innerHTML += `
                <div class="hour-item">
                    <p><strong>${time}</strong></p>
                    <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}">
                    <p>${temp}°${unit === 'metric' ? 'C' : 'F'}</p>
                    <p>${description}</p>
                </div>
            `;
        });
    } catch (error) {
        document.getElementById('hourly-list').innerHTML = 'Error fetching hourly forecast!';
    }
}

// Function to get the weather data by city name
function getWeatherByCity() {
    const city = document.getElementById('city').value; // Get the city name from the input field
    if (city) {
        getWeather(`q=${encodeURIComponent(city)}`); // Call getWeather with the city name
    }
}

// Function to get the weather data based on the user's geolocation
function getLocationWeather() {
    if (navigator.geolocation) {
        // If geolocation is available, get the user's current position
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords; // Get the latitude and longitude
            getWeather(`lat=${latitude}&lon=${longitude}`); // Call getWeather with the latitude and longitude
        }, () => {
            alert("Location access denied or unavailable."); // Handle errors if location is denied or unavailable
        });
    } else {
        alert("Geolocation is not supported by this browser."); // Handle errors if geolocation is not supported
    }
}
