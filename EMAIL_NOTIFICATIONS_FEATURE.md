# Store Activity Email Notifications

This feature automatically sends email notifications to customers when stores they follow perform certain activities.

## Features

### Automated Email Notifications

The system sends emails to customers for the following store activities:

1. **New Product Added** 🆕

   - Triggered when a store adds a new product
   - Email includes product name, price, description, and direct link

2. **Price Changes** 💰

   - **Price Increase**: Notifies customers when product prices go up
   - **Price Decrease**: Highlights savings when prices drop (special deal format)
   - Shows old vs new price comparison

3. **Product Available Again** ✅

   - Triggered when a product changes from unavailable to available
   - Helps customers know when items are back in stock

4. **New Blog Post** 📝
   - Sent when stores publish new blog posts
   - Includes title, subtitle, category, and direct link to read more

## Implementation

### Services

#### `emailService.js`

- **`sendStoreActivityEmail(customerEmail, customerName, storeInfo, activityData)`**
  - Sends personalized HTML emails for different activity types
  - Responsive email templates with professional styling
  - Branded with ELako.NV design

#### `storeActivityNotificationService.js`

- **`notifyFollowersOfNewProduct(msmeId, productId)`**
- **`notifyFollowersOfPriceChange(msmeId, productId, oldPrice, newPrice)`**
- **`notifyFollowersOfProductAvailability(msmeId, productId)`**
- **`notifyFollowersOfNewBlogPost(msmeId, blogPostId, blogPostData)`**

### API Integration

#### Product Endpoints

- **POST `/api/products`**: Triggers new product notifications
- **PUT `/api/products/:id`**: Detects price changes and availability changes

#### Blog Post Endpoints

- **POST `/api/msme/blog-posts`**: Triggers new blog post notifications for published posts
- **PUT `/api/msme/blog-posts/:id`**: Triggers notifications when draft posts are published

## Email Templates

### Design Features

- **Responsive Design**: Works on all devices
- **Professional Styling**: Clean, modern appearance
- **Branded**: Consistent with ELako.NV design
- **Action Buttons**: Direct links to products/blog posts
- **Store Information**: Includes store description and context

### Email Types

#### New Product Email

```
Subject: 🆕 New Product from [Store Name]!
Content: Product details, price, description, "View Product" button
```

#### Price Increase Email

```
Subject: 📈 Price Update from [Store Name]
Content: Old vs new price comparison, product details
```

#### Price Decrease Email

```
Subject: 🎉 Great Deal from [Store Name]!
Content: Savings highlight, old vs new price, "Get This Deal" button
```

#### Product Available Email

```
Subject: ✅ Product Back in Stock at [Store Name]!
Content: Availability notice, product details, "Order Now" button
```

#### New Blog Post Email

```
Subject: 📝 New Update from [Store Name]!
Content: Blog post preview, category, "Read Full Post" button
```

## Configuration

### Email Service Setup

The system uses Gmail SMTP with the following configuration:

- **Service**: Gmail
- **Auth**: App-specific password required
- **Sender**: "ELako.NV Notifications" <elakonv@gmail.com>

### Error Handling

- Non-blocking: Email failures don't affect core functionality
- Logging: All email attempts are logged for monitoring
- Batch Processing: Uses Promise.allSettled for sending to multiple recipients

## Database Requirements

### Customer Model

- Must have `following` array field containing MSME ObjectIds
- Must have `email`, `firstname`, `lastname` fields

### MSME Model

- Must have `businessName`, `businessDescription` fields

### Product Model

- Must have `msmeId`, `productName`, `price`, `description`, `availability` fields

### MsmeBlogPost Model

- Must have `msmeId`, `title`, `subtitle`, `description`, `category`, `status` fields

## Usage Examples

### Following a Store

When customers follow a store (add MSME ObjectId to their `following` array), they automatically receive notifications for that store's activities.

### Testing

To test the notification system:

1. Create a customer account
2. Follow a store (add store ID to customer's following array)
3. Perform store activities (add products, change prices, post blogs)
4. Check email inbox for notifications

## Security & Privacy

- **Opt-in Only**: Customers only get emails for stores they explicitly follow
- **Unsubscribe Info**: Each email includes information about managing following preferences
- **No Spam**: Only legitimate store activities trigger emails
- **Professional Content**: All emails maintain professional standards

## Monitoring

The system logs:

- Email send attempts and results
- Failed email deliveries
- Notification trigger events
- Batch processing statistics

## Future Enhancements

Potential improvements:

- Email frequency controls (daily digest vs instant)
- Email preference categories (products only, blogs only, etc.)
- Email analytics and open tracking
- A/B testing for email templates
- SMS notifications option
