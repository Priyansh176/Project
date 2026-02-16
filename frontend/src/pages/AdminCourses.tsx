import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Course {
  course_id: string;
  course_name: string;
  credits: number;
  faculty: string;
  slot: string;
  capacity: number;
  seats_available: number;
  seats_allotted: number;
  course_type?: string;
  elective_slot?: string | null;
  max_choices?: number | null;
  semester?: number | null;
  department_id?: number | null;
}

interface CourseForm {
  course_id: string;
  course_name: string;
  credits: number;
  faculty: string;
  slot: string;
  capacity: number;
  course_type: 'core' | 'elective';
  elective_slot: string;
  max_choices: number;
  semester: number | null;
  department_id: number | null;
}

const EMPTY_FORM: CourseForm = {
  course_id: '',
  course_name: '',
  credits: 3,
  faculty: 'TBA',
  slot: 'TBA',
  capacity: 30,
  course_type: 'core',
  elective_slot: '',
  max_choices: 1,
  semester: null,
  department_id: null,
};

export function AdminCourses() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleOpenForm = (course?: Course) => {
    if (course) {
      setEditingId(course.course_id);
      setFormData({
        course_id: course.course_id,
        course_name: course.course_name,
        credits: course.credits,
        faculty: course.faculty,
        slot: course.slot,
        capacity: course.capacity,
        course_type: (course.course_type as 'core' | 'elective') || 'core',
        elective_slot: course.elective_slot || '',
        max_choices: course.max_choices || 1,
        semester: course.semester || null,
        department_id: course.department_id || null,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    // Validate form
    if (!formData.course_id.trim() || !formData.course_name.trim()) {
      setError('Course ID and Name are required');
      return;
    }
    if (formData.credits < 1 || formData.capacity < 0) {
      setError('Credits must be ≥ 1, Capacity must be ≥ 0');
      return;
    }
    if (formData.course_type === 'elective' && !formData.elective_slot.trim()) {
      setError('Elective slot name is required for elective courses');
      return;
    }
    if (formData.course_type === 'elective' && formData.max_choices < 1) {
      setError('Max choices must be at least 1 for elective courses');
      return;
    }

    setFormLoading(true);
    setError('');
    try {
      const payload = {
        course_name: formData.course_name,
        credits: formData.credits,
        faculty: formData.faculty,
        slot: formData.slot,
        capacity: formData.capacity,
        course_type: formData.course_type,
        elective_slot: formData.course_type === 'elective' ? formData.elective_slot : null,
        max_choices: formData.course_type === 'elective' ? formData.max_choices : null,
        semester: formData.semester,
        department_id: formData.department_id,
      };
      
      if (editingId) {
        // Update course
        await api(`/courses/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
          token: accessToken,
        });
        setSuccess(`Course ${editingId} updated successfully`);
      } else {
        // Create course
        await api('/courses', {
          method: 'POST',
          body: JSON.stringify({ ...payload, course_id: formData.course_id }),
          token: accessToken,
        });
        setSuccess(`Course ${formData.course_id} created successfully`);
      }
      loadCourses();
      handleCloseForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!accessToken) return;

    setFormLoading(true);
    setError('');
    try {
      await api(`/courses/${courseId}`, {
        method: 'DELETE',
        token: accessToken,
      });
      setSuccess(`Course ${courseId} deleted successfully`);
      loadCourses();
      setDeleteConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete course');
    } finally {
      setFormLoading(false);
    }
  };

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
          <p className="text-muted-foreground mt-1">Add, edit, and manage courses</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleOpenForm()}>
          <Plus size={18} className="mr-2" />
          Add Course
        </Button>
      </div>

      {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-md">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}

      {/* Add/Edit Course Form */}
      {showForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>{editingId ? 'Edit Course' : 'Add New Course'}</CardTitle>
            <button
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course ID */}
                <div className="space-y-2">
                  <Label htmlFor="course_id">Course ID *</Label>
                  <Input
                    id="course_id"
                    placeholder="e.g., CS101"
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({ ...formData, course_id: e.target.value.toUpperCase() })
                    }
                    disabled={!!editingId}
                    className="disabled:opacity-50"
                  />
                  {editingId && <p className="text-xs text-muted-foreground">Cannot change ID</p>}
                </div>

                {/* Course Name */}
                <div className="space-y-2">
                  <Label htmlFor="course_name">Course Name *</Label>
                  <Input
                    id="course_name"
                    placeholder="e.g., Data Structures"
                    value={formData.course_name}
                    onChange={(e) =>
                      setFormData({ ...formData, course_name: e.target.value })
                    }
                  />
                </div>

                {/* Course Type */}
                <div className="space-y-2">
                  <Label htmlFor="course_type">Course Type *</Label>
                  <select
                    id="course_type"
                    value={formData.course_type}
                    onChange={(e) =>
                      setFormData({ ...formData, course_type: e.target.value as 'core' | 'elective' })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="core">Core (Mandatory)</option>
                    <option value="elective">Elective (Optional)</option>
                  </select>
                </div>

                {/* Credits */}
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <select
                    id="semester"
                    value={formData.semester || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value ? parseInt(e.target.value) : null })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department ID</Label>
                  <Input
                    id="department_id"
                    type="number"
                    placeholder="Department ID (optional)"
                    value={formData.department_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, department_id: e.target.value ? parseInt(e.target.value) : null })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for all departments</p>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                {/* Faculty */}
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    placeholder="e.g., Dr. Smith"
                    value={formData.faculty}
                    onChange={(e) =>
                      setFormData({ ...formData, faculty: e.target.value })
                    }
                  />
                </div>

                {/* Slot */}
                <div className="space-y-2">
                  <Label htmlFor="slot">Slot/Timing</Label>
                  <Input
                    id="slot"
                    placeholder="e.g., MWF 10:00-11:00"
                    value={formData.slot}
                    onChange={(e) =>
                      setFormData({ ...formData, slot: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Elective-specific fields */}
              {formData.course_type === 'elective' && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm mb-3">Elective Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Elective Slot */}
                    <div className="space-y-2">
                      <Label htmlFor="elective_slot">Elective Slot Name *</Label>
                      <Input
                        id="elective_slot"
                        placeholder="e.g., Elective-1, Elective-2"
                        value={formData.elective_slot}
                        onChange={(e) =>
                          setFormData({ ...formData, elective_slot: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Group courses by slot (e.g., all "Elective-1" courses are one group)
                      </p>
                    </div>

                    {/* Max Choices */}
                    <div className="space-y-2">
                      <Label htmlFor="max_choices">Max Student Choices *</Label>
                      <Input
                        id="max_choices"
                        type="number"
                        min="1"
                        value={formData.max_choices}
                        onChange={(e) =>
                          setFormData({ ...formData, max_choices: parseInt(e.target.value) || 1 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        How many courses can a student select from this elective slot
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-right py-2 px-3 font-medium">Actions</th>
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
                        <span className="inline-flex items-center justify-center bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium text-xs">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenForm(course)}
                        >
                          <Edit2 size={14} />
                        </Button>

                        {deleteConfirm === course.course_id ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(course.course_id)}
                              disabled={formLoading}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirm(course.course_id)}
                          >
                            <Trash2 size={14} />
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
