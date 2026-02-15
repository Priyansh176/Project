import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const { user, role } = useAuth();

  if (role === 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground mt-2">Students, Courses, and Allotment sections are in the sidebar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name</span> {user?.name}</p>
            <p><span className="text-muted-foreground">Roll No</span> {user?.roll_no}</p>
            <p><span className="text-muted-foreground">Department</span> {user?.department}</p>
            <p><span className="text-muted-foreground">Semester</span> {user?.semester}</p>
            {user?.cgpa != null && <p><span className="text-muted-foreground">CGPA</span> {user.cgpa}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allotment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Not started</p>
            <p className="text-xs text-muted-foreground mt-1">Submit preferences and wait for allotment run.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Preference deadline: TBA</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
