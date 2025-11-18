# MSME Certificate Upload Feature

## Overview

This feature allows MSME (Micro, Small, and Medium Enterprises) owners to upload their business certificates during the registration process. The admin can then view these certificates through the admin oversight panel.

## Features Added

### 1. MSME Registration Enhancement

- **TIN Number Field**: Text input for Tax Identification Number
- **Mayor's Permit Upload**: File upload for Mayor's Permit (PDF, JPG, PNG)
- **BIR Certificate Upload**: File upload for BIR certificate (PDF, JPG, PNG)
- **DTI Certificate Upload**: File upload for DTI certificate (PDF, JPG, PNG)

### 2. Backend Changes

- **Database Schema**: Added `certificates` object to MSME model with fields:
  - `mayorsPermit`: File path for Mayor's Permit
  - `bir`: File path for BIR certificate
  - `tinNumber`: TIN number as text
  - `dti`: File path for DTI certificate
- **File Upload Handling**: Implemented multer middleware for certificate uploads
- **API Endpoint**: Added `/api/msme/:id/certificates` endpoint for retrieving certificate information

### 3. Admin Interface Enhancement

- **User Management Integration**: Added certificate viewing in User Management modal for MSME users
- **MSME Oversight Integration**: Made MSME cards clickable to view details and certificates
- **Unified Modal Interface**: Both admin pages show MSME details and certificates in consistent modal format
- **Individual Document Viewers**: Each certificate has a "View Document" button that opens a dedicated popup viewer
- **One-by-One Viewing**: Click each certificate button to view documents individually in popup modals
- **No External Tabs**: All certificate viewing happens within the application interface
- **Smart Image Display**: Images display directly in the viewer, PDFs show download option

## File Structure

```
server/
├── uploads/
│   └── certificates/          # Certificate files stored here
│       ├── mayorsPermit-[timestamp]-[random].ext
│       ├── bir-[timestamp]-[random].ext
│       └── fda-[timestamp]-[random].ext
├── models/
│   └── msme.model.js         # Updated with certificates field
└── index.js                  # Updated registration endpoint

dashboard/src/
├── pages/
│   ├── Signup.jsx            # Updated with file upload fields
│   └── AdminMsmeOversight.jsx # Updated with certificate viewing
└── css/
    ├── Signup.css            # Added certificate upload styles
    └── AdminMsmeOversight.css # Added modal styles
```

## Usage

### For MSME Registration:

1. Navigate to the signup page
2. Select "MSME" tab
3. Fill in all required fields including TIN number
4. Upload all three required certificates:
   - Mayor's Permit
   - BIR Certificate
   - DTI Certificate
5. Submit the registration form

### For Admin Certificate Review:

#### Method 1: User Management Panel

1. Login as admin
2. Navigate to "User Management" page
3. Find the MSME user you want to review
4. Click "View" button in the Actions column
5. **View MSME details and certificate section in the modal**
6. Click "View Document" button for each certificate to see it in a popup viewer
7. Each certificate opens one-by-one in a dedicated image viewer (no new tabs)

#### Method 2: MSME Oversight Panel

1. Login as admin
2. Navigate to "MSME Oversight" page
3. Click on any MSME card (entire card is clickable)
4. **View MSME details and certificate section in the modal**
5. Click "View Document" button for each certificate to see it in a popup viewer
6. Each certificate opens one-by-one in a dedicated image viewer (no new tabs)

## Technical Details

### File Upload Validation:

- Accepts: PDF, JPG, JPEG, PNG files
- Maximum file size: 10MB per certificate
- All three certificates are required for registration

### File Naming Convention:

- `[certificateType]-[timestamp]-[randomNumber].[extension]`
- Example: `mayorsPermit-1735734233219-611443760.pdf`

### Error Handling:

- Client-side validation for required certificates
- Server-side file type and size validation
- Proper error messages for failed uploads

## Security Considerations

- Files are stored in a separate certificates directory
- File access is controlled through the server
- File names are randomized to prevent conflicts
- File type validation prevents malicious uploads
