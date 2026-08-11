# Admin Portal Documentation

The Admin Portal is a secure, comprehensive interface for platform administrators to manage users, verifications, contracts, products, and overall platform operations.

## Overview

**Route**: `/admin-portal/*`  
**Access**: Admin authentication required (separate from regular users)  
**Layout**: AdminSidebar + AdminHeader  
**Security**: Multi-factor authentication (email + password + security key)  

## Authentication System

### Admin Login (`/admin/login`)
- **Security**: Triple authentication (email, password, security key)
- **Session**: 24-hour localStorage-based sessions
- **Accounts**: Pre-configured admin accounts with secure keys
- **Protection**: Independent from regular user authentication

### Admin Accounts
```
Admin 1: admin1@kein.com / KeinAdmin2024! / KEIN_ADMIN_2024_SECURE_KEY_001
Admin 2: admin2@kein.com / KeinAdmin2024! / KEIN_ADMIN_2024_SECURE_KEY_002
```

## Main Dashboard (`/admin-portal`)

### Features
- **Platform Statistics**: User counts, revenue metrics, growth indicators
- **Visual Analytics**: User growth charts, category distribution
- **Recent Activity**: Real-time platform events and notifications
- **Quick Actions**: Direct navigation to management sections

### Stats Cards
- Total Users (5,234) with growth percentage
- Active Products (1,847) with monthly change
- Platform Revenue ($284K) with trend indicators
- Pending Verifications (23) with status updates

### Charts & Visualizations
- User growth over time (bar chart)
- Product category distribution (pie chart)
- Revenue trends and projections

## User Management (`/admin-portal/users`)

### Features
- **User Overview**: Complete user database with roles and status
- **Search & Filter**: By name, email, username, role type
- **User Details**: Profile information, verification status, activity
- **Actions**: View details, manage verification, suspend users

### User Statistics
- Total users, influencers, sellers, admins
- Verification status tracking
- Role distribution analytics

### User Detail Modal
- Complete profile information
- Verification status and history
- Account creation and activity dates
- Admin actions (verify, suspend, etc.)

## Verification Management (`/admin-portal/verifications`)

### Purpose
Review and process influencer/seller verification applications

### Features
- **Application Queue**: Pending, approved, rejected requests
- **Document Review**: Uploaded verification documents
- **Approval Workflow**: Approve/reject with admin notes
- **Status Tracking**: Real-time verification status updates

### Verification Process
1. User submits application with documents
2. Admin reviews application details
3. Admin approves/rejects with notes
4. User profile updated automatically
5. Notification sent to user

## Contract Management (`/admin-portal/contracts`)

### Features
- **Contract Overview**: All influencer-seller partnerships
- **Financial Tracking**: Sales, commissions, revenue metrics
- **Status Monitoring**: Active, pending, completed, cancelled contracts
- **Party Information**: Seller and influencer details

### Contract Statistics
- Total contracts and status distribution
- Sales volume and commission tracking
- Partnership performance metrics

### Contract Details
- Party information (seller/influencer)
- Financial terms and commission rates
- Product associations and performance
- Duration and status history

## Product Management (`/admin-portal/products`)

### Features
- **Product Catalog**: All platform products with seller information
- **Inventory Tracking**: Stock levels and low stock alerts
- **Category Management**: Product categorization and filtering
- **Status Control**: Active/inactive product management

### Product Statistics
- Total products, active/inactive counts
- Low stock alerts and inventory value
- Category distribution and trends

### Product Details
- Complete product information
- Seller details and contact information
- Stock levels and pricing
- Creation and update history

## Layout Components

### AdminSidebar
- **Navigation**: Dashboard, Users, Verifications, Contracts, Products, Analytics, Settings
- **Security**: Sign out functionality
- **Branding**: Admin portal identification
- **Active States**: Current page highlighting

### AdminHeader
- **Search**: Global platform search functionality
- **Notifications**: Admin alerts and updates with badge counts
- **Profile Menu**: Admin account management and settings
- **Mobile Support**: Responsive navigation toggle

## Security Features

### Authentication
- **Multi-factor**: Email + password + security key required
- **Session Management**: 24-hour timeout with automatic logout
- **Database Isolation**: Separate admin_users table
- **No Signup**: Admin accounts created manually only

### Access Control
- **Route Protection**: All admin pages require authentication
- **Role Verification**: Admin status checked on each request
- **Automatic Redirects**: Unauthorized access redirected to login
- **Session Validation**: Continuous session validity checks

## Data Management

### Database Operations
- **Admin Client**: Service role key for bypassing RLS
- **Real-time Updates**: Live data synchronization
- **Bulk Operations**: Efficient mass data operations
- **Audit Logging**: Admin action tracking (planned)

### API Integration
- **Admin API Routes**: Dedicated endpoints for admin operations
- **Error Handling**: Comprehensive error management
- **Data Validation**: Input sanitization and validation
- **Performance Optimization**: Efficient query patterns

## Debug Tools (`/admin/debug/*`)

### Test Database (`/admin/debug/test-db`)
- **Purpose**: Test admin database connections
- **Features**: Query verification requests, connection testing
- **Development**: Debugging database issues

### Verification Test (`/admin/debug/verification-test`)
- **Purpose**: Create test verification data
- **Features**: Generate sample verification requests
- **Testing**: Populate admin dashboard for testing

## Responsive Design

### Desktop
- Full sidebar navigation
- Expanded data tables
- Detailed statistics cards
- Complete admin functionality

### Tablet
- Collapsible sidebar
- Responsive tables
- Touch-friendly controls
- Optimized layouts

### Mobile
- Overlay navigation
- Simplified tables
- Mobile-optimized forms
- Essential functionality focus

## Performance & Scalability

### Optimization
- **Efficient Queries**: Optimized database operations
- **Pagination**: Large dataset management
- **Caching**: Strategic data caching
- **Loading States**: Progressive data loading

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Admin action timing
- **Usage Analytics**: Admin portal usage patterns
- **Security Monitoring**: Access attempt logging

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Automated verification workflows
- Bulk user management operations
- Enhanced security features (2FA, IP whitelisting)
- Comprehensive audit logging
- Real-time notifications system

### Technical Improvements
- Enhanced mobile experience
- Advanced search and filtering
- Export functionality for all data
- Integration with external tools
- Performance monitoring dashboard