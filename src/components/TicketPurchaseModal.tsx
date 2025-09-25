import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { CreditCard, Calendar, MapPin, Minus, Plus, User, Mail, Phone } from 'lucide-react';
import { Event } from './EventCard';

interface TicketPurchaseModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (eventId: string, quantity: number, buyerInfo: any, paymentInfo: any) => void;
}

export function TicketPurchaseModal({ event, isOpen, onClose, onPurchaseComplete }: TicketPurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  if (!event) return null;

  const availableTickets = event.capacity - event.attendees;
  const maxQuantity = Math.min(availableTickets, 10);
  const totalPrice = event.price * quantity;
  const processingFee = totalPrice > 0 ? Math.max(totalPrice * 0.03, 0.50) : 0;
  const finalTotal = totalPrice + processingFee;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the purchase completion handler with all the data
    onPurchaseComplete(event.id, quantity, buyerInfo, paymentInfo);
    
    // Reset form
    setQuantity(1);
    setBuyerInfo({ name: '', email: '', phone: '' });
    setPaymentInfo({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
    
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Tickets</DialogTitle>
          <DialogDescription>
            Complete your ticket purchase for {event.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePurchase} className="space-y-6">
          {/* Event Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Quantity */}
          <div className="space-y-4">
            <h3>Select Quantity</h3>
            <div className="flex items-center space-x-4">
              <Label>Number of tickets:</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                (Max {maxQuantity} available)
              </span>
            </div>
          </div>

          <Separator />

          {/* Buyer Information */}
          <div className="space-y-4">
            <h3>Buyer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    value={buyerInfo.name}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={buyerInfo.phone}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(123) 456-7890"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {event.price > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3>Payment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value }))}
                      placeholder="Name on card"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Order Summary */}
          <div className="space-y-4">
            <h3>Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tickets ({quantity}x)</span>
                <span>{event.price === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}</span>
              </div>
              {processingFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing fee</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{finalTotal === 0 ? 'Free' : `$${finalTotal.toFixed(2)}`}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {event.price === 0 ? 'Get Free Tickets' : `Pay $${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}