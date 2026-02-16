import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface AllotmentResult {
  students_processed: number;
  total_allotted: number;
  total_waitlisted: number;
  timestamp: string;
}

export function AdminAllotment() {
  const { accessToken } = useAuth();
  const [result, setResult] = useState<AllotmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [published, setPublished] = useState(false);

  const runAllotment = async () => {
    if (!accessToken) return;

    // Confirm before running
    const confirmed = window.confirm(
      'This will clear all existing allotments and run the allotment algorithm. Continue?'
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api<{ result: AllotmentResult }>('/admin/allotment/run', {
        method: 'POST',
        token: accessToken,
      });
      setResult(data.result);
      setSuccess('Allotment completed successfully!');
      setPublished(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run allotment');
    } finally {
      setLoading(false);
    }
  };

  const publishResults = () => {
    if (!result) return;

    // Confirm before publishing
    const confirmed = window.confirm(
      'Publishing will make allotment results visible to all students. Continue?'
    );
    if (!confirmed) return;

    setPublished(true);
    setSuccess('Results published! Students can now view their allotments.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Allotment</h1>
        <p className="text-muted-foreground mt-1">Run allotment algorithm and manage results</p>
      </div>

      {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-md">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle size={20} />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>• The allotment algorithm sorts students by CGPA (highest first)</p>
          <p>• Students are allotted courses based on their ranked preferences</p>
          <p>• Courses fill up to capacity; overflow students are waitlisted</p>
          <p>• Running allotment will clear previous results</p>
          <p>• Results remain private until explicitly published</p>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Allotment Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
              onClick={runAllotment}
            >
              <Zap size={18} className="mr-2" />
              {loading ? 'Running...' : 'Run Allotment'}
            </Button>
            {result && (
              <Button
                size="lg"
                variant={published ? 'default' : 'outline'}
                disabled={published}
                onClick={publishResults}
                className={published ? 'bg-green-600' : ''}
              >
                <CheckCircle2 size={18} className="mr-2" />
                {published ? 'Published' : 'Publish Results'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Allotment Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Run at: {new Date(result.timestamp).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Students Processed */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Students Processed</p>
                  <p className="text-4xl font-bold text-blue-600">{result.students_processed}</p>
                  <p className="text-xs text-muted-foreground">Total applicants</p>
                </div>

                {/* Total Allotted */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Courses Allotted</p>
                  <p className="text-4xl font-bold text-green-600">{result.total_allotted}</p>
                  <p className="text-xs text-muted-foreground">Successful allotments</p>
                </div>

                {/* Total Waitlisted */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Waitlisted</p>
                  <p className="text-4xl font-bold text-orange-600">{result.total_waitlisted}</p>
                  <p className="text-xs text-muted-foreground">Waiting for seats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card className={`border-2 ${published ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardHeader>
              <CardTitle className={published ? 'text-green-900' : 'text-orange-900'}>
                {published ? '✅ Results Published' : '⏳ Results Not Yet Published'}
              </CardTitle>
            </CardHeader>
            <CardContent className={published ? 'text-green-800' : 'text-orange-800'}>
              {published ? (
                <p>Students can now view their allotment results in the "Allotment Result" section.</p>
              ) : (
                <p>Click "Publish Results" above to make these results visible to students.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results Yet */}
      {!result && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-muted-foreground">No Allotment Run Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Click "Run Allotment" above to start the course allocation process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
