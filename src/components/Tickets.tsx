import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, MapPin, Clock, Ticket, QrCode, Download, Star, AlertCircle } from 'lucide-react';
import { Event } from './EventCard';
import { QRCodeModal } from './QRCodeModal';

interface TicketsProps {
  events: Event[];
  userTickets: Array<{ eventId: string; quantity: number; purchaseDate: string }>;
  onViewEvent: (event: Event) => void;
  onBrowseEvents: () => void;
}

interface TicketWithEvent {
  eventId: string;
  quantity: number;
  purchaseDate: string;
  event: Event;
}

export function Tickets({ events, userTickets, onViewEvent, onBrowseEvents }: TicketsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<{
    event: Event;
    ticketInfo: {
      quantity: number;
      purchaseDate: string;
      ticketNumber: string;
      seatInfo?: string;
    };
  } | null>(null);

  // Combine tickets with event data
  const ticketsWithEvents: TicketWithEvent[] = useMemo(() => {
    return userTickets.map(ticket => {
      const event = events.find(e => e.id === ticket.eventId);
      return {
        ...ticket,
        event: event!
      };
    }).filter(ticket => ticket.event); // Filter out tickets where event is not found
  }, [userTickets, events]);

  // Separate upcoming and past events
  const upcomingTickets = useMemo(() => {
    const now = new Date();
    return ticketsWithEvents.filter(ticket => {
      const eventDate = new Date(`${ticket.event.date} ${ticket.event.time}`);
      return eventDate > now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.event.date} ${a.event.time}`);
      const dateB = new Date(`${b.event.date} ${b.event.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [ticketsWithEvents]);

  const historyTickets = useMemo(() => {
    const now = new Date();
    return ticketsWithEvents.filter(ticket => {
      const eventDate = new Date(`${ticket.event.date} ${ticket.event.time}`);
      return eventDate <= now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.event.date} ${a.event.time}`);
      const dateB = new Date(`${b.event.date} ${b.event.time}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [ticketsWithEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateTicketNumber = (eventId: string, purchaseDate: string) => {
    // Generate a realistic ticket number based on event ID and purchase date
    const hash = eventId + purchaseDate;
    let num = 0;
    for (let i = 0; i < hash.length; i++) {
      num += hash.charCodeAt(i);
    }
    return `TIX-${(num % 900000 + 100000).toString()}`;
  };

  const handleShowQR = (ticket: TicketWithEvent) => {
    const ticketNumber = generateTicketNumber(ticket.eventId, ticket.purchaseDate);
    const seatInfo = ticket.quantity === 1 ? 
      `Section A, Row ${Math.floor(Math.random() * 20) + 1}, Seat ${Math.floor(Math.random() * 30) + 1}` : 
      `General Admission`;
    
    setSelectedTicketForQR({
      event: ticket.event,
      ticketInfo: {
        quantity: ticket.quantity,
        purchaseDate: ticket.purchaseDate,
        ticketNumber,
        seatInfo
      }
    });
  };

  const TicketCard = ({ ticket, isUpcoming }: { ticket: TicketWithEvent; isUpcoming: boolean }) => {
    const { event, quantity, purchaseDate } = ticket;
    const eventDate = new Date(`${event.date} ${event.time}`);
    const purchasedDate = new Date(purchaseDate);
    
    return (
      <Card className="overflow-hidden">
        <div className="relative">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={isUpcoming ? "default" : "secondary"}>
              {isUpcoming ? "Upcoming" : "Attended"}
            </Badge>
          </div>
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              <CardDescription className="mt-2">
                {event.organizer}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <Ticket className="w-4 h-4" />
                <span className="font-semibold">{quantity} Ticket{quantity > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatTime(event.time)}</span>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="text-sm text-muted-foreground">
              Purchased: {purchasedDate.toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewEvent(event)}
              >
                View Details
              </Button>
              {isUpcoming && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShowQR(ticket)}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </>
              )}
              {!isUpcoming && (
                <Button variant="outline" size="sm">
                  <Star className="w-4 h-4 mr-1" />
                  Rate Event
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'history' }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <Ticket className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {type === 'upcoming' ? 'No Upcoming Events' : 'No Event History'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {type === 'upcoming' 
          ? "You don't have any upcoming events. Start exploring and book your next adventure!"
          : "You haven't attended any events yet. Your event history will appear here."
        }
      </p>
      <Button variant="outline" onClick={onBrowseEvents}>
        Browse Events
      </Button>
    </div>
  );

  if (userTickets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Ticket className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">No Tickets Yet</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              You haven't purchased any tickets yet. Discover amazing events and start building your collection!
            </p>
            <Button size="lg" onClick={onBrowseEvents}>
              <Calendar className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage your event tickets and view your event history
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History ({historyTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingTickets.length === 0 ? (
              <EmptyState type="upcoming" />
            ) : (
              <>
                {upcomingTickets.some(ticket => {
                  const eventDate = new Date(`${ticket.event.date} ${ticket.event.time}`);
                  const now = new Date();
                  const timeDiff = eventDate.getTime() - now.getTime();
                  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  return daysDiff <= 7;
                }) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Upcoming Events This Week</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Don't forget about your upcoming events! Check event details and make sure you're ready to attend.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingTickets.map((ticket) => (
                    <TicketCard
                      key={`${ticket.eventId}-${ticket.purchaseDate}`}
                      ticket={ticket}
                      isUpcoming={true}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {historyTickets.length === 0 ? (
              <EmptyState type="history" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {historyTickets.map((ticket) => (
                  <TicketCard
                    key={`${ticket.eventId}-${ticket.purchaseDate}`}
                    ticket={ticket}
                    isUpcoming={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={!!selectedTicketForQR}
          onClose={() => setSelectedTicketForQR(null)}
          event={selectedTicketForQR?.event || null}
          ticketInfo={selectedTicketForQR?.ticketInfo || null}
        />
      </div>
    </div>
  );
}