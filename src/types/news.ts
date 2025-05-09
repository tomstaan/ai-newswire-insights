
export interface NewsStory {
  id: number;
  title: string;
  slug: string;
  summary: string;
  published_date: string;
  updated_at: string;
  editorial_updated_at: string;
  clearance_mark: string;
  collection_headline?: string;
  collection_summary_html?: string;
  in_trending_collection: boolean;
  lead_image?: {
    url: string;
    filename: string;
  };
  lead_item?: {
    id: number;
    media_button: {
      first_time: boolean;
      already_downloaded_by_relative: boolean;
      action: string;
    };
    resource_type: string;
    type: string;
  };
  place_id?: string;
  regions?: string[];
  video_providing_partner?: boolean;
  stated_location?: string;
  media_url?: string;
}

export interface APIStoryResponse {
  story: APIStory;
  similar_stories: APIStory[];
}

export interface APIStory {
  id: string;
  title: string;
  title_slug: string;
  summary: string;
  extended_summary: string;
  published_date: string;
  story_mark_clearance: string;
  image_url: string;
  media_url: string;
  provider_url: string;
  categories: string;
  channels: string;
  collections: string;
  keywords: string;
  stated_location: string;
  total_downloads: string;
  total_views: string;
  unique_downloads: string;
  unique_views: string;
  title_date: string;
  story_mark_guidance: string;
}

export interface AIOverview {
  summary: string;
  keyPoints: string[];
  relatedTopics: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pythonCode?: string;  // Added to store Python code separately
  hasPythonCode?: boolean; // Flag to indicate Python code is present
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
}
