import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  Bell,
  Zap,
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Types
type UserRole = 'Admin' | 'Team Lead' | 'Executive' | 'Consultant' | 'Publisher' | 'Digital Manager';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  stage: string;
  source: string;
  status: string;
  assigned_to: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  due_date?: string;
  assigned_to: string;
}

// Mock Data
const mockUser: User = {
  id: 1,
  name: 'Admin User',
  email: 'admin@university.edu',
  role: 'Admin',
  is_active: true,
};

const mockLeads: Lead[] = [
  { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '555-0101', stage: 'Inquiry', source: 'Website', status: 'active', assigned_to: 'Mike Executive' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', phone: '555-0102', stage: 'Lead', source: 'Referral', status: 'active', assigned_to: 'Sarah Manager' },
  { id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', phone: '555-0103', stage: 'Application', source: 'Google Ads', status: 'converted', assigned_to: 'Mike Executive' },
  { id: 4, first_name: 'Alice', last_name: 'Williams', email: 'alice@example.com', phone: '555-0104', stage: 'Admission', source: 'Facebook', status: 'active', assigned_to: 'Sarah Manager' },
  { id: 5, first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', phone: '555-0105', stage: 'Enrollment', source: 'Event', status: 'converted', assigned_to: 'Mike Executive' },
];

const mockTasks: Task[] = [
  { id: 1, title: 'Follow up with John Doe', description: 'Call to discuss program options', type: 'call', priority: 'high', status: 'pending', due_date: '2024-02-15', assigned_to: 'Mike Executive' },
  { id: 2, title: 'Send application form', description: 'Email application to Jane Smith', type: 'email', priority: 'medium', status: 'completed', due_date: '2024-02-14', assigned_to: 'Sarah Manager' },
  { id: 3, title: 'Schedule interview', description: 'Set up admission interview', type: 'meeting', priority: 'high', status: 'pending', due_date: '2024-02-16', assigned_to: 'Mike Executive' },
];

const mockWorkflows = [
  { id: 1, name: 'New Lead Welcome', description: 'Send welcome email when new lead is created', trigger: 'lead_created', active: true, execution_count: 145 },
  { id: 2, name: 'Stage Change Notification', description: 'Notify team when lead moves to application stage', trigger: 'stage_changed', active: true, execution_count: 89 },
  { id: 3, name: 'Inactive Lead Follow-up', description: 'Create follow-up task for inactive leads', trigger: 'scheduled_time', active: false, execution_count: 234 },
];

const faqs = [
  { question: 'How do I create a new lead?', answer: 'Navigate to the Leads page and click the "Add Lead" button. Fill in the required information including name, email, and phone number.' },
  { question: 'How does the lead pipeline work?', answer: 'The lead pipeline consists of 5 stages: Inquiry, Lead, Application, Admission, and Enrollment. Leads progress through these stages as they move closer to enrollment.' },
  { question: 'What are tasks and how do I use them?', answer: 'Tasks are follow-up reminders and activities. You can create tasks for yourself or assign them to team members.' },
];

// Status color helpers
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  converted: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800',
};

// Navigation Items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'publisher', label: 'Publisher', icon: Globe },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Changed to false to show login

  // Login View with Jain University Branding
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center login-background px-4">
        <div className="w-full max-w-md">
          {/* University Logo */}
          <div className="text-center mb-8">
            <div className="logo-container mb-6">
              <img 
                src="https://www.genspark.ai/api/files/s/JTddWKAi" 
                alt="Jain University Logo" 
                className="jain-logo"
              />
            </div>
          </div>

          <Card className="login-card">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 mb-4 shadow-lg">
                  <span className="text-white font-bold text-3xl">JGI</span>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-blue-900">ADMISSION PORTAL</CardTitle>
              <CardDescription className="text-base mt-2 tracking-widest uppercase text-gray-400">
                Staff Single-Sign-On Experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); toast.success('Login successful!'); }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Work Email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="name@uni.edu" 
                      className="pl-10 h-12 bg-gray-50 border-gray-200"
                      placeholder="name@uni.edu"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Secure Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      defaultValue="••••••••" 
                      className="pl-10 h-12 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold text-base shadow-lg transition-all duration-200 border-b-4 border-amber-400"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  SEND OTP VERIFICATION
                </Button>
              </form>
              
              <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ACTIVE SESSION: 90 DAYS
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center text-xs text-gray-400 space-y-2">
                  <div className="font-semibold uppercase tracking-widest">Jain (Deemed-to-be University)</div>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <span>SYSTEM V4.0.0</span>
                    <span>•</span>
                    <span>GDPR COMPLIANT</span>
                    <span>•</span>
                    <span>ISO 27001</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your admissions pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-gray-500">+12 today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Applications</CardTitle>
            <FileText className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-gray-500">23 pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-gray-500">5 overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-gray-500">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.slice(0, 5).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.first_name} {lead.last_name}</TableCell>
                    <TableCell>{lead.stage}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status] || 'bg-gray-100'}>{lead.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTasks.filter(t => t.status === 'pending').map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.priority] || 'bg-gray-100'}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>{task.due_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Leads View
  const LeadsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Manage prospective students</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
              <Button className="w-full" onClick={() => toast.success('Lead created!')}>Create Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm flex gap-2">
              <Input placeholder="Search leads..." />
              <Button variant="outline"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.stage}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status] || 'bg-gray-100'}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>{lead.assigned_to}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Applications View
  const ApplicationsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500">Manage student applications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm flex gap-2">
              <Input placeholder="Search applications..." />
              <Button variant="outline"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeads.filter(l => l.status === 'converted').map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">verified</Badge></TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">paid</Badge></TableCell>
                  <TableCell><Badge className="bg-blue-100 text-blue-800">approved</Badge></TableCell>
                  <TableCell><Badge className="bg-purple-100 text-purple-800">confirmed</Badge></TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">completed</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Tasks View
  const TasksView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage follow-ups and reminders</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Task title" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Task description" />
              </div>
              <Button className="w-full" onClick={() => toast.success('Task created!')}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.type}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[task.priority] || 'bg-gray-100'}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[task.status] || 'bg-gray-100'}>{task.status}</Badge>
                  </TableCell>
                  <TableCell>{task.due_date}</TableCell>
                  <TableCell>{task.assigned_to}</TableCell>
                  <TableCell>
                    {task.status !== 'completed' && (
                      <Button variant="ghost" size="icon" onClick={() => toast.success('Task completed!')}>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Reports View
  const ReportsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Analytics and performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Response Time</CardTitle>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
              +0.5h from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Applications</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Inquiry', 'Lead', 'Application', 'Admission', 'Enrollment'].map((stage, i) => (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{stage}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${100 - i * 15}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-right">{120 - i * 20}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lead Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Website', value: 35, color: 'bg-blue-500' },
                { name: 'Referral', value: 25, color: 'bg-green-500' },
                { name: 'Social Media', value: 20, color: 'bg-purple-500' },
                { name: 'Events', value: 15, color: 'bg-amber-500' },
                { name: 'Other', value: 5, color: 'bg-gray-500' },
              ].map((source) => (
                <div key={source.name} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-medium">{source.name}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${source.color} rounded-full`} style={{ width: `${source.value * 2}%` }} />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-right">{source.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Automation View
  const AutomationView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-500">Configure automated workflows</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Create Workflow</Button>
      </div>

      <div className="grid gap-4">
        {mockWorkflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <Badge variant={workflow.active ? 'default' : 'secondary'}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4" />
                      Trigger: {workflow.trigger}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">|</span>
                      Executed {workflow.execution_count} times
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={workflow.active} />
                  <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Settings View
  const SettingsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system configuration</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-2"><Users className="w-4 h-4" />Users</TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Stages</TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2"><Globe className="w-4 h-4" />Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </div>
              <Button><Plus className="w-4 h-4 mr-2" />Add User</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: 'John Admin', email: 'admin@university.edu', role: 'Admin', is_active: true },
                    { id: 2, name: 'Sarah Manager', email: 'sarah@university.edu', role: 'Team Lead', is_active: true },
                    { id: 3, name: 'Mike Executive', email: 'mike@university.edu', role: 'Executive', is_active: true },
                  ].map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
              <CardDescription>Configure lead and application stages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: 'Inquiry', type: 'lead', order: 1, is_active: true },
                    { id: 2, name: 'Lead', type: 'lead', order: 2, is_active: true },
                    { id: 3, name: 'Application', type: 'lead', order: 3, is_active: true },
                    { id: 4, name: 'Admission', type: 'lead', order: 4, is_active: true },
                    { id: 5, name: 'Enrollment', type: 'lead', order: 5, is_active: true },
                  ].map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>{stage.order}</TableCell>
                      <TableCell className="font-medium">{stage.name}</TableCell>
                      <TableCell><Badge variant="outline">{stage.type}</Badge></TableCell>
                      <TableCell>
                        <Badge className={stage.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {stage.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Configure lead source categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: 'Website', category: 'Organic', is_active: true },
                    { id: 2, name: 'Google Ads', category: 'Paid', is_active: true },
                    { id: 3, name: 'Facebook', category: 'Social Media', is_active: true },
                    { id: 4, name: 'Referral', category: 'Referral', is_active: true },
                  ].map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell><Badge variant="outline">{source.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
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

  // Publisher View
  const PublisherView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publisher Portal</h1>
        <p className="text-gray-500">Submit and track your leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Leads Submitted</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <Progress value={45} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">of 100 limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Converted</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">Successful conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26.7%</div>
            <p className="text-xs text-gray-500">Average performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <CheckCircle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33</div>
            <p className="text-xs text-gray-500">Active leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Lead</CardTitle>
            <CardDescription>Enter lead details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional information..." />
            </div>
            <Button className="w-full" onClick={() => toast.success('Lead submitted!')}>Submit Lead</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Submitted Leads</CardTitle>
            <CardDescription>Track the status of your leads</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 1, name: 'Alice Johnson', status: 'converted', date: '2024-01-15' },
                  { id: 2, name: 'Bob Smith', status: 'active', date: '2024-01-14' },
                  { id: 3, name: 'Carol White', status: 'active', date: '2024-01-13' },
                ].map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status] || 'bg-gray-100'}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>{lead.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Help View
  const HelpView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500">Find answers and get support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Live Chat', desc: 'Available 9am - 5pm', icon: '💬', btn: 'Start Chat' },
          { title: 'Email Support', desc: 'Response within 24h', icon: '✉️', btn: 'Send Email' },
          { title: 'Phone Support', desc: '+1 (555) 123-4567', icon: '📞', btn: 'Call Now' },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
              <Button variant="outline" className="w-full">{item.btn}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  // View Renderer
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'leads': return <LeadsView />;
      case 'applications': return <ApplicationsView />;
      case 'tasks': return <TasksView />;
      case 'reports': return <ReportsView />;
      case 'automation': return <AutomationView />;
      case 'settings': return <SettingsView />;
      case 'publisher': return <PublisherView />;
      case 'help': return <HelpView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">JGI</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-gray-900 text-sm leading-tight">JAIN</span>
                <span className="text-xs text-gray-500 leading-tight">UNIVERSITY</span>
              </div>
            </button>
            <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">{mockUser.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{mockUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{mockUser.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAuthenticated(false)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-2 px-3 text-sm text-gray-500">No new notifications</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {renderView()}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;