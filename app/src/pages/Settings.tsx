import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Layers, 
  Globe, 
  Plus, 
  Edit2, 
  Trash2,
  Settings as SettingsIcon 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: 'John Admin', email: 'admin@university.edu', role: 'Admin', is_active: true },
  { id: 2, name: 'Sarah Manager', email: 'sarah@university.edu', role: 'Team Lead', is_active: true },
  { id: 3, name: 'Mike Executive', email: 'mike@university.edu', role: 'Executive', is_active: true },
];

const mockStages = [
  { id: 1, name: 'Inquiry', type: 'lead', order: 1, is_active: true },
  { id: 2, name: 'Lead', type: 'lead', order: 2, is_active: true },
  { id: 3, name: 'Application', type: 'lead', order: 3, is_active: true },
  { id: 4, name: 'Admission', type: 'lead', order: 4, is_active: true },
  { id: 5, name: 'Enrollment', type: 'lead', order: 5, is_active: true },
];

const mockSources = [
  { id: 1, name: 'Website', category: 'Organic', is_active: true },
  { id: 2, name: 'Google Ads', category: 'Paid', is_active: true },
  { id: 3, name: 'Facebook', category: 'Social Media', is_active: true },
  { id: 4, name: 'Referral', category: 'Referral', is_active: true },
];

export function Settings() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </div>
              <PermissionGate requireAdmin>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <PermissionGate requireAdmin>
                      <TableHead className="w-24">Actions</TableHead>
                    </PermissionGate>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <PermissionGate requireAdmin>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </PermissionGate>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>Configure lead and application stages</CardDescription>
              </div>
              <PermissionGate requireAdmin>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <PermissionGate requireAdmin>
                      <TableHead className="w-24">Actions</TableHead>
                    </PermissionGate>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStages.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>{stage.order}</TableCell>
                      <TableCell className="font-medium">{stage.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stage.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={stage.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {stage.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <PermissionGate requireAdmin>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </PermissionGate>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Configure lead source categories</CardDescription>
              </div>
              <PermissionGate requireAdmin>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <PermissionGate requireAdmin>
                      <TableHead className="w-24">Actions</TableHead>
                    </PermissionGate>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <PermissionGate requireAdmin>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </PermissionGate>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
