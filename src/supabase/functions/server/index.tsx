import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Auth helper function
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Sign up route
app.post('/make-server-f69ab98e/signup', async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json()
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        user_type: userType 
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString()
    })

    return c.json({ 
      user: data.user,
      message: 'User created successfully' 
    })
  } catch (error) {
    console.log('Server error during signup:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user profile
app.get('/make-server-f69ab98e/profile', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all events
app.get('/make-server-f69ab98e/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ events: events.map(e => e.value) });
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single event
app.get('/make-server-f69ab98e/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    return c.json({ event });
  } catch (error) {
    console.log('Error fetching event:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create event (organizers only)
app.post('/make-server-f69ab98e/events', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'organizer') {
      return c.json({ error: 'Only organizers can create events' }, 403);
    }

    const eventData = await c.req.json();
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      ...eventData,
      organizerId: user.id,
      organizer: userProfile.name,
      attendees: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`event:${eventId}`, event);
    
    return c.json({ event, message: 'Event created successfully' });
  } catch (error) {
    console.log('Error creating event:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update event (organizer only)
app.put('/make-server-f69ab98e/events/:id', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    if (event.organizerId !== user.id) {
      return c.json({ error: 'Only the event organizer can update this event' }, 403);
    }

    const updateData = await c.req.json();
    const updatedEvent = {
      ...event,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`event:${eventId}`, updatedEvent);
    
    return c.json({ event: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.log('Error updating event:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Purchase tickets
app.post('/make-server-f69ab98e/tickets/purchase', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'user') {
      return c.json({ error: 'Only attendees can purchase tickets' }, 403);
    }

    const { eventId, quantity, buyerInfo, paymentInfo } = await c.req.json();
    
    if (!eventId || !quantity || quantity < 1) {
      return c.json({ error: 'Invalid purchase data' }, 400);
    }

    // Get event and check availability
    const event = await kv.get(`event:${eventId}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const availableTickets = event.capacity - event.attendees;
    if (quantity > availableTickets) {
      return c.json({ error: 'Not enough tickets available' }, 400);
    }

    // Create ticket purchase record
    const ticketId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ticket = {
      id: ticketId,
      eventId,
      userId: user.id,
      quantity,
      totalPrice: event.price * quantity,
      buyerInfo,
      purchaseDate: new Date().toISOString(),
      status: 'confirmed'
    };

    // Update event attendees count
    const updatedEvent = {
      ...event,
      attendees: event.attendees + quantity,
      updatedAt: new Date().toISOString()
    };

    // Save both ticket and updated event
    await kv.mset([
      [`ticket:${ticketId}`, ticket],
      [`event:${eventId}`, updatedEvent],
      [`user_ticket:${user.id}:${ticketId}`, ticket]
    ]);

    return c.json({ 
      ticket, 
      event: updatedEvent, 
      message: 'Tickets purchased successfully' 
    });
  } catch (error) {
    console.log('Error purchasing tickets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's tickets
app.get('/make-server-f69ab98e/tickets', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userTickets = await kv.getByPrefix(`user_ticket:${user.id}:`);
    const tickets = userTickets.map(t => t.value);

    return c.json({ tickets });
  } catch (error) {
    console.log('Error fetching user tickets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get organizer's events
app.get('/make-server-f69ab98e/organizer/events', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'organizer') {
      return c.json({ error: 'Only organizers can access this endpoint' }, 403);
    }

    const allEvents = await kv.getByPrefix('event:');
    const organizerEvents = allEvents
      .map(e => e.value)
      .filter(event => event.organizerId === user.id);

    return c.json({ events: organizerEvents });
  } catch (error) {
    console.log('Error fetching organizer events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get dashboard stats
app.get('/make-server-f69ab98e/dashboard/stats', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    if (userProfile.userType === 'organizer') {
      // Organizer stats
      const allEvents = await kv.getByPrefix('event:');
      const organizerEvents = allEvents
        .map(e => e.value)
        .filter(event => event.organizerId === user.id);

      const totalEvents = organizerEvents.length;
      const totalAttendees = organizerEvents.reduce((sum, event) => sum + event.attendees, 0);
      const totalRevenue = organizerEvents.reduce((sum, event) => sum + (event.price * event.attendees), 0);

      return c.json({
        userType: 'organizer',
        stats: { totalEvents, totalAttendees, totalRevenue }
      });
    } else {
      // User stats
      const userTickets = await kv.getByPrefix(`user_ticket:${user.id}:`);
      const tickets = userTickets.map(t => t.value);
      
      const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
      const totalSpent = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
      
      // Get events for upcoming count
      const allEvents = await kv.getByPrefix('event:');
      const events = allEvents.map(e => e.value);
      const userEventIds = tickets.map(t => t.eventId);
      const upcomingEvents = events.filter(event => 
        userEventIds.includes(event.id) && new Date(event.date) > new Date()
      ).length;

      return c.json({
        userType: 'user',
        stats: { totalTickets, upcomingEvents, totalSpent }
      });
    }
  } catch (error) {
    console.log('Error fetching dashboard stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Search events
app.get('/make-server-f69ab98e/events/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const category = c.req.query('category') || 'All';
    
    const allEvents = await kv.getByPrefix('event:');
    let events = allEvents.map(e => e.value);

    // Filter by search query
    if (query) {
      events = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      events = events.filter(event => event.category === category);
    }

    return c.json({ events });
  } catch (error) {
    console.log('Error searching events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-f69ab98e/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Initialize some sample data if none exists
app.post('/make-server-f69ab98e/init-sample-data', async (c) => {
  try {
    const existingEvents = await kv.getByPrefix('event:');
    
    if (existingEvents.length === 0) {
      const sampleEvents = [
        {
          id: 'sample-1',
          title: 'Tech Innovation Conference 2025',
          description: 'Join leading tech innovators and entrepreneurs for a day of groundbreaking insights, networking, and the latest in technology trends.',
          date: '2025-10-15',
          time: '09:00',
          location: 'Silicon Valley Convention Center',
          price: 299,
          capacity: 500,
          attendees: 0,
          category: 'Conference',
          image: 'https://images.unsplash.com/photo-1571645163064-77faa9676a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwbmV0d29ya2luZyUyMGV2ZW50fGVufDF8fHx8MTc1ODE5OTEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          organizer: 'TechEvents Inc.',
          organizerId: 'sample-organizer-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          title: 'Summer Music Festival',
          description: 'Experience three days of incredible live music featuring top artists from around the world in a beautiful outdoor setting.',
          date: '2025-07-20',
          time: '15:00',
          location: 'Golden Gate Park, San Francisco',
          price: 150,
          capacity: 5000,
          attendees: 0,
          category: 'Festival',
          image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NTgxOTExNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          organizer: 'MusicFest Productions',
          organizerId: 'sample-organizer-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-3',
          title: 'Digital Marketing Workshop',
          description: 'Master the latest digital marketing strategies and tools. Perfect for entrepreneurs, marketers, and business owners.',
          date: '2025-09-12',
          time: '10:00',
          location: 'Downtown Business Center',
          price: 89,
          capacity: 50,
          attendees: 0,
          category: 'Workshop',
          image: 'https://images.unsplash.com/photo-1733758283615-224f76ab0792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTgyNjgzNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          organizer: 'Marketing Pros Academy',
          organizerId: 'sample-organizer-3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const event of sampleEvents) {
        await kv.set(`event:${event.id}`, event);
      }

      return c.json({ message: 'Sample data initialized successfully' });
    }

    return c.json({ message: 'Sample data already exists' });
  } catch (error) {
    console.log('Error initializing sample data:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch)