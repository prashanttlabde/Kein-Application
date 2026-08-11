# Kein Platform Documentation

Welcome to the comprehensive documentation for the Kein social commerce platform. This documentation covers all aspects of the platform including pages, components, hooks, utilities, and features.

## Platform Overview

Kein is a live shopping platform that combines social media engagement with e-commerce, enabling three core user types to interact in a dynamic marketplace:

- **Regular Users**: Browse content, shop products, manage orders
- **Influencers**: Create reels, host live streams, earn commissions (requires verification)
- **Sellers**: Manage products, create contracts with influencers (requires verification)
- **Admins**: Manage verifications, oversee platform operations

## Documentation Structure

### 📄 [Pages Documentation](./pages/)
Complete documentation for all application routes including authentication requirements, parameters, and user roles.

### 🧩 [Components Documentation](./components/)
Detailed documentation for all reusable UI components including props, usage examples, and styling.

### 🪝 [Hooks Documentation](./hooks/)
Documentation for custom React hooks including parameters, return values, and usage patterns.

### 📚 [Library Documentation](./lib/)
Documentation for utility functions, database operations, and configuration files.

### ⭐ [Features Documentation](./features/)
High-level feature documentation covering user workflows, business logic, and integration points.

## Quick Start

1. **Authentication System**: Multi-role authentication with regular users, influencers, sellers, and admins
2. **Verification System**: KYC process for influencers and sellers with admin approval workflow
3. **Creator Dashboard**: Content creation tools for influencers including reels and live streaming
4. **Admin Portal**: Comprehensive admin interface for platform management
5. **Commerce Features**: Shopping cart, checkout, and order management

## Technology Stack

- **Frontend**: Next.js 15.5.5 with React 19.1.0 and TypeScript
- **Backend**: Supabase with PostgreSQL and Row Level Security
- **Styling**: Tailwind CSS 4 with custom design system
- **Authentication**: Supabase Auth with role-based access control

## Key Concepts

### User Roles
- `user`: Regular platform users
- `influencer`: Content creators (requires verification)
- `seller`: Product vendors (requires verification)  
- `admin`: Platform administrators

### Verification Process
1. User applies for influencer/seller status
2. Admin reviews application and documents
3. Admin approves/rejects with notes
4. User profile updated with verification status

### Navigation Structure
- Public routes: Home, explore, products, live streams
- Protected routes: Dashboard, settings, profile management
- Role-specific routes: Creator dashboard, admin portal
- Admin-only routes: User management, verification approval

## Getting Started

Refer to the specific documentation sections for detailed information about each aspect of the platform.