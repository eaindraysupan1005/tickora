import { createClient } from 'npm:@supabase/supabase-js@2'

// Helper to create Supabase client
function createDBClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function createUser(authId: string, userData: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        auth_id: authId,
        name: userData.name,
        email: userData.email,
        user_type: userData.userType,
        phone: userData.phone || null,
        location: userData.location || null,
        bio: userData.bio || null,
        preferences: userData.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          eventReminders: true,
        },
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create user: ${error.message}`)
  return data
}

export async function getUserByAuthId(authId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`)
  }
  return data || null
}

export async function getUserById(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`)
  }
  return data || null
}

export async function updateUser(userId: string, updates: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update user: ${error.message}`)
  return data
}

export async function deleteUserAccount(authId: string) {
  const supabase = createDBClient()

  const { data: userRecord, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { userId: null }
    }
    throw new Error(`Failed to load user for deletion: ${fetchError.message}`)
  }

  if (!userRecord?.id) {
    return { userId: null }
  }

  // Remove related cached profile data from KV store if present
  const { error: kvError } = await supabase
    .from('kv_store_f69ab98e')
    .delete()
    .eq('key', `user:${authId}`)

  if (kvError && kvError.code !== 'PGRST116') {
    console.log('Warning deleting KV user cache:', kvError)
  }

  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userRecord.id)

  if (deleteError) {
    throw new Error(`Failed to delete user: ${deleteError.message}`)
  }

  return { userId: userRecord.id }
}

// ============================================
// ORGANIZER FUNCTIONS
// ============================================

export async function createOrganizer(userId: string, orgData: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .insert([
      {
        user_id: userId,
        organization_name: orgData.organizationName,
        organization_logo_url: orgData.logoUrl || null,
        website: orgData.website || null,
        social_links: orgData.socialLinks || {
          twitter: null,
          facebook: null,
          instagram: null,
          linkedin: null,
        },
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create organizer: ${error.message}`)
  return data
}

export async function getOrganizerByUserId(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get organizer: ${error.message}`)
  }
  return data || null
}

export async function getOrganizerById(organizerId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('id', organizerId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get organizer: ${error.message}`)
  }
  return data || null
}

// ============================================
// EVENT FUNCTIONS
// ============================================

export async function createEvent(organizerId: string, eventData: any) {
  const supabase = createDBClient()
  
  console.log('DB createEvent - Input data:', JSON.stringify(eventData, null, 2));
  
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        organizer_id: organizerId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        price: eventData.price,
        capacity: eventData.capacity,
        category: eventData.category,
        image_url: eventData.image_url || null,
        status: eventData.status || 'active',
        attendees: 0,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create event: ${error.message}`)
  
  console.log('DB createEvent - Created event:', JSON.stringify(data, null, 2));
  
  return data
}

export async function getEventById(eventId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, organizers(*, users(name, email))')
    .eq('id', eventId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get event: ${error.message}`)
  }
  return data || null
}

export async function getActiveEvents() {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, organizers(organization_name, website, users(name))')
    .eq('status', 'active')
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to get events: ${error.message}`)
  return data || []
}

export async function getEventsByOrganizerWithJoin(organizerId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to get organizer events: ${error.message}`)
  return data || []
}

export async function updateEvent(eventId: string, updates: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update event: ${error.message}`)
  return data
}

export async function searchEvents(query: string, category?: string) {
  const supabase = createDBClient()
  let queryBuilder = supabase
    .from('events')
    .select('*, organizers(organization_name, users(name))')
    .eq('status', 'active')

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
    )
  }

  if (category && category !== 'All') {
    queryBuilder = queryBuilder.eq('category', category)
  }

  const { data, error } = await queryBuilder.order('date', { ascending: true })

  if (error) throw new Error(`Failed to search events: ${error.message}`)
  return data || []
}

// ============================================
// TICKET FUNCTIONS
// ============================================

export async function createTicket(ticketData: any) {
  const supabase = createDBClient()

  // Get current event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', ticketData.eventId)
    .single()

  if (eventError || !event) throw new Error('Event not found')

  const availableTickets = event.capacity - event.attendees
  if (ticketData.quantity > availableTickets) {
    throw new Error('Not enough tickets available')
  }

  // Create ticket record
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert([
      {
        event_id: ticketData.eventId,
        user_id: ticketData.userId,
        quantity: ticketData.quantity,
        total_price: ticketData.totalPrice,
        status: 'confirmed',
        buyer_info: ticketData.buyerInfo || null,
      },
    ])
    .select()
    .single()

  if (ticketError) throw new Error(`Failed to create ticket: ${ticketError.message}`)

  // Update event attendees count
  const newAttendees = event.attendees + ticketData.quantity
  await updateEvent(ticketData.eventId, { attendees: newAttendees })

  return ticket
}

export async function getTicketsByUserId(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(*, organizers(organization_name))')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('purchase_date', { ascending: false })

  if (error) throw new Error(`Failed to get user tickets: ${error.message}`)
  return data || []
}

export async function getTicketsByEventId(eventId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*, users(name, email)')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('purchase_date', { ascending: false })

  if (error) throw new Error(`Failed to get event tickets: ${error.message}`)
  return data || []
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getOrganizerStats(organizerId: string) {
  const supabase = createDBClient()

  // Get organizer's events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)

  if (eventsError) throw new Error(`Failed to get organizer stats: ${eventsError.message}`)

  const totalEvents = events?.length || 0
  const totalAttendees = events?.reduce((sum: number, e: any) => sum + e.attendees, 0) || 0
  const totalRevenue = events?.reduce((sum: number, e: any) => sum + e.price * e.attendees, 0) || 0

  return { totalEvents, totalAttendees, totalRevenue }
}

export async function getUserStats(userId: string) {
  const supabase = createDBClient()

  // Get user's tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*, events(date)')
    .eq('user_id', userId)
    .eq('status', 'confirmed')

  if (ticketsError) throw new Error(`Failed to get user stats: ${ticketsError.message}`)

  const totalTickets = tickets?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0
  const totalSpent = tickets?.reduce((sum: number, t: any) => sum + t.total_price, 0) || 0
  const upcomingEvents =
    tickets?.filter((t: any) => new Date(t.events.date) > new Date()).length || 0

  return { totalTickets, totalSpent, upcomingEvents }
}

// ============================================
// INIT SAMPLE DATA
// ============================================

export async function initSampleData() {
  const supabase = createDBClient()

  try {
    // Check if sample data already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'sarah@techevents.co')
      .single()

    if (existingUsers) {
      return { message: 'Sample data already exists' }
    }

    // Create sample organizer user
    const { data: orgAuthUser, error: orgAuthError } = await supabase.auth.admin.createUser({
      email: 'sarah@techevents.co',
      password: 'SampleOrg123!',
      user_metadata: {
        name: 'Sarah Johnson',
        user_type: 'organizer',
      },
      email_confirm: true,
    })

    if (orgAuthError) throw new Error(`Auth error: ${orgAuthError.message}`)

    // Create organizer user record
    const { data: orgUser, error: orgUserError } = await supabase
      .from('users')
      .insert([
        {
          auth_id: orgAuthUser.user.id,
          name: 'Sarah Johnson',
          email: 'sarah@techevents.co',
          user_type: 'organizer',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          bio: 'Experienced event organizer passionate about creating memorable tech conferences.',
          member_since: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (orgUserError) throw new Error(`Failed to create org user: ${orgUserError.message}`)

    // Create organizer profile
    const { data: organizer, error: orgError } = await supabase
      .from('organizers')
      .insert([
        {
          user_id: orgUser.id,
          organization_name: 'TechEvents Co.',
          website: 'https://techevents.co',
          social_links: {
            twitter: 'https://twitter.com/techeventsco',
            facebook: 'https://facebook.com/techeventsco',
            instagram: 'https://instagram.com/techeventsco',
            linkedin: 'https://linkedin.com/company/techeventsco',
          },
        },
      ])
      .select()
      .single()

    if (orgError) throw new Error(`Failed to create organizer: ${orgError.message}`)

    // Create sample events
    const sampleEvents = [
      {
        organizer_id: organizer.id,
        title: 'Tech Innovation Conference 2025',
        description:
          'Join leading tech innovators and entrepreneurs for a day of groundbreaking insights, networking, and the latest in technology trends.',
        date: '2025-10-15',
        time: '09:00',
        location: 'Silicon Valley Convention Center',
        price: 299,
        capacity: 500,
        attendees: 0,
        category: 'Conference',
        image_url:
          'https://images.unsplash.com/photo-1571645163064-77faa9676a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwbmV0d29ya2luZyUyMGV2ZW50fGVufDF8fHx8MTc1ODE5OTEwNHww&ixlib=rb-4.1.0&q=80&w=1080',
        status: 'active',
      },
      {
        organizer_id: organizer.id,
        title: 'Summer Music Festival',
        description:
          'Experience three days of incredible live music featuring top artists from around the world in a beautiful outdoor setting.',
        date: '2025-07-20',
        time: '15:00',
        location: 'Golden Gate Park, San Francisco',
        price: 150,
        capacity: 5000,
        attendees: 0,
        category: 'Festival',
        image_url:
          'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NTgxOTExNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        status: 'active',
      },
      {
        organizer_id: organizer.id,
        title: 'Digital Marketing Workshop',
        description:
          'Master the latest digital marketing strategies and tools. Perfect for entrepreneurs, marketers, and business owners.',
        date: '2025-09-12',
        time: '10:00',
        location: 'Downtown Business Center',
        price: 89,
        capacity: 50,
        attendees: 0,
        category: 'Workshop',
        image_url:
          'https://images.unsplash.com/photo-1733758283615-224f76ab0792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTgyNjgzNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        status: 'active',
      },
    ]

    const { error: eventsError } = await supabase.from('events').insert(sampleEvents)

    if (eventsError) throw new Error(`Failed to create events: ${eventsError.message}`)

    return {
      message: 'Sample data initialized successfully',
      organizer: orgUser,
      eventsCount: sampleEvents.length,
    }
  } catch (error) {
    console.log('Error initializing sample data:', error)
    throw error
  }
}
