import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Course = {
  course_id: string;
  course_name: string;
  credits: number;
  department_name: string | null;
  semester: number | null;
  status: string;
  capacity: number;
  seats_available: number;
  seats_allotted: number;
  slot: string;
  faculty: string;
};

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function AvailableCourses() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState<string>('');
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const addToPreferences = useCallback(
    async (courseId: string) => {
      if (!accessToken) return;
      setAddingId(courseId);
      try {
        const { preferences: current } = await api<{ preferences: { course_id: string; rank: number }[] }>('/preferences', { token: accessToken });
        const exists = current.some((p) => p.course_id === courseId);
        if (exists) {
          setError('Already in your preferences');
          return;
        }
        const next = [...current, { course_id: courseId, rank: current.length + 1 }];
        await api('/preferences', {
          method: 'PUT',
          body: JSON.stringify({ preferences: next }),
          token: accessToken,
        });
        setError('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add');
      } finally {
        setAddingId(null);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (department) params.set('department', department);
    if (semester) params.set('semester', semester);
    const q = params.toString();
    api<{ courses: Course[] }>(`/courses${q ? `?${q}` : ''}`, { token: accessToken ?? undefined })
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, [accessToken, department, semester]);

  const filtered = search.trim()
    ? courses.filter(
        (c) =>
          c.course_id.toLowerCase().includes(search.toLowerCase()) ||
          c.course_name.toLowerCase().includes(search.toLowerCase()) ||
          (c.department_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available Courses</h1>
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by code, name, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={String(s)}>Sem {s}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-muted-foreground">Loading courses...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No courses found.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Course Code</th>
                  <th className="text-left p-3 font-medium">Course Name</th>
                  <th className="text-left p-3 font-medium">Faculty</th>
                  <th className="text-left p-3 font-medium">Credits</th>
                  <th className="text-left p-3 font-medium">Seats</th>
                  <th className="text-left p-3 font-medium">Slot</th>
                  <th className="text-left p-3 font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.course_id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.course_id}</td>
                    <td className="p-3">{c.course_name}</td>
                    <td className="p-3">{c.faculty}</td>
                    <td className="p-3">{c.credits}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              c.capacity === 0 ? 'bg-muted' : c.seats_available === 0 ? 'bg-destructive' : c.seats_available < c.capacity / 2 ? 'bg-amber-500' : 'bg-green-500'
                            )}
                            style={{ width: c.capacity ? `${(c.seats_available / c.capacity) * 100}%` : '0%' }}
                          />
                        </div>
                        <span>{c.seats_available} / {c.capacity}</span>
                      </div>
                    </td>
                    <td className="p-3">{c.slot}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={addingId === c.course_id}
                        onClick={() => addToPreferences(c.course_id)}
                      >
                        {addingId === c.course_id ? 'Adding…' : 'Add preference'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
