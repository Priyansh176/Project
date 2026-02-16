# Elective Slot System - Implementation Guide

## Overview
The course allotment system now supports elective slots, allowing:
1. **Semester/Department-based course visibility**: Students only see courses for their semester and department
2. **Elective slots**: Group elective courses into slots (e.g., "Elective-1", "Elective-2")
3. **Choice limits per slot**: Define how many courses students can select from each elective slot
4. **CGPA-based allotment within slots**: Students are allotted courses based on CGPA and preferences within each elective slot

## Database Changes

### Migration Script
Run the migration script to add elective functionality to existing databases:
```bash
mysql -u root -p course_allotment < backend/scripts/add-elective-slots.sql
```

### New COURSE Table Fields
- `Course_Type` ENUM('core', 'elective') - Course category
- `Elective_Slot` VARCHAR(50) - Slot identifier (e.g., "Elective-1", "Elective-2")  
- `Max_Choices` INT - How many courses students can select from this slot

## Backend Changes ✅ Completed

### Routes Updated
- **POST /courses** - Now accepts `course_type`, `elective_slot`, `max_choices`, `semester`, `department_id`
- **PATCH /courses/:id** - Can update all new fields
- **GET /courses** - Automatically filters by student's semester/department when authenticated

### Example Course Creation
```json
{
  "course_id": "CS401",
  "course_name": "Machine Learning",
  "credits": 4,
  "capacity": 40,
  "semester": 7,
  "department_id": 1,
  "course_type": "elective",
  "elective_slot": "Elective-1",
  "max_choices": 3,
  "faculty": "Dr. Smith",
  "slot": "MWF 10:00-11:00"
}
```

## Frontend Changes ✅ Completed

### Admin Course Management
- Added fields for Course Type (Core/Elective)
- Added Elective Slot Name input
- Added Max Choices input
- Added Semester and Department selection
- Form validates elective-specific fields

### Usage in Admin Dashboard
1. Navigate to **Courses** page
2. Click **Add Course**
3. Select "Elective" for Course Type
4. Enter Elective Slot name (e.g., "Elective-1")
5. Set Max Choices (how many courses students can pick from this slot)
6. Select Semester and Department
7. Fill in other details and save

## Student Experience 

### Course Visibility
Students will now only see courses that match:
- Their current semester
- Their department
- Active status

### Elective Selection (To Be Implemented)
When implemented, students will:
1. See courses grouped by elective slots
2. Be limited to selecting `max_choices` courses per slot
3. Rank their preferences within each slot
4. Get allotted based on CGPA (highest first) and preference rank

## Allotment Algorithm Changes (To Be Implemented)

The allotment algorithm needs to be updated to:
1. Process each elective slot separately
2. For each slot:
   - Get all student preferences for courses in that slot
   - Sort students by CGPA (descending)
   - Process preferences in order
   - Respect capacity limits
   - Allot or waitlist students
3. Process core courses normally

### Example Algorithm Flow
```
For each Elective Slot (Elective-1, Elective-2, etc.):
  1. Get all courses in this slot
  2. Get all student preferences for these courses
  3. Sort students by CGPA DESC
  4. For each student (highest CGPA first):
     - Check their ranked preferences in this slot
     - Try to allot based on preference order
     - Stop when student gets 1 course from this slot (or waitlisted in all)
  5. Move to next slot

For Core courses:
  - Process normally (all core courses are mandatory)
```

## Next Steps

### 1. Update Student Preference UI
**File**: `frontend/src/pages/MyPreferences.tsx`

**Changes Needed**:
- Group preferences by elective_slot
- Show slot information (e.g., "Elective-1: Select up to 3 courses")
- Enforce max_choices limit per slot
- Allow ranking within each slot
- Show core courses separately

### 2. Update Available Courses UI
**File**: `frontend/src/pages/AvailableCourses.tsx`

**Changes Needed**:
- Group courses by elective_slot
- Show which slot each course belongs to
- Indicate remaining choices per slot
- Filter to show only student's semester/department courses

### 3. Update Allotment Algorithm
**File**: `backend/src/lib/allotment.ts`

**Changes Needed**:
- Group preferences by elective_slot
- Process each slot separately
- Ensure students get at most 1 course per elective slot
- Maintain CGPA-based priority within each slot

### 4. Update Preference Validation
**File**: `backend/src/routes/preferences.ts`

**Changes Needed**:
- Validate max_choices per elective slot
- Prevent students from selecting more than max_choices courses per slot
- Allow unlimited core course selections

## Testing Checklist

- [ ] Run migration script on database
- [ ] Create a core course via admin panel
- [ ] Create multiple elective courses in same slot
- [ ] Create multiple elective courses in different slots
- [ ] Verify students only see their semester/department courses
- [ ] Verify elective slot grouping in student view
- [ ] Test preference selection with choice limits
- [ ] Run allotment and verify correct slot-based allocation
- [ ] Verify CGPA ordering within each slot
- [ ] Test waitlisting when slots are full

## Configuration Examples

### Example 1: Technical Elective Slot
- **Slot Name**: "Technical-Elective-1"
- **Max Choices**: 4 (student selects 4 preferences, gets 1 course)
- **Courses**: AI, ML, Blockchain, IoT, Cloud Computing, Cybersecurity
- **Logic**: Student picks 4 courses, system allots 1 based on CGPA and preference rank

### Example 2: Open Elective Slot
- **Slot Name**: "Open-Elective"
- **Max Choices**: 2
- **Courses**: Various interdisciplinary courses
- **Logic**: Student picks 2 courses, gets 1

### Example 3: Humanities Elective
- **Slot Name**: "Humanities"
- **Max Choices**: 3
- **Courses**: Ethics, Philosophy, Psychology, etc.
- **Logic**: Student picks 3, gets 1

## Notes
- Core courses (Course_Type = 'core') are treated as mandatory and allotted normally
- Elective courses (Course_Type = 'elective') are grouped by Elective_Slot
- Students can have preferences in multiple elective slots
- Each elective slot is processed independently during allotment
- Max_Choices defines preference limit, not allocation limit (students get max 1 course per slot)
