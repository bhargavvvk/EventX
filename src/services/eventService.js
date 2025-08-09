import axios from 'axios';

const API_URL = 'http://localhost:5001/api/events';

// Get all events sorted by date in ascending order
export const getEvents = async () => {
  try {
    const response = await axios.get(API_URL);
    // Sort events by date in ascending order
    const sortedEvents = response.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    return sortedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get events for carousel (limited to 7)
export const getCarouselEvents = async () => {
  try {
    const events = await getEvents();
    // Return first 7 events for carousel
    return events.slice(0, 7);
  } catch (error) {
    console.error('Error fetching carousel events:', error);
    throw error;
  }
};

// Get events for home page (limited to 4)
export const getHomePageEvents = async () => {
  try {
    const events = await getEvents();
    // Return first 4 events for home page
    return events.slice(0, 4);
  } catch (error) {
    console.error('Error fetching home page events:', error);
    throw error;
  }
};
