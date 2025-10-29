import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  ArrowLeft,
  Mail,
  Users,
  DollarSign,
  Search,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Event } from './EventCard';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: 'confirmed' | 'paid' | 'requesting_refund' | 'refunded';
  purchase_date: string;
  users: {
    name: string;
    email: string;
  };
}

interface EventAttendeesProps {
  event: Event;
  accessToken: string;
  onBack: () => void;
}

export function EventAttendees({ event, accessToken, onBack }: EventAttendeesProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'paid' | 'requesting_refund' | 'refunded'>('all');

  // Fetch event tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.getEventTickets(event.id, accessToken);
        
        if (response.error) {
          toast.error(`Failed to fetch tickets: ${response.error}`);
          setTickets([]);
        } else if (response.data || response.tickets) {
          setTickets(response.data || response.tickets || []);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load event attendees');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (event.id && accessToken) {
      fetchTickets();
    }
  }, [event.id, accessToken]);

  // Filter tickets based on search and status
  useEffect(() => {
    let filtered = tickets;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.users.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = {
    total: tickets.length,
    totalRevenue: tickets.reduce((sum, t) => sum + t.total_price, 0),
    confirmed: tickets.filter(t => t.status === 'confirmed').length,
    paid: tickets.filter(t => t.status === 'paid').length,
    requestingRefund: tickets.filter(t => t.status === 'requesting_refund').length,
    refunded: tickets.filter(t => t.status === 'refunded').length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      confirmed: { label: 'Confirmed', variant: 'default' },
      paid: { label: 'Paid', variant: 'default' },
      requesting_refund: { label: 'Requesting Refund', variant: 'destructive' },
      refunded: { label: 'Refunded', variant: 'secondary' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'requesting_refund':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Total tickets sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">From all tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Refund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-yellow-500 text-2xl font-bold'>{stats.requestingRefund}</div> 
            <p className="text-xs text-gray-500 mt-1">Pending requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.refunded}</div>
            <p className="text-xs text-gray-500 mt-1">Processed refunds</p>
          </CardContent>
        </Card>
      </div>

    
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
              <option value="requesting_refund">Requesting Refund</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Attendees Table */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading attendees...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.users.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a
                            href={`mailto:${ticket.users.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {ticket.users.email}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.quantity}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {ticket.total_price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(ticket.purchase_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
