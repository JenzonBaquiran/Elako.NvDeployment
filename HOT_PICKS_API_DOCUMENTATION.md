# Hot Picks (Top Rated Products) API Documentation

## Overview

The Hot Picks API provides endpoints to fetch products with high ratings (4.5-5.0 average rating) from the MongoDB database. These endpoints are designed to display top-performing products in the Hot Picks section of the homepage.

## Endpoints

### 1. Get Top 4 Hot Picks Products

**Endpoint:** `GET /api/hot-picks`

**Description:** Fetches the top 4 products with 4.5-5.0 average rating, sorted by rating (descending), then by newest first.

**Query Parameters:**

- `limit` (optional): Number of products to return (default: 4)

**Example Request:**

```
GET http://localhost:1337/api/hot-picks
GET http://localhost:1337/api/hot-picks?limit=8
```

**Response Format:**

```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "productId": "product_id",
      "productName": "Product Name",
      "description": "Product description",
      "price": 80,
      "category": "baked-goods",
      "availability": true,
      "visible": true,
      "mainImage": "image_filename.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "imageUrl": "http://localhost:1337/uploads/image_filename.jpg",
      "rating": 5.0,
      "averageRating": 5.0,
      "totalReviews": 5,
      "feedback": [...],
      "msme": {
        "_id": "msme_id",
        "businessName": "Store Name",
        "username": "store_username",
        "status": "approved"
      },
      "hashtags": ["tag1", "tag2"],
      "variants": [...],
      "sizeOptions": [...],
      "createdAt": "2025-10-07T12:47:24.710Z",
      "updatedAt": "2025-10-08T19:12:59.795Z"
    }
  ],
  "total": 4,
  "message": "Top 4 hot picks with 4.5-5.0 rating"
}
```

### 2. Get All Hot Picks Products (View All)

**Endpoint:** `GET /api/hot-picks/all`

**Description:** Fetches all products with 4.5-5.0 average rating with pagination support. This endpoint is used when the user clicks "View All" to see all top-rated products.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of products per page (default: 12)

**Example Request:**

```
GET http://localhost:1337/api/hot-picks/all
GET http://localhost:1337/api/hot-picks/all?page=2&limit=8
```

**Response Format:**

```json
{
  "success": true,
  "products": [...], // Same format as above
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "limit": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "All hot picks with 4.5-5.0 rating"
}
```

## Rating Criteria

- Only products with `rating` between 4.5 and 5.0 (inclusive) are returned
- Only available (`availability: true`) and visible (`visible: true`) products are included
- Only products from approved MSMEs (`status: "approved"`) are included
- Products are sorted by:
  1. Average rating (highest first)
  2. Creation date (newest first)

## Product Data Structure

Each product object includes:

- **Basic Info:** ID, product name, description, price, category, availability, visibility
- **Images:** Main image, all images array, formatted image URLs
- **Rating Info:** Rating score, total reviews count, feedback array
- **MSME Info:** Store details including business name, username, and approval status
- **Product Details:** Hashtags, variants, size options, timestamps

## Frontend Integration

### Hot Picks Labels

Products are automatically labeled based on their rating:

- **Rating 5.0:** "Hot" (red label)
- **Rating 4.8-4.9:** "Trending" (green label)
- **Rating 4.5-4.7:** "Popular" (orange label)
- **Default:** "Featured" (red label)

### Image Handling

- Uses `imageUrl` field for direct image access
- Falls back to default image if product image fails to load
- Supports multiple product images via `images` array

### Price Formatting

- Prices are formatted as Philippine Pesos (₱)
- Uses `toLocaleString()` for proper number formatting

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
// Fetch top 4 hot picks for homepage
const fetchHotPicks = async () => {
  try {
    const response = await fetch("/api/hot-picks");
    const data = await response.json();
    if (data.success) {
      setHotPicks(data.products);
    }
  } catch (error) {
    console.error("Error fetching hot picks:", error);
  }
};

// Fetch all hot picks with pagination
const fetchAllHotPicks = async (page = 1) => {
  try {
    const response = await fetch(`/api/hot-picks/all?page=${page}&limit=12`);
    const data = await response.json();
    if (data.success) {
      setAllHotPicks(data.products);
      setPagination(data.pagination);
    }
  } catch (error) {
    console.error("Error fetching all hot picks:", error);
  }
};
```

## Database Queries Used

### Hot Picks Endpoint

- Simple MongoDB query with filtering and population
- Filters products by rating, availability, and visibility
- Populates MSME information and filters by approval status

### Hot Picks All Endpoint

- Uses MongoDB aggregation pipeline for better performance
- Includes `$lookup` to join with MSME collection
- Implements pagination with `$skip` and `$limit`
- Provides accurate total count for pagination

## Notes

- Product ratings are stored in the `rating` field of the Product model
- MSME approval status is checked to ensure quality control
- All image URLs are fully qualified with server domain
- Pagination metadata helps with frontend pagination UI
- Error handling includes both database and validation errors
