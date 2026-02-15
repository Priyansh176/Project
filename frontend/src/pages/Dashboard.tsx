import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { user, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Course Allotment Portal</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            {role === 'admin' ? 'Admin' : 'Student'} Dashboard
          </h2>
          <p className="text-muted-foreground">
            {user?.name && `${user.name} · `}
            {user?.email}
            {user?.roll_no && ` · ${user.roll_no}`}
            {user?.department && ` · ${user.department} Sem ${user.semester}`}
          </p>
        </div>
      </div>
    </div>
  );
}
