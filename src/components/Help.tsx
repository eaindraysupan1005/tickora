import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, MessageCircle, Phone, Mail, Book, HelpCircle, Send, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HelpProps {
  userType: 'user' | 'organizer';
}

export function Help({ userType }: HelpProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Your message has been sent! We\'ll get back to you within 24 hours.');
    setContactForm({ subject: '', message: '', priority: 'medium' });
  };

  const faqData = {
    user: [
      {
        id: 'buy-tickets',
        question: 'How do I buy tickets for an event?',
        answer: 'To buy tickets, browse events on the home page, click on an event you\'re interested in, and click "Buy Tickets". You\'ll need to sign in as an attendee and provide payment information.'
      },
      {
        id: 'cancel-tickets',
        question: 'Can I cancel or refund my tickets?',
        answer: 'Refund policies vary by event. Check the event details for specific refund information. Most events allow cancellations up to 48 hours before the event date.'
      },
      {
        id: 'transfer-tickets',
        question: 'Can I transfer my tickets to someone else?',
        answer: 'Yes, most tickets can be transferred. Go to your Tickets page, find the ticket you want to transfer, and click "Transfer Ticket". You\'ll need the recipient\'s email address.'
      },
      {
        id: 'event-cancelled',
        question: 'What happens if an event is cancelled?',
        answer: 'If an event is cancelled by the organizer, you\'ll receive a full refund automatically within 5-7 business days. You\'ll also be notified via email and SMS if enabled.'
      },
      {
        id: 'mobile-tickets',
        question: 'How do I access my tickets on my phone?',
        answer: 'Your tickets are available in the Tickets section of your account. Each ticket has a QR code that can be scanned at the event entrance. Make sure to have your phone charged!'
      }
    ],
    organizer: [
      {
        id: 'create-event',
        question: 'How do I create an event?',
        answer: 'Sign in as an organizer, go to your Dashboard, and click "Create New Event". Fill in all the required information including title, description, date, time, location, and pricing.'
      },
      {
        id: 'manage-tickets',
        question: 'How do I manage ticket sales?',
        answer: 'In your Dashboard, you can view ticket sales in real-time, see attendee lists, and download reports. You can also modify ticket prices and availability.'
      },
      {
        id: 'payment-processing',
        question: 'How do payments work for organizers?',
        answer: 'Payments are processed securely and transferred to your account within 3-5 business days after the event. We charge a small processing fee of 3% + $0.30 per transaction.'
      },
      {
        id: 'promote-event',
        question: 'How can I promote my event?',
        answer: 'Use social media sharing buttons, email marketing tools in your dashboard, and consider featuring your event by upgrading to premium visibility options.'
      },
      {
        id: 'analytics',
        question: 'Can I see analytics for my events?',
        answer: 'Yes! Your Dashboard includes detailed analytics showing ticket sales over time, attendee demographics, referral sources, and revenue tracking.'
      }
    ]
  };

  const guideData = {
    user: [
      {
        title: 'Getting Started as an Attendee',
        description: 'Learn how to find and book events',
        items: [
          'Create your attendee account',
          'Browse events by category or location',
          'Purchase tickets securely',
          'Access your tickets on mobile',
          'Rate and review events'
        ]
      },
      {
        title: 'Managing Your Tickets',
        description: 'Everything about your purchased tickets',
        items: [
          'View upcoming events',
          'Download ticket PDFs',
          'Transfer tickets to others',
          'Get QR codes for entry',
          'Request refunds when eligible'
        ]
      }
    ],
    organizer: [
      {
        title: 'Creating Your First Event',
        description: 'Step-by-step guide to launching events',
        items: [
          'Set up your organizer profile',
          'Create compelling event descriptions',
          'Set appropriate pricing',
          'Upload engaging event images',
          'Publish and promote your event'
        ]
      },
      {
        title: 'Growing Your Audience',
        description: 'Marketing and promotion strategies',
        items: [
          'Use social media integration',
          'Create early bird discounts',
          'Build an email subscriber list',
          'Partner with other organizers',
          'Leverage event analytics'
        ]
      }
    ]
  };

  const filteredFAQs = faqData[userType].filter(faq =>
    searchQuery === '' ||
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get the help you need
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No FAQs found matching your search
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guideData[userType].map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="w-5 h-5 text-primary" />
                      {guide.title}
                    </CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {guide.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full mt-4">
                      View Full Guide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                    <Button size="sm" className="ml-auto">
                      Chat Now
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@eventtix.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    We'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={contactForm.priority}
                        onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe your issue or question in detail..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">All systems operational</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Status Page
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    For developers integrating with EventTix
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View API Docs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Forum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with other users and organizers
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Forum
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Step-by-step video guides
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Watch Tutorials
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Suggest new features and improvements
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Submit Ideas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Legal documents and policies
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Policies
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}