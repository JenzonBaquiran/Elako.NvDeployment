const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");
const MsmeBlogPost = require("./models/msmeBlogPost.model");
const Customer = require("./models/customer.model");
const PageView = require("./models/pageview.model");

async function testMsmeData() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get sample MSME data
    const msmes = await MSME.find({}).limit(3).lean();
    console.log(`\nFound ${msmes.length} MSMEs in database:`);

    for (let i = 0; i < msmes.length; i++) {
      const msme = msmes[i];
      console.log(`\n${i + 1}. Business: ${msme.businessName}`);
      console.log(`   Category: ${msme.category}`);
      console.log(`   Status: ${msme.status}`);
      console.log(`   Email: ${msme.email}`);
      console.log(
        `   Rating: ${msme.averageRating || 0} (${
          msme.totalRatings || 0
        } reviews)`
      );

      // Count products
      const productCount = await Product.countDocuments({ msmeId: msme._id });
      console.log(`   Products: ${productCount}`);

      // Count blog posts
      const blogCount = await MsmeBlogPost.countDocuments({ msmeId: msme._id });
      console.log(`   Blog posts: ${blogCount}`);

      // Count followers
      const followerCount = await Customer.countDocuments({
        following: msme._id,
      });
      console.log(`   Followers: ${followerCount}`);
    }

    // Get total counts
    const totalMsmes = await MSME.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalBlogs = await MsmeBlogPost.countDocuments({});
    const totalCustomers = await Customer.countDocuments({});

    console.log(`\nDatabase Summary:`);
    console.log(`Total MSMEs: ${totalMsmes}`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total MSME Blogs: ${totalBlogs}`);
    console.log(`Total Customers: ${totalCustomers}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nConnection closed");
  }
}

testMsmeData();
