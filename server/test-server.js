const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

// Import Models
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");
const MsmeBlogPost = require("./models/msmeBlogPost.model");
const Customer = require("./models/customer.model");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

// Test endpoint for MSME reports
app.get("/api/test/msme-reports", async (req, res) => {
  try {
    console.log("Testing MSME reports endpoint...");

    const msmes = await MSME.find({}).lean();
    console.log(`Found ${msmes.length} MSMEs`);

    const reports = [];

    for (const msme of msmes) {
      const totalProducts = await Product.countDocuments({ msmeId: msme._id });
      const totalBlogs = await MsmeBlogPost.countDocuments({
        msmeId: msme._id,
      });
      const totalCustomers = await Customer.countDocuments({
        following: msme._id,
      });

      // Get blog views
      const blogPosts = await MsmeBlogPost.find({ msmeId: msme._id }).lean();
      const blogViews = blogPosts.reduce(
        (total, blog) => total + (blog.views || 0),
        0
      );

      // Calculate product rating
      const products = await Product.find({ msmeId: msme._id });
      let totalRating = 0;
      let ratingCount = 0;

      products.forEach((product) => {
        if (product.feedback) {
          product.feedback.forEach((feedback) => {
            if (feedback.rating) {
              totalRating += feedback.rating;
              ratingCount++;
            }
          });
        }
      });

      const avgProductRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      reports.push({
        businessName: msme.businessName,
        category: msme.category,
        status: msme.status,
        storeRating: msme.averageRating || 0,
        totalProducts,
        avgProductRating: Number(avgProductRating.toFixed(1)),
        totalBlogs,
        blogViews,
        totalCustomers,
        email: msme.email,
      });
    }

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(
    "Visit http://localhost:3001/api/test/msme-reports to test the endpoint"
  );
});
