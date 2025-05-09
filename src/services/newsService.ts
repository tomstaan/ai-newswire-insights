import { APIStory, APIStoryResponse, NewsStory } from '@/types/news';
import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = 'https://api.allorigins.win/raw?url=';
const API_ENDPOINT = 'https://newswire-story-recommendation.staging.storyful.com/api/stories';
const STORIES_CACHE_KEY = 'newswire_stories_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// List of CORS proxies to try
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

// Utility function to handle errors
const handleErrors = async (response: Response) => {
  if (!response.ok) {
    const message = `HTTP error! Status: ${response.status}`;
    console.error(message);
    throw new Error(message);
  }
  return response;
};

// Function to fetch data from the API with retries through different proxies
const fetchData = async <T>(endpoint: string, params?: string): Promise<T> => {
  const targetUrl = params ? `${endpoint}${params}` : endpoint;
  const errors: Error[] = [];

  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(targetUrl)}&_t=${Date.now()}`;
      console.log(`Trying to fetch from: ${url}`);
      
      const response = await fetch(url);
      await handleErrors(response);
      const data = await response.json();
      console.log(`Successfully fetched data from ${url}`);
      return data as T;
    } catch (error) {
      console.error(`Error fetching with proxy ${proxy}:`, error);
      errors.push(error as Error);
    }
  }

  // If we get here, all proxies failed
  console.error('All CORS proxies failed');
  throw new Error(`Failed to fetch data: ${errors[0]?.message || 'Unknown error'}`);
};

// Mock data to use as fallback when all proxies fail
const getMockData = (storyId?: string | number): NewsStory => {
  return {
    id: storyId ? Number(storyId) : 12345,
    title: "Example Story - API Unavailable",
    slug: "example-story",
    summary: "This is a placeholder story shown when the API is unavailable. Please try again later or check your connection.",
    published_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editorial_updated_at: new Date().toISOString(),
    clearance_mark: "LICENSED",
    regions: ["Global"],
    stated_location: "Internet",
    media_url: "",
    in_trending_collection: false,
    collection_headline: "",
    collection_summary_html: "",
    lead_image: {
      url: "https://via.placeholder.com/800x450?text=API+Unavailable",
      filename: "Placeholder"
    },
    lead_item: {
      id: storyId ? Number(storyId) : 12345,
      resource_type: 'video',
      type: 'video',
      media_button: {
        first_time: false,
        already_downloaded_by_relative: false,
        action: 'preview'
      }
    }
  };
};

// Get a mock result for when all API attempts fail
const getMockStoryResult = (storyId: string | number) => {
  const mainStory = getMockData(storyId);
  const similarStories = Array.from({ length: 5 }, (_, i) => ({
    ...getMockData(100000 + i),
    title: `Similar Story Example ${i + 1}`,
    id: 100000 + i
  }));
  
  return {
    story: mainStory,
    similarStories
  };
};

// Transform API response to our app model
const transformAPIStory = (apiStory: APIStory): NewsStory => {
  return {
    id: parseInt(apiStory.id),
    title: apiStory.title,
    slug: apiStory.title_slug,
    summary: apiStory.summary,
    published_date: apiStory.published_date,
    updated_at: apiStory.published_date,
    editorial_updated_at: apiStory.published_date,
    clearance_mark: apiStory.story_mark_clearance,
    lead_image: apiStory.image_url ? {
      url: apiStory.image_url,
      filename: apiStory.title
    } : undefined,
    regions: apiStory.categories ? JSON.parse(apiStory.categories) : [],
    stated_location: apiStory.stated_location,
    media_url: apiStory.media_url,
    in_trending_collection: false,
    video_providing_partner: false,
    collection_headline: '',
    collection_summary_html: '',
    lead_item: {
      id: parseInt(apiStory.id), // Using the same ID as the story
      resource_type: 'video',
      type: 'video', // Required by the interface
      media_button: {
        first_time: false,
        already_downloaded_by_relative: false,
        action: 'preview'
      }
    }
  };
};

export const fetchStoryById = async (id: string): Promise<{ story: NewsStory; similarStories: NewsStory[] }> => {
  try {
    console.log(`Fetching story with ID: ${id}`);
    
    try {
      const data = await fetchData<APIStoryResponse>(`${API_ENDPOINT}/${id}`);
      
      // If the response has a story property, use that structure
      if (data.story) {
        return {
          story: transformAPIStory(data.story),
          similarStories: data.similar_stories?.map(transformAPIStory) || []
        };
      } 
      // Otherwise, assume the response is just the story itself
      else {
        const story = transformAPIStory(data as unknown as APIStory);
        // Try to get similar stories
        try {
          const similarData = await fetchData<APIStory[]>(`${API_ENDPOINT}/${id}/recommendations`);
          return {
            story,
            similarStories: similarData?.map(transformAPIStory) || []
          };
        } catch (error) {
          console.error('Error fetching similar stories:', error);
          return { story, similarStories: [] };
        }
      }
    } catch (error) {
      console.error('All API endpoints failed. Using mock data as fallback.', error);
      
      // Show toast to indicate mock data is being used
      toast({
        title: "API Connection Issue",
        description: "Using sample data. Please check your connection and try again later.",
        variant: "destructive",
      });
      
      // Return mock data as fallback 
      return getMockStoryResult(id);
    }
  } catch (error) {
    console.error('Unhandled error in fetchStoryById:', error);
    throw error;
  }
};

export const getTopStories = async (forceRefresh: boolean = false): Promise<NewsStory[]> => {
  try {
    // Check if we have a valid cache
    if (!forceRefresh) {
      const cachedData = sessionStorage.getItem(STORIES_CACHE_KEY);
      if (cachedData) {
        const { stories, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired && Array.isArray(stories) && stories.length > 0) {
          console.log('Using cached stories:', stories.length);
          return stories;
        }
      }
    }
    
    console.log('Fetching fresh stories...');
    
    try {
      const data = await fetchData<APIStory[]>(`${API_ENDPOINT}`, '?limit=20');
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No stories found in API response');
      }
      
      const stories = data.map(transformAPIStory);
      
      // Cache the result
      sessionStorage.setItem(
        STORIES_CACHE_KEY,
        JSON.stringify({
          stories,
          timestamp: Date.now()
        })
      );
      
      console.log(`Successfully fetched ${stories.length} stories`);
      return stories;
    } catch (error) {
      console.error('API endpoints failed. Using mock data as fallback for top stories.', error);
      
      // Show toast to user
      toast({
        title: "API Connection Issue",
        description: "Using sample data. Please check your connection and try again later.",
        variant: "destructive",
      });
      
      // Return mock data as fallback
      return Array.from({ length: 10 }, (_, i) => getMockData(200000 + i));
    }
  } catch (error) {
    console.error('Unhandled error in getTopStories:', error);
    throw error;
  }
};

// Clean up unused functions
export const getStoryBySlug = async (slug: string): Promise<NewsStory | undefined> => {
  try {
    // Attempt to parse ID from slug if it's numeric
    if (/^\d+$/.test(slug)) {
      const result = await fetchStoryById(slug);
      return result.story;
    }
    
    // Non-numeric slugs aren't currently supported by our API
    console.error('Non-numeric slug not supported:', slug);
    return undefined;
  } catch (error) {
    console.error('Error in getStoryBySlug:', error);
    return undefined;
  }
};

export const getRecommendedStories = async (storyId: number): Promise<NewsStory[]> => {
  try {
    const result = await fetchStoryById(storyId.toString());
    return result.similarStories;
  } catch (error) {
    console.error('Error in getRecommendedStories:', error);
    return [];
  }
};
