import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'

export const GET = async ({ url }) => {
  // Extract latitude and longitude from the query parameters
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  // Ensure we have valid coordinates
  if (!lat || !lon) {
    return json({ error: 'Missing latitude or longitude' }, { status: 400 });
  }

  const API_KEY = env.OPENWM_API_KEY; // Replace with your OpenWeatherMap API key
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
  try {
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    // If the API returned an error (e.g., invalid coordinates)
    if (weatherData.cod !== 200) {
      return json({ error: weatherData.message || 'Failed to fetch weather data' }, { status: 500 });
    }

    // Return the weather data
    return json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return json({ error: 'Failed to fetch weather data from OpenWeatherMap' }, { status: 500 });
  }
};
