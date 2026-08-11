# AdminHeader Component

Header component for the admin portal providing search functionality, notifications, and admin user management.

## Overview

**File**: `components/AdminHeader.tsx`  
**Type**: Client Component  
**Usage**: Admin portal layout header  

## Props

```typescript
interface AdminHeaderProps {
  onMenuToggle?: () => void; // Optional mobile menu toggle handler
}
```

## Features

### Left Section
- **Mobile Menu Button**: Hamburger menu for mobile navigation (lg:hidden)
- **Admin Branding**: Shield icon with "Admin Portal" title and "Kein Platform Management" subtitle

### Center Section
- **Search Bar**: Global search functionality (hidden on mobile, shown on md+)
- **Search Placeholder**: "Search users, products, contracts..."
- **Search Icon**: Magnifying glass icon in input field

### Right Section
- **Notifications**: Bell icon with unread count badge
- **Settings**: Settings icon button
- **Profile Menu**: Admin user dropdown with profile and logout options

## State Management

### Local State
```typescript
const [showProfileMenu, setShowProfileMenu] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
```

### Admin Profile
- **Hook**: `useAdminAuth()` for admin user data
- **Profile Data**: Admin name, email, and authentication status

## Notifications System

### Mock Notifications
```typescript
const notifications = [
  { 
    id: 1, 
    message: 'New verification request from @sarah_beauty', 
    time: '2 min ago', 
    unread: true 
  },
  // ... more notifications
];
```

### Features
- **Unread Count**: Badge showing number of unread notifications
- **Dropdown**: Expandable notification list
- **Time Stamps**: Relative time for each notification
- **Read Status**: Visual distinction between read/unread

## Profile Menu

### Menu Items
- **Profile Settings**: Admin profile management
- **Admin Settings**: Portal configuration
- **Sign Out**: Secure logout with redirect to login

### User Display
- **Avatar**: Gradient background with user icon
- **Name**: Admin full name or "Admin User" fallback
- **Email**: Admin email address
- **Role**: "Administrator" label

## Styling

### Layout
```css
/* Header container */
bg-white border-b border-gray-200 shadow-sm h-16

/* Responsive sections */
flex items-center justify-between px-6

/* Mobile menu button */
lg:hidden p-2 rounded-lg hover:bg-gray-100
```

### Search Bar
```css
/* Desktop search */
hidden md:flex flex-1 max-w-md mx-8

/* Mobile search */
md:hidden px-6 pb-4 w-full
```

### Dropdowns
```css
/* Dropdown container */
absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50

/* Notification items */
p-4 border-b hover:bg-gray-50 cursor-pointer
```

## Usage Example

```tsx
// In admin portal layout
import AdminHeader from '@/components/AdminHeader';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Dependencies

### External Libraries
- `next/navigation` - useRouter for navigation
- `lucide-react` - Icons throughout the component
- `@/lib/adminMiddleware` - useAdminAuth hook
- `@/lib/adminAuth` - adminAuth utilities

### Icons Used
- `Shield` - Admin branding
- `Bell` - Notifications
- `Settings` - Settings button
- `LogOut` - Sign out
- `User` - Profile avatar
- `ChevronDown` - Dropdown indicator
- `Search` - Search functionality
- `Menu` - Mobile menu toggle

## Authentication Integration

### Admin Profile
- **Data Source**: `useAdminAuth()` hook provides admin profile data
- **Fallbacks**: Default values for missing profile information
- **Real-time**: Updates when admin profile changes

### Sign Out Flow
```typescript
const handleSignOut = async () => {
  try {
    await adminAuth.signOut();
    router.push('/admin/login');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
```

## Responsive Design

### Desktop (lg+)
- **Full Layout**: All sections visible
- **Search Bar**: Expanded search in center
- **Hover States**: Interactive hover effects

### Tablet (md-lg)
- **Search**: Visible but may be smaller
- **Touch Targets**: Appropriate touch target sizes
- **Dropdowns**: Touch-friendly dropdown interactions

### Mobile (sm)
- **Menu Toggle**: Hamburger menu button visible
- **Search**: Moved to separate row below header
- **Simplified**: Reduced complexity for mobile

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through interactive elements
- **Focus Management**: Proper focus handling for dropdowns
- **Escape Key**: Close dropdowns with escape key

### Screen Readers
- **ARIA Labels**: Descriptive labels for buttons and inputs
- **Role Attributes**: Proper roles for dropdown menus
- **Live Regions**: Announcements for notification updates

### Visual Accessibility
- **Color Contrast**: Sufficient contrast for all text
- **Focus Indicators**: Visible focus states
- **Icon Labels**: Text alternatives for icon-only buttons

## Performance

### Optimization
- **Conditional Rendering**: Dropdowns only render when open
- **Event Handlers**: Stable references with useCallback
- **Minimal Re-renders**: Optimized state updates

### Bundle Size
- **Icon Tree Shaking**: Only used icons included in bundle
- **Component Splitting**: Separate chunks for large features

## Security

### Admin Authentication
- **Session Validation**: Integrated with admin auth system
- **Secure Logout**: Proper session cleanup
- **Profile Protection**: Admin profile data protection

### Input Sanitization
- **Search Input**: Sanitized search queries
- **XSS Prevention**: Proper input handling and output encoding

## Customization

### Theming
- **Colors**: Admin red theme (customizable via CSS variables)
- **Branding**: Easy to update logo and branding elements
- **Layout**: Flexible spacing and sizing

### Notifications
- **Data Source**: Can be connected to real notification system
- **Types**: Support for different notification types
- **Actions**: Expandable with notification actions

## Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket or Server-Sent Events
- **Advanced Search**: Filters, suggestions, recent searches
- **Keyboard Shortcuts**: Quick actions and navigation
- **Theme Switching**: Light/dark mode toggle

### Performance Improvements
- **Search Debouncing**: Optimized search input handling
- **Notification Pagination**: Efficient notification loading
- **Caching**: Profile and notification caching