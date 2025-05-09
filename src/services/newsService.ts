
import { NewsStory } from '@/types/news';
import { fetchData } from '@/utils/apiUtils';
import { transformAPIStory, parseRawApiData } from '@/utils/transformUtils';
import { getValidCache, saveToCache } from '@/utils/cacheUtils';
import { toast } from '@/hooks/use-toast';

// Primary API endpoint - using Storyful API via our proxy to avoid CORS issues
export const STORYFUL_API = '/api/newswire/stories';

// Variable to track if we've already shown an API error message
let hasShownApiErrorMessage = false;

export const getTopStories = async (forceRefresh: boolean = false): Promise<NewsStory[]> => {
  try {
    console.log('Starting getTopStories function, forceRefresh:', forceRefresh);
    
    // Check if we have a valid cache and forceRefresh is false
    if (!forceRefresh) {
      const cachedStories = getValidCache();
      if (cachedStories && cachedStories.length > 0) {
        console.log('Using cached stories:', cachedStories.length);
        return cachedStories;
      }
    } else {
      console.log('Force refresh requested, bypassing cache');
    }
    
    console.log('Fetching fresh stories from Storyful API...');
    
    try {
      // Try using the Storyful API
      console.log(`Fetching from: ${STORYFUL_API}`);
      const rawData = await fetchData<any>(STORYFUL_API);
      console.log('Raw Storyful data received:', typeof rawData, Array.isArray(rawData));
      
      const storyfulData = parseRawApiData(rawData);
      console.log('Parsed Storyful data count:', storyfulData?.length || 0);
      
      if (storyfulData && storyfulData.length > 0) {
        console.log('Storyful API returned stories:', storyfulData.length);
        
        // Transform the storyful data to our NewsStory format
        const stories = storyfulData.map(story => transformAPIStory(story));
        
        console.log('Transformed stories from Storyful:', stories.length);
        
        // Cache the result
        saveToCache(stories);
        
        return stories;
      } else {
        throw new Error("Storyful API returned empty or invalid response");
      }
    } catch (apiError) {
      console.error('Storyful API failed:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('All API attempts failed:', error);
    
    // Show API error message if we haven't already
    if (!hasShownApiErrorMessage) {
      toast({
        title: "API Connection Issue",
        description: "Could not connect to the news API. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      hasShownApiErrorMessage = true;
    }
    
    // Return empty array as last resort
    return [];
  }
};

// Re-export story-related functions from storyService 
export { fetchStoryById, getStoryBySlug, getRecommendedStories } from './storyService';
