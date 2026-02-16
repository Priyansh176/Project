import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Edit2, Upload, X } from 'lucide-react';

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
  
  // CGPA editing
  const [editingCGPA, setEditingCGPA] = useState<string | null>(null);
  const [cgpaValue, setCgpaValue] = useState('');
  
  // Bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startEditCGPA = (rollNo: string, currentCGPA: number | null) => {
    setEditingCGPA(rollNo);
    setCgpaValue(currentCGPA?.toString() ?? '');
    setError('');
    setSuccessMessage('');
  };

  const cancelEditCGPA = () => {
    setEditingCGPA(null);
    setCgpaValue('');
  };

  const saveCGPA = async (rollNo: string) => {
    if (!accessToken) return;
    
    const cgpa = parseFloat(cgpaValue);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      setError('CGPA must be between 0 and 10');
      return;
    }

    setActionLoading(rollNo);
    setError('');
    setSuccessMessage('');
    try {
      await api(`/admin/${rollNo}/cgpa`, {
        method: 'PATCH',
        body: JSON.stringify({ cgpa }),
        token: accessToken,
      });
      setSuccessMessage(`CGPA updated for ${rollNo}`);
      setEditingCGPA(null);
      loadStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update CGPA');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setUploadLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const text = await file.text();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        setError('File is empty');
        return;
      }

      // Parse CSV (expecting format: roll_no,cgpa)
      const students: Array<{ roll_no: string; cgpa: string }> = [];

      lines.forEach((line, index) => {
        const [roll_no, cgpa] = line.split(',').map((v) => v.trim());
        
        // Skip header row if it exists
        if (index === 0 && (roll_no.toLowerCase() === 'roll_no' || roll_no.toLowerCase() === 'rollno')) {
          return;
        }

        if (roll_no && cgpa) {
          students.push({ roll_no, cgpa });
        }
      });

      if (students.length === 0) {
        setError('No valid data found in CSV file');
        return;
      }

      // Send bulk update request
      const result = await api<{ updated: number; failed: number; errors: string[] }>(
        '/admin/students/cgpa/bulk',
        {
          method: 'POST',
          body: JSON.stringify({ students }),
          token: accessToken,
        }
      );

      setSuccessMessage(
        `Bulk upload complete: ${result.updated} updated, ${result.failed} failed`
      );
      
      if (result.errors.length > 0) {
        setError(`Errors: ${result.errors.join(', ')}`);
      }

      loadStudents();
      setShowBulkUpload(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload file');
    } finally {
      setUploadLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground mt-1">Approve, reject, and manage student CGPAs</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowBulkUpload(!showBulkUpload)}
        >
          <Upload size={18} className="mr-2" />
          Bulk Upload CGPA
        </Button>
      </div>

      {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}

      {/* Bulk Upload Form */}
      {showBulkUpload && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Bulk Upload CGPA (CSV)</CardTitle>
            <button
              onClick={() => setShowBulkUpload(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a CSV file with format: <code className="bg-white px-2 py-1 rounded">roll_no,cgpa</code>
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Example: <code className="bg-white px-2 py-1 rounded">21CS101,8.5</code>
              </p>
              <Label htmlFor="csvFile">Select CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv,.txt"
                ref={fileInputRef}
                onChange={handleBulkUpload}
                disabled={uploadLoading}
                className="mt-2"
              />
              {uploadLoading && (
                <p className="text-sm text-blue-600 mt-2">Uploading...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <th className="text-right py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedStudents.map((student) => (
                    <tr key={student.roll_no} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-medium">{student.roll_no}</td>
                      <td className="py-3 px-3">{student.name}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{student.email}</td>
                      <td className="py-3 px-3">
                        {editingCGPA === student.roll_no ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              value={cgpaValue}
                              onChange={(e) => setCgpaValue(e.target.value)}
                              className="w-20"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => saveCGPA(student.roll_no)}
                              disabled={actionLoading === student.roll_no}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditCGPA}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{student.cgpa ?? '—'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingCGPA !== student.roll_no && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditCGPA(student.roll_no, student.cgpa)}
                          >
                            <Edit2 size={14} className="mr-1" />
                            Edit CGPA
                          </Button>
                        )}
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
