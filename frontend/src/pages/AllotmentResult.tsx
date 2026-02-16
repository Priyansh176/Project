import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CourseAllotment {
  course_id: string;
  course_name: string;
  credits: number;
  faculty: string;
  slot: string;
  preference_rank: number | null;
  capacity: number;
  course_type?: string;
  elective_slot?: string | null;
  max_choices?: number | null;
}

interface AllotmentData {
  allotted: CourseAllotment[];
  waitlisted: CourseAllotment[];
  summary: {
    total_allotted: number;
    total_credits: number;
    total_waitlisted: number;
  };
}

export function AllotmentResult() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<AllotmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    setLoading(true);
    api<AllotmentData>('/allotments/me', { token: accessToken })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load allotments'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Allotment Result</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Allotment Result</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Allotment Result</h1>
        <p className="text-muted-foreground text-sm">No allotment results available yet.</p>
      </div>
    );
  }

  // Helper function to group courses by elective slot
  const groupCoursesBySlot = (courses: CourseAllotment[]) => {
    const grouped: { slot: string | null; courses: CourseAllotment[] }[] = [];
    const electiveSlots = new Map<string, CourseAllotment[]>();
    const coreCourses: CourseAllotment[] = [];

    courses.forEach((course) => {
      if (course.course_type === 'elective' && course.elective_slot) {
        if (!electiveSlots.has(course.elective_slot)) {
          electiveSlots.set(course.elective_slot, []);
        }
        electiveSlots.get(course.elective_slot)!.push(course);
      } else {
        coreCourses.push(course);
      }
    });

    if (coreCourses.length > 0) {
      grouped.push({ slot: null, courses: coreCourses });
    }

    electiveSlots.forEach((courses, slot) => {
      grouped.push({ slot, courses });
    });

    return grouped;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Allotment Result</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Allotted Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.total_allotted}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.summary.total_credits} credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waitlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{data.summary.total_waitlisted}</div>
            <p className="text-xs text-muted-foreground mt-1">Waiting for seats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.total_allotted + data.summary.total_waitlisted}</div>
            <p className="text-xs text-muted-foreground mt-1">Submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Allotted Courses */}
      {data.allotted.length > 0 && (
        <div className="space-y-4">
          {groupCoursesBySlot(data.allotted).map(({ slot, courses }) => (
            <Card key={slot ?? 'core'}>
              <CardHeader>
                <CardTitle>
                  ✅ {slot ? slot : 'Core Courses'} (Allotted)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.course_id} className="border rounded-md p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{course.course_id}</div>
                          <div className="text-sm text-muted-foreground">{course.course_name}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            📚 {course.credits} credits | 👨‍🏫 {course.faculty} | 🕐 {course.slot}
                          </div>
                        </div>
                        <div className="text-right">
                          {course.preference_rank && (
                            <div className="text-sm font-medium text-blue-600">Preference #{course.preference_rank}</div>
                          )}
                          <div className="text-xs text-green-600 mt-1">Allotted</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Waitlisted Courses */}
      {data.waitlisted.length > 0 && (
        <div className="space-y-4">
          {groupCoursesBySlot(data.waitlisted).map(({ slot, courses }) => (
            <Card key={slot ?? 'core'}>
              <CardHeader>
                <CardTitle>
                  ⏳ {slot ? slot : 'Core Courses'} (Waitlisted)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.course_id} className="border border-orange-200 bg-orange-50 rounded-md p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{course.course_id}</div>
                          <div className="text-sm text-muted-foreground">{course.course_name}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            📚 {course.credits} credits | 👨‍🏫 {course.faculty} | 🕐 {course.slot}
                          </div>
                        </div>
                        <div className="text-right">
                          {course.preference_rank && (
                            <div className="text-sm font-medium text-blue-600">Preference #{course.preference_rank}</div>
                          )}
                          <div className="text-xs text-orange-600 mt-1">Waitlisted</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.allotted.length === 0 && data.waitlisted.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Allotments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">You have not been allotted or waitlisted for any courses yet. Allotments will appear here after the process is complete.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
