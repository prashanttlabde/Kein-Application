# AdminSidebar Component

Navigation sidebar for the admin portal providing access to all administrative functions.

## Overview

**File**: `components/AdminSidebar.tsx`  
**Type**: Client Component  
**Usage**: Admin portal layout  

## Props

This component doesn't accept any props - it's a self-contained navigation component.

## Features

### Navigation Items
- **Dashboard** (`/admin-portal`) - Platform overview and statistics
- **Users** (`/admin-portal/users`) - User management and profiles
- **Verifications** (`/admin-portal/verifications`) - Review verification applications
- **Contracts** (`/admin-portal/contracts`) - Monitor influencer-seller partnerships
- **Products** (`/admin-portal/products`) - Product catalog management
- **Analytics** (`/admin-portal/analytics`) - Platform analytics and insights
- **Settings** (`/admin-portal/settings`) - Admin portal configuration

### Visual States
- **Active State**: Current page highlighted with red background and border
- **Hover State**: Gray background on hover for inactive items
- **Icons**: Lucide React icons for each navigation item

### Security Features
- **Sign Out**: Secure logout functionality
- **Admin Branding**: Shield icon and admin identification
- **Session Management**: Integrated with admin authentication system

## Styling

### Layout
- **Width**: Fixed 64 (16rem) width
- **Height**: Full screen height
- **Background**: White with shadow and border
- **Position**: Fixed sidebar layout

### Navigation Items
```css
/* Active state */
bg-red-100 text-red-700 border-r-2 border-red-600

/* Inactive state */
text-gray-600 hover:bg-gray-100 hover:text-gray-900

/* Layout */
flex items-center px-4 py-3 text-sm font-medium rounded-lg
```

### Header Section
- **Height**: 16 (4rem) header height
- **Border**: Bottom border separation
- **Content**: Shield icon + "Navigation" text

## Usage Example

```tsx
// Used in admin portal layout
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

## Dependencies

### External Libraries
- `next/navigation` - usePathname, useRouter for navigation
- `lucide-react` - Icons for navigation items
- `@/lib/adminAuth` - Admin authentication utilities

### Icons Used
- `LayoutDashboard` - Dashboard
- `Users` - User management
- `CheckCircle` - Verifications
- `FileText` - Contracts
- `Package` - Products
- `BarChart3` - Analytics
- `Settings` - Settings
- `LogOut` - Sign out
- `Shield` - Admin branding

## Authentication Integration

### Admin Auth
- **Sign Out Handler**: Calls `adminAuth.signOut()`
- **Redirect**: Navigates to `/admin/login` after logout
- **Error Handling**: Console error logging for sign out failures

### Route Detection
- **Active State**: Uses `usePathname()` to determine current route
- **Exact Matching**: Compares pathname with navigation hrefs
- **Visual Feedback**: Highlights current page in navigation

## Responsive Design

### Desktop
- **Visibility**: Always visible on desktop
- **Layout**: Fixed sidebar with full navigation
- **Interactions**: Hover states and smooth transitions

### Mobile
- **Behavior**: Typically hidden on mobile (controlled by parent layout)
- **Alternative**: Mobile layouts use overlay or different navigation patterns
- **Accessibility**: Maintains keyboard navigation support

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through navigation items
- **Focus States**: Visible focus indicators
- **Enter/Space**: Activates navigation links

### Screen Readers
- **Semantic HTML**: Proper nav and link elements
- **ARIA Labels**: Descriptive labels for navigation items
- **Role Attributes**: Appropriate ARIA roles

## Security Considerations

### Admin Access
- **Authentication**: Only accessible to authenticated admin users
- **Session Validation**: Integrated with admin session management
- **Secure Logout**: Proper session cleanup on sign out

### Route Protection
- **Admin Routes**: All navigation links lead to protected admin routes
- **Middleware**: Admin authentication middleware protects all routes
- **Unauthorized Access**: Automatic redirect to login for non-admin users

## Performance

### Optimization
- **Static Navigation**: Navigation items are static, no API calls
- **Minimal Re-renders**: Only re-renders when pathname changes
- **Icon Loading**: Lucide icons are tree-shaken and optimized

### Bundle Size
- **Dependencies**: Minimal external dependencies
- **Code Splitting**: Part of admin portal chunk
- **Tree Shaking**: Unused icons are removed from bundle

## Customization

### Styling
- **Colors**: Red theme for admin portal (can be customized via CSS variables)
- **Icons**: Easy to replace with different icon sets
- **Layout**: Flexible width and spacing adjustments

### Navigation Items
- **Adding Items**: Simple array modification to add new navigation items
- **Permissions**: Can be extended with role-based navigation filtering
- **Grouping**: Can be organized into sections or categories

## Future Enhancements

### Planned Features
- **Collapsible Sidebar**: Toggle between expanded and collapsed states
- **Navigation Grouping**: Organize items into logical sections
- **Badge Notifications**: Show counts for pending items (verifications, etc.)
- **Search**: Quick navigation search functionality

### Accessibility Improvements
- **High Contrast**: Enhanced contrast mode support
- **Reduced Motion**: Respect user motion preferences
- **Screen Reader**: Enhanced screen reader announcements