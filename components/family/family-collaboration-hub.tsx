'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  Eye,
  EyeOff,
  MessageCircle,
  Calendar,
  Camera,
  Heart,
  Share2,
  Link,
  Settings,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MoreVertical,
  Gift,
  Star,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  status: 'active' | 'invited' | 'declined';
  joinedDate: string;
  lastActive: string;
  permissions: {
    canChat: boolean;
    canAddMemories: boolean;
    canEditTimeline: boolean;
    canInviteOthers: boolean;
    canViewPrivate: boolean;
  };
  notifications: {
    newMemories: boolean;
    newConversations: boolean;
    milestones: boolean;
    familyUpdates: boolean;
  };
}

interface SharedMemory {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'video' | 'audio' | 'text' | 'milestone';
  createdBy: string;
  createdAt: string;
  tags: string[];
  isPrivate: boolean;
  reactions: Record<string, string[]>; // emoji -> user IDs
  comments: {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }[];
  viewedBy: string[];
}

interface CollaborationActivity {
  id: string;
  type: 'memory_added' | 'conversation' | 'milestone_created' | 'member_joined' | 'reaction' | 'comment';
  userId: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

const ROLE_PERMISSIONS = {
  owner: {
    canChat: true,
    canAddMemories: true,
    canEditTimeline: true,
    canInviteOthers: true,
    canViewPrivate: true
  },
  admin: {
    canChat: true,
    canAddMemories: true,
    canEditTimeline: true,
    canInviteOthers: true,
    canViewPrivate: true
  },
  contributor: {
    canChat: true,
    canAddMemories: true,
    canEditTimeline: false,
    canInviteOthers: false,
    canViewPrivate: false
  },
  viewer: {
    canChat: false,
    canAddMemories: false,
    canEditTimeline: false,
    canInviteOthers: false,
    canViewPrivate: false
  }
};

export function FamilyCollaborationHub({ sessionId }: { sessionId: string }) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [sharedMemories, setSharedMemories] = useState<SharedMemory[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<FamilyMember['role']>('contributor');
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [newMemory, setNewMemory] = useState<Partial<SharedMemory>>({
    type: 'text',
    isPrivate: false
  });

  useEffect(() => {
    loadFamilyData();
  }, [sessionId]);

  const loadFamilyData = async () => {
    try {
      const [membersRes, memoriesRes, activitiesRes] = await Promise.all([
        fetch(`/api/family/members?sessionId=${sessionId}`),
        fetch(`/api/family/memories?sessionId=${sessionId}`),
        fetch(`/api/family/activities?sessionId=${sessionId}`)
      ]);

      const [members, memories, activities] = await Promise.all([
        membersRes.json(),
        memoriesRes.json(),
        activitiesRes.json()
      ]);

      setFamilyMembers(members.members || []);
      setSharedMemories(memories.memories || []);
      setActivities(activities.activities || []);
      setCurrentUser(members.currentUser);
    } catch (error) {
      console.error('Failed to load family data:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteRole) return;

    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: inviteEmail,
          role: inviteRole,
          message: inviteMessage
        })
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteMessage('');
        loadFamilyData();
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.title) return;

    try {
      const response = await fetch('/api/family/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMemory,
          sessionId
        })
      });

      if (response.ok) {
        setShowMemoryModal(false);
        setNewMemory({ type: 'text', isPrivate: false });
        loadFamilyData();
      }
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  const handleReaction = async (memoryId: string, emoji: string) => {
    try {
      await fetch('/api/family/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          memoryId,
          emoji
        })
      });
      loadFamilyData();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const getMemberRole = (role: FamilyMember['role']) => {
    const roleConfig = {
      owner: { icon: Crown, label: 'Owner', color: 'text-yellow-600' },
      admin: { icon: Shield, label: 'Admin', color: 'text-blue-600' },
      contributor: { icon: Edit3, label: 'Contributor', color: 'text-green-600' },
      viewer: { icon: Eye, label: 'Viewer', color: 'text-gray-600' }
    };
    return roleConfig[role];
  };

  const getActivityIcon = (type: CollaborationActivity['type']) => {
    const icons = {
      memory_added: Camera,
      conversation: MessageCircle,
      milestone_created: Calendar,
      member_joined: UserPlus,
      reaction: Heart,
      comment: MessageCircle
    };
    return icons[type] || Bell;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Family Circle
          </h2>
          <p className="text-gray-600">Share memories and collaborate with family</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          {currentUser?.permissions.canInviteOthers && (
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Family
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family Members */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Family Members ({familyMembers.length})</span>
                {currentUser?.permissions.canInviteOthers && (
                  <Button size="sm" variant="outline" onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyMembers.map(member => {
                  const roleConfig = getMemberRole(member.role);
                  const RoleIcon = roleConfig.icon;

                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              <RoleIcon className={`w-3 h-3 mr-1 ${roleConfig.color}`} />
                              {roleConfig.label}
                            </Badge>
                            {member.status === 'invited' && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-xs text-gray-400">
                            Last active: {new Date(member.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.status === 'active' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {currentUser?.role === 'owner' && member.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMember(member)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shared Memories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Shared Memories ({sharedMemories.length})</span>
                {currentUser?.permissions.canAddMemories && (
                  <Button size="sm" onClick={() => setShowMemoryModal(true)}>
                    <Gift className="w-4 h-4 mr-2" />
                    Add Memory
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedMemories.map(memory => {
                  const creator = familyMembers.find(m => m.id === memory.createdBy);
                  
                  return (
                    <Card key={memory.id} className="border-l-4 border-l-purple-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{memory.title}</h4>
                              {memory.isPrivate && (
                                <Badge variant="secondary" className="text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{memory.description}</p>
                            <div className="text-xs text-gray-500">
                              Added by {creator?.name} • {new Date(memory.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {memory.tags.length > 0 && (
                          <div className="flex gap-1 mb-3">
                            {memory.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {['❤️', '😊', '😢', '👏', '🙏'].map(emoji => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 hover:bg-purple-50"
                                onClick={() => handleReaction(memory.id, emoji)}
                              >
                                <span className="mr-1">{emoji}</span>
                                <span className="text-xs">
                                  {memory.reactions[emoji]?.length || 0}
                                </span>
                              </Button>
                            ))}
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-xs">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {memory.comments.length} comments
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 10).map(activity => {
                  const user = familyMembers.find(m => m.id === activity.userId);
                  const ActivityIcon = getActivityIcon(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <ActivityIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{user?.name}</span>
                          {' '}{activity.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="family@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as FamilyMember['role'])}
                className="w-full p-2 border rounded-lg"
              >
                <option value="contributor">Contributor - Can add memories and chat</option>
                <option value="viewer">Viewer - Can only view memories</option>
                {currentUser?.role === 'owner' && (
                  <option value="admin">Admin - Full access</option>
                )}
              </select>
            </div>
            
            <div>
              <Label htmlFor="message">Personal Message (optional)</Label>
              <Textarea
                id="message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Hi! I'd love for you to join our family memories on Talkers..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} disabled={!inviteEmail}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Memory Modal */}
      <Dialog open={showMemoryModal} onOpenChange={setShowMemoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shared Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newMemory.title || ''}
                onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
                placeholder="What's this memory about?"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMemory.description || ''}
                onChange={(e) => setNewMemory({...newMemory, description: e.target.value})}
                placeholder="Share the details of this special memory..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={newMemory.isPrivate}
                onCheckedChange={(checked) => setNewMemory({...newMemory, isPrivate: checked})}
              />
              <Label htmlFor="private">Keep this memory private</Label>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMemoryModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMemory} disabled={!newMemory.title}>
                Add Memory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}