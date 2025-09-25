import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Github } from 'lucide-react';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import tickoraLogo from 'figma:asset/3fdeb8fc2454f72234488e708b9894663f874e30.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ImageWithFallback src={tickoraLogo} alt="Tickora Logo" className="h-10 w-auto" />
                <h3 className="text-2xl font-bold text-primary">Tickora</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your premier destination for discovering and booking amazing events. 
                From conferences to concerts, we bring you closer to unforgettable experiences.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Follow us on Github"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Browse Events</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Create Event</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold">Event Categories</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Conferences</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Workshops</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Festivals</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sports</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Networking</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact Us</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">123 Event Street, San Francisco, CA 94105</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">hello@tickora.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Tickora. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}