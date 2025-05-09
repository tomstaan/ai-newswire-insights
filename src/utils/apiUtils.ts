
// Handle API request utilities

// Add cache buster to URL to prevent caching
export const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};

// Utility function to handle errors with more detailed logging
export const handleErrors = async (response: Response) => {
  if (!response.ok) {
    const statusText = response.statusText || 'Unknown error';
    const message = `HTTP error! Status: ${response.status} ${statusText}`;
    console.error(message);
    
    // Log more details about the response for debugging
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get response text for more context
    try {
      const text = await response.text();
      console.log('Error response body:', text.substring(0, 500)); // Log first 500 chars only
      
      // Check for specific CORS error messages
      if (text.includes('cors') || text.includes('CORS')) {
        console.error('CORS error detected in response');
      }
    } catch (e) {
      console.log('Could not read error response body');
    }
    
    throw new Error(message);
  }
  return response;
};

// Convert to JSON with better error handling
export const toJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (e) {
    console.error('JSON parsing error:', e);
    // Try to log the text that couldn't be parsed
    try {
      const text = await response.text();
      console.log('Failed to parse as JSON:', text.substring(0, 200)); // Log first 200 chars
    } catch (innerError) {
      console.log('Could not read response text');
    }
    throw new Error('Failed to parse response as JSON');
  }
};

// Enhanced fetch function specifically for our proxied API endpoints
export const fetchData = async <T>(endpoint: string, params?: string): Promise<T> => {
  const targetUrl = params ? `${endpoint}${params}` : endpoint;
  console.log(`Starting fetch to: ${targetUrl}`);
  
  // Add cache buster to prevent caching issues
  const urlWithCache = addCacheBuster(targetUrl);
  
  try {
    // Use standard fetch with our proxy
    const response = await fetch(urlWithCache, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'omit', // Don't send cookies to avoid CORS preflight
    });
    
    await handleErrors(response);
    const data = await toJson(response);
    console.log(`Fetch successful for: ${targetUrl}`);
    return data as T;
  } catch (error) {
    console.error(`Fetch failed for: ${targetUrl}`, error);
    throw error;
  }
};

// Type definition for story data
export interface Story {
  id: string;
  title: string;
  description?: string;
  publishedAt?: string;
  url?: string;
  // Add other fields as needed based on the API response
}

// Function to fetch stories from the newswire API
export const fetchStories = async (): Promise<Story[]> => {
  try {
    // Use our Vite proxy endpoint to avoid CORS issues
    const response = await fetch('/api/newswire/stories');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as Story[];
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};
