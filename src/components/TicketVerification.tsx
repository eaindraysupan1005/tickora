import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, Ticket, User, Mail, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TicketPayload {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  organizer: string;
  ticketNumber: string;
  quantity: number;
  seatInfo?: string;
  buyerName: string;
  buyerEmail: string;
  purchaseDate: string;
  eventId: string;
}

const decodeTicketData = (encoded: string): TicketPayload | null => {
  try {
    if (!encoded) {
      return null;
    }

    const normalized = decodeURIComponent(encoded.replace(/\s/g, ''));

    if (typeof window === 'undefined') {
      return null;
    }

    const binary = window.atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoder = new TextDecoder();
    const json = decoder.decode(bytes);

    return JSON.parse(json) as TicketPayload;
  } catch (error) {
    console.error('Failed to decode ticket data:', error);
    return null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function TicketVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const encodedData = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('data') || '';
  }, [location.search]);

  const ticketData = useMemo(() => decodeTicketData(encodedData), [encodedData]);

  const isValid = !!ticketData;
  const isPastEvent = useMemo(() => {
    if (!ticketData) return false;
    const eventDateTime = new Date(`${ticketData.eventDate}T${ticketData.eventTime}`);
    return eventDateTime.getTime() < Date.now();
  }, [ticketData]);

  const handleCopyTicketNumber = () => {
    if (!ticketData) return;
    if (!navigator.clipboard) {
      toast.error('Clipboard access is unavailable in this browser');
      return;
    }
    navigator.clipboard.writeText(ticketData.ticketNumber)
      .then(() => toast.success('Ticket number copied to clipboard'))
      .catch(() => toast.error('Unable to copy ticket number'));
  };

  const handleCopyPageLink = () => {
    if (typeof window === 'undefined') return;
    if (!navigator.clipboard) {
      toast.error('Clipboard access is unavailable in this browser');
      return;
    }
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Verification link copied to clipboard'))
      .catch(() => toast.error('Unable to copy link'));
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="w-5 h-5 text-destructive" />
                Ticket Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We could not verify this ticket. The link may be invalid or expired. Please contact the event organizer or try scanning the ticket again.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </Button>
                <Button variant="outline" onClick={handleCopyPageLink}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Page Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={isPastEvent ? 'outline' : 'default'}>
                {isPastEvent ? 'Event Completed' : 'Valid Ticket'}
              </Badge>
              <Badge variant="secondary">#{ticketData.ticketNumber}</Badge>
            </div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {ticketData.eventTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Presented by {ticketData.organizer}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(ticketData.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatTime(ticketData.eventTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="line-clamp-2">{ticketData.location}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{ticketData.buyerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate" title={ticketData.buyerEmail}>{ticketData.buyerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-muted-foreground" />
                <span>{ticketData.quantity} Ticket{ticketData.quantity > 1 ? 's' : ''}</span>
              </div>
              {ticketData.seatInfo && (
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span>{ticketData.seatInfo}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Purchased on {new Date(ticketData.purchaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/') }>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={handleCopyTicketNumber}>
                <Copy className="w-4 h-4 mr-1" />
                Copy Ticket Number
              </Button>
              <Button variant="outline" onClick={handleCopyPageLink}>
                <Copy className="w-4 h-4 mr-1" />
                Copy Verification Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
