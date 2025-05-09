
import React from 'react';
import { NewsStory } from '@/types/news';
import { formatDate, getRandomInt } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Video, Play, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecommendedStoriesProps {
  stories: NewsStory[];
  currentStoryId?: number;
}

const RecommendedStories: React.FC<RecommendedStoriesProps> = ({ stories, currentStoryId }) => {
  const navigate = useNavigate();
  
  // Filter out the current story if it's in the recommended list
  const filteredStories = currentStoryId 
    ? stories.filter(story => story.id !== currentStoryId).slice(0, 5)
    : stories.slice(0, 5);

  const handleStoryClick = (e: React.MouseEvent<HTMLAnchorElement>, storyId: number) => {
    e.preventDefault();
    // Force a full navigation to the story page to ensure proper loading
    window.location.href = `/story/${storyId}`;
  };

  return (
    <div className="border border-newswire-lightGray rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="bg-gradient-to-r from-newswire-accent/90 to-newswire-accent p-4 border-b border-newswire-lightGray">
        <h3 className="font-display font-bold text-lg text-white flex items-center">
          <Video size={18} className="mr-2 text-white" />
          Similar Videos
        </h3>
      </div>
      <div className="divide-y divide-newswire-lightGray">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => {
            const minutes = getRandomInt(1, 8);
            const seconds = getRandomInt(10, 59);
            const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // CRITICAL: Always use the numeric ID for consistent navigation
            const storyLink = `/story/${story.id}`;
            
            return (
              <a 
                key={story.id} 
                href={storyLink}
                onClick={(e) => handleStoryClick(e, story.id)}
                className="block hover:bg-newswire-lightGray/20 transition-colors group"
              >
                <div className="flex gap-3 p-4">
                  <div className="w-24 h-16 md:w-28 md:h-20 flex-shrink-0 bg-newswire-lightGray overflow-hidden relative rounded-md">
                    {story.lead_image && (
                      <img 
                        src={story.lead_image.url} 
                        alt={story.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={14} className="text-newswire-accent ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center">
                      <Clock size={8} className="mr-0.5" />
                      {durationString}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-newswire-accent transition-colors">
                      {story.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-newswire-mediumGray">
                      <div className="flex items-center">
                        <Calendar size={10} className="mr-1" />
                        {formatDate(story.published_date)}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-4 px-1.5 font-medium",
                          story.clearance_mark === "LICENSED" ? "border-emerald-500 text-emerald-600" :
                          story.clearance_mark === "RESTRICTED" ? "border-amber-500 text-amber-600" :
                          "border-blue-500 text-blue-600"
                        )}
                      >
                        {story.clearance_mark}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-newswire-mediumGray" />
                  </div>
                </div>
              </a>
            );
          })
        ) : (
          <div className="p-8 text-center text-newswire-mediumGray">
            No similar videos available
          </div>
        )}
      </div>
      <div className="p-3 bg-newswire-lightGray/30 flex justify-center border-t border-newswire-lightGray">
        <Link to="/" className="text-xs text-newswire-accent hover:text-newswire-accent/80 font-medium flex items-center">
          View all related videos
          <ExternalLink size={12} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default RecommendedStories;
