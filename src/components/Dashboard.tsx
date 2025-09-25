import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { EventCard, Event } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Eye,
  Edit,
  Filter,
  Search,
  BarChart3,
  QrCode,
  Ticket,
  MapPin,
  Clock,
  Star,
  Download,
  Share2,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  PieChart,
  LineChart,
  UserCheck,
  RefreshCw,
  Copy,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface DashboardProps {
  userType: 'user' | 'organizer';
  events: Event[];
  userTickets: Array<{ eventId: string; quantity: number; purchaseDate: string }>;
  onCreateEvent: (eventData: any) => void;
  onViewEvent: (event: Event) => void;
}

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
  benefits: string[];
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usageLimit: number;
  used: number;
  expiryDate: string;
  isActive: boolean;
}

export function Dashboard({ userType, events, userTickets, onCreateEvent, onViewEvent }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('events');
  const [eventFilter, setEventFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventForManagement, setSelectedEventForManagement] = useState<Event | null>(null);

  // Mock data for ticket tiers and promo codes
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: '1',
      name: 'General Admission',
      price: 50,
      quantity: 100,
      sold: 67,
      description: 'Standard entry to the event',
      benefits: ['Event access', 'Welcome drink']
    },
    {
      id: '2',
      name: 'VIP Experience',
      price: 150,
      quantity: 25,
      sold: 18,
      description: 'Premium experience with exclusive perks',
      benefits: ['Event access', 'VIP lounge', 'Meet & greet', 'Premium seating']
    }
  ]);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: '1',
      code: 'EARLY20',
      discount: 20,
      type: 'percentage',
      usageLimit: 50,
      used: 23,
      expiryDate: '2025-10-01',
      isActive: true
    },
    {
      id: '2',
      code: 'STUDENT10',
      discount: 10,
      type: 'fixed',
      usageLimit: 100,
      used: 45,
      expiryDate: '2025-12-31',
      isActive: true
    }
  ]);

  // Filter events based on organizer (for prototype, show some events as organizer's)
  const organizerEvents = userType === 'organizer' ? events.slice(0, 6) : [];

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = organizerEvents;

    // Filter by status
    if (eventFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) > new Date());
    } else if (eventFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.date) <= new Date());
    } else if (eventFilter === 'drafts') {
      // Mock draft events (for prototype)
      filtered = filtered.filter(event => event.attendees === 0);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [organizerEvents, eventFilter, searchQuery]);

  // Calculate analytics data
  const analytics = useMemo(() => {
    const totalEvents = organizerEvents.length;
    const upcomingEvents = organizerEvents.filter(event => new Date(event.date) > new Date()).length;
    const totalTicketsSold = organizerEvents.reduce((sum, event) => sum + event.attendees, 0);
    const totalRevenue = organizerEvents.reduce((sum, event) => sum + (event.price * event.attendees), 0);
    const totalCapacity = organizerEvents.reduce((sum, event) => sum + event.capacity, 0);
    
    return {
      totalEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue,
      totalCapacity,
      averageTicketPrice: totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0,
      salesConversionRate: totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0
    };
  }, [organizerEvents]);

  // User Dashboard for attendees
  const UserDashboard = () => {
    const userEvents = userTickets.map(ticket => {
      const event = events.find(e => e.id === ticket.eventId);
      return event ? { ...event, ticketQuantity: ticket.quantity, purchaseDate: ticket.purchaseDate } : null;
    }).filter(Boolean);

    const userStats = {
      totalTickets: userTickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
      upcomingEvents: userEvents.filter(event => event && new Date(event.date) > new Date()).length,
      totalSpent: userEvents.reduce((sum, event) => sum + (event.price * (event.ticketQuantity || 1)), 0)
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events to attend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats.totalSpent}</div>
              <p className="text-xs text-muted-foreground">On event tickets</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {userEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
                <p className="text-muted-foreground">Browse events and get your first ticket!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <div key={event.id} className="relative">
                    <EventCard 
                      event={event} 
                      onViewDetails={onViewEvent}
                      showActions={false}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {event.ticketQuantity} ticket{event.ticketQuantity > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Event Management Tab
  const EventManagementTab = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
            <SelectItem value="drafts">Drafts</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {eventFilter === 'all' ? 'Create your first event to get started' : `No ${eventFilter} events found`}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => {
            const salesPercentage = Math.round((event.attendees / event.capacity) * 100);
            const isUpcoming = new Date(event.date) > new Date();
            
            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                              {isUpcoming ? 'Upcoming' : 'Past'}
                            </Badge>
                            <Badge 
                              variant={salesPercentage < 30 ? 'destructive' : salesPercentage < 70 ? 'secondary' : 'default'}
                            >
                              {salesPercentage}% sold
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees}/{event.capacity} attendees</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-semibold">${(event.price * event.attendees).toLocaleString()}</span>
                          </div>
                          <Progress value={salesPercentage} className="flex-1 max-w-32" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedEventForManagement(event)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onViewEvent(event)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTicketsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {analytics.totalCapacity.toLocaleString()} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.salesConversionRate}%</div>
            <p className="text-xs text-muted-foreground">Sales to capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Ticket Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageTicketPrice}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Sales by Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizerEvents.slice(0, 5).map((event, index) => {
                const percentage = (event.attendees / analytics.totalTicketsSold) * 100;
                return (
                  <div key={event.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{event.title}</span>
                      <span>{event.attendees} tickets</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Conference', 'Workshop', 'Festival', 'Sports'].map((category, index) => {
                const categoryEvents = organizerEvents.filter(e => e.category === category);
                const categoryRevenue = categoryEvents.reduce((sum, e) => sum + (e.price * e.attendees), 0);
                const percentage = analytics.totalRevenue > 0 ? (categoryRevenue / analytics.totalRevenue) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>${categoryRevenue.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Audience Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Age Groups</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>18-25</span>
                  <span>32%</span>
                </div>
                <Progress value={32} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>26-35</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>36-50</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Gender</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Female</span>
                  <span>58%</span>
                </div>
                <Progress value={58} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Male</span>
                  <span>42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Location</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>San Francisco</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Bay Area</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Other</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Ticket Management Tab
  const TicketManagementTab = () => (
    <div className="space-y-6">
      {/* Ticket Tiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Tiers</CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Tier
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketTiers.map((tier) => (
            <div key={tier.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${tier.price}</div>
                  <div className="text-sm text-muted-foreground">
                    {tier.sold}/{tier.quantity} sold
                  </div>
                </div>
              </div>
              
              <Progress value={(tier.sold / tier.quantity) * 100} className="h-2" />
              
              <div className="flex flex-wrap gap-1">
                {tier.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Promo Codes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Promo Codes</CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Code
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-lg">{promo.code}</div>
                  <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={promo.isActive} />
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Discount: </span>
                  <span className="font-semibold">
                    {promo.type === 'percentage' ? `${promo.discount}%` : `$${promo.discount}`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Used: </span>
                  <span className="font-semibold">{promo.used}/{promo.usageLimit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires: </span>
                  <span className="font-semibold">{new Date(promo.expiryDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <Progress value={(promo.used / promo.usageLimit) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Check-in Tools Tab
  const CheckInTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Event Check-in Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Generator */}
          <div className="border rounded-lg p-6 text-center space-y-4">
            <div className="w-32 h-32 bg-muted rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Event Check-in QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use this QR code for quick attendee check-in at your event venue
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Check-in Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">234</div>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">45</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">No Show</p>
              </CardContent>
            </Card>
          </div>

          {/* Check-in Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <QrCode className="w-6 h-6" />
                Scan QR Code
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Search className="w-6 h-6" />
                Manual Check-in
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Download className="w-6 h-6" />
                Export List
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <RefreshCw className="w-6 h-6" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Dashboard for Organizers
  const OrganizerDashboard = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Check-in
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventManagementTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketManagementTab />
        </TabsContent>

        <TabsContent value="checkin">
          <CheckInTab />
        </TabsContent>
      </Tabs>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={onCreateEvent}
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {userType === 'organizer' ? 'Event Management Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {userType === 'organizer' 
            ? 'Manage your events, analyze performance, and track sales' 
            : 'View your tickets and upcoming events'
          }
        </p>
      </div>

      {userType === 'organizer' ? <OrganizerDashboard /> : <UserDashboard />}
    </div>
  );
}