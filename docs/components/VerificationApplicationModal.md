# VerificationApplicationModal Component

Modal component for submitting influencer and seller verification applications with document upload and form validation.

## Overview

**File**: `components/VerificationApplicationModal.tsx`  
**Type**: Client Component  
**Purpose**: Comprehensive verification application form with document upload capabilities  

## Props

```typescript
interface VerificationApplicationModalProps {
  type: 'influencer' | 'seller';
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: VerificationFormData) => void;
  initialData?: Partial<VerificationFormData>;
}
```

### Required Props

- **type**: Verification type (influencer or seller)
- **isOpen**: Modal visibility state
- **onClose**: Callback to close the modal

### Optional Props

- **onSubmit**: Custom submit handler (defaults to internal submission)
- **initialData**: Pre-populate form with existing data

## Form Data Structure

```typescript
interface VerificationFormData {
  // Common fields
  businessName: string;
  businessType: string;
  documents: File[];
  additionalInfo: string;
  
  // Influencer-specific
  socialLinks: string[];
  followerCount: number;
  contentNiche: string;
  
  // Seller-specific
  taxId: string;
  businessAddress: string;
  productCategories: string[];
  shippingCapabilities: string[];
}
```

## Form Sections

### Business Information

**Common Fields**:
- **Business Name**: Legal or operating business name
- **Business Type**: Dropdown selection (Individual, LLC, Corporation, etc.)
- **Additional Information**: Free-text area for extra details

**Validation**:
- Business name: Required, minimum 2 characters
- Business type: Required selection
- Additional info: Optional, maximum 1000 characters

### Document Upload

**Features**:
- **Drag & Drop**: Intuitive file upload interface
- **Multiple Files**: Support for multiple document uploads
- **File Validation**: Type and size validation
- **Preview**: Thumbnail previews of uploaded files
- **Remove**: Individual file removal capability

**Supported Formats**:
- Images: JPG, PNG, GIF (max 10MB each)
- Documents: PDF (max 10MB each)
- Total limit: 50MB per application

**Required Documents**:

*Influencer*:
- Government-issued photo ID
- Social media analytics screenshots
- Portfolio samples (optional)

*Seller*:
- Business registration certificate
- Tax identification documents
- Product liability insurance (if applicable)

### Type-Specific Fields

#### Influencer Fields

**Social Media Links**:
- Dynamic input fields for multiple platforms
- URL validation for social media platforms
- Platform detection (Instagram, TikTok, YouTube, etc.)

**Follower Information**:
- Total follower count across platforms
- Primary platform selection
- Engagement rate (optional)

**Content Details**:
- Content niche/category selection
- Content creation frequency
- Monetization experience

#### Seller Fields

**Business Details**:
- Tax identification number
- Business registration number
- Business address (full address form)

**Product Information**:
- Product categories (multi-select)
- Inventory size estimation
- Manufacturing vs. reselling

**Shipping & Fulfillment**:
- Shipping capabilities (local, national, international)
- Fulfillment methods (self-ship, dropship, 3PL)
- Processing time estimates

## Validation Rules

### Client-Side Validation

```typescript
const validationRules = {
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  businessType: {
    required: true
  },
  documents: {
    required: true,
    minFiles: 1,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  },
  socialLinks: {
    required: true, // For influencers
    minItems: 1,
    urlValidation: true
  },
  followerCount: {
    required: true, // For influencers
    min: 1000,
    max: 100000000
  },
  taxId: {
    required: true, // For sellers
    pattern: /^[0-9-]+$/
  }
};
```

### Real-Time Validation
- **Field-level**: Validates individual fields on blur
- **Form-level**: Validates entire form on submit
- **Visual Feedback**: Red borders and error messages for invalid fields
- **Success States**: Green checkmarks for valid fields

## File Upload System

### Upload Process

1. **File Selection**: Drag & drop or file picker
2. **Validation**: Check file type, size, and count limits
3. **Preview Generation**: Create thumbnails for images
4. **Upload Preparation**: Prepare files for Supabase Storage
5. **Progress Tracking**: Show upload progress for large files

### Upload Implementation

```typescript
const handleFileUpload = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);
    
    if (error) throw error;
    return data.path;
  });
  
  const uploadedPaths = await Promise.all(uploadPromises);
  return uploadedPaths;
};
```

### Security Features
- **File Type Validation**: Strict MIME type checking
- **Virus Scanning**: Automatic malware detection
- **Access Control**: Secure file access with signed URLs
- **Encryption**: Files encrypted at rest

## Form Submission

### Submission Flow

1. **Validation**: Complete form validation
2. **File Upload**: Upload documents to Supabase Storage
3. **Data Preparation**: Prepare verification request object
4. **Database Insert**: Create verification request record
5. **Notification**: Send confirmation to user
6. **Modal Close**: Close modal and update UI

### Error Handling

```typescript
const handleSubmit = async (formData: VerificationFormData) => {
  try {
    setSubmitting(true);
    
    // Upload documents
    const documentUrls = await uploadDocuments(formData.documents);
    
    // Create verification request
    const { data, error } = await database.createVerificationRequest({
      user_id: user.id,
      type: type,
      status: 'pending',
      business_name: formData.businessName,
      business_type: formData.businessType,
      documents: documentUrls,
      social_links: formData.socialLinks,
      follower_count: formData.followerCount,
      tax_id: formData.taxId,
      additional_info: formData.additionalInfo
    });
    
    if (error) throw error;
    
    // Success handling
    showSuccessMessage();
    onClose();
    
  } catch (error) {
    console.error('Verification submission failed:', error);
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

## UI Components

### Modal Structure

```typescript
// Modal layout
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <Modal.Header>
    <h2>Apply for {type} Verification</h2>
  </Modal.Header>
  
  <Modal.Body>
    <form onSubmit={handleSubmit}>
      <BusinessInfoSection />
      <DocumentUploadSection />
      {type === 'influencer' ? (
        <InfluencerFieldsSection />
      ) : (
        <SellerFieldsSection />
      )}
      <AdditionalInfoSection />
    </form>
  </Modal.Body>
  
  <Modal.Footer>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button 
      type="submit" 
      loading={submitting}
      disabled={!isFormValid}
    >
      Submit Application
    </Button>
  </Modal.Footer>
</Modal>
```

### Form Sections

**Business Information**:
- Text inputs with validation
- Dropdown selectors
- Help text and examples

**Document Upload**:
- Drag & drop zone
- File list with previews
- Upload progress indicators
- Error states for failed uploads

**Dynamic Fields**:
- Conditional rendering based on verification type
- Dynamic input arrays (social links, categories)
- Real-time validation feedback

## Styling & Design

### Visual Design
- **Clean Layout**: Organized sections with clear hierarchy
- **Progress Indication**: Step-by-step progress indicator
- **Visual Feedback**: Clear success/error states
- **Responsive**: Mobile-friendly responsive design

### Color Scheme
- **Primary**: Brand blue (#003366) for buttons and accents
- **Success**: Green for valid fields and success states
- **Error**: Red for validation errors and failures
- **Neutral**: Gray tones for secondary elements

### Typography
- **Headers**: Bold, larger text for section titles
- **Labels**: Medium weight for form labels
- **Body**: Regular weight for descriptions and help text
- **Error**: Smaller, red text for error messages

## Accessibility

### Screen Reader Support
- **Form Labels**: Proper labels for all form inputs
- **Error Announcements**: Screen reader announcements for errors
- **Progress Updates**: Accessibility announcements for form progress
- **File Upload**: Accessible file upload with keyboard support

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through form elements
- **Focus Management**: Proper focus handling for modal
- **Keyboard Shortcuts**: Enter to submit, Escape to close
- **File Upload**: Keyboard accessible file selection

### Visual Accessibility
- **High Contrast**: Sufficient color contrast for all text
- **Focus Indicators**: Clear focus states for all interactive elements
- **Error States**: Multiple visual cues beyond just color
- **Text Alternatives**: Alt text for images and icons

## Performance Optimization

### Form Performance
- **Debounced Validation**: Debounced real-time validation
- **Lazy Loading**: Lazy load non-critical form sections
- **Memoization**: Memoized expensive validation functions
- **Virtual Scrolling**: For large dropdown lists

### File Upload Performance
- **Chunked Upload**: Large file chunked upload
- **Parallel Processing**: Parallel file processing
- **Progress Tracking**: Real-time upload progress
- **Error Recovery**: Automatic retry for failed uploads

### Bundle Optimization
- **Code Splitting**: Separate bundle for modal component
- **Tree Shaking**: Remove unused validation libraries
- **Image Optimization**: Optimized preview thumbnails
- **Lazy Imports**: Lazy import heavy dependencies

## Integration Points

### Database Integration
- **Verification Requests**: Creates records in verification_requests table
- **File Storage**: Integrates with Supabase Storage
- **User Profiles**: Updates user profile with application status
- **Real-time**: Real-time updates for application status

### Authentication Integration
- **User Context**: Accesses current user information
- **Permission Checks**: Validates user eligibility
- **Session Management**: Handles authentication state
- **Security**: Secure file upload with user context

### Notification System
- **Email Notifications**: Sends confirmation emails
- **In-App Notifications**: Creates in-app notifications
- **Admin Alerts**: Notifies admins of new applications
- **Status Updates**: Updates user on application progress

## Testing Strategy

### Unit Tests
- **Form Validation**: Test all validation rules
- **File Upload**: Test file upload functionality
- **Error Handling**: Test error scenarios
- **Accessibility**: Test keyboard navigation and screen readers

### Integration Tests
- **End-to-End**: Complete application submission flow
- **Database**: Test database integration
- **File Storage**: Test file upload and storage
- **Notifications**: Test notification delivery

### User Testing
- **Usability**: User experience testing
- **Accessibility**: Accessibility compliance testing
- **Performance**: Performance under load
- **Cross-browser**: Browser compatibility testing

## Future Enhancements

### Planned Features
- **Auto-save**: Automatic form data saving
- **Multi-step**: Wizard-style multi-step form
- **Document Scanner**: Mobile document scanning
- **AI Validation**: AI-powered document validation

### User Experience
- **Smart Defaults**: Intelligent form pre-filling
- **Contextual Help**: Dynamic help based on user input
- **Progress Saving**: Save and resume application progress
- **Template System**: Pre-built application templates

### Technical Improvements
- **Offline Support**: Offline form completion
- **Real-time Collaboration**: Multi-user application editing
- **Advanced Validation**: Server-side validation integration
- **Analytics**: Form completion analytics and optimization