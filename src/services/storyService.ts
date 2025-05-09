
import { NewsStory, APIStoryResponse } from '@/types/news';
import { fetchData } from '@/utils/apiUtils';
import { transformAPIStory, parseRawApiData } from '@/utils/transformUtils';

// Primary API endpoint using our Vite proxy to avoid CORS issues
const STORYFUL_API = '/api/newswire/stories';

export const fetchStoryById = async (id: string): Promise<{ story: NewsStory; similarStories: NewsStory[] }> => {
  try {
    console.log(`Fetching story with ID: ${id}`);
    
    try {
      // Try fetching the specific story by ID using our proxy
      console.log(`Attempting to fetch single story with ID: ${id}`);
      const singleStoryEndpoint = `${STORYFUL_API}/${id}`;
      
      try {
        // First attempt: Try to fetch the specific story directly
        const response = await fetchData<any>(singleStoryEndpoint);
        console.log('Single story data received:', response);
        
        // Check if the response has the expected structure with story and similar_stories
        if (response && response.story) {
          console.log('Found story in response:', response.story.id || 'unknown id');
          
          // Transform the story to our format
          const transformedStory = transformAPIStory(response.story);
          console.log('Transformed story:', transformedStory.id, transformedStory.title);
          
          // Transform similar stories if available
          let similarStories: NewsStory[] = [];
          if (response.similar_stories && Array.isArray(response.similar_stories)) {
            similarStories = response.similar_stories.map(transformAPIStory);
            console.log(`Found ${similarStories.length} similar stories`);
          }
          
          return { story: transformedStory, similarStories };
        } else if (response && typeof response === 'object') {
          // If the response is a single story object without the wrapper
          console.log('Response appears to be a direct story object');
          const transformedStory = transformAPIStory(response);
          
          // Fetch similar stories separately
          const allStoriesData = await fetchData<any>(STORYFUL_API);
          const allStories = parseRawApiData(allStoriesData);
          const similarStories = allStories
            .filter(s => s.id !== id && s.id?.toString() !== id.toString())
            .slice(0, 5)
            .map(transformAPIStory);
          
          return { story: transformedStory, similarStories };
        }
      } catch (singleStoryError) {
        console.log('Failed to fetch single story directly, falling back to all stories method:', singleStoryError);
      }
      
      // Second attempt: Fallback to fetching all stories and filtering
      console.log('Falling back to fetching all stories and filtering');
      const rawData = await fetchData<any>(STORYFUL_API);
      console.log('Raw Storyful data received:', typeof rawData);
      
      const allStories = parseRawApiData(rawData);
      console.log('Parsed stories count:', allStories?.length || 0);
      
      if (allStories && allStories.length > 0) {
        // Find a story that matches the ID or use the first one as fallback
        const story = allStories.find(s => s.id === id || s.id?.toString() === id.toString()) || allStories[0];
        console.log('Found story:', story?.id || 'none');
        
        // Transform the story to our format
        const transformedStory = transformAPIStory(story);
        
        // Get a few similar stories
        const similarStories = allStories
          .filter(s => s.id !== story.id && s.id?.toString() !== story.id?.toString())
          .slice(0, 5)
          .map(transformAPIStory);
        
        console.log(`Returning story ID: ${transformedStory.id} with ${similarStories.length} similar stories`);
        return { story: transformedStory, similarStories };
      } else {
        console.log("No stories found in API response");
        throw new Error("No stories found in API response");
      }
    } catch (apiError) {
      console.error('Storyful API failed:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('All API attempts failed.', error);
    throw error;
  }
};

// Import this function from newsService to avoid circular dependencies
import { getTopStories } from './newsService';

export const getStoryBySlug = async (slug: string): Promise<NewsStory | undefined> => {
  try {
    console.log(`Looking for story with slug: ${slug}`);
    
    // Attempt to parse ID from slug if it's numeric
    if (/^\d+$/.test(slug)) {
      console.log('Slug is numeric, treating as ID');
      const result = await fetchStoryById(slug);
      return result.story;
    }
    
    // For non-numeric slugs, try to find from API
    try {
      console.log('Fetching all stories to find by slug');
      const allStories = await getTopStories(true); // Force refresh to get latest stories
      const matchedStory = allStories.find(story => story.slug === slug);
      
      if (matchedStory) {
        console.log(`Found story with matching slug: ${matchedStory.id}`);
      } else {
        console.log('No story with matching slug found');
      }
      
      return matchedStory;
    } catch (error) {
      console.error('Error finding story by slug:', error);
      return undefined;
    }
  } catch (error) {
    console.error('Error in getStoryBySlug:', error);
    return undefined;
  }
};

export const getRecommendedStories = async (storyId: number): Promise<NewsStory[]> => {
  try {
    console.log(`Getting recommended stories for ID: ${storyId}`);
    const result = await fetchStoryById(storyId.toString());
    return result.similarStories;
  } catch (error) {
    console.error('Error in getRecommendedStories:', error);
    return [];
  }
};
