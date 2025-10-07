# Club Page Restructuring - Implementation Guide

## Overview
The `/club` page has been completely restructured with new tab organization and an event calendar feature.

## Changes Made

### 1. New Tab Structure
The main page now has **3 primary tabs**:
- **IIC Events** - Shows all approved IIC events
- **Self Hosted Events** - Contains nested tabs for Current and Past events
- **My Event Calendar** - Shows IIC events added to the club's calendar

### 2. IIC Events Tab Updates
- **New Button**: "Add to Calendar" button replaces the "Settings" button
- **View Details**: Eye icon to view event details in a modal
- **Calendar Indicator**: Events already in calendar show a green checkmark icon
- **Filtering**: Existing semester/quarter filtering and search functionality retained

### 3. Self Hosted Events Tab
Contains **2 nested tabs**:
- **Current Tab**: Shows ongoing events + "Add New Event" card
- **Past Tab**: Shows completed events

### 4. My Event Calendar Tab
A comprehensive table showing all IIC events added to the calendar with these columns:

| Column | Description |
|--------|-------------|
| S.No. | Serial number |
| Title of Activity | Event name, quarter/semester, and type (Free/Paid) |
| View Activity Details | Button to view event details |
| Upload Activity Report | Button to navigate to `/club/event/[id]#after-event` |
| Correct Status of Report Submission | Badge showing "Submitted" or "Not Submitted" |
| Reviewer's Comment | Text from reviewer (NA if none) |
| Review for Request | Review request status (NA if none) |
| Download Report | Button to download report (disabled for now) |
| Action | Delete button to remove from calendar |

## Database Schema

### New Table: `club_event_calendar`

```sql
CREATE TABLE public.club_event_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_status TEXT DEFAULT 'Not Submitted',
  reviewer_comment TEXT,
  review_request TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- Unique constraint on (event_id, club_id) prevents duplicate entries
- RLS policies ensure clubs can only manage their own calendar events
- Cascading deletes if event or club is deleted
- Indexes for optimal performance

## Workflow

### Adding an Event to Calendar
1. User browses IIC Events tab
2. Clicks "Add to Calendar" button on an approved IIC event
3. Event is added to `club_event_calendar` table
4. Button changes to green checkmark indicating "Already in Calendar"
5. Event appears in "My Event Calendar" tab

### Uploading Reports
1. User navigates to "My Event Calendar" tab
2. Finds the event in the table
3. Clicks "Upload" button in "Upload Activity Report" column
4. User is redirected to `/club/event/[id]#after-event` (scrolls to after-event section)
5. User uploads report and fills details
6. Status updates to "Submitted" in the calendar table

### Removing from Calendar
1. User navigates to "My Event Calendar" tab
2. Clicks trash icon in "Action" column
3. Confirms deletion
4. Event is removed from calendar (but still exists in IIC Events)

## Key Functions

### `handleAddToCalendar(eventId: string)`
- Checks if event already exists in calendar
- Inserts new record with status "Not Submitted"
- Refreshes event list
- Shows success/error alerts

### `isEventInCalendar(eventId: string)`
- Returns boolean indicating if event is in calendar
- Used to change button appearance/behavior

### `fetchEvents()`
- Fetches IIC events (only approved)
- Fetches self-hosted events
- Fetches calendar events with joined event data

## Migration Instructions

1. **Run the SQL migration** in your Supabase dashboard:
   ```bash
   # Copy contents of supabase/migrations/create_club_event_calendar.sql
   # Run in Supabase SQL Editor
   ```

2. **Verify RLS policies** are enabled and working

3. **Test the flow**:
   - Add an IIC event to calendar
   - Verify it appears in "My Event Calendar"
   - Test upload report navigation
   - Test removing from calendar

## Future Enhancements

- [ ] Implement actual report download functionality
- [ ] Add report upload tracking
- [ ] Add reviewer comment submission interface
- [ ] Add notifications for status changes
- [ ] Add bulk operations (add multiple events)
- [ ] Add calendar export (iCal, CSV)

## Notes

- IIC events now only show if status is "approved"
- The upload report button uses hash navigation (#after-event) to scroll to the correct section
- Calendar events maintain a reference to the original event via foreign key
- Report status is stored in calendar table, not events table
