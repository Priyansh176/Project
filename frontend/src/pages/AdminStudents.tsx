import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Student {
  roll_no: string;
  name: string;
  email: string;
  cgpa: number | null;
  status: 'active' | 'inactive';
  department_id: number | null;
}

export function AdminStudents() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadStudents = () => {
    if (!accessToken) return;
    setLoading(true);
    api<{ students: Student[] }>('/admin/students', { token: accessToken })
      .then((data) => setStudents(data.students))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load students'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [accessToken]);

  const approveStudent = async (rollNo: string) => {
    if (!accessToken) return;
    setActionLoading(rollNo);
    setError('');
    setSuccessMessage('');
    try {
      await api(`/admin/${rollNo}/approve`, {
        method: 'PATCH',
        token: accessToken,
      });
      setSuccessMessage(`Student ${rollNo} approved`);
      loadStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve student');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectStudent = async (rollNo: string) => {
    if (!accessToken) return;
    setActionLoading(rollNo);
    setError('');
    setSuccessMessage('');
    try {
      await api(`/admin/${rollNo}/reject`, {
        method: 'PATCH',
        token: accessToken,
      });
      setSuccessMessage(`Student ${rollNo} rejected`);
      loadStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject student');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingStudents = students.filter((s) => s.status === 'inactive');
  const approvedStudents = students.filter((s) => s.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground mt-1">Approve or reject student registrations</p>
      </div>

      {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Pending Approval ({pendingStudents.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">Students awaiting approval</p>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending approvals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Roll No</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Email</th>
                    <th className="text-left py-2 px-3 font-medium">CGPA</th>
                    <th className="text-right py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map((student) => (
                    <tr key={student.roll_no} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-medium">{student.roll_no}</td>
                      <td className="py-3 px-3">{student.name}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{student.email}</td>
                      <td className="py-3 px-3">{student.cgpa ?? '—'}</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={actionLoading === student.roll_no}
                          onClick={() => approveStudent(student.roll_no)}
                        >
                          <CheckCircle2 size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === student.roll_no}
                          onClick={() => rejectStudent(student.roll_no)}
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            Approved Students ({approvedStudents.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">Active students in the system</p>
        </CardHeader>
        <CardContent>
          {approvedStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No approved students</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Roll No</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Email</th>
                    <th className="text-left py-2 px-3 font-medium">CGPA</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedStudents.map((student) => (
                    <tr key={student.roll_no} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-medium">{student.roll_no}</td>
                      <td className="py-3 px-3">{student.name}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{student.email}</td>
                      <td className="py-3 px-3">{student.cgpa ?? '—'}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
