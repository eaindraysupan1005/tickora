import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { EventCard, Event } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { Dashboard } from './components/Dashboard';
import { Tickets } from './components/Tickets';
import { Profile } from './components/Profile';
import { Help } from './components/Help';
import { OrganizerHome } from './components/OrganizerHome';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Calendar, MapPin, Search, Sparkles, TrendingUp, Users, Loader2, Home } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from './utils/supabase/client';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import tickoraLogo from 'figma:asset/3fdeb8fc2454f72234488e708b9894663f874e30.png';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'tickets' | 'profile' | 'help'>('home');
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
  const [userTickets, setUserTickets] = useState<Array<{ eventId: string; quantity: number; purchaseDate: string }>>([]);

  // Destructure auth state for easier access
  const { isLoggedIn, userType } = authState;

  const categories = ['All', 'Conference', 'Workshop', 'Festival', 'Sports', 'Art & Culture', 'Food & Drink', 'Networking', 'Other'];

  // Initialize app with sample data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data on the server
        await api.initSampleData();
        
        // Get events from server
        const result = await api.getEvents();
        if (result.events) {
          setEvents(result.events);
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
  }, []);

  // Memoize filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === '' || 
        (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
      
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
          accessToken: result.session?.access_token || 'temp-token'
        });
        
        toast.success(`Welcome back, ${result.profile.name}!`);
      } else {
        // Temporary fallback for development
        setUserProfile({
          id: 'temp-id',
          name: email.split('@')[0],
          email: email,
          userType: type,
          accessToken: 'temp-token'
        });
        
        toast.success(`Welcome back!`);
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Temporary fallback for development - allow login with any credentials
      setAuthState({
        isLoggedIn: true,
        userType: type,
      });
      
      setUserProfile({
        id: 'temp-id',
        name: email.split('@')[0],
        email: email,
        userType: type,
        accessToken: 'temp-token'
      });
      
      toast.success(`Signed in as ${type === 'organizer' ? 'Event Organizer' : 'Event Attendee'} (Development Mode)`);
      return true;
    }
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name: string, userType: 'user' | 'organizer') => {
    try {
      console.log('Attempting signup with:', { email, name, userType, password: '***' });
      
      const result = await api.signup({ email, password, name, userType });
      console.log('Signup result:', result);
      
      if (result.error) {
        toast.error(result.error);
        return false;
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
          accessToken: result.user.id // Note: In real implementation, we'd get access token from auth
        });
        
        toast.success(`Welcome to Tickora, ${name}! Your account has been created successfully.`);
      } else {
        // Temporary fallback for development
        setUserProfile({
          id: 'temp-id-' + Date.now(),
          name: name,
          email: email,
          userType: userType,
          accessToken: 'temp-token'
        });
        
        toast.success(`Welcome to Tickora, ${name}! Account created in development mode.`);
      }
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Temporary fallback for development - allow signup with any data
      setAuthState({
        isLoggedIn: true,
        userType: userType,
      });
      
      setUserProfile({
        id: 'temp-id-' + Date.now(),
        name: name,
        email: email,
        userType: userType,
        accessToken: 'temp-token'
      });
      
      toast.success(`Welcome to Tickora, ${name}! Account created in development mode.`);
      return true;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthState({
      isLoggedIn: false,
      userType: null,
    });
    setUserProfile(null);
    setUserTickets([]);
    setCurrentView('home');
    toast.success('Signed out successfully');
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentView('home');
  }, []);

  const handleShowHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  const handleShowTickets = useCallback(() => {
    setCurrentView('tickets');
  }, []);

  const handleShowProfile = useCallback(() => {
    setCurrentView('profile');
  }, []);

  const handleShowHelp = useCallback(() => {
    setCurrentView('help');
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
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update event attendees
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: Math.min(event.attendees + quantity, event.capacity) }
        : event
    ));

    // Add to user tickets
    setUserTickets(prev => [
      ...prev,
      { eventId, quantity, purchaseDate: new Date().toISOString() }
    ]);

    toast.success(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
  }, []);

  const handleCreateEvent = useCallback(async (eventData: any) => {
    if (!isLoggedIn || userType !== 'organizer') {
      toast.error('Only organizers can create events');
      return;
    }

    // Simulate event creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      price: eventData.price,
      capacity: eventData.capacity,
      attendees: 0,
      category: eventData.category,
      image_url: eventData.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      organizer: 'Your Organization'
    };

    setEvents(prev => [newEvent, ...prev]);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
          <div className="space-y-2">
            <div className="flex items-center justify-center text-primary mb-2">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold">98%</div>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </section>
  );

  const HomeView = () => (
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
            
            <div className="flex gap-4">
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
              <Button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}>
                Clear Filters
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
        currentView={currentView}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
        onShowDashboard={() => setCurrentView('dashboard')}
        onShowHome={handleShowHome}
        onShowTickets={handleShowTickets}
        onShowProfile={handleShowProfile}
        onShowHelp={handleShowHelp}
      />

      <main>
        {currentView === 'home' && (
          isLoggedIn && userType === 'organizer' ? (
            <OrganizerHome
              events={events}
              onCreateEvent={handleCreateEvent}
              onViewEvent={handleViewEvent}
              onShowDashboard={() => setCurrentView('dashboard')}
              accessToken={userProfile?.accessToken}
            />
          ) : (
            <HomeView />
          )
        )}
        {currentView === 'dashboard' && (
          <Dashboard
            userType={userType!}
            events={events}
            userTickets={userTickets}
            onCreateEvent={handleCreateEvent}
            onViewEvent={handleViewEvent}
          />
        )}
        {currentView === 'tickets' && (
          <Tickets
            events={events}
            userTickets={userTickets}
            onViewEvent={handleViewEvent}
            onBrowseEvents={handleShowHome}
          />
        )}
        {currentView === 'profile' && (
          <Profile
            userType={userType!}
            userTickets={userTickets}
            userProfile={userProfile}
          />
        )}
        {currentView === 'help' && (
          <Help
            userType={userType!}
          />
        )}
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

      {/* Back to Home Button for non-home views */}
      {currentView !== 'home' && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setCurrentView('home')}
            size="lg"
            className="shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      )}
    </div>
  );
}