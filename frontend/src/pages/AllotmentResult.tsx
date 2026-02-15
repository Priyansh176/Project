import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AllotmentResult() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Allotment Result</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your allotment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Results will appear here after the allotment is run. (Coming next.)</p>
        </CardContent>
      </Card>
    </div>
  );
}
