import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, MapPin, Users, DollarSign, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/supabase/client';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: any) => void;
  accessToken?: string;
}

export function CreateEventModal({ isOpen, onClose, onCreateEvent, accessToken }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    category: '',
    image_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Conference', 'Workshop', 'Seminar', 'Networking', 'Concert', 
    'Festival', 'Sports', 'Art & Culture', 'Food & Drink', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.capacity || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 0,
        category: formData.category,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
        status: 'active'
      };

      console.log('Form image_url value:', formData.image_url);
      console.log('Sending event data to API:', eventData);
      console.log('image_url in eventData:', eventData.image_url);
      // Save to database if accessToken is available
      if (accessToken) {
        const response = await api.createEvent(eventData, accessToken);
        
        console.log('API Response:', response);
        
        if (response.error) {
          toast.error(response.error.message || 'Failed to create event');
          setIsLoading(false);
          return;
        }

        toast.success('Event created and saved successfully!');
        
        // Add to local state with the returned data
        const savedEvent = {
          id: response.data?.id || Date.now().toString(),
          ...eventData,
          attendees: 0,
          organizer: 'Your Organization'
        };
        onCreateEvent(savedEvent);
      } else {
        toast.warning('Event will only be shown locally');
        
        // Create event locally only if no auth
        const localEvent = {
          id: Date.now().toString(),
          ...eventData,
          attendees: 0,
          organizer: 'Your Organization'
        };
        onCreateEvent(localEvent);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        capacity: '',
        category: '',
        image_url: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill out the details below to create and publish your event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3>Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value: string) => handleInputChange('category', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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

          {/* Date & Time */}
          <div className="space-y-4">
            <h3>Date & Time</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3>Location</h3>
            
            <div className="space-y-2">
              <Label htmlFor="location">Venue/Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter venue or location"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="space-y-4">
            <h3>Tickets & Pricing</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00 (Free)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Maximum attendees"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-4">
            <h3>Event Image</h3>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="image"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to use a default image
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}