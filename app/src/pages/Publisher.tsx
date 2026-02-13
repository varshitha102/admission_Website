import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Send, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';

// Mock submitted leads for demonstration
const mockSubmittedLeads = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'converted', submitted_at: '2024-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'active', submitted_at: '2024-01-14' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', status: 'active', submitted_at: '2024-01-13' },
  { id: 4, name: 'David Brown', email: 'david@example.com', status: 'converted', submitted_at: '2024-01-12' },
];

const statusColors: Record<string, string> = {
  active: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export function Publisher() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleSubmit = async () => {
    try {
      // Mock submission
      toast.success('Lead submitted successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to submit lead');
    }
  };

  const stats = {
    leadsSubmitted: 45,
    leadsConverted: 12,
    conversionRate: 26.7,
    leadLimit: 100,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publisher Portal</h1>
        <p className="text-gray-500">Submit and track your leads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Leads Submitted</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsSubmitted}</div>
            <Progress value={(stats.leadsSubmitted / stats.leadLimit) * 100} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">of {stats.leadLimit} limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Converted</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsConverted}</div>
            <p className="text-xs text-gray-500">Successful conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-gray-500">Average performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <Clock className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsSubmitted - stats.leadsConverted}</div>
            <p className="text-xs text-gray-500">Active leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Lead Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Lead</CardTitle>
            <CardDescription>Enter lead details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={(v) => setFormData({ ...formData, first_name: v })}
                required
              />
              <FormField
                label="Last Name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={(v) => setFormData({ ...formData, last_name: v })}
                required
              />
            </div>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              required
            />
            <FormField
              label="Phone"
              name="phone"
              type="phone"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
            />
            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={(v) => setFormData({ ...formData, notes: v })}
            />
            <Button onClick={handleSubmit} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Submit Lead
            </Button>
          </CardContent>
        </Card>

        {/* Submitted Leads */}
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
                {mockSubmittedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status] || 'bg-gray-100'}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.submitted_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
