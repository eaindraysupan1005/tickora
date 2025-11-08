import { useState, useCallback, useEffect, ChangeEvent, MouseEvent } from 'react';
import { api } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Building,
  DollarSign,
  Link,
  Upload,
  Settings,
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileProps {
  userType: 'user' | 'organizer';
  userTickets: Array<{ eventId: string; quantity: number; purchaseDate: string }>;
  userProfile?: {
    id: string;
    name: string;
    email: string;
    userType: string;
    accessToken: string;
  } | null;
  onDeleteAccount?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  memberSince: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    eventReminders: boolean;
  };
}

interface OrganizerProfile extends UserProfile {
  organizationName: string;
  organizationLogo: string;
  website: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  businessDetails: {
    businessType: string;
    taxId: string;
    businessAddress: string;
  };
  paymentSettings: {
    bankAccountName: string;
    bankAccountNumber: string;
    routingNumber: string;
    paypalEmail: string;
    stripeConnected: boolean;
    defaultPayoutMethod: 'bank' | 'paypal' | 'stripe';
  };
}

// ProfileForm Component - Defined outside to prevent re-creation on every render
interface ProfileFormProps {
  data: UserProfile | OrganizerProfile;
  onChange: (data: UserProfile | OrganizerProfile) => void;
  readonly?: boolean;
  userType: 'user' | 'organizer';
}

const ProfileFormComponent = ({ data, onChange, readonly = false, userType }: ProfileFormProps) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={data.avatar} alt={data.name} />
        <AvatarFallback className="text-2xl">
          {data.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {!readonly && (
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Change Photo
        </Button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e: any) => onChange({ ...data, name: e.target.value })}
          disabled={readonly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e: any) => onChange({ ...data, email: e.target.value })}
          disabled={readonly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e: any) => onChange({ ...data, phone: e.target.value })}
          disabled={readonly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={data.location}
          onChange={(e: any) => onChange({ ...data, location: e.target.value })}
          disabled={readonly}
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        id="bio"
        value={data.bio}
        onChange={(e: any) => onChange({ ...data, bio: e.target.value })}
        disabled={readonly}
        rows={4}
        placeholder={`Tell others about yourself${userType === 'organizer' ? ' and your organization' : ''}...`}
      />
    </div>
  </div>
);

export function Profile({ userType, userTickets, userProfile, onDeleteAccount }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Use real user data if available, otherwise fall back to sample data
  const defaultName = userProfile?.name || (userType === 'organizer' ? 'Sarah Johnson' : 'John Doe');
  const defaultEmail = userProfile?.email || (userType === 'organizer' ? 'sarah@techevents.co' : 'john.doe@example.com');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: defaultName,
    email: defaultEmail,
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: userType === 'organizer' 
      ? 'Experienced event organizer passionate about creating memorable tech conferences and networking experiences. Founded TechEvents Co. in 2020.'
      : 'Event enthusiast who loves discovering new experiences and connecting with like-minded people.',
    avatar: '',
    memberSince: '2023-01-15',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      eventReminders: true,
    }
  });

  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile>({
    ...profile,
    name: defaultName,
    email: defaultEmail,
    organizationName: 'TechEvents Co.',
    organizationLogo: '',
    website: 'https://techevents.co',
    socialLinks: {
      twitter: 'https://twitter.com/techeventsco',
      facebook: 'https://facebook.com/techeventsco',
      instagram: 'https://instagram.com/techeventsco',
      linkedin: 'https://linkedin.com/company/techeventsco',
    },
    businessDetails: {
      businessType: 'LLC',
      taxId: '12-3456789',
      businessAddress: '123 Market St, San Francisco, CA 94103',
    },
    paymentSettings: {
      bankAccountName: 'TechEvents Co.',
      bankAccountNumber: '****1234',
      routingNumber: '121000248',
      paypalEmail: 'payments@techevents.co',
      stripeConnected: true,
      defaultPayoutMethod: 'stripe',
    }
  });

  const [editProfile, setEditProfile] = useState<UserProfile | OrganizerProfile>(
    userType === 'organizer' ? organizerProfile : profile
  );

  // Fetch complete profile data from database on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const accessToken = userProfile?.accessToken;
        if (!accessToken) {
          console.log('No access token available');
          setIsLoading(false);
          return;
        }

        // Fetch profile from API using the existing api helper
        const data = await api.getProfile(accessToken);
        
        if (data.profile) {
          const fetchedProfile = data.profile;
          const newUserProfile: UserProfile = {
            name: fetchedProfile.name || defaultName,
            email: fetchedProfile.email || defaultEmail,
            phone: fetchedProfile.phone || '',
            location: fetchedProfile.location || '',
            bio: fetchedProfile.bio || '',
            avatar: fetchedProfile.avatar_url || '',
            memberSince: fetchedProfile.member_since || fetchedProfile.created_at || new Date().toISOString(),
            preferences: fetchedProfile.preferences || {
              emailNotifications: true,
              smsNotifications: false,
              eventReminders: true,
            },
          };

          if (userType === 'organizer') {
            // For organizers, also fetch organizer-specific data
            setOrganizerProfile((prev) => ({
              ...prev,
              ...newUserProfile,
            } as OrganizerProfile));
            setEditProfile((prev) => ({
              ...prev,
              ...newUserProfile,
            } as OrganizerProfile));
          } else {
            // For regular users
            setProfile(newUserProfile);
            setEditProfile(newUserProfile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userProfile?.accessToken, userType, defaultName, defaultEmail]);

  const handleSave = useCallback(async () => {
    try {
      console.log('Saving profile:', editProfile);
      
      // Get access token from userProfile
      const accessToken = userProfile?.accessToken || '';
      if (!accessToken) {
        toast.error('No access token available. Please log in again.');
        return;
      }
      
      // Only send fields that the backend accepts
      const profileDataToSend = {
        name: editProfile.name,
        phone: editProfile.phone,
        location: editProfile.location,
        bio: editProfile.bio,
      };
      
      console.log('Sending to backend:', profileDataToSend);
      
      // Call backend API to update user profile
      const result = await api.updateUserProfile(profileDataToSend, accessToken);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      // Update local state
      if (userType === 'organizer') {
        setOrganizerProfile(editProfile as OrganizerProfile);
      } else {
        setProfile(editProfile as UserProfile);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    }
  }, [editProfile, userType, userProfile?.accessToken]);

  const handleCancel = () => {
    setEditProfile(userType === 'organizer' ? organizerProfile : profile);
    setIsEditing(false);
  };

  const handleDeleteAccount = useCallback(async (): Promise<boolean> => {
    const accessToken = userProfile?.accessToken;

    if (!accessToken) {
      toast.error('No access token available. Please log in again.');
      return false;
    }

    try {
      setIsDeleting(true);
      const response = await api.deleteAccount(accessToken);

      if (!response || response.error) {
        toast.error(response?.error || 'Failed to delete account');
        return false;
      }

      toast.success('Your account has been deleted.');
      if (onDeleteAccount) {
        onDeleteAccount();
      }
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [onDeleteAccount, userProfile?.accessToken]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatMemberSince = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const updatePreference = (key: keyof UserProfile['preferences'], value: boolean) => {
    if (isEditing) {
      setEditProfile((prev: any) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      }));
    } else {
      const updateFn = userType === 'organizer' ? setOrganizerProfile : setProfile;
      updateFn((prev: any) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      }));
      toast.success('Notification preference updated');
    }
  };

  const currentProfile = userType === 'organizer' ? organizerProfile : profile;

  // ProfileForm moved outside to prevent re-creation on every render
  const handleProfileFormChange = (data: UserProfile | OrganizerProfile) => {
    setEditProfile(data);
  };

  const ProfileForm = ({ data, onChange, readonly = false }: {
    data: UserProfile | OrganizerProfile;
    onChange: (data: UserProfile | OrganizerProfile) => void;
    readonly?: boolean;
  }) => (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={data.avatar} alt={data.name} />
          <AvatarFallback className="text-2xl">
            {getInitials(data.name)}
          </AvatarFallback>
        </Avatar>
        {!readonly && (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Change Photo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e: any) => onChange({ ...data, name: e.target.value })}
            disabled={readonly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e: any) => onChange({ ...data, email: e.target.value })}
            disabled={readonly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e: any) => onChange({ ...data, phone: e.target.value })}
            disabled={readonly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e: any) => onChange({ ...data, location: e.target.value })}
            disabled={readonly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e: any) => onChange({ ...data, bio: e.target.value })}
          disabled={readonly}
          rows={4}
          placeholder={`Tell others about yourself${userType === 'organizer' ? ' and your organization' : ''}...`}
        />
      </div>

      {/* Organizer-specific fields */}
      {userType === 'organizer' && (
        <>
          <Separator />
          <h3 className="text-lg font-semibold">Organization Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={(data as OrganizerProfile).organizationName}
                onChange={(e: any) => onChange({ ...data, organizationName: e.target.value } as OrganizerProfile)}
                disabled={readonly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={(data as OrganizerProfile).website}
                onChange={(e: any) => onChange({ ...data, website: e.target.value } as OrganizerProfile)}
                disabled={readonly}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organization Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={(data as OrganizerProfile).organizationLogo} alt="Organization logo" />
                <AvatarFallback>
                  <Building className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {!readonly && (
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Social Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={(data as OrganizerProfile).socialLinks.twitter}
                  onChange={(e: any) => onChange({
                    ...data,
                    socialLinks: { ...(data as OrganizerProfile).socialLinks, twitter: e.target.value }
                  } as OrganizerProfile)}
                  disabled={readonly}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={(data as OrganizerProfile).socialLinks.facebook}
                  onChange={(e: any) => onChange({
                    ...data,
                    socialLinks: { ...(data as OrganizerProfile).socialLinks, facebook: e.target.value }
                  } as OrganizerProfile)}
                  disabled={readonly}
                  placeholder="https://facebook.com/page"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={(data as OrganizerProfile).socialLinks.instagram}
                  onChange={(e: any) => onChange({
                    ...data,
                    socialLinks: { ...(data as OrganizerProfile).socialLinks, instagram: e.target.value }
                  } as OrganizerProfile)}
                  disabled={readonly}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={(data as OrganizerProfile).socialLinks.linkedin}
                  onChange={(e: any) => onChange({
                    ...data,
                    socialLinks: { ...(data as OrganizerProfile).socialLinks, linkedin: e.target.value }
                  } as OrganizerProfile)}
                  disabled={readonly}
                  placeholder="https://linkedin.com/company/name"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const BusinessDetailsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Business Information
        </CardTitle>
        <CardDescription>
          Legal and business details for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select 
              value={organizerProfile.businessDetails.businessType}
              onValueChange={(value: any) => setOrganizerProfile((prev: any) => ({
                ...prev,
                businessDetails: { ...prev.businessDetails, businessType: value }
              }))}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                <SelectItem value="Corp">Corporation</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="Non-profit">Non-profit Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <Input
              id="taxId"
              value={organizerProfile.businessDetails.taxId}
              onChange={(e: any) => setOrganizerProfile((prev: any) => ({
                ...prev,
                businessDetails: { ...prev.businessDetails, taxId: e.target.value }
              }))}
              disabled={!isEditing}
              placeholder="12-3456789"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address</Label>
          <Textarea
            id="businessAddress"
            value={organizerProfile.businessDetails.businessAddress}
            onChange={(e: any) => setOrganizerProfile((prev: any) => ({
              ...prev,
              businessDetails: { ...prev.businessDetails, businessAddress: e.target.value }
            }))}
            disabled={!isEditing}
            rows={3}
            placeholder="Enter your business address"
          />
        </div>
      </CardContent>
    </Card>
  );

  const PaymentSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payout Methods
          </CardTitle>
          <CardDescription>
            Set up how you want to receive payments from ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Payout Method</Label>
            <Select 
              value={organizerProfile.paymentSettings.defaultPayoutMethod}
              onValueChange={(value: 'bank' | 'paypal' | 'stripe') => 
                setOrganizerProfile(prev => ({
                  ...prev,
                  paymentSettings: { ...prev.paymentSettings, defaultPayoutMethod: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe Connect</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Stripe Connect */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Stripe Connect</h3>
                  <p className="text-sm text-muted-foreground">Fast, secure payments</p>
                </div>
              </div>
              {organizerProfile.paymentSettings.stripeConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
              ) : (
                <Button variant="outline">Connect Stripe</Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Account Name</Label>
                <Input
                  id="bankAccountName"
                  value={organizerProfile.paymentSettings.bankAccountName}
                  onChange={(e: any) => setOrganizerProfile((prev: any) => ({
                    ...prev,
                    paymentSettings: { ...prev.paymentSettings, bankAccountName: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={organizerProfile.paymentSettings.routingNumber}
                  onChange={(e: any) => setOrganizerProfile((prev: any) => ({
                    ...prev,
                    paymentSettings: { ...prev.paymentSettings, routingNumber: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input
                id="bankAccountNumber"
                type="password"
                value={organizerProfile.paymentSettings.bankAccountNumber}
                onChange={(e: any) => setOrganizerProfile((prev: any) => ({
                  ...prev,
                  paymentSettings: { ...prev.paymentSettings, bankAccountNumber: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="Account number will be encrypted"
              />
            </div>
          </div>

          <Separator />

          {/* PayPal */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              PayPal
            </h3>
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={organizerProfile.paymentSettings.paypalEmail}
                onChange={(e: any) => setOrganizerProfile((prev: any) => ({
                  ...prev,
                  paymentSettings: { ...prev.paymentSettings, paypalEmail: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="paypal@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Schedule</CardTitle>
          <CardDescription>
            Configure when you receive payouts from ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Automatic Payouts</h4>
              <p className="text-sm text-muted-foreground">Receive payouts 2 days after event completion</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Weekly Summary</h4>
              <p className="text-sm text-muted-foreground">Get weekly payout summaries via email</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Badge variant={userType === 'organizer' ? 'default' : 'secondary'}>
            {userType === 'organizer' ? 'Event Organizer' : 'Event Attendee'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${userType === 'organizer' ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            {userType === 'organizer' && (
              <>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payments
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile information and how others see you
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => {
                      setEditProfile(currentProfile);
                      setIsEditing(true);
                    }} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ProfileFormComponent
                  data={isEditing ? editProfile : currentProfile}
                  onChange={setEditProfile}
                  readonly={!isEditing}
                  userType={userType}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and membership information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {formatMemberSince(currentProfile.memberSince)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Account Status</p>
                      <p className="text-sm text-green-600">Verified</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently remove your account and associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove your profile, tickets, and event history. You cannot undo this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={async (event: MouseEvent<HTMLButtonElement>) => {
                          event.preventDefault();
                          const success = await handleDeleteAccount();
                          if (success) {
                            setDeleteDialogOpen(false);
                          }
                        }}
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about events and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email Notifications</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your events via email
                      </p>
                    </div>
                    <Switch
                      checked={isEditing ? editProfile.preferences.emailNotifications : currentProfile.preferences.emailNotifications}
                      onCheckedChange={(checked: any) => updatePreference('emailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">SMS Notifications</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for important event updates
                      </p>
                    </div>
                    <Switch
                      checked={isEditing ? editProfile.preferences.smsNotifications : currentProfile.preferences.smsNotifications}
                      onCheckedChange={(checked: any) => updatePreference('smsNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Event Reminders</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders before your events start
                      </p>
                    </div>
                    <Switch
                      checked={isEditing ? editProfile.preferences.eventReminders : currentProfile.preferences.eventReminders}
                      onCheckedChange={(checked: any) => updatePreference('eventReminders', checked)}
                    />
                  </div>

                  <Separator />

                 
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {userType === 'organizer' && (
            <>
              <TabsContent value="business" className="space-y-6">
                <BusinessDetailsTab />
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <PaymentSettingsTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}