import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { EventCard, Event } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { Dashboard } from './components/Dashboard';
import { Tickets } from './components/Tickets';
import { TicketVerification } from './components/TicketVerification';
import { Profile } from './components/Profile';
import { Help } from './components/Help';
import { OrganizerHome } from './components/OrganizerHome';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Calendar, MapPin, Search, Sparkles, TrendingUp, Users, Loader2, Home } from 'lucide-react';
import { toast } from 'sonner';
import { api } from './utils/supabase/client';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import tickoraLogo from 'figma:asset/3fdeb8fc2454f72234488e708b9894663f874e30.png';

export default function App() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userType: null as 'user' | 'organizer' | null,
  });
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email: string;
    userType: string;
    accessToken: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [purchaseEvent, setPurchaseEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [userTickets, setUserTickets] = useState<Array<{
    id: string;
    eventId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
    buyerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    purchaseDate: string;
  }>>([]);

  // Destructure auth state for easier access
  const { isLoggedIn, userType } = authState;

  const categories = ['All', 'Conference', 'Workshop', 'Festival', 'Sports', 'Art & Culture', 'Food & Drink', 'Networking', 'Other'];

  const transformEvents = useCallback((rawEvents: any[] = []): Event[] => {
    return rawEvents.map((event: any) => ({
      ...event,
      organizer: event.organizers?.organization_name || event.organizer || 'Unknown Organization',
      organizer_id: event.organizer_id,
    }));
  }, []);

  // Initialize app with sample data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data on the server
        await api.initSampleData();
        
        // Get events from server
        const result = await api.getEvents();
        if (result.events) {
          // Transform events to match Event interface
          const transformedEvents = transformEvents(result.events);
          setEvents(transformedEvents);
        } else {
          // No events available
          setEvents([]);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // No fallback data - start with empty events
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Simulate loading time
    setTimeout(initializeApp, 1000);
  }, [transformEvents]);

  // Load user tickets and organizer events when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && userProfile?.accessToken) {
        try {
          // Load tickets for all users
          console.log('Loading user tickets...');
          const ticketsResponse = await api.getUserTickets(userProfile.accessToken);
          console.log('Full tickets response:', JSON.stringify(ticketsResponse, null, 2));
          
          // Handle different response formats
          let ticketsList: any[] = [];
          
          if (ticketsResponse.tickets && Array.isArray(ticketsResponse.tickets)) {
            ticketsList = ticketsResponse.tickets;
            console.log('Tickets from response.tickets:', ticketsList);
          } else if (Array.isArray(ticketsResponse)) {
            ticketsList = ticketsResponse;
            console.log('Tickets from array response:', ticketsList);
          } else if (ticketsResponse.data && Array.isArray(ticketsResponse.data)) {
            ticketsList = ticketsResponse.data;
            console.log('Tickets from response.data:', ticketsList);
          }
          
          // Transform database response to match UI expectations
          const transformedTickets = ticketsList.map((ticket: any) => ({
            id: ticket.id,
            eventId: ticket.event_id,
            quantity: ticket.quantity,
            totalPrice: ticket.total_price,
            status: ticket.status || 'confirmed',
            buyerInfo: typeof ticket.buyer_info === 'string' 
              ? JSON.parse(ticket.buyer_info) 
              : (ticket.buyer_info || { name: '', email: '', phone: '' }),
            purchaseDate: ticket.purchase_date || new Date().toISOString(),
          }));
          
          console.log('Transformed tickets:', transformedTickets);
          
          if (transformedTickets.length > 0) {
            console.log('Setting user tickets:', transformedTickets);
            setUserTickets(transformedTickets);
          } else {
            console.log('No tickets found');
            setUserTickets([]);
          }
          
          if (ticketsResponse.error) {
            console.error('Error loading tickets:', ticketsResponse.error);
          }

          // Load organizer events if user is an organizer
          if (userType === 'organizer') {
            console.log('Loading organizer events...');
            const orgEventsResponse = await api.getOrganizerEvents(userProfile.accessToken);
            console.log('Organizer events response:', JSON.stringify(orgEventsResponse, null, 2));
            
            let organizerEventsList: any[] = [];
            
            if (orgEventsResponse.events && Array.isArray(orgEventsResponse.events)) {
              organizerEventsList = orgEventsResponse.events;
              console.log('Events from response.events:', organizerEventsList);
            } else if (Array.isArray(orgEventsResponse)) {
              organizerEventsList = orgEventsResponse;
              console.log('Events from array response:', organizerEventsList);
            } else if (orgEventsResponse.data && Array.isArray(orgEventsResponse.data)) {
              organizerEventsList = orgEventsResponse.data;
              console.log('Events from response.data:', organizerEventsList);
            }
            
            console.log('Setting organizer events:', organizerEventsList);
            setEvents(organizerEventsList);
          } else {
            console.log('Loading public events for attendee...');
            const publicEventsResponse = await api.getEvents();

            let publicEvents: any[] = [];
            if (publicEventsResponse.events && Array.isArray(publicEventsResponse.events)) {
              publicEvents = publicEventsResponse.events;
            } else if (Array.isArray(publicEventsResponse)) {
              publicEvents = publicEventsResponse;
            } else if (publicEventsResponse.data && Array.isArray(publicEventsResponse.data)) {
              publicEvents = publicEventsResponse.data;
            }

            setEvents(transformEvents(publicEvents));
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
    };

    loadUserData();
  }, [isLoggedIn, userProfile?.accessToken, userType, transformEvents]);

  // Memoize filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      // Safety check for event object
      if (!event) return false;
      
      // Filter out past events - only show upcoming events
      const eventDate = new Date(event.date);
      if (eventDate < now) return false;
      
      const matchesSearch = searchQuery === '' || 
        (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || (event.category && event.category === categoryFilter);
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  const handleLogin = useCallback(async (type: 'user' | 'organizer', email: string, password: string) => {
    try {
      console.log('Attempting login with:', { type, email, password: '***' });
      
      const result = await api.signin({ email, password });
      console.log('Login result:', result);
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }

      // Check if user type matches what they selected (database uses user_type with underscore)
      const userType = result.profile?.user_type || result.profile?.userType;
      if (result.profile && userType !== type) {
        toast.error(`This account is registered as ${userType === 'organizer' ? 'Event Organizer' : 'Event Attendee'}`);
        return false;
      }
      
      // Ensure we have a valid access token
      if (!result.session?.access_token) {
        console.error('No access token in login response:', result);
        toast.error('Failed to get session token');
        return false;
      }
      
      setAuthState({
        isLoggedIn: true,
        userType: type,
      });
      
      if (result.profile) {
        setUserProfile({
          id: result.user?.id || 'temp-id',
          name: result.profile.name,
          email: result.profile.email,
          userType: userType as 'user' | 'organizer',
          accessToken: result.session.access_token
        });
        
        toast.success(`Welcome back, ${result.profile.name}!`);
      } else {
        console.error('No profile in login response');
        toast.error('User profile not found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name: string, userType: 'user' | 'organizer') => {
    try {
      console.log('Attempting signup with:', { email, name, userType, password: '***' });
      
      const result = await api.signup({ email, password, name, userType });
      console.log('Signup result:', result);
      
      if (result.error) {
        toast.error(result.error);
        
        // If error mentions "successfully" or 201, account was created but auto-login failed
        if (result.error.includes('successfully') || result.error.includes('created')) {
          toast.info('Please log in with your new credentials');
          // Return true to close signup dialog, but don't set user as logged in
          return true;
        }
        return false;
      }
      
      // Ensure we have a valid session with access token
      if (!result.session?.access_token) {
        console.error('No session/access_token in signup response:', result);
        // Account was created, but auto-login failed
        toast.success(`Account created, ${name}! Please log in with your credentials.`);
        return true; // Close the dialog
      }
      
      // Set auth state to log the user in after successful signup
      setAuthState({
        isLoggedIn: true,
        userType: userType,
      });
      
      if (result.user) {
        setUserProfile({
          id: result.user.id,
          name: name,
          email: email,
          userType: userType,
          accessToken: result.session.access_token
        });
        
        toast.success(`Welcome to Tickora, ${name}! Your account has been created successfully.`);
      } else {
        console.error('No user object in signup response');
        toast.error('Account created but could not log in');
        return true; // Close the dialog
      }
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthState({
      isLoggedIn: false,
      userType: null,
    });
    setUserProfile(null);
    setUserTickets([]);
    navigate('/');
    toast.success('Signed out successfully');
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    navigate('/');
  }, [navigate]);

  const handleShowHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleShowTickets = useCallback(() => {
    navigate('/tickets');
  }, [navigate]);

  const handleShowProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleShowHelp = useCallback(() => {
    navigate('/help');
  }, [navigate]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('All');
  }, []);

  const handleViewEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const handleBuyTicket = useCallback((event: Event) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to purchase tickets');
      return;
    }
    if (userType !== 'user') {
      toast.error('Only event attendees can purchase tickets');
      return;
    }
    setPurchaseEvent(event);
  }, [isLoggedIn, userType]);

  const handlePurchaseComplete = useCallback(async (eventId: string, quantity: number, buyerInfo: any, paymentInfo: any) => {
    try {
      if (!userProfile?.accessToken) {
        toast.error('Please log in to purchase tickets');
        return;
      }

      // Call backend API to purchase tickets
      const ticketData = {
        eventId,
        quantity,
        buyerInfo: {
          name: buyerInfo.name,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
        }
      };

      const response = await api.purchaseTickets(ticketData, userProfile.accessToken);
      
      if (response.error) {
        toast.error(response.error || 'Failed to purchase tickets');
        return;
      }

      // Refresh user tickets from backend
      const ticketsResponse = await api.getUserTickets(userProfile.accessToken);
      console.log('Purchase: Full tickets response:', JSON.stringify(ticketsResponse, null, 2));
      
      // Handle different response formats
      let ticketsList: any[] = [];
      
      if (ticketsResponse.tickets && Array.isArray(ticketsResponse.tickets)) {
        ticketsList = ticketsResponse.tickets;
        console.log('Purchase: Tickets from response.tickets:', ticketsList);
      } else if (Array.isArray(ticketsResponse)) {
        ticketsList = ticketsResponse;
        console.log('Purchase: Tickets from array response:', ticketsList);
      } else if (ticketsResponse.data && Array.isArray(ticketsResponse.data)) {
        ticketsList = ticketsResponse.data;
        console.log('Purchase: Tickets from response.data:', ticketsList);
      }
      
      // Transform database response to match UI expectations
      const transformedTickets = ticketsList.map((ticket: any) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        quantity: ticket.quantity,
        totalPrice: ticket.total_price,
        status: ticket.status || 'confirmed',
        buyerInfo: typeof ticket.buyer_info === 'string' 
          ? JSON.parse(ticket.buyer_info) 
          : (ticket.buyer_info || { name: '', email: '', phone: '' }),
        purchaseDate: ticket.purchase_date || new Date().toISOString(),
      }));
      
      console.log('Purchase: Transformed tickets:', transformedTickets);
      
      if (transformedTickets.length > 0) {
        console.log('Purchase: Setting user tickets:', transformedTickets);
        setUserTickets(transformedTickets);
      } else {
        console.log('Purchase: No tickets found');
        setUserTickets([]);
      }

      // Show success popup
      toast.success(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      
      // Close modal
      setPurchaseEvent(null);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      toast.error('Failed to purchase tickets. Please try again.');
    }
  }, [userProfile]);

  const handleCreateEvent = useCallback(async (eventData: any) => {
    if (!isLoggedIn || userType !== 'organizer') {
      toast.error('Only organizers can create events');
      return;
    }

    // Add the event to the local state (it was already saved to database by CreateEventModal)
    setEvents(prev => [eventData, ...prev]);
    toast.success('Event created successfully!');
  }, [isLoggedIn, userType]);

  // Memoize expensive calculations
  const upcomingEvents = useMemo(() => 
    events.filter(event => new Date(event.date) > new Date()).slice(0, 3), 
    [events]
  );
  
  const featuredEvents = useMemo(() => 
    events.filter(event => event.attendees > event.capacity * 0.5).slice(0, 4), 
    [events]
  );

  const HeroSection = () => (
    <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* <div className="flex justify-center mb-8">
            <ImageWithFallback 
              src={tickoraLogo} 
              alt="Tickora - Event Ticketing Platform" 
              className="h-24 w-auto"
            />
          </div> */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Discover Amazing <span className="text-primary">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find and book tickets for the best events in your area. From conferences to concerts, 
            workshops to festivals - your next great experience awaits.
          </p>
          
          <SearchBar 
            onSearch={handleSearch}
            className="max-w-2xl mx-auto pt-8"
          />

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.slice(1, 7).map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const StatsSection = () => (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center text-primary mb-2">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold">{events.length}+</div>
            <p className="text-muted-foreground">Events Available</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center text-primary mb-2">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold">
              {events.reduce((sum, event) => sum + event.attendees, 0).toLocaleString()}+
            </div>
            <p className="text-muted-foreground">Happy Attendees</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center text-primary mb-2">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold">15+</div>
            <p className="text-muted-foreground">Cities Covered</p>
          </div>
         
        </div>
      </div>
    </section>
  );

  const HomeView = () => {
    const showResetButton = searchQuery.trim() !== '' || categoryFilter !== 'All';

    return (
      <div>
        <HeroSection />
        <StatsSection />

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">Featured Events</h2>
                <Badge variant="secondary" className="ml-2">Popular</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewEvent}
                    onBuyTicket={handleBuyTicket}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Events */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'All Events'}
                </h2>
                <p className="text-muted-foreground">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                {showResetButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="whitespace-nowrap"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Back to All Events
                  </Button>
                )}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={handleResetFilters}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to All Events
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewEvent}
                    onBuyTicket={handleBuyTicket}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Tickora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userType={userType}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
        onShowDashboard={() => navigate('/dashboard')}
        onShowHome={handleShowHome}
        onShowTickets={handleShowTickets}
        onShowProfile={handleShowProfile}
        onShowHelp={handleShowHelp}
      />

      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn && userType === 'organizer' ? (
                <OrganizerHome
                  events={events}
                  onCreateEvent={handleCreateEvent}
                  onViewEvent={handleViewEvent}
                  onShowDashboard={() => navigate('/dashboard')}
                  accessToken={userProfile?.accessToken}
                />
              ) : (
                <HomeView />
              )
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard
                userType={userType!}
                userProfile={userProfile}
                events={events}
                userTickets={userTickets}
                onCreateEvent={handleCreateEvent}
                onViewEvent={handleViewEvent}
              />
            }
          />
          <Route 
            path="/tickets" 
            element={
              <Tickets
                events={events}
                userTickets={userTickets}
                onViewEvent={handleViewEvent}
                onBrowseEvents={handleShowHome}
              />
            }
          />
          <Route 
            path="/profile" 
            element={
              <Profile
                userType={userType!}
                userTickets={userTickets}
                userProfile={userProfile}
                onDeleteAccount={handleLogout}
              />
            }
          />
          <Route 
            path="/help" 
            element={
              <Help
                userType={userType!}
              />
            }
          />
          <Route
            path="/verify-ticket"
            element={<TicketVerification />}
          />
        </Routes>
      </main>

      <Footer />

      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onBuyTicket={handleBuyTicket}
        userType={userType}
      />

      <TicketPurchaseModal
        event={purchaseEvent}
        isOpen={!!purchaseEvent}
        onClose={() => setPurchaseEvent(null)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}