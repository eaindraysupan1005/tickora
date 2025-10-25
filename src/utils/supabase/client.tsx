import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-f69ab98e`

// API helper functions
export const api = {
  // Auth endpoints
  signup: async (userData: { email: string; password: string; name: string; userType: string }) => {
    const response = await fetch(`${serverUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(userData)
    })
    return response.json()
  },

  signin: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${serverUrl}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(credentials)
    })
    return response.json()
  },

  getProfile: async (accessToken: string) => {
    const response = await fetch(`${serverUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  },

  updateUserProfile: async (profileData: any, accessToken: string) => {
    const response = await fetch(`${serverUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(profileData)
    })
    return response.json()
  },

  // Event endpoints
  getEvents: async () => {
    const response = await fetch(`${serverUrl}/events`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    return response.json()
  },

  getEvent: async (eventId: string) => {
    const response = await fetch(`${serverUrl}/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    return response.json()
  },

  createEvent: async (eventData: any, accessToken: string) => {
    const response = await fetch(`${serverUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(eventData)
    })
    return response.json()
  },

  searchEvents: async (query: string, category: string = 'All') => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (category && category !== 'All') params.append('category', category)
    
    const response = await fetch(`${serverUrl}/events/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    return response.json()
  },

  // Ticket endpoints
  purchaseTickets: async (ticketData: any, accessToken: string) => {
    const response = await fetch(`${serverUrl}/tickets/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(ticketData)
    })
    return response.json()
  },

  getUserTickets: async (accessToken: string) => {
    const response = await fetch(`${serverUrl}/tickets`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  },

  // Dashboard endpoints
  getDashboardStats: async (accessToken: string) => {
    const response = await fetch(`${serverUrl}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  },

  getOrganizerEvents: async (accessToken: string) => {
    const response = await fetch(`${serverUrl}/organizer/events`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  },

  // Initialize sample data
  initSampleData: async () => {
    const response = await fetch(`${serverUrl}/init-sample-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    return response.json()
  }
}