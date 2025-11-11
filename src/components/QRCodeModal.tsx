import { useMemo, useRef } from 'react';
import { toJpeg } from 'html-to-image';
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

const QR_SIZE = 25;

const generatePattern = (input: string) => {
  const pattern: boolean[] = [];
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  for (let i = 0; i < QR_SIZE * QR_SIZE; i++) {
    const val = Math.abs(hash + i * 2654435761) % 100;
    pattern.push(val < 50);
  }

  const addFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const index = (startRow + r) * QR_SIZE + (startCol + c);
        if (index < pattern.length) {
          const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = (r >= 2 && r <= 4) && (c >= 2 && c <= 4);
          pattern[index] = isEdge || isInner;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, 18);
  addFinderPattern(18, 0);

  return pattern;
};

// Simple QR Code component using CSS grid pattern
const QRCodeDisplay = ({ pattern }: { pattern: boolean[] }) => {
  const size = QR_SIZE;

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
  const qrPattern = useMemo(() => generatePattern(qrData), [qrData]);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadTicket = async () => {
    if (!cardRef.current) {
      toast.error('Unable to locate ticket details');
      return;
    }

    const closeBtn = closeButtonRef.current;
    const actions = actionsRef.current;
    const previousCloseDisplay = closeBtn?.style.display;
    const previousActionsDisplay = actions?.style.display;
    if (closeBtn) closeBtn.style.display = 'none';
    if (actions) actions.style.display = 'none';

    try {
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: window.devicePixelRatio || 2,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ticket-${ticketInfo.ticketNumber}.jpg`;
      link.click();

      toast.success('Ticket saved as JPG');
    } catch (error) {
      console.error('Error downloading ticket view:', error);
      toast.error('Failed to download ticket');
    } finally {
      if (closeBtn) closeBtn.style.display = previousCloseDisplay || '';
      if (actions) actions.style.display = previousActionsDisplay || '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90vw] max-h-[90vh] overflow-y-auto">
        <div ref={cardRef} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Ticket className="w-4 h-4 text-primary" />
              Your Event Ticket
            </DialogTitle>
            <DialogDescription className="text-sm">
              Present this QR code at the event entrance
            </DialogDescription>
          </DialogHeader>

          {/* QR Code */}
          <QRCodeDisplay pattern={qrPattern} />

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
          <div ref={actionsRef} className="grid grid-cols-2 gap-2">
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

          <Button ref={closeButtonRef} onClick={onClose} className="w-full" size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}