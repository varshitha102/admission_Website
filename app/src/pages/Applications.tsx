import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/hooks/useApplications';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Filter } from 'lucide-react';
import { Application } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  confirmed: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function Applications() {
  const navigate = useNavigate();
  const { 
    applications, 
    pagination, 
    isLoading, 
    fetchApplications,
  } = useApplications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchApplications({ page: currentPage });
  }, [currentPage, fetchApplications]);

  const columns = [
    { 
      key: 'lead', 
      header: 'Student',
      render: (app: Application) => app.lead?.full_name || '-'
    },
    { 
      key: 'document_status', 
      header: 'Documents',
      render: (app: Application) => (
        <Badge className={statusColors[app.document_status] || 'bg-gray-100'}>
          {app.document_status}
        </Badge>
      )
    },
    { 
      key: 'fee_status', 
      header: 'Fee',
      render: (app: Application) => (
        <Badge className={statusColors[app.fee_status] || 'bg-gray-100'}>
          {app.fee_status}
        </Badge>
      )
    },
    { 
      key: 'admission_status', 
      header: 'Admission',
      render: (app: Application) => (
        <Badge className={statusColors[app.admission_status] || 'bg-gray-100'}>
          {app.admission_status}
        </Badge>
      )
    },
    { 
      key: 'enrollment_status', 
      header: 'Enrollment',
      render: (app: Application) => (
        <Badge className={statusColors[app.enrollment_status] || 'bg-gray-100'}>
          {app.enrollment_status}
        </Badge>
      )
    },
    { 
      key: 'overall_status', 
      header: 'Overall',
      render: (app: Application) => (
        <Badge className={statusColors[app.overall_status] || 'bg-gray-100'}>
          {app.overall_status}
        </Badge>
      )
    },
    { 
      key: 'created_at', 
      header: 'Created',
      render: (app: Application) => new Date(app.created_at).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500">Manage student applications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="flex gap-2">
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applications}
            columns={columns}
            keyExtractor={(app) => app.id}
            totalItems={pagination.total}
            currentPage={currentPage}
            itemsPerPage={pagination.perPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            emptyMessage="No applications found"
            actions={(app) => (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/applications/${app.id}`)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
