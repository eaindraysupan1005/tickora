import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Menu, LayoutDashboard, Home, Ticket, UserCircle, HelpCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { LanguageSelector } from './LanguageSelector';
import { ImageWithFallback } from './figma/ImageWithFallback';
import tickoraLogo from 'figma:asset/3fdeb8fc2454f72234488e708b9894663f874e30.png';

interface HeaderProps {
  isLoggedIn: boolean;
  userType: 'user' | 'organizer' | null;
  currentView: 'home' | 'dashboard' | 'tickets' | 'profile' | 'help';
  onLogin: (type: 'user' | 'organizer', email: string, password: string) => Promise<boolean>;
  onSignup: (email: string, password: string, name: string, userType: 'user' | 'organizer') => Promise<boolean>;
  onLogout: () => void;
  onShowDashboard: () => void;
  onShowHome: () => void;
  onShowTickets: () => void;
  onShowProfile: () => void;
  onShowHelp: () => void;
}

// Separate AuthForm component to isolate form state
function AuthForm({ onLogin, onSignup, onClose }: {
  onLogin: (type: 'user' | 'organizer', email: string, password: string) => Promise<boolean>;
  onSignup: (email: string, password: string, name: string, userType: 'user' | 'organizer') => Promise<boolean>;
  onClose: () => void;
}) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'user' | 'organizer'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      let success = false;
      
      if (authMode === 'signin') {
        success = await onLogin(userType, email, password);
      } else {
        if (!name.trim()) {
          alert('Please enter your name');
          return;
        }
        success = await onSignup(email, password, name, userType);
      }

      if (success) {
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setAuthMode('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {authMode === 'signin' ? 'Sign In to Tickora' : 'Create Your Tickora Account'}
        </DialogTitle>
        <DialogDescription>
          {authMode === 'signin' 
            ? 'Enter your credentials to access your account'
            : 'Create a new account to start using Tickora'
          }
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs value={userType} onValueChange={(value: string) => setUserType(value as 'user' | 'organizer')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Event Attendee</TabsTrigger>
            <TabsTrigger value="organizer">Event Organizer</TabsTrigger>
          </TabsList>
        </Tabs>

        {authMode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            'Loading...'
          ) : (
            `${authMode === 'signin' ? 'Sign In' : 'Create Account'} as ${userType === 'organizer' ? 'Organizer' : 'Attendee'}`
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {authMode === 'signin' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </form>
    </>
  );
}

export function Header({ isLoggedIn, userType, currentView, onLogin, onSignup, onLogout, onShowDashboard, onShowHome, onShowTickets, onShowProfile, onShowHelp }: HeaderProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Navigation = () => (
    <>
      <div className="hidden md:flex items-center space-x-2">
        {isLoggedIn ? (
          <div className="flex items-center space-x-1">
            <Button 
              onClick={onShowHome} 
              variant={currentView === 'home' ? 'default' : 'ghost'} 
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            {userType === 'user' && (
              <Button 
                onClick={onShowTickets} 
                variant={currentView === 'tickets' ? 'default' : 'ghost'} 
                size="sm"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Tickets
              </Button>
            )}
            <Button 
              onClick={onShowProfile} 
              variant={currentView === 'profile' ? 'default' : 'ghost'} 
              size="sm"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              onClick={onShowDashboard} 
              variant={currentView === 'dashboard' ? 'default' : 'ghost'} 
              size="sm"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              onClick={onShowHelp} 
              variant={currentView === 'help' ? 'default' : 'ghost'} 
              size="sm"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <LanguageSelector variant="compact" />
            <Button onClick={onLogout} variant="outline" size="sm">Logout</Button>
          </div>
        ) : (
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button>Sign In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <AuthForm 
                onLogin={onLogin}
                onSignup={onSignup}
                onClose={() => setIsAuthOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );

  const MobileNavigation = () => (
    <div className="md:hidden">
      {isLoggedIn ? (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Access your account and navigate through Tickora
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col space-y-6 mt-8">
              <div className="flex flex-col space-y-4">
                <Button onClick={onShowHome} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                {userType === 'user' && (
                  <Button onClick={onShowTickets} variant="outline" className="w-full">
                    <Ticket className="w-4 h-4 mr-2" />
                    Tickets
                  </Button>
                )}
                <Button onClick={onShowProfile} variant="outline" className="w-full">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button onClick={onShowDashboard} variant="outline" className="w-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={onShowHelp} variant="outline" className="w-full">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
                <div className="pt-2">
                  <LanguageSelector />
                </div>
                <Button onClick={onLogout} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
          <DialogTrigger asChild>
            <Button>Sign In</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <AuthForm 
              onLogin={onLogin}
              onSignup={onSignup}
              onClose={() => setIsAuthOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onShowHome} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <ImageWithFallback 
              src={tickoraLogo} 
              alt="Tickora - Event Ticketing Platform" 
              className="h-12 w-auto"
            />
          </button>

          <Navigation />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}