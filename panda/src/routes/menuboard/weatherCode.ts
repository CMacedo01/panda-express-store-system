

let weatherData;
let weatherError;

/**
 * Gathers real time information for the local weather
*/
async function callWeatherApi() {
    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Send coordinates to the server-side endpoint
            try {
                const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
    
                if (res.ok) {
                    weatherData = data;
                }
                else {
                    weatherError = data.error || "Failed to fetch weather data.";
                }
            } 
            catch (error) {
                weatherError = "Error fetching weather data from the server.";
            }
        },
        (error) => {
            weatherError = "Geolocation permission denied or failed.";
        }
        );
    } else {
        weatherError = "Geolocation is not supported by this browser.";
    }
}