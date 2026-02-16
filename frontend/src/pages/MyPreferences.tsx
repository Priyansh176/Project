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
  course_type?: string | null;
  elective_slot?: string | null;
  max_choices?: number | null;
};

type PreferencesResponse = {
  preferences: PrefItem[];
  deadline: string | null;
  can_edit: boolean;
};

export function MyPreferences() {
  const { accessToken } = useAuth();
  const [prefs, setPrefs] = useState<PrefItem[]>([]);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    api<PreferencesResponse>('/preferences', { token: accessToken })
      .then((data) => {
        setPrefs(data.preferences);
        setDeadline(data.deadline);
        setCanEdit(data.can_edit);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  // Update time remaining every minute
  useEffect(() => {
    if (!deadline) {
      setTimeRemaining('');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const ms = deadlineDate.getTime() - now.getTime();

      if (ms <= 0) {
        setTimeRemaining('Deadline passed');
        setCanEdit(false);
      } else {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        let formatted = '';
        if (days > 0) formatted += `${days}d `;
        if (hours > 0 || days > 0) formatted += `${hours}h `;
        formatted += `${minutes}m`;
        setTimeRemaining(formatted);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  const remove = useCallback(
    async (courseId: string) => {
      if (!accessToken || !canEdit) return;
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
    [accessToken, prefs, load, canEdit]
  );

  const move = useCallback(
    async (courseId: string, dir: 'up' | 'down') => {
      if (!canEdit) return;
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
    [accessToken, prefs, load, canEdit]
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Preferences</h1>
        {deadline && (
          <div className={`text-sm font-medium ${!canEdit ? 'text-destructive' : 'text-orange-600'}`}>
            {!canEdit ? '🔒 Deadline Passed' : `⏰ ${timeRemaining} remaining`}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!canEdit && !error && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Preference submission deadline has passed. You can no longer edit your preferences.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Ranked course preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            {canEdit ? 'Reorder with up/down. Remove to drop from list. Add more from Available Courses.' : 'Editing is disabled after the deadline.'}
          </p>
        </CardHeader>
        <CardContent>
          {prefs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No preferences yet. Add courses from Available Courses.</p>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Group preferences by elective slot
                const electiveSlots = new Map<string, PrefItem[]>();
                const corePrefs: PrefItem[] = [];

                prefs.forEach((p) => {
                  if (p.course_type === 'elective' && p.elective_slot) {
                    if (!electiveSlots.has(p.elective_slot)) {
                      electiveSlots.set(p.elective_slot, []);
                    }
                    electiveSlots.get(p.elective_slot)!.push(p);
                  } else {
                    corePrefs.push(p);
                  }
                });

                const groups: { slot: string | null; items: PrefItem[] }[] = [];
                if (corePrefs.length > 0) {
                  groups.push({ slot: null, items: corePrefs });
                }
                electiveSlots.forEach((items, slot) => {
                  groups.push({ slot, items });
                });

                return groups.map(({ slot, items }) => (
                  <div key={slot ?? 'core'} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">
                      {slot ? `${slot}` : 'Core Courses'}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((p, i) => (
                        <li key={p.course_id} className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-muted-foreground w-6">{p.rank}.</span>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{p.course_id}</span>
                                <span>{p.course_name ?? ''}</span>
                                {p.credits != null && <span className="text-muted-foreground text-sm">{p.credits} cr</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={saving || !canEdit || i === 0}
                              onClick={() => move(p.course_id, 'up')}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={saving || !canEdit || i === items.length - 1}
                              onClick={() => move(p.course_id, 'down')}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={saving || !canEdit}
                              onClick={() => remove(p.course_id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
