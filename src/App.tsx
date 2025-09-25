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
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import tickoraLogo from 'figma:asset/3fdeb8fc2454f72234488e708b9894663f874e30.png';

// Sample events data - moved outside component to prevent re-renders
const sampleEvents: Event[] = [
    {
      id: 'sample-1',
      title: 'Tech Summit 2025: AI & Innovation',
      description: 'Join industry leaders, researchers, and entrepreneurs for an inspiring conference exploring the latest in artificial intelligence, machine learning, and cutting-edge technology. Features keynotes, panel discussions, networking sessions, and hands-on workshops.',
      date: '2025-10-15',
      time: '09:00',
      location: 'San Francisco Convention Center',
      price: 299,
      capacity: 500,
      attendees: 387,
      category: 'Conference',
      image: 'https://images.unsplash.com/photo-1600320261634-78edd477fa1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHNwZWFrZXJzfGVufDF8fHx8MTc1ODI3MDA1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'TechVision Events'
    },
    {
      id: 'sample-2',
      title: 'Culinary Masterclass: Italian Cuisine',
      description: 'Learn authentic Italian cooking techniques from Chef Marco Rossi. Make fresh pasta, traditional sauces, and classic desserts in this hands-on cooking workshop. All ingredients and equipment provided.',
      date: '2025-10-18',
      time: '14:00',
      location: 'Culinary Arts Studio, Downtown',
      price: 85,
      capacity: 16,
      attendees: 14,
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1701775696323-57c5e7640185?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwd29ya3Nob3AlMjBoYW5kc3xlbnwxfHx8fDE3NTgyNzAwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Culinary Adventures'
    },
    {
      id: 'sample-3',
      title: 'Harmony Music Festival',
      description: 'Three days of incredible music featuring indie bands, electronic artists, and folk musicians. Food trucks, art installations, and camping available. An unforgettable experience for music lovers.',
      date: '2025-10-25',
      time: '16:00',
      location: 'Golden Gate Park, San Francisco',
      price: 150,
      capacity: 8000,
      attendees: 6200,
      category: 'Festival',
      image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzU4MjUwNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Harmony Productions'
    },
    {
      id: 'sample-4',
      title: 'Lakers vs Warriors - Season Opener',
      description: 'Don\'t miss the highly anticipated season opener! Watch two of the NBA\'s biggest teams battle it out in what promises to be an electrifying game. Premium seating and concessions available.',
      date: '2025-10-22',
      time: '19:30',
      location: 'Chase Center, San Francisco',
      price: 125,
      capacity: 18064,
      attendees: 18064,
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1616353352910-15d970ac020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBiYXNrZXRiYWxsJTIwZ2FtZXxlbnwxfHx8fDE3NTgyNzAwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'NBA Events'
    },
    {
      id: 'sample-5',
      title: 'Modern Art Exhibition: Urban Perspectives',
      description: 'Explore contemporary urban art from emerging artists worldwide. Interactive installations, digital art, and traditional paintings that capture the essence of modern city life. Guided tours available.',
      date: '2025-10-30',
      time: '10:00',
      location: 'Museum of Modern Art',
      price: 25,
      capacity: 200,
      attendees: 87,
      category: 'Art & Culture',
      image: 'https://images.unsplash.com/photo-1713779490284-a81ff6a8ffae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwZXhoaWJpdGlvbnxlbnwxfHx8fDE3NTgyNTg3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Modern Art Society'
    },
    {
      id: 'sample-6',
      title: 'Wine & Cheese Tasting Evening',
      description: 'Savor carefully curated wines paired with artisanal cheeses from local producers. Learn about wine selection, tasting techniques, and perfect pairing combinations from our sommelier.',
      date: '2025-11-02',
      time: '18:30',
      location: 'Napa Valley Tasting Room',
      price: 65,
      capacity: 40,
      attendees: 32,
      category: 'Food & Drink',
      image: 'https://images.unsplash.com/photo-1681219916726-036039b9b20d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwd2luZSUyMHRhc3Rpbmd8ZW58MXx8fHwxNzU4MjcwMDczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Vineyard Experiences'
    },
    {
      id: 'sample-7',
      title: 'Startup Networking Mixer',
      description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Perfect for finding co-founders, learning about new opportunities, and building valuable professional relationships. Light refreshments provided.',
      date: '2025-11-05',
      time: '17:00',
      location: 'WeWork, SOMA District',
      price: 0,
      capacity: 80,
      attendees: 45,
      category: 'Networking',
      image: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudHxlbnwxfHx8fDE3NTgxNzQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'SF Startup Community'
    },
    {
      id: 'sample-8',
      title: 'Morning Yoga & Meditation Retreat',
      description: 'Start your day with peaceful yoga practice and guided meditation in a serene outdoor setting. All levels welcome. Includes light breakfast and take-home wellness kit.',
      date: '2025-11-08',
      time: '07:00',
      location: 'Golden Gate Park Pavilion',
      price: 35,
      capacity: 50,
      attendees: 28,
      category: 'Other',
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwZml0bmVzcyUyMGNsYXNzfGVufDF8fHx8MTc1ODI3MDA3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Mindful Living Collective'
    },
    {
      id: 'sample-9',
      title: 'Startup Pitch Competition',
      description: 'Watch innovative startups present their ideas to a panel of investors and industry experts. Network with entrepreneurs and potentially discover the next big thing. Prizes awarded to top pitches.',
      date: '2025-11-12',
      time: '18:00',
      location: 'Innovation Hub, Palo Alto',
      price: 20,
      capacity: 150,
      attendees: 89,
      category: 'Conference',
      image: 'https://images.unsplash.com/photo-1563807893646-b6598a2b6fdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwcGl0Y2glMjBjb21wZXRpdGlvbnxlbnwxfHx8fDE3NTgyMTU1NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Silicon Valley Entrepreneurs'
    },
    {
      id: 'sample-10',
      title: 'Photography Workshop: Street Photography',
      description: 'Master the art of street photography with professional photographer Sarah Chen. Learn composition, lighting, and storytelling techniques. Camera equipment provided for beginners.',
      date: '2025-11-15',
      time: '10:00',
      location: 'Mission District, San Francisco',
      price: 75,
      capacity: 12,
      attendees: 9,
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1486892539609-d5322f938c50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMHdvcmtzaG9wJTIwY2FtZXJhfGVufDF8fHx8MTc1ODE5MDQwNXww&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'Visual Arts Academy'
    },
    {
      id: 'sample-11',
      title: 'Shakespeare in the Park: Hamlet',
      description: 'Experience Shakespeare\'s masterpiece performed by acclaimed theater company under the stars. Bring blankets and enjoy this free outdoor performance. Food vendors available on-site.',
      date: '2025-11-18',
      time: '19:00',
      location: 'Presidio Park Amphitheater',
      price: 0,
      capacity: 300,
      attendees: 156,
      category: 'Art & Culture',
      image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTgyNDg3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'SF Theater Collective'
    },
    {
      id: 'sample-12',
      title: 'San Francisco Marathon',
      description: 'Join runners from around the world in this iconic marathon through the beautiful streets of San Francisco. Multiple distance options available including 5K, 10K, half marathon, and full marathon.',
      date: '2025-11-22',
      time: '06:30',
      location: 'Golden Gate Bridge Start Line',
      price: 95,
      capacity: 5000,
      attendees: 3200,
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1591078393633-eb8a3c88b83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJhdGhvbiUyMHJ1bm5pbmclMjByYWNlfGVufDF8fHx8MTc1ODI3MDA5NHww&ixlib=rb-4.1.0&q=80&w=1080',
      organizer: 'SF Marathon Association'
    }
  ];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'tickets' | 'profile' | 'help'>('home');
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userType: null as 'user' | 'organizer' | null,
  });
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
    const initializeApp = () => {
      setEvents(sampleEvents);
      setLoading(false);
    };

    // Simulate loading time
    setTimeout(initializeApp, 1000);
  }, []);

  // Memoize filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  const handleLogin = useCallback(async (type: 'user' | 'organizer', email: string, password: string) => {
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAuthState({
      isLoggedIn: true,
      userType: type,
    });
    
    toast.success(`Welcome! Signed in as ${type === 'organizer' ? 'Event Organizer' : 'Event Attendee'}`);
    return true;
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name: string, userType: 'user' | 'organizer') => {
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set auth state to log the user in after successful signup
    setAuthState({
      isLoggedIn: true,
      userType: userType,
    });
    
    toast.success(`Welcome! Account created successfully as ${userType === 'organizer' ? 'Event Organizer' : 'Event Attendee'}`);
    return true;
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthState({
      isLoggedIn: false,
      userType: null,
    });
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
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
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