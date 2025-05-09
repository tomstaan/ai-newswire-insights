
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Play, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsStory } from '@/types/news';
import { formatDate, getRandomInt } from '@/lib/utils';

interface NewsCardProps {
  story: NewsStory;
  variant?: 'default' | 'compact' | 'featured';
  size?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ story, variant = 'default', size }) => {
  const navigate = useNavigate();
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';
  
  const minutes = getRandomInt(1, 15);
  const seconds = getRandomInt(10, 59);
  const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const handleStoryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Force a full navigation to ensure proper loading
    window.location.href = `/story/${story.id}`;
  };
  
  const getClearanceBadge = (clearance: string) => {
    switch (clearance) {
      case 'LICENSED':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1">
            <ShieldCheck size={12} />
            LICENSED
          </Badge>
        );
      case 'RESTRICTED':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1">
            <AlertTriangle size={12} />
            RESTRICTED
          </Badge>
        );
      case 'CLEARED':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
            <ShieldCheck size={12} />
            CLEARED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1">
            PUBLIC
          </Badge>
        );
    }
  };

  // CRITICAL: Always use the numeric ID for the link to ensure consistent navigation
  const storyLink = `/story/${story.id}`;

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${isFeatured ? 'md:flex h-full' : ''}`}>
      <a 
        href={storyLink}
        onClick={handleStoryClick}
        className="block h-full"
      >
        <div className={`${isFeatured ? 'md:w-1/2 md:flex-shrink-0' : ''}`}>
          <div className="relative aspect-video bg-newswire-lightGray">
            {story.lead_image?.url ? (
              <img 
                src={story.lead_image.url} 
                alt={story.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-newswire-lightGray">
                <Play size={40} className="text-white/50" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <Play size={20} className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
              <Clock size={10} className="mr-1" />
              {durationString}
            </div>
          </div>
        </div>
        
        <CardContent className={`p-4 ${isFeatured ? 'md:w-1/2 md:flex-grow' : ''}`}>
          <div className="flex items-center justify-between mb-2 text-xs text-newswire-mediumGray">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{formatDate(story.published_date)}</span>
            </div>
            {getClearanceBadge(story.clearance_mark)}
          </div>
          
          <h3 className={`font-display font-bold leading-tight mb-2 line-clamp-2 ${isFeatured ? 'text-xl md:text-2xl' : isCompact ? 'text-base' : 'text-lg'}`}>
            {story.title}
          </h3>
          
          {!isCompact && (
            <p className="text-newswire-mediumGray mb-3 line-clamp-2 text-sm">
              {story.summary}
            </p>
          )}
          
          <div className="flex items-center text-xs text-newswire-mediumGray">
            {story.stated_location && (
              <div className="flex items-center mr-3">
                <MapPin size={12} className="mr-1" />
                <span>{story.stated_location}</span>
              </div>
            )}
            {story.regions && story.regions.length > 0 && (
              <div className="flex items-center">
                <span>{story.regions[0]}</span>
              </div>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

export default NewsCard;
