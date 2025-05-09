
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import VideoCard from '@/components/news/NewsCard';
import NewsCardSkeleton from '@/components/news/NewsCardSkeleton';
import { NewsStory } from '@/types/news';
import { getTopStories } from '@/services/newsService';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import AIOverviewSection from '@/components/ai/AIOverviewSection';
import AIAssistant from '@/components/ai/AIAssistant';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const Index = () => {
  const [featuredVideo, setFeaturedVideo] = useState<NewsStory | null>(null);
  const [videos, setVideos] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchVideos = async (showToast = false, forceRefresh = false) => {
    try {
      console.log(`Starting to fetch videos (forceRefresh: ${forceRefresh})...`);
      if (showToast) {
        setIsRefreshing(true);
        toast({
          title: "Refreshing stories",
          description: "Fetching the latest stories for you...",
        });
      } else {
        setLoading(true);
      }
      
      setLoadError(null);
      
      // Force refresh on manual refresh button click
      const allVideos = await getTopStories(forceRefresh);
      console.log('Fetched videos:', allVideos.length);
      
      if (allVideos.length > 0) {
        setFeaturedVideo(allVideos[0]);
        setVideos(allVideos.slice(1));
        
        if (showToast) {
          toast({
            title: "Stories refreshed",
            description: `Loaded ${allVideos.length} stories successfully.`,
          });
        }
      } else {
        console.log('No videos returned from API');
        setLoadError('No videos available at this time. Please try again later.');
        setFeaturedVideo(null);
        setVideos([]);
      }
    } catch (error) {
      console.error('Error in component when fetching videos:', error);
      setLoadError('Failed to load videos. Please try again later.');
      setFeaturedVideo(null);
      setVideos([]);
      
      if (showToast) {
        toast({
          title: "Error refreshing stories",
          description: "There was a problem fetching the latest stories.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Use a more comprehensive approach to fetch fresh data
  useEffect(() => {
    // On initial load, force refresh to avoid dummy data
    fetchVideos(false, true);
    
    // Handle navigation events
    const handleRouteChange = () => {
      if (location.pathname === '/') {
        console.log('Back on home page, refreshing data...');
        fetchVideos(false, true);
      }
    };
    
    // Listen for both popstate (back/forward) and navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [location.pathname]);

  // Filter videos based on search term
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When user manually refreshes, force a refresh from API
  const handleManualRefresh = () => {
    fetchVideos(true, true);
  };

  // Render skeleton loaders when loading
  const renderSkeletons = () => {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-newswire-lightGray rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-newswire-lightGray rounded mb-6"></div>
          <div className="mb-12 flex justify-between items-center">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <NewsCardSkeleton key={i} size="medium" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        {renderSkeletons()}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* AI Insights Section - Only show if featured video exists */}
        {featuredVideo && <AIOverviewSection story={featuredVideo} />}
        
        {/* Available Videos */}
        <div className="mb-12 flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">
            Available Videos
          </h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-newswire-mediumGray" size={16} />
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="pl-10 pr-4 py-2 border border-newswire-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-newswire-accent focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center gap-1"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                <Filter size={14} />
                Filters
              </Button>
            </div>
          </div>
        </div>
        
        {loadError && (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
            <h3 className="text-xl font-medium text-red-700 mb-2">{loadError}</h3>
            <p className="text-newswire-mediumGray mb-4">Try refreshing the page or check back later</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Try Again"}
            </Button>
          </div>
        )}
        
        {!loadError && filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-newswire-darkGray mb-2">No videos found</h3>
            <p className="text-newswire-mediumGray mb-4">Try adjusting your search criteria or refreshing</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard 
                key={video.id} 
                story={video} 
                size="medium" 
              />
            ))}
          </div>
        )}
      </div>

      {/* Add AI Assistant component */}
      <AIAssistant showAssistantButton={false} />
    </Layout>
  );
};

export default Index;
