# Actions Directory Structure

This directory contains all server actions organized by user role and functionality.

## 📁 Directory Structure

```
lib/actions/
├── admin/           # Admin-only actions
├── resident/        # Resident-only actions  
├── shared/          # Shared utilities
├── index.ts         # Clean exports
└── README.md        # This file
```

## 🔐 Admin Actions (`/admin/`)

Actions that only administrators can access:

- **`admin-payments.ts`** - Payment management (view all, mark as paid, generate receipts)
- **`admin-complaints.ts`** - Complaint management (view all, respond, update status)
- **`admin-amenities.ts`** - Amenity management (create, edit, approve bookings)
- **`admin-move-requests.ts`** - Move request management (approve, reject, track)
- **`admin-gatepass.ts`** - Gatepass management (approve visitor requests)
- **`admin-services.ts`** - Service request management
- **`improved-residents.ts`** - Resident management with unit relationships
- **`residents.ts`** - Legacy resident management
- **`admin.ts`** - General admin utilities

## 👤 Resident Actions (`/resident/`)

Actions that residents can access for their own data:

- **`resident-payments.ts`** - View own payments, confirm payments
- **`resident-complaints.ts`** - Submit, view, update own complaints
- **`resident-amenities.ts`** - Book amenities, view own bookings
- **`resident-move-requests.ts`** - Submit, view, update move requests
- **`resident-visitors.ts`** - Submit, manage visitor requests
- **`resident-profile.ts`** - Update profile, change password, upload avatar
- **`services.ts`** - Submit service requests
- **`visitors.ts`** - Legacy visitor management
- **`amenities.ts`** - Legacy amenity booking

## 🔗 Shared Actions (`/shared/`)

Actions used by both admin and resident roles:

- **`auth.ts`** - Authentication utilities
- **`profile.ts`** - Profile management utilities
- **`units.ts`** - Unit information utilities

## 🚀 Usage

### Import from Index (Recommended)
```typescript
// Clean imports for any action
import { 
  getAllPayments,           // Admin
  getMyPayments,           // Resident
  createComplaint,         // Resident
  getAllComplaints,        // Admin
  getAvailableAmenities    // Resident
} from "@/lib/actions"
```

### Direct Imports
```typescript
// Admin actions
import { getAllPayments } from "@/lib/actions/admin/admin-payments"
import { getAllComplaints } from "@/lib/actions/admin/admin-complaints"

// Resident actions
import { getMyPayments } from "@/lib/actions/resident/resident-payments"
import { createComplaint } from "@/lib/actions/resident/resident-complaints"

// Shared actions
import { getUnits } from "@/lib/actions/shared/units"
```

## 🔒 Security Features

### Authentication
- All actions verify user is logged in
- Uses Supabase client-side authentication

### Authorization
- Admin actions verify user has "admin" role
- Resident actions verify user has "resident" role
- Data isolation ensures users only access their own data

### Input Validation
- Form data validation on all inputs
- Type checking for required fields
- Error handling for invalid data

## 📝 Migration Guide

### From Old Structure
```typescript
// Old way
import { createAmenityBooking } from "@/lib/actions/amenities"

// New way
import { createAmenityBooking } from "@/lib/actions/resident/resident-amenities"
// or
import { createAmenityBooking } from "@/lib/actions"
```

### Update Imports
1. Replace direct imports with index imports where possible
2. Update any broken imports to use new file paths
3. Test functionality after migration

## 🛠️ Development

### Adding New Actions
1. Create file in appropriate directory (`admin/`, `resident/`, or `shared/`)
2. Add proper authentication/authorization
3. Export functions from the file
4. Add export to `index.ts`
5. Test the action

### Best Practices
- Always use proper authentication helpers
- Validate all inputs
- Handle errors gracefully
- Use descriptive function names
- Add JSDoc comments for complex functions
- Test with both admin and resident users 