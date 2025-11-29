require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import all your models
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");
const Admin = require("./models/admin.model");
const AuditLog = require("./models/auditLog.model");
const Product = require("./models/product.model");
const Dashboard = require("./models/dashboard.model");
const PageView = require("./models/pageview.model");
const Notification = require("./models/notification.model");
const CustomerNotification = require("./models/customerNotification.model");
const BlogPost = require("./models/blogPost.model");
const MsmeBlogPost = require("./models/msmeBlogPost.model");
const Message = require("./models/message.model");
const Conversation = require("./models/conversation.model");
const StoreBadge = require("./models/storeBadge.model");
const CustomerBadge = require("./models/customerBadge.model");

// Define collections to migrate
const collections = [
  { name: "customers", model: Customer },
  { name: "msmes", model: MSME },
  { name: "admins", model: Admin },
  { name: "auditlogs", model: AuditLog },
  { name: "products", model: Product },
  { name: "dashboards", model: Dashboard },
  { name: "pageviews", model: PageView },
  { name: "notifications", model: Notification },
  { name: "customernotifications", model: CustomerNotification },
  { name: "blogposts", model: BlogPost },
  { name: "msmeblogposts", model: MsmeBlogPost },
  { name: "messages", model: Message },
  { name: "conversations", model: Conversation },
  { name: "storebadges", model: StoreBadge },
  { name: "customerbadges", model: CustomerBadge },
];

async function exportFromLocal() {
  console.log("🔄 Starting data export from local MongoDB...");

  // Connect to local MongoDB
  await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");
  console.log("✅ Connected to local MongoDB");

  const exportData = {};

  for (const collection of collections) {
    try {
      const data = await collection.model.find({}).lean();
      exportData[collection.name] = data;
      console.log(
        `📦 Exported ${data.length} documents from ${collection.name}`
      );
    } catch (error) {
      console.log(`⚠️  Could not export ${collection.name}:`, error.message);
      exportData[collection.name] = [];
    }
  }

  // Save to JSON file
  const exportPath = path.join(__dirname, "data-export.json");
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
  console.log(`💾 Data exported to: ${exportPath}`);

  await mongoose.disconnect();
  return exportData;
}

async function importToAtlas(exportData) {
  console.log("🔄 Starting data import to MongoDB Atlas...");

  // Build Atlas connection string
  const atlasURI = process.env.MONGODB_URI?.replace(
    "<db_username>",
    process.env.DB_USERNAME
  )?.replace("<db_password>", process.env.DB_PASSWORD);

  if (!atlasURI || !process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    throw new Error("Atlas connection credentials not properly configured");
  }

  // Connect to Atlas
  await mongoose.connect(atlasURI);
  console.log("✅ Connected to MongoDB Atlas");

  for (const collection of collections) {
    const data = exportData[collection.name];
    if (data && data.length > 0) {
      try {
        // Clear existing data (optional - remove if you want to keep existing)
        await collection.model.deleteMany({});

        // Import data
        if (data.length > 0) {
          await collection.model.insertMany(data, { ordered: false });
        }
        console.log(
          `✅ Imported ${data.length} documents to ${collection.name}`
        );
      } catch (error) {
        console.log(`❌ Error importing ${collection.name}:`, error.message);
      }
    } else {
      console.log(`⚠️  No data to import for ${collection.name}`);
    }
  }

  await mongoose.disconnect();
}

async function migrateData() {
  try {
    console.log("🚀 Starting MongoDB migration from local to Atlas...");

    // Step 1: Export from local
    const exportData = await exportFromLocal();

    // Step 2: Import to Atlas
    await importToAtlas(exportData);

    console.log("🎉 Migration completed successfully!");

    // Show summary
    const totalDocs = Object.values(exportData).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(`📊 Migration Summary: ${totalDocs} total documents migrated`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData, exportFromLocal, importToAtlas };
