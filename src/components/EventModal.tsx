import { Calendar, MapPin, Users, DollarSign, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Event } from './EventCard';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyTicket?: (event: Event) => void;
  userType?: 'user' | 'organizer' | null;
}

export function EventModal({ event, isOpen, onClose, onBuyTicket, userType }: EventModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const availableTickets = event.capacity - event.attendees;
  const isFullyBooked = availableTickets <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{event.title}</DialogTitle>
          <DialogDescription className="text-left">
            {event.category} • {formatDate(event.date)} at {event.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
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

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3>Event Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{event.organizer}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3>Ticket Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {event.price === 0 ? 'Free Entry' : `$${event.price}`}
                      </p>
                      <p className="text-sm text-muted-foreground">Per ticket</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{availableTickets} tickets left</p>
                      <p className="text-sm text-muted-foreground">
                        {event.attendees} of {event.capacity} sold
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Description */}
          <div className="space-y-3">
            <h3>About This Event</h3>
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {onBuyTicket && userType === 'user' && (
              <Button 
                onClick={() => onBuyTicket(event)}
                disabled={isFullyBooked}
                className="flex-1"
              >
                {isFullyBooked ? 'Sold Out' : (event.price === 0 ? 'Get Free Ticket' : `Buy Ticket - $${event.price}`)}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}