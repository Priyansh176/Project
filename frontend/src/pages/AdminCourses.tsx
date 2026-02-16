import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

interface Course {
  course_id: string;
  course_name: string;
  credits: number;
  faculty: string;
  slot: string;
  capacity: number;
  seats_available: number;
  seats_allotted: number;
}

export function AdminCourses() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourses = () => {
    if (!accessToken) return;
    setLoading(true);
    api<{ courses: Course[] }>('/courses', { token: accessToken })
      .then((data) => setCourses(data.courses))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-1">View and manage courses</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" disabled>
          <Plus size={18} className="mr-2" />
          Add Course (Coming Soon)
        </Button>
      </div>

      {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-md">{error}</p>}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            Active Courses ({courses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-muted-foreground text-sm">No courses available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Code</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Faculty</th>
                    <th className="text-left py-2 px-3 font-medium">Credits</th>
                    <th className="text-left py-2 px-3 font-medium">Slot</th>
                    <th className="text-left py-2 px-3 font-medium">Capacity</th>
                    <th className="text-left py-2 px-3 font-medium">Allotted</th>
                    <th className="text-left py-2 px-3 font-medium">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.course_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{course.course_id}</td>
                      <td className="py-3 px-3 font-medium">{course.course_name}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{course.faculty}</td>
                      <td className="py-3 px-3">{course.credits}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{course.slot}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-xs">
                          {course.capacity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium text-xs">
                          {course.seats_allotted}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-medium text-xs ${
                            course.seats_available > 0
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {course.seats_available}
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
