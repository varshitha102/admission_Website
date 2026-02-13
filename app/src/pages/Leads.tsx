import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { usePermission } from '@/components/PermissionGate';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { Lead, LeadFormData } from '@/types';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  converted: 'bg-blue-100 text-blue-800',
  lost: 'bg-red-100 text-red-800',
  dormant: 'bg-gray-100 text-gray-800',
};

export function Leads() {
  const navigate = useNavigate();
  const { 
    leads, 
    pagination, 
    isLoading, 
    fetchLeads, 
    createLead, 
    deleteLead,
    stages,
    sources 
  } = useLeads();
  const { canEditLead, canDeleteLead } = usePermission();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<LeadFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source_id: undefined,
    stage_id: undefined,
    assigned_to: undefined,
  });

  useEffect(() => {
    fetchLeads({ page: currentPage, search: searchQuery });
  }, [currentPage, fetchLeads]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLeads({ page: 1, search: searchQuery });
  };

  const handleCreate = async () => {
    try {
      await createLead(formData);
      setIsCreateOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        source_id: undefined,
        stage_id: undefined,
        assigned_to: undefined,
      });
      fetchLeads({ page: currentPage });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (leadId: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId);
        fetchLeads({ page: currentPage });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const columns = [
    { key: 'full_name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { 
      key: 'stage', 
      header: 'Stage',
      render: (lead: Lead) => lead.stage?.name || '-'
    },
    { 
      key: 'source', 
      header: 'Source',
      render: (lead: Lead) => lead.source?.name || '-'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (lead: Lead) => (
        <Badge className={statusColors[lead.status] || 'bg-gray-100'}>
          {lead.status}
        </Badge>
      )
    },
    { 
      key: 'assigned_user', 
      header: 'Assigned To',
      render: (lead: Lead) => lead.assigned_user?.name || 'Unassigned'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Manage prospective students</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Source"
                  name="source_id"
                  type="select"
                  value={formData.source_id}
                  onChange={(v) => setFormData({ ...formData, source_id: v })}
                  options={sources.map(s => ({ value: s.id, label: s.name }))}
                />
                <FormField
                  label="Stage"
                  name="stage_id"
                  type="select"
                  value={formData.stage_id}
                  onChange={(v) => setFormData({ ...formData, stage_id: v })}
                  options={stages.map(s => ({ value: s.id, label: s.name }))}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="flex gap-2">
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={leads}
            columns={columns}
            keyExtractor={(lead) => lead.id}
            totalItems={pagination.total}
            currentPage={currentPage}
            itemsPerPage={pagination.perPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            emptyMessage="No leads found"
            actions={(lead) => (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {canEditLead(lead.assigned_to) && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate(`/leads/${lead.id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {canDeleteLead() && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(lead.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
