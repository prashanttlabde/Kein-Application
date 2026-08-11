# CreatorSidebar Component

Navigation sidebar for the creator dashboard providing access to all content creation and analytics features.

## Overview

**File**: `components/CreatorSidebar.tsx`  
**Type**: Client Component  
**Usage**: Creator dashboard layout  

## Props

This component doesn't accept any props - it's a self-contained navigation component.

## Features

### Navigation Items
- **Dashboard** (`/creator-dashboard`) - Overview and quick actions
- **My Reels** (`/creator-dashboard/reels`) - Video content management
- **Live Sessions** (`/creator-dashboard/live`) - Live streaming management
- **Analytics** (`/creator-dashboard/analytics`) - Performance insights
- **Earnings** (`/creator-dashboard/earnings`) - Revenue tracking
- **Audience** (`/creator-dashboard/audience`) - Follower demographics
- **Schedule** (`/creator-dashboard/schedule`) - Content scheduling
- **Messages** (`/creator-dashboard/messages`) - Communication
- **Settings** (`/creator-dashboard/settings`) - Creator preferences

### Quick Stats Section
- **This Month**: Current month earnings ($1,250)
- **Total Views**: Lifetime view count (2.4M)
- **Followers**: Current follower count (89K)

### Visual States
- **Active State**: Current page highlighted with brand color (#003366)
- **Hover State**: Gray background on hover for inactive items
- **Icons**: Lucide React icons for each navigation item

## Styling

### Layout
```css
/* Sidebar container */
w-64 bg-white border-r border-gray-200 min-h-screen

/* Navigation items */
flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium

/* Active state */
bg-[#003366] text-white

/* Inactive state */
text-gray-700 hover:bg-gray-100 hover:text-gray-900
```

### Quick Stats
```css
/* Stats container */
p-4 border-t border-gray-200 mt-8

/* Stats items */
flex justify-between text-sm
```

## Usage Example

```tsx
// Used in creator dashboard layout
import CreatorSidebar from '@/components/CreatorSidebar';

export default function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <CreatorSidebar />
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

## Dependencies

### External Libraries
- `next/link` - Next.js Link component for navigation
- `next/navigation` - usePathname for active state detection
- `lucide-react` - Icons for navigation items
- `clsx` - Conditional class name utility

### Icons Used
- `Home` - Dashboard
- `Play` - My Reels
- `Video` - Live Sessions
- `BarChart3` - Analytics
- `DollarSign` - Earnings
- `Users` - Audience
- `Calendar` - Schedule
- `MessageCircle` - Messages
- `Settings` - Settings

## Navigation Logic

### Active State Detection
```typescript
const pathname = usePathname();

// Check if current path matches navigation item
const isActive = pathname === item.href;
```

### Link Structure
```typescript
const navigation = [
  { name: 'Dashboard', href: '/creator-dashboard', icon: Home },
  { name: 'My Reels', href: '/creator-dashboard/reels', icon: Play },
  // ... more items
];
```

## Responsive Design

### Desktop (lg+)
- **Visibility**: Always visible as fixed sidebar
- **Full Width**: 64 (16rem) width with complete navigation
- **Stats Display**: Quick stats section at bottom

### Tablet/Mobile (< lg)
- **Hidden**: Sidebar hidden on smaller screens
- **Alternative**: Replaced by CreatorMobileNav bottom navigation
- **Overlay**: Could be shown as overlay when needed

## Quick Stats Integration

### Mock Data
```typescript
// Current mock stats displayed
{
  thisMonth: '$1,250',
  totalViews: '2.4M',
  followers: '89K'
}
```

### Future Integration
- **Real-time Data**: Connect to actual user analytics
- **Dynamic Updates**: Update stats based on user activity
- **Personalization**: Show relevant metrics for each creator

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through navigation items
- **Focus States**: Visible focus indicators with proper contrast
- **Enter/Space**: Activates navigation links

### Screen Readers
- **Semantic HTML**: Proper nav and link elements
- **ARIA Labels**: Descriptive labels for navigation items
- **Link Purpose**: Clear link destinations

### Visual Accessibility
- **Color Contrast**: High contrast between text and background
- **Focus Indicators**: Clear focus states for keyboard users
- **Icon + Text**: Icons paired with text labels for clarity

## Performance

### Optimization
- **Static Navigation**: Navigation items are static, no API calls
- **Minimal Re-renders**: Only re-renders when pathname changes
- **Icon Optimization**: Lucide icons are tree-shaken

### Bundle Size
- **Lightweight**: Minimal dependencies and small footprint
- **Tree Shaking**: Unused icons removed from bundle
- **Code Splitting**: Part of creator dashboard chunk

## Customization

### Styling
- **Brand Colors**: Uses primary brand color (#003366)
- **Spacing**: Consistent spacing using Tailwind scale
- **Typography**: System font stack with proper weights

### Navigation Items
- **Easy Addition**: Simple array modification to add items
- **Icon Flexibility**: Easy to change icons or add custom ones
- **Conditional Items**: Can hide/show items based on user permissions

### Stats Section
- **Customizable Metrics**: Easy to change displayed stats
- **Formatting**: Number formatting can be customized
- **Real-time Updates**: Can be connected to live data

## Future Enhancements

### Planned Features
- **Collapsible Sidebar**: Toggle between expanded and collapsed states
- **Real-time Stats**: Live updating statistics
- **Notification Badges**: Show counts for new messages, etc.
- **Search**: Quick navigation search functionality

### User Experience
- **Tooltips**: Helpful tooltips for navigation items
- **Keyboard Shortcuts**: Quick navigation shortcuts
- **Breadcrumbs**: Show current location context
- **Recent Items**: Quick access to recently viewed content

### Performance Improvements
- **Virtual Scrolling**: For large navigation lists
- **Lazy Loading**: Defer loading of non-critical navigation items
- **Caching**: Cache navigation state and preferences