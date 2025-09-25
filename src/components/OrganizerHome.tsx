import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { EventCard, Event } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

interface OrganizerHomeProps {
  events: Event[];
  onCreateEvent: (eventData: any) => void;
  onViewEvent: (event: Event) => void;
  onShowDashboard: () => void;
}

export function OrganizerHome({ events, onCreateEvent, onViewEvent, onShowDashboard }: OrganizerHomeProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter events created by organizer (for prototype, show some events as organizer's)
  const organizerEvents = events.slice(0, 6);

  // Calculate quick stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingEvents = organizerEvents.filter(event => new Date(event.date) > now);
    const ongoingEvents = organizerEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventEndDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hour events
      return eventDate <= now && eventEndDate >= now;
    });

    return {
      totalEvents: organizerEvents.length,
      upcomingEvents: upcomingEvents.length,
      ongoingEvents: ongoingEvents.length,
      totalTicketsSold: organizerEvents.reduce((sum, event) => sum + event.attendees, 0),
      totalRevenue: organizerEvents.reduce((sum, event) => sum + (event.price * event.attendees), 0),
      totalCapacity: organizerEvents.reduce((sum, event) => sum + event.capacity, 0),
      averageAttendance: organizerEvents.length > 0 
        ? Math.round((organizerEvents.reduce((sum, event) => sum + (event.attendees / event.capacity), 0) / organizerEvents.length) * 100)
        : 0
    };
  }, [organizerEvents]);

  // Get notifications
  const notifications = useMemo(() => {
    const alerts = [];
    
    // Low ticket sales (less than 30% sold)
    const lowSalesEvents = organizerEvents.filter(event => 
      (event.attendees / event.capacity) < 0.3 && new Date(event.date) > new Date()
    );
    
    if (lowSalesEvents.length > 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Low Ticket Sales',
        message: `${lowSalesEvents.length} event${lowSalesEvents.length > 1 ? 's have' : ' has'} sold less than 30% of tickets`,
        count: lowSalesEvents.length
      });
    }

    // Events happening soon (within 7 days)
    const soonEvents = organizerEvents.filter(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });

    if (soonEvents.length > 0) {
      alerts.push({
        type: 'info' as const,
        title: 'Upcoming Events',
        message: `${soonEvents.length} event${soonEvents.length > 1 ? 's are' : ' is'} happening within the next 7 days`,
        count: soonEvents.length
      });
    }

    // Mock: Refund requests (randomly show some)
    const mockRefundRequests = Math.floor(Math.random() * 3);
    if (mockRefundRequests > 0) {
      alerts.push({
        type: 'destructive' as const,
        title: 'Refund Requests',
        message: `${mockRefundRequests} pending refund request${mockRefundRequests > 1 ? 's' : ''} need review`,
        count: mockRefundRequests
      });
    }

    return alerts;
  }, [organizerEvents]);

  // Get upcoming and ongoing events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return organizerEvents
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [organizerEvents]);

  const ongoingEvents = useMemo(() => {
    const now = new Date();
    return organizerEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventEndDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hour events
      return eventDate <= now && eventEndDate >= now;
    });
  }, [organizerEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold">Organizer Overview</h1>
            <p className="text-muted-foreground text-lg">
              Manage your events, track performance, and grow your audience
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTicketsSold.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalCapacity.toLocaleString()} capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
              <p className="text-xs text-muted-foreground">
                Capacity filled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Notifications
            </h2>
            <div className="grid gap-4">
              {notifications.map((notification, index) => (
                <Alert key={index} variant={notification.type}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>{notification.message}</span>
                    <Badge variant="outline">{notification.count}</Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-500" />
              Live Events
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                {ongoingEvents.length} active
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <div key={event.id} className="relative">
                  <EventCard 
                    event={event} 
                    onViewDetails={onViewEvent}
                    showActions={false}
                  />
                  <div className="absolute top-4 right-4 space-y-2">
                    <Badge className="bg-green-500 text-white animate-pulse">
                      LIVE
                    </Badge>
                    <Badge variant="outline" className="block bg-white/90">
                      {event.attendees}/{event.capacity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Events
            </h2>
            {upcomingEvents.length > 4 && (
              <Button variant="outline" size="sm">
                View All ({stats.upcomingEvents})
              </Button>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  Create your next event to start selling tickets
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => {
                const salesPercentage = Math.round((event.attendees / event.capacity) * 100);
                const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={event.id} className="relative">
                    <EventCard 
                      event={event} 
                      onViewDetails={onViewEvent}
                      showActions={false}
                    />
                    <div className="absolute top-4 right-4 space-y-2">
                      <Badge 
                        variant={salesPercentage < 30 ? 'destructive' : salesPercentage < 70 ? 'secondary' : 'default'}
                        className="block text-center"
                      >
                        {salesPercentage}% sold
                      </Badge>
                      <Badge variant="outline" className="block bg-white/90 text-center">
                        {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => onViewEvent(event)}
                        className="w-full"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-6 h-6" />
                Create Event
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={onShowDashboard}
              >
                <Users className="w-6 h-6" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                disabled
              >
                <DollarSign className="w-6 h-6" />
                Payouts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={onCreateEvent}
      />
    </div>
  );
}