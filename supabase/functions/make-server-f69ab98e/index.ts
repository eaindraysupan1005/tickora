import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as db from './db.ts'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client for auth operations
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

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

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
      email_confirm: true
    })

    if (error) {
      console.log('Signup auth error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Create user record in database
    try {
      const user = await db.createUser(data.user.id, {
        name,
        email,
        userType,
      })

      // If organizer, create organizer profile
      if (userType === 'organizer') {
        await db.createOrganizer(user.id, {
          organizationName: `${name}'s Events`,
        })
      }

      return c.json({ 
        user,
        message: 'User created successfully' 
      })
    } catch (dbError) {
      console.log('Database error during signup:', dbError)
      // Clean up auth user if database operation fails
      await supabase.auth.admin.deleteUser(data.user.id)
      return c.json({ error: 'Failed to create user profile' }, 500)
    }
  } catch (error) {
    console.log('Server error during signup:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Sign in route
app.post('/make-server-f69ab98e/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('Signin error:', error)
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Get user profile from database
    try {
      const userProfile = await db.getUserByAuthId(data.user.id)
      
      if (!userProfile) {
        return c.json({ error: 'User profile not found' }, 404)
      }

      return c.json({ 
        user: data.user,
        session: data.session,
        profile: userProfile,
        message: 'Signed in successfully' 
      })
    } catch (dbError) {
      console.log('Database error during signin:', dbError)
      return c.json({ error: 'Failed to fetch user profile' }, 500)
    }
  } catch (error) {
    console.log('Server error during signin:', error)
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

    const profile = await db.getUserByAuthId(user.id);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user profile
app.put('/make-server-f69ab98e/profile', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    console.log('Received updates:', updates);
    
    // Only allow updating these specific fields
    const allowedFields = ['name', 'phone', 'location', 'bio', 'preferences'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    console.log('Filtered updates:', filteredUpdates);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data, error } = await supabaseClient
      .from('users')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.log('Error updating profile:', error);
      return c.json({ error: error.message || 'Failed to update profile', details: error }, 500);
    }
    
    return c.json({ profile: data, message: 'Profile updated successfully' });
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: 'Internal server error', details: error }, 500);
  }
});

// ============================================
// EVENT ENDPOINTS
// ============================================

// Get all active events
app.get('/make-server-f69ab98e/events', async (c) => {
  try {
    const events = await db.getActiveEvents();
    return c.json({ events });
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single event
app.get('/make-server-f69ab98e/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await db.getEventById(eventId);
    
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

    const userProfile = await db.getUserByAuthId(user.id);
    if (!userProfile || userProfile.user_type !== 'organizer') {
      return c.json({ error: 'Only organizers can create events' }, 403);
    }

    // Get organizer profile
    const organizer = await db.getOrganizerByUserId(userProfile.id);
    if (!organizer) {
      return c.json({ error: 'Organizer profile not found' }, 404);
    }

    const eventData = await c.req.json();
    console.log('Received event data:', eventData);
    const event = await db.createEvent(organizer.id, eventData);
    
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
    const event = await db.getEventById(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if user is the organizer
    const userProfile = await db.getUserByAuthId(user.id);
    const organizer = await db.getOrganizerByUserId(userProfile.id);
    
    if (event.organizer_id !== organizer?.id) {
      return c.json({ error: 'Only the event organizer can update this event' }, 403);
    }

    const updateData = await c.req.json();
    const updatedEvent = await db.updateEvent(eventId, updateData);
    
    return c.json({ event: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.log('Error updating event:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Search events
app.get('/make-server-f69ab98e/events/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const category = c.req.query('category') || 'All';
    
    const events = await db.searchEvents(query, category);

    return c.json({ events });
  } catch (error) {
    console.log('Error searching events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// TICKET ENDPOINTS
// ============================================

// Purchase tickets
app.post('/make-server-f69ab98e/tickets/purchase', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await db.getUserByAuthId(user.id);
    if (!userProfile || userProfile.user_type !== 'user') {
      return c.json({ error: 'Only attendees can purchase tickets' }, 403);
    }

    const { eventId, quantity, buyerInfo } = await c.req.json();
    
    if (!eventId || !quantity || quantity < 1) {
      return c.json({ error: 'Invalid purchase data' }, 400);
    }

    const event = await db.getEventById(eventId);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Create ticket
    const ticket = await db.createTicket({
      eventId,
      userId: userProfile.id,
      quantity,
      totalPrice: event.price * quantity,
      buyerInfo,
    });

    return c.json({ 
      ticket, 
      message: 'Tickets purchased successfully' 
    });
  } catch (error) {
    console.log('Error purchasing tickets:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});

// Get user's tickets
app.get('/make-server-f69ab98e/tickets', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await db.getUserByAuthId(user.id);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const tickets = await db.getTicketsByUserId(userProfile.id);

    return c.json({ tickets });
  } catch (error) {
    console.log('Error fetching user tickets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get event tickets (organizer only)
app.get('/make-server-f69ab98e/events/:id/tickets', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const event = await db.getEventById(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if user is the organizer
    const userProfile = await db.getUserByAuthId(user.id);
    const organizer = await db.getOrganizerByUserId(userProfile.id);
    
    if (event.organizer_id !== organizer?.id) {
      return c.json({ error: 'Only the event organizer can view these tickets' }, 403);
    }

    const tickets = await db.getTicketsByEventId(eventId);

    return c.json({ tickets });
  } catch (error) {
    console.log('Error fetching event tickets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// ORGANIZER ENDPOINTS
// ============================================

// Get organizer's events
app.get('/make-server-f69ab98e/organizer/events', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await db.getUserByAuthId(user.id);
    if (!userProfile || userProfile.user_type !== 'organizer') {
      return c.json({ error: 'Only organizers can access this endpoint' }, 403);
    }

    const organizer = await db.getOrganizerByUserId(userProfile.id);
    if (!organizer) {
      return c.json({ error: 'Organizer profile not found' }, 404);
    }

    const events = await db.getEventsByOrganizerWithJoin(organizer.id);

    return c.json({ events });
  } catch (error) {
    console.log('Error fetching organizer events:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

// Get dashboard stats
app.get('/make-server-f69ab98e/dashboard/stats', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await db.getUserByAuthId(user.id);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    if (userProfile.user_type === 'organizer') {
      // Organizer stats
      const organizer = await db.getOrganizerByUserId(userProfile.id);
      if (!organizer) {
        return c.json({ error: 'Organizer profile not found' }, 404);
      }

      const stats = await db.getOrganizerStats(organizer.id);

      return c.json({
        userType: 'organizer',
        stats,
      });
    } else {
      // User stats
      const stats = await db.getUserStats(userProfile.id);

      return c.json({
        userType: 'user',
        stats,
      });
    }
  } catch (error) {
    console.log('Error fetching dashboard stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// HEALTH & UTILITY ENDPOINTS
// ============================================

// Health check
app.get('/make-server-f69ab98e/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Initialize sample data
app.post('/make-server-f69ab98e/init-sample-data', async (c) => {
  try {
    const result = await db.initSampleData();
    return c.json(result);
  } catch (error) {
    console.log('Error initializing sample data:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch)
