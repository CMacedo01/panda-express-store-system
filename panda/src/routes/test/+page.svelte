<script lang="ts">
    import { onMount } from "svelte";
  
    let weatherData: any = null;
    let errorMessage: string = "";
  
    // This will run when the component mounts
    onMount(() => {
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
              } else {
                errorMessage = data.error || "Failed to fetch weather data.";
              }
            } catch (error) {
              errorMessage = "Error fetching weather data from the server.";
            }
          },
          (error) => {
            errorMessage = "Geolocation permission denied or failed.";
          }
        );
      } else {
        errorMessage = "Geolocation is not supported by this browser.";
      }
    });
  </script>
  
  {#if errorMessage}
    <p>{errorMessage}</p>
  {:else if weatherData}
    <h2>Weather for {weatherData.name}, {weatherData.sys.country}</h2>
    <p>{weatherData.weather[0].description}</p>
    <p>Temperature: {weatherData.main.temp}°F</p>
    <p>Humidity: {weatherData.main.humidity}%</p>
  {:else}
    <p>Loading weather data...</p>
  {/if}
  