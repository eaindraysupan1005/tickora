import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Ticket, Download, Share, Copy } from 'lucide-react';
import { Event } from './EventCard';
import { toast } from 'sonner@2.0.3';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  ticketInfo: {
    quantity: number;
    purchaseDate: string;
    ticketNumber: string;
    seatInfo?: string;
  } | null;
}

// Simple QR Code component using CSS grid pattern
const QRCodeDisplay = ({ data }: { data: string }) => {
  // Generate a pseudo-random pattern based on the data string
  const generatePattern = (input: string) => {
    const size = 25; // 25x25 grid
    const pattern = [];
    let hash = 0;
    
    // Simple hash function
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate pattern based on hash
    for (let i = 0; i < size * size; i++) {
      const val = Math.abs(hash + i * 2654435761) % 100;
      pattern.push(val < 50);
    }
    
    // Add finder patterns (corners)
    const addFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const index = (startRow + r) * size + (startCol + c);
          if (index < pattern.length) {
            const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = (r >= 2 && r <= 4) && (c >= 2 && c <= 4);
            pattern[index] = isEdge || isInner;
          }
        }
      }
    };
    
    addFinderPattern(0, 0); // Top-left
    addFinderPattern(0, 18); // Top-right  
    addFinderPattern(18, 0); // Bottom-left
    
    return pattern;
  };

  const pattern = generatePattern(data);
  const size = 25;

  return (
    <div className="flex justify-center">
      <div className="bg-white p-3 rounded-lg shadow-lg">
        <div 
          className="grid gap-0 border-2 border-gray-200"
          style={{ 
            gridTemplateColumns: `repeat(${size}, 6px)`,
            gridTemplateRows: `repeat(${size}, 6px)`
          }}
        >
          {pattern.map((filled, index) => (
            <div
              key={index}
              className={`${filled ? 'bg-black' : 'bg-white'}`}
            />
          ))}
        </div>
        <p className="text-xs text-center text-gray-500 mt-1">Tickora QR Code</p>
      </div>
    </div>
  );
};

export function QRCodeModal({ isOpen, onClose, event, ticketInfo }: QRCodeModalProps) {
  if (!event || !ticketInfo) return null;

  const qrData = `EVENTTIX:${event.id}:${ticketInfo.ticketNumber}:${ticketInfo.purchaseDate}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCopyTicketNumber = () => {
    navigator.clipboard.writeText(ticketInfo.ticketNumber);
    toast.success('Ticket number copied to clipboard');
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `My ticket for ${event.title}`,
        text: `I'm attending ${event.title} on ${formatDate(event.date)}`,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(`I'm attending ${event.title} on ${formatDate(event.date)} - ${window.location.origin}`);
      toast.success('Event details copied to clipboard');
    }
  };

  const handleDownloadTicket = () => {
    // Simulate ticket download
    toast.success('Ticket downloaded successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Ticket className="w-4 h-4 text-primary" />
            Your Event Ticket
          </DialogTitle>
          <DialogDescription className="text-sm">
            Present this QR code at the event entrance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <QRCodeDisplay data={qrData} />

          {/* Ticket Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2">{event.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {ticketInfo.quantity} Ticket{ticketInfo.quantity > 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">Valid</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(event.time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="line-clamp-2">{event.location}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{ticketInfo.ticketNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={handleCopyTicketNumber}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <span>{new Date(ticketInfo.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organizer:</span>
                  <span>{event.organizer}</span>
                </div>
                {ticketInfo.seatInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat:</span>
                    <span>{ticketInfo.seatInfo}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownloadTicket} className="w-full" size="sm">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShareTicket} className="w-full" size="sm">
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>

          {/* Important Notice */}
          <div className="bg-muted/50 p-2 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Important:</strong> Please arrive 30 minutes before the event starts. 
              This QR code is unique and cannot be reproduced.
            </p>
          </div>

          <Button onClick={onClose} className="w-full" size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}