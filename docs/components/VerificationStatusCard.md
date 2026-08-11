# VerificationStatusCard Component

Display component for showing user verification status with appropriate styling and messaging.

## Overview

**File**: `components/VerificationStatusCard.tsx`  
**Type**: Client Component  
**Purpose**: Visual representation of verification status for influencers and sellers  

## Props

```typescript
interface VerificationStatusCardProps {
  type: 'influencer' | 'seller';
  status: 'pending' | 'approved' | 'rejected' | 'not_applied';
  applicationDate?: string;
  verificationDate?: string;
  adminNotes?: string;
  onApply?: () => void;
  onReapply?: () => void;
}
```

### Required Props

- **type**: Verification type (influencer or seller)
- **status**: Current verification status

### Optional Props

- **applicationDate**: ISO date string of application submission
- **verificationDate**: ISO date string of verification approval
- **adminNotes**: Admin feedback for rejected applications
- **onApply**: Callback for initial application
- **onReapply**: Callback for reapplication after rejection

## Status States

### Not Applied
**Display**: Encourages user to apply for verification  
**Styling**: Blue border and background  
**Actions**: "Apply for Verification" button  

```typescript
// Example usage
<VerificationStatusCard
  type="influencer"
  status="not_applied"
  onApply={handleApply}
/>
```

### Pending
**Display**: Shows application is under review  
**Styling**: Yellow/orange border and background  
**Content**: Application date and review message  

```typescript
// Example usage
<VerificationStatusCard
  type="seller"
  status="pending"
  applicationDate="2024-01-15T10:30:00Z"
/>
```

### Approved
**Display**: Celebrates successful verification  
**Styling**: Green border and background with checkmark  
**Content**: Verification date and success message  

```typescript
// Example usage
<VerificationStatusCard
  type="influencer"
  status="approved"
  applicationDate="2024-01-15T10:30:00Z"
  verificationDate="2024-01-18T14:20:00Z"
/>
```

### Rejected
**Display**: Shows rejection with admin feedback  
**Styling**: Red border and background  
**Content**: Admin notes and reapplication option  
**Actions**: "Apply Again" button  

```typescript
// Example usage
<VerificationStatusCard
  type="seller"
  status="rejected"
  applicationDate="2024-01-15T10:30:00Z"
  adminNotes="Please provide clearer business registration documents"
  onReapply={handleReapply}
/>
```

## Visual Design

### Color Scheme
- **Not Applied**: Blue (`bg-blue-50`, `border-blue-200`, `text-blue-800`)
- **Pending**: Yellow (`bg-yellow-50`, `border-yellow-200`, `text-yellow-800`)
- **Approved**: Green (`bg-green-50`, `border-green-200`, `text-green-800`)
- **Rejected**: Red (`bg-red-50`, `border-red-200`, `text-red-800`)

### Layout Structure
```css
/* Card container */
border rounded-lg p-6 mb-6

/* Header section */
flex items-center justify-between mb-4

/* Content section */
space-y-3

/* Action buttons */
mt-4 flex gap-3
```

### Icons
- **Not Applied**: `AlertCircle` - Information icon
- **Pending**: `Clock` - Time/waiting icon
- **Approved**: `CheckCircle` - Success checkmark
- **Rejected**: `XCircle` - Error/rejection icon

## Content Messaging

### Type-Specific Messaging

**Influencer Verification**:
- Not Applied: "Become a verified influencer to unlock premium features"
- Pending: "Your influencer verification is being reviewed"
- Approved: "You are now a verified influencer!"
- Rejected: "Your influencer application needs attention"

**Seller Verification**:
- Not Applied: "Become a verified seller to start selling products"
- Pending: "Your seller verification is being reviewed"
- Approved: "You are now a verified seller!"
- Rejected: "Your seller application needs attention"

### Date Formatting
```typescript
// Date display format
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Example: "January 15, 2024"
```

## Usage Examples

### Profile Settings Integration
```typescript
const ProfileSettings = () => {
  const { user } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const getVerificationStatus = () => {
    if (user.influencer_verified) return 'approved';
    if (user.has_pending_verification) return 'pending';
    return 'not_applied';
  };

  return (
    <div>
      <VerificationStatusCard
        type="influencer"
        status={getVerificationStatus()}
        applicationDate={user.verification_application_date}
        verificationDate={user.verification_approved_date}
        adminNotes={user.verification_admin_notes}
        onApply={() => setShowVerificationModal(true)}
        onReapply={() => setShowVerificationModal(true)}
      />
      
      {showVerificationModal && (
        <VerificationApplicationModal
          type="influencer"
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};
```

### Dashboard Integration
```typescript
const DashboardOverview = () => {
  const { user } = useAuth();

  return (
    <div className="grid gap-6">
      {!user.influencer_verified && (
        <VerificationStatusCard
          type="influencer"
          status={user.verification_status}
          applicationDate={user.application_date}
          adminNotes={user.admin_notes}
        />
      )}
      
      {!user.seller_verified && (
        <VerificationStatusCard
          type="seller"
          status={user.seller_verification_status}
          applicationDate={user.seller_application_date}
          adminNotes={user.seller_admin_notes}
        />
      )}
    </div>
  );
};
```

## Accessibility

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for status and actions
- **Role Attributes**: Proper roles for interactive elements
- **Status Announcements**: Screen reader announcements for status changes

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through interactive elements
- **Focus States**: Visible focus indicators for buttons
- **Enter/Space**: Activates action buttons

### Visual Accessibility
- **Color Contrast**: High contrast text and background combinations
- **Icon + Text**: Icons paired with text for clarity
- **Status Indicators**: Multiple visual cues beyond just color

## Responsive Design

### Desktop
- **Full Layout**: Complete card with all information
- **Hover States**: Interactive hover effects for buttons
- **Spacious Design**: Generous padding and spacing

### Tablet
- **Responsive Grid**: Adapts to tablet screen sizes
- **Touch Targets**: Appropriate button sizes for touch
- **Readable Text**: Maintains text readability

### Mobile
- **Stacked Layout**: Vertical stacking of elements
- **Full Width**: Utilizes full screen width
- **Touch-Friendly**: Large touch targets for buttons

## Integration Points

### Authentication System
- **User Data**: Integrates with user profile data
- **Status Updates**: Reflects real-time verification status
- **Permission Checks**: Shows appropriate actions based on user state

### Verification Modal
- **Modal Trigger**: Triggers verification application modal
- **State Management**: Manages modal open/close state
- **Data Flow**: Passes verification type to modal

### Database Integration
- **Status Sync**: Syncs with database verification status
- **Real-time Updates**: Updates when verification status changes
- **Admin Notes**: Displays admin feedback from database

## Performance Considerations

### Optimization
- **Conditional Rendering**: Only renders necessary elements
- **Memoization**: Uses React.memo for expensive computations
- **Stable References**: Uses useCallback for event handlers

### Bundle Size
- **Icon Tree Shaking**: Only imports used icons
- **Minimal Dependencies**: Lightweight component with few dependencies
- **CSS Optimization**: Efficient Tailwind CSS classes

## Customization

### Styling
- **Theme Colors**: Easy to customize status colors
- **Typography**: Configurable text styles and sizes
- **Spacing**: Adjustable padding and margins

### Content
- **Custom Messages**: Configurable status messages
- **Localization**: Support for multiple languages
- **Branding**: Customizable to match brand guidelines

### Behavior
- **Custom Actions**: Configurable action callbacks
- **Animation**: Optional animations and transitions
- **Sound**: Optional sound feedback for status changes

## Future Enhancements

### Planned Features
- **Progress Indicators**: Show verification progress steps
- **Document Preview**: Quick preview of submitted documents
- **Status History**: Timeline of verification status changes
- **Notification Integration**: Real-time status notifications

### User Experience
- **Animations**: Smooth transitions between status states
- **Tooltips**: Helpful tooltips for status explanations
- **Quick Actions**: One-click actions for common tasks
- **Contextual Help**: Inline help and guidance

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Cached status for offline viewing
- **Performance Monitoring**: Track component performance metrics
- **A/B Testing**: Support for testing different designs