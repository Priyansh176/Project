import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PrefItem = {
  course_id: string;
  rank: number;
  course_name: string | null;
  credits: number | null;
  faculty: string | null;
  slot: string | null;
};

export function MyPreferences() {
  const { accessToken } = useAuth();
  const [prefs, setPrefs] = useState<PrefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    api<{ preferences: PrefItem[] }>('/preferences', { token: accessToken })
      .then((data) => setPrefs(data.preferences))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (courseId: string) => {
      if (!accessToken) return;
      const next = prefs.filter((p) => p.course_id !== courseId).map((p, i) => ({ course_id: p.course_id, rank: i + 1 }));
      setSaving(true);
      setError('');
      try {
        await api('/preferences', {
          method: 'PUT',
          body: JSON.stringify({ preferences: next }),
          token: accessToken,
        });
        load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update');
      } finally {
        setSaving(false);
      }
    },
    [accessToken, prefs, load]
  );

  const move = useCallback(
    async (courseId: string, dir: 'up' | 'down') => {
      const i = prefs.findIndex((p) => p.course_id === courseId);
      if (i < 0) return;
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= prefs.length) return;
      const next = [...prefs];
      [next[i], next[j]] = [next[j], next[i]];
      const body = next.map((p, r) => ({ course_id: p.course_id, rank: r + 1 }));
      if (!accessToken) return;
      setSaving(true);
      setError('');
      try {
        await api('/preferences', { method: 'PUT', body: JSON.stringify({ preferences: body }), token: accessToken });
        load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update');
      } finally {
        setSaving(false);
      }
    },
    [accessToken, prefs]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Preferences</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Preferences</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Ranked course preferences</CardTitle>
          <p className="text-sm text-muted-foreground">Reorder with up/down. Remove to drop from list. Add more from Available Courses.</p>
        </CardHeader>
        <CardContent>
          {prefs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No preferences yet. Add courses from Available Courses.</p>
          ) : (
            <ul className="space-y-2">
              {prefs.map((p, i) => (
                <li
                  key={p.course_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-muted-foreground w-6">{p.rank}.</span>
                    <span className="font-medium">{p.course_id}</span>
                    <span>{p.course_name ?? ''}</span>
                    {p.credits != null && <span className="text-muted-foreground text-sm">{p.credits} cr</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" disabled={saving || i === 0} onClick={() => move(p.course_id, 'up')}>
                      ↑
                    </Button>
                    <Button size="sm" variant="ghost" disabled={saving || i === prefs.length - 1} onClick={() => move(p.course_id, 'down')}>
                      ↓
                    </Button>
                    <Button size="sm" variant="outline" disabled={saving} onClick={() => remove(p.course_id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
