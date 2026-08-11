# Pages Documentation

This section documents all application routes in the Kein platform, organized by functionality and user access levels.

## Route Structure

### Public Routes
- [Home Page](./home.md) - `/` - Landing page and platform overview
- [Explore](./explore.md) - `/explore` - Browse public content and creators
- [Products](./products.md) - `/products` - Product catalog and search
- [Live Streams](./live.md) - `/live` - View live streaming content

### Authentication Routes
- [Auth Page](./auth.md) - `/auth` - Login and registration
- [Auth Callback](./auth-callback.md) - `/auth/callback` - OAuth callback handler

### Protected User Routes
- [Dashboard](./dashboard.md) - `/dashboard` - Main user dashboard
- [Settings](./settings/) - `/settings/*` - User settings and preferences
- [Profile](./profile.md) - `/profile/[id]` - User profile pages
- [Cart](./cart.md) - `/cart` - Shopping cart management
- [Checkout](./checkout.md) - `/checkout` - Order checkout process

### Creator Dashboard Routes
- [Creator Dashboard](./creator-dashboard/) - `/creator-dashboard/*` - Content creator interface
  - Main dashboard, reels management, analytics, earnings, audience insights

### Admin Routes
- [Admin Login](./admin-login.md) - `/admin/login` - Secure admin authentication
- [Admin Portal](./admin-portal/) - `/admin-portal/*` - Platform administration
  - Dashboard, user management, verifications, contracts, products
- [Admin Debug](./admin-debug.md) - `/admin/debug/*` - Development and testing tools

## Authentication & Authorization

### Access Levels
1. **Public**: No authentication required
2. **Authenticated**: Valid user session required
3. **Role-based**: Specific user role required (influencer, seller, admin)
4. **Admin-only**: Admin authentication with security key

### Route Protection
- Middleware handles authentication checks
- Role-based access control for specialized routes
- Automatic redirects for unauthorized access
- Session management and timeout handling

## Navigation Patterns

### User Flow
1. Public browsing → Registration/Login → Dashboard
2. Role application → Verification → Specialized features
3. Content creation → Monetization → Analytics

### Admin Flow
1. Secure login → Admin portal → Management tasks
2. Verification review → User management → Platform oversight

## Route Parameters

### Dynamic Routes
- `/profile/[id]` - User profile by ID
- `/products/[id]` - Product detail page
- `/live/[id]` - Live stream viewer

### Query Parameters
- Search filters and pagination
- Authentication redirects
- Feature flags and preferences