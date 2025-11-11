import { useMemo, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import QRCode from 'react-qr-code';
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
    buyerName: string;
    buyerEmail: string;
    eventId: string;
  } | null;
}

const encodeTicketPayload = (payload: Record<string, unknown>) => {
  try {
    if (typeof window === 'undefined') {
      return '';
    }
    const json = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return encodeURIComponent(window.btoa(binary));
  } catch (error) {
    console.error('Failed to encode ticket payload:', error);
    return '';
  }
};

export function QRCodeModal({ isOpen, onClose, event, ticketInfo }: QRCodeModalProps) {
  if (!event || !ticketInfo) return null;

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
    if (!navigator.clipboard) {
      toast.error('Clipboard access is unavailable in this browser');
      return;
    }
    navigator.clipboard.writeText(ticketInfo.ticketNumber)
      .then(() => toast.success('Ticket number copied to clipboard'))
      .catch(() => toast.error('Unable to copy ticket number'));
  };

  const handleShareTicket = (link: string) => {
    if (!link) {
      toast.error('Unable to prepare share link');
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${event.title}`,
        text: `Access ticket ${ticketInfo.ticketNumber} for ${event.title}`,
        url: link
      });
    } else {
      if (!navigator.clipboard) {
        toast.error('Clipboard access is unavailable');
        return;
      }
      navigator.clipboard.writeText(link)
        .then(() => toast.success('Verification link copied to clipboard'))
        .catch(() => toast.error('Unable to copy verification link'));
    }
  };

  const verificationUrl = useMemo(() => {
    const publicBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
    const origin = publicBaseUrl?.trim()
      ? publicBaseUrl.replace(/\/$/, '')
      : typeof window !== 'undefined'
        ? window.location.origin
        : '';

    const encodedPayload = encodeTicketPayload({
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      location: event.location,
      organizer: event.organizer,
      ticketNumber: ticketInfo.ticketNumber,
      quantity: ticketInfo.quantity,
      seatInfo: ticketInfo.seatInfo,
      buyerName: ticketInfo.buyerName,
      buyerEmail: ticketInfo.buyerEmail,
      purchaseDate: ticketInfo.purchaseDate,
      eventId: ticketInfo.eventId,
    });

    if (!encodedPayload) {
      return '';
    }

    const base = origin || '';
    return `${base}/verify-ticket?data=${encodedPayload}`;
  }, [
    event.date,
    event.location,
    event.organizer,
    event.time,
    event.title,
    ticketInfo.buyerEmail,
    ticketInfo.buyerName,
    ticketInfo.eventId,
    ticketInfo.purchaseDate,
    ticketInfo.quantity,
    ticketInfo.seatInfo,
    ticketInfo.ticketNumber,
  ]);

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
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <QRCode value={verificationUrl || 'https://tickora.app'} size={180} level="H" />
              <p className="text-xs text-center text-gray-500 mt-1">Tickora QR Code</p>
            </div>
          </div>

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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendee:</span>
                  <span>{ticketInfo.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="truncate max-w-[160px]" title={ticketInfo.buyerEmail}>
                    {ticketInfo.buyerEmail}
                  </span>
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
            <Button
              variant="outline"
              onClick={() => handleShareTicket(verificationUrl)}
              className="w-full"
              size="sm"
              disabled={!verificationUrl}
            >
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