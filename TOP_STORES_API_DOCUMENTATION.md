# Top Stores API Documentation

## Overview

The Top Stores API provides endpoints to fetch MSMEs (stores) with high ratings (4.5-5.0 average rating) from the MongoDB database. These endpoints are designed to display top-performing stores on the frontend.

## Endpoints

### 1. Get Top 6 Stores

**Endpoint:** `GET /api/top-stores`

**Description:** Fetches the top 6 stores with 4.5-5.0 average rating, sorted by rating (descending), then by number of ratings, then by newest.

**Query Parameters:**

- `limit` (optional): Number of stores to return (default: 6)

**Example Request:**

```
GET http://localhost:1337/api/top-stores
GET http://localhost:1337/api/top-stores?limit=10
```

**Response Format:**

```json
{
  "success": true,
  "stores": [
    {
      "_id": "store_id",
      "msmeId": "store_id",
      "businessName": "Store Name",
      "category": "food|artisan",
      "username": "store_username",
      "status": "approved",
      "createdAt": "2025-09-20T16:33:47.930Z",
      "address": "Store Address",
      "averageRating": 4.5,
      "totalRatings": 2,
      "ratings": [...],
      "productCount": 5,
      "followerCount": 10,
      "dashboard": {
        "businessName": "Store Name",
        "description": "Store description",
        "coverPhoto": "cover_photo_filename.jpg",
        "storeLogo": "logo_filename.jpg",
        "contactNumber": "Contact Number",
        "location": "Store Location",
        "socialLinks": {
          "facebook": "https://facebook.com/store",
          "instagram": "https://instagram.com/store",
          "twitter": "https://twitter.com/store",
          "website": "https://store-website.com"
        },
        "rating": 4.5,
        "totalRatings": 2,
        "isPublic": true,
        "createdAt": "2025-09-20T16:34:01.018Z",
        "updatedAt": "2025-10-06T19:16:31.548Z"
      }
    }
  ],
  "total": 6,
  "message": "Top 6 stores with 4.5-5.0 rating"
}
```

### 2. Get All Top Stores (View All)

**Endpoint:** `GET /api/top-stores/all`

**Description:** Fetches all stores with 4.5-5.0 average rating with pagination support. This endpoint is used when the user clicks "View All" to see all top-rated stores.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of stores per page (default: 12)

**Example Request:**

```
GET http://localhost:1337/api/top-stores/all
GET http://localhost:1337/api/top-stores/all?page=2&limit=8
```

**Response Format:**

```json
{
  "success": true,
  "stores": [...], // Same format as above
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "limit": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "All stores with 4.5-5.0 rating"
}
```

## Rating Criteria

- Only stores with `averageRating` between 4.5 and 5.0 (inclusive) are returned
- Only approved (`status: "approved"`) and visible (`isVisible: true`) stores are included
- Stores are sorted by:
  1. Average rating (highest first)
  2. Total number of ratings (most ratings first)
  3. Creation date (newest first)

## Store Data Structure

Each store object includes:

- **Basic Info:** ID, business name, category, username, status, creation date, address
- **Rating Info:** Average rating, total ratings count, individual ratings array
- **Statistics:** Product count, follower count
- **Dashboard Info:** Complete dashboard information including photos, contact details, social links

## Error Handling

Both endpoints return a standard error response format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Usage Examples

### Frontend Implementation (React/JavaScript)

```javascript
// Fetch top 6 stores for homepage
const fetchTopStores = async () => {
  try {
    const response = await fetch("/api/top-stores");
    const data = await response.json();
    if (data.success) {
      setTopStores(data.stores);
    }
  } catch (error) {
    console.error("Error fetching top stores:", error);
  }
};

// Fetch all top stores with pagination
const fetchAllTopStores = async (page = 1) => {
  try {
    const response = await fetch(`/api/top-stores/all?page=${page}&limit=12`);
    const data = await response.json();
    if (data.success) {
      setAllTopStores(data.stores);
      setPagination(data.pagination);
    }
  } catch (error) {
    console.error("Error fetching all top stores:", error);
  }
};
```

## Notes

- Dashboard information is automatically created if it doesn't exist for a store
- Product count and follower count are calculated dynamically
- All file paths (images) need to be prefixed with the server's uploads URL when displaying
- The rating system uses the MSME model's rating data, not the dashboard rating field
