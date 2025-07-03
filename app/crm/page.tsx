'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar, 
  Play, 
  Pause, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  subject: string;
  status: string;
  targetType: string;
  totalTargets: number;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  createdAt: string;
  scheduledFor?: string;
  logs: any[];
  sequences: any[];
}

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalEmailsSent: number;
  averageOpenRate: number;
  totalUsers: number;
  verifiedUsers: number;
}

export default function CRMDashboard() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmailsSent: 0,
    averageOpenRate: 0,
    totalUsers: 0,
    verifiedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminKey, setAdminKey] = useState('');

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    subject: '',
    targetType: 'VERIFIED_USERS',
    emailTemplate: {
      html: '',
      text: ''
    }
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchCampaigns();
      fetchStats();
    }
  }, [isAdminAuthenticated]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`/api/crm/campaigns?adminKey=${encodeURIComponent(adminKey)}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/crm/analytics?adminKey=${encodeURIComponent(adminKey)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCampaign, adminKey })
      });

      if (response.ok) {
        toast.success('Campaign created successfully');
        setIsCreateModalOpen(false);
        fetchCampaigns();
        setNewCampaign({
          name: '',
          description: '',
          subject: '',
          targetType: 'VERIFIED_USERS',
          emailTemplate: { html: '', text: '' }
        });
      } else {
        toast.error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const launchCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/crm/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Campaign launched! Sent ${data.results.sent} emails`);
        fetchCampaigns();
      } else {
        toast.error('Failed to launch campaign');
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      toast.error('Failed to launch campaign');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    try {
      const response = await fetch('/api/crm/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminPassword })
      });

      if (response.ok) {
        setIsAdminAuthenticated(true);
        setAdminKey(adminPassword); // Store the admin key for API calls
        toast.success('Welcome to CRM Dashboard!');
      } else {
        setAdminLoginError('Invalid admin password');
      }
    } catch (error) {
      setAdminLoginError('Authentication failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'RUNNING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CRM Admin Access
            </CardTitle>
            <CardDescription>
              Enter your admin password to access the CRM dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1"
                />
              </div>
              
              {adminLoginError && (
                <div className="text-red-600 text-sm">
                  {adminLoginError}
                </div>
              )}
              
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                Access CRM Dashboard
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium">Need the admin password?</p>
              <p>Check your .env.local file for ADMIN_EMAIL_KEY or run:</p>
              <code className="bg-white px-2 py-1 rounded text-xs">npm run email:setup</code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email CRM Dashboard</h1>
          <p className="text-gray-600">Manage your email campaigns and track performance</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Email Campaign</DialogTitle>
              <DialogDescription>
                Set up a new email campaign to reach your users
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="e.g., Welcome Series, Follow-up Campaign"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Brief description of this campaign"
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  placeholder="e.g., How has your experience been? 💜"
                />
              </div>

              <div>
                <Label htmlFor="targetType">Target Audience</Label>
                <Select 
                  value={newCampaign.targetType} 
                  onValueChange={(value) => setNewCampaign({...newCampaign, targetType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_USERS">All Users</SelectItem>
                    <SelectItem value="VERIFIED_USERS">Verified Users Only</SelectItem>
                    <SelectItem value="TRIAL_USERS">Trial Users</SelectItem>
                    <SelectItem value="PREMIUM_USERS">Premium Users</SelectItem>
                    <SelectItem value="INACTIVE_USERS">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="htmlTemplate">Email HTML Content</Label>
                <Textarea
                  id="htmlTemplate"
                  value={newCampaign.emailTemplate.html}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign, 
                    emailTemplate: {...newCampaign.emailTemplate, html: e.target.value}
                  })}
                  placeholder="Enter HTML email content. Use {{userName}} for personalization."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createCampaign}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedUsers} verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Manage and monitor your email campaigns</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => {
                const openRate = campaign.totalSent > 0 
                  ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1)
                  : '0.0';

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{campaign.targetType.replace('_', ' ')}</div>
                        <div className="text-gray-500">{campaign.totalTargets} users</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{campaign.totalSent} sent</div>
                        {campaign.totalFailed > 0 && (
                          <div className="text-red-500">{campaign.totalFailed} failed</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{openRate}%</TableCell>
                    <TableCell>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                          <Button
                            size="sm"
                            onClick={() => launchCampaign(campaign.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Launch
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 