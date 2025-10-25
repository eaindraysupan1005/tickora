import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  attendees: number;
  category: string;
  image_url: string;
  organizer: string;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onBuyTicket?: (event: Event) => void;
  showActions?: boolean;
}

export function EventCard({ event, onViewDetails, onBuyTicket, showActions = true }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const availableTickets = event.capacity - event.attendees;
  const isFullyBooked = availableTickets <= 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <ImageWithFallback
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {event.category}
          </Badge>
        </div>
        {isFullyBooked && (
          <div className="absolute top-4 right-4">
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 shrink-0" />
            <span>{formatDate(event.date)} at {event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              <span>{event.attendees}/{event.capacity} attending</span>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="font-semibold">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-6 pt-0 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(event)}
            className="flex-1"
          >
            View Details
          </Button>
          {onBuyTicket && (
            <Button 
              onClick={() => onBuyTicket(event)}
              disabled={isFullyBooked}
              className="flex-1"
            >
              {isFullyBooked ? 'Sold Out' : (event.price === 0 ? 'Get Ticket' : 'Buy Ticket')}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}