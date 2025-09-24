const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

// Import Models
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");
const Admin = require("./models/admin.model");
const Product = require("./models/product.model");
const Dashboard = require("./models/dashboard.model");
const PageView = require("./models/pageview.model");
const Notification = require("./models/notification.model");
const CustomerNotification = require("./models/customerNotification.model");

// Import Services
const CustomerNotificationService = require("./services/customerNotificationService");


const app = express();
const port = 1337;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// --- Validation Helpers ---
function validateCustomerInput(data) {
  const errors = [];
  if (!data.firstname || typeof data.firstname !== "string") errors.push("First name is required.");
  if (!data.lastname || typeof data.lastname !== "string") errors.push("Last name is required.");
  if (!data.username || typeof data.username !== "string") errors.push("Username is required.");
  if (!data.email || typeof data.email !== "string") errors.push("Email is required.");
  if (!data.contactNumber || typeof data.contactNumber !== "string") errors.push("Contact number is required.");
  if (!data.address || typeof data.address !== "string") errors.push("Address is required.");
  if (!data.password || typeof data.password !== "string" || data.password.length < 6) errors.push("Password must be at least 6 characters.");
  return errors;
}

function validateMSMEInput(data) {
  const errors = [];
  if (!data.clientProfilingNumber || typeof data.clientProfilingNumber !== "string") errors.push("Client profiling number is required.");
  if (!data.category || !["food", "artisan"].includes(data.category)) errors.push("Category must be 'food' or 'artisan'.");
  if (!data.businessName || typeof data.businessName !== "string") errors.push("Business name is required.");
  if (!data.username || typeof data.username !== "string") errors.push("Username is required.");
  if (!data.password || typeof data.password !== "string" || data.password.length < 6) errors.push("Password must be at least 6 characters.");
  return errors;
}

// --- Customer Routes ---
app.post("/api/customers/register", async (req, res) => {
  const errors = validateCustomerInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Generate unique ID
    const id = `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const customer = new Customer({
      ...req.body,
      id
    });
    
    await customer.save();
    res.status(201).json({ 
      success: true, 
      message: "Customer registered successfully",
      customer: { ...customer.toObject(), password: undefined } // Don't return password
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find({}, { password: 0 }); // Exclude password
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/customers/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  
  try {
    const customer = await Customer.findOne({ username });
    if (!customer || customer.password !== password) { // Plain text comparison
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    
    res.json({ 
      success: true, 
      user: { ...customer.toObject(), password: undefined },
      userType: 'customer'
    });
  } catch (error) {
    console.error("Customer login error:", error);
    res.status(500).json({ success: false, error: "Login error" });
  }
});

// --- MSME Routes ---
app.post("/api/msme/register", async (req, res) => {
  const errors = validateMSMEInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Generate unique ID
    const id = `MSME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const msme = new MSME({
      ...req.body,
      id
    });
    
    await msme.save();
    res.status(201).json({ 
      success: true, 
      message: "MSME registered successfully",
      msme: { ...msme.toObject(), password: undefined }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Client profiling number or username already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/msme", async (req, res) => {
  try {
    const msmes = await MSME.find({}, { password: 0 });
    res.json(msmes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/msme/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  
  try {
    const msme = await MSME.findOne({ username });
    if (!msme || msme.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    
    // Check if MSME is visible (can log in)
    if (msme.isVisible === false) {
      return res.status(403).json({ 
        success: false, 
        error: "Your account has been temporarily suspended. Please contact support." 
      });
    }
    
    res.json({ 
      success: true, 
      user: { ...msme.toObject(), password: undefined },
      userType: 'msme'
    });
  } catch (error) {
    console.error("MSME login error:", error);
    res.status(500).json({ success: false, error: "Login error" });
  }
});

// Update MSME status (for admin approval)
app.put("/api/msme/:id/status", async (req, res) => {
  const { status } = req.body;
  
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  
  try {
    const msme = await MSME.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!msme) {
      return res.status(404).json({ error: "MSME not found" });
    }
    
    res.json({ success: true, msme: { ...msme.toObject(), password: undefined } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Admin Routes ---
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  
  try {
    // First check hardcoded admin credentials (for backward compatibility)
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      res.json({ 
        success: true, 
        user: { 
          id: "admin", 
          username: ADMIN_USERNAME, 
          firstname: "Super",
          lastname: "Admin",
          userType: "admin"
        },
        userType: 'admin'
      });
      return;
    }

    // Check database for created admins
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid admin credentials" });
    }

    // Check if admin is active
    if (admin.status !== "active") {
      return res.status(401).json({ success: false, error: "Admin account is not active" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid admin credentials" });
    }

    // Login successful
    res.json({ 
      success: true, 
      user: { 
        id: admin._id, 
        username: admin.username, 
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email,
        userType: "admin"
      },
      userType: 'admin'
    });
    
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, error: "Error during admin login" });
  }
});

// Get all users (admin only)
app.get("/api/admin/users", async (req, res) => {
  try {
    const customers = await Customer.find({}, { password: 0 });
    const msmes = await MSME.find({}, { password: 0 });
    
    res.json({
      customers,
      msmes,
      total: customers.length + msmes.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer (admin only)
app.delete("/api/admin/customers/:id", async (req, res) => {
  try {
    const result = await Customer.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single product by productId
app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('msmeId', 'businessName username');
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, error: "Error fetching product" });
  }
});

// Add feedback and rating to product
app.post("/api/products/:productId/feedback", async (req, res) => {
  try {
    const { rating, comment, user, userId } = req.body;
    if (!rating || !comment || !user) {
      return res.status(400).json({ success: false, error: "Rating, comment, and user are required" });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
    }
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    // Add feedback to product
    if (!Array.isArray(product.feedback)) product.feedback = [];
    product.feedback.push({ 
      user, 
      userId: userId || null,
      comment, 
      rating,
      createdAt: new Date()
    });
    
    // Update average rating
    const ratings = product.feedback.map(fb => fb.rating);
    product.rating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
    
    await product.save();
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ success: false, error: "Error submitting feedback" });
  }
});

// Update customer (admin only)
app.put("/api/admin/customers/:id/update", async (req, res) => {
  try {
    const { username, firstname, lastname, email, address, contactNumber } = req.body;
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      {
        username,
        firstname,
        lastname,
        email,
        address,
        contactNumber,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Customer updated successfully",
      customer: updatedCustomer 
    });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete MSME (admin only)
app.delete("/api/admin/msme/:id", async (req, res) => {
  try {
    const result = await MSME.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ error: "MSME not found" });
    }
    res.json({ success: true, message: "MSME deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update MSME (admin only)
app.put("/api/admin/msme/:id/update", async (req, res) => {
  try {
    const { 
      username, 
      businessName, 
      category, 
      address, 
      contactNumber, 
      clientProfilingNumber 
    } = req.body;
    
    const updatedMSME = await MSME.findOneAndUpdate(
      { id: req.params.id },
      {
        username,
        businessName,
        category,
        address,
        contactNumber,
        clientProfilingNumber,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );
    
    if (!updatedMSME) {
      return res.status(404).json({ success: false, error: "MSME not found" });
    }
    
    res.json({ 
      success: true, 
      message: "MSME updated successfully",
      msme: updatedMSME 
    });
  } catch (err) {
    console.error("Error updating MSME:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- Admin Management Routes ---
// Create new admin
app.post("/api/admin/create", async (req, res) => {
  try {
    const { username, password, firstname, lastname, email, createdBy } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        error: "Admin with this username or email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      email,
      createdBy
    });

    await newAdmin.save();

    // Return admin without password
    const adminResponse = {
      id: newAdmin._id,
      username: newAdmin.username,
      firstname: newAdmin.firstname,
      lastname: newAdmin.lastname,
      email: newAdmin.email,
      role: newAdmin.role,
      status: newAdmin.status,
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt
    };

    res.status(201).json({ 
      success: true, 
      message: "Admin created successfully",
      admin: adminResponse
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error creating admin" 
    });
  }
});

// Create new MSME (Admin only)
app.post("/api/admin/msme/create", async (req, res) => {
  try {
    const { 
      username, 
      password, 
      businessName, 
      category, 
      address, 
      contactNumber, 
      clientProfilingNumber 
    } = req.body;

    // Validate required fields
    if (!username || !password || !businessName || !category) {
      return res.status(400).json({ 
        success: false, 
        error: "Username, password, business name, and category are required" 
      });
    }

    // Validate category (only food and artisan allowed)
    if (!['food', 'artisan'].includes(category)) {
      return res.status(400).json({ 
        success: false, 
        error: "Category must be either 'food' or 'artisan'" 
      });
    }

    // Check if MSME already exists
    const existingMSME = await MSME.findOne({ username });
    
    if (existingMSME) {
      return res.status(400).json({ 
        success: false, 
        error: "MSME with this username already exists" 
      });
    }

    // Check if clientProfilingNumber already exists (if provided)
    if (clientProfilingNumber) {
      const existingCPN = await MSME.findOne({ clientProfilingNumber });
      if (existingCPN) {
        return res.status(400).json({ 
          success: false, 
          error: "Client Profiling Number already exists" 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const generateId = () => {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    // Create new MSME
    const newMSME = new MSME({
      id: generateId(),
      username,
      password: hashedPassword,
      businessName,
      category,
      address: address || '',
      contactNumber: contactNumber || '',
      clientProfilingNumber: clientProfilingNumber || '',
      status: 'approved' // Auto-approve MSMEs created by admin
    });

    await newMSME.save();

    // Return MSME without password
    const msmeResponse = {
      id: newMSME.id,
      _id: newMSME._id,
      username: newMSME.username,
      businessName: newMSME.businessName,
      category: newMSME.category,
      address: newMSME.address,
      contactNumber: newMSME.contactNumber,
      clientProfilingNumber: newMSME.clientProfilingNumber,
      status: newMSME.status,
      createdAt: newMSME.createdAt,
      updatedAt: newMSME.updatedAt
    };

    res.status(201).json({ 
      success: true, 
      message: "MSME created successfully",
      msme: msmeResponse
    });
  } catch (err) {
    console.error("Error creating MSME:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error creating MSME" 
    });
  }
});

// Get all admins
app.get("/api/admin/admins", async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.json({
      success: true,
      admins
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error fetching admins" 
    });
  }
});

// Update admin status
app.put("/api/admin/admins/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.params.id;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { status },
      { new: true, select: '-password' }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ 
        success: false, 
        error: "Admin not found" 
      });
    }

    res.json({
      success: true,
      message: "Admin status updated successfully",
      admin: updatedAdmin
    });
  } catch (err) {
    console.error("Error updating admin status:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error updating admin status" 
    });
  }
});

// Update admin details
app.put("/api/admin/admins/:id", async (req, res) => {
  try {
    const { username, firstname, lastname, email } = req.body;
    const adminId = req.params.id;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        username,
        firstname,
        lastname,
        email,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ 
        success: false, 
        error: "Admin not found" 
      });
    }

    res.json({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin
    });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error updating admin" 
    });
  }
});

// Delete admin
app.delete("/api/admin/admins/:id", async (req, res) => {
  try {
    const adminId = req.params.id;
    
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return res.status(404).json({ 
        success: false, 
        error: "Admin not found" 
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error deleting admin" 
    });
  }
});

// --- Product Routes ---
// Create new product
app.post("/api/products", upload.single('picture'), async (req, res) => {
  try {
    const { 
      productName, 
      price, 
      description, 
      availability, 
      stocks, 
      category,
      hashtags,
      msmeId 
    } = req.body;

    // Validate required fields
    if (!productName || !price || !description || !stocks || !msmeId) {
      return res.status(400).json({ 
        success: false, 
        error: "Product name, price, description, stocks, and MSME ID are required" 
      });
    }

    // Parse hashtags if it's a string
    let parsedHashtags = [];
    if (hashtags) {
      try {
        parsedHashtags = typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags;
      } catch (e) {
        parsedHashtags = [];
      }
    }

    // Handle file upload
    let picturePath = null;
    if (req.file) {
      picturePath = req.file.filename;
    }

    // Create new product
    const newProduct = new Product({
      productName,
      price: parseFloat(price),
      description,
      availability: availability === 'true' || availability === true,
      visible: true, // New products are visible by default
      stocks: parseInt(stocks),
      picture: picturePath,
      hashtags: parsedHashtags,
      category: category || '',
      msmeId
    });

    await newProduct.save();

    // Notify followers of the store about the new product
    try {
      await CustomerNotificationService.notifyFollowersOfNewProduct(msmeId, newProduct._id);
    } catch (notificationError) {
      console.error("Error sending customer notifications:", notificationError);
      // Continue with product creation even if notifications fail
    }

    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      product: newProduct
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error creating product" 
    });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { msmeId, category, availability } = req.query;
    
    let filter = {};
    if (msmeId) filter.msmeId = msmeId;
    if (category) filter.category = category;
    if (availability) filter.availability = availability === 'true';

    const products = await Product.find(filter).populate('msmeId', 'businessName username');
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error fetching products" 
    });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('msmeId', 'businessName username');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error fetching product" 
    });
  }
});

// Update product
app.put("/api/products/:id", upload.single('picture'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      productName, 
      price, 
      description, 
      availability,
      visible,
      stocks, 
      category,
      hashtags 
    } = req.body;

    // Find existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }

    // Parse hashtags if it's a string
    let parsedHashtags = existingProduct.hashtags;
    if (hashtags) {
      try {
        parsedHashtags = typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags;
      } catch (e) {
        // Keep existing hashtags if parsing fails
      }
    }

    // Handle file upload
    let picturePath = existingProduct.picture;
    if (req.file) {
      picturePath = req.file.filename;
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productName: productName || existingProduct.productName,
        price: price ? parseFloat(price) : existingProduct.price,
        description: description || existingProduct.description,
        availability: availability !== undefined ? (availability === 'true' || availability === true) : existingProduct.availability,
        visible: visible !== undefined ? (visible === 'true' || visible === true) : existingProduct.visible,
        stocks: stocks ? parseInt(stocks) : existingProduct.stocks,
        picture: picturePath,
        hashtags: parsedHashtags,
        category: category !== undefined ? category : existingProduct.category,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error updating product" 
    });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error deleting product" 
    });
  }
});

// Toggle product visibility
app.put("/api/products/:id/visibility", async (req, res) => {
  try {
    const productId = req.params.id;
    const { visible } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }

    // Update visibility
    product.visible = visible !== undefined ? visible : !product.visible;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.visible ? 'shown' : 'hidden'} successfully`,
      product: product
    });
  } catch (err) {
    console.error("Error toggling product visibility:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error updating product visibility" 
    });
  }
});

// Toggle MSME visibility (controls homepage display and login access)
app.put("/api/admin/msme/:id/visibility", async (req, res) => {
  try {
    const msmeId = req.params.id;
    const { isVisible } = req.body;
    
    // Try to find by MongoDB _id first, then by custom id field
    let msme = await MSME.findById(msmeId);
    if (!msme) {
      msme = await MSME.findOne({ id: msmeId });
    }
    
    if (!msme) {
      return res.status(404).json({ 
        success: false, 
        error: "MSME not found" 
      });
    }

    // Update visibility
    msme.isVisible = isVisible !== undefined ? isVisible : !msme.isVisible;
    msme.updatedAt = new Date();
    await msme.save();

    res.json({
      success: true,
      message: `MSME ${msme.isVisible ? 'shown' : 'hidden'} successfully. ${msme.isVisible ? 'They can now log in and appear on homepage.' : 'They cannot log in or appear on homepage.'}`,
      msme: {
        id: msme.id,
        _id: msme._id,
        businessName: msme.businessName,
        username: msme.username,
        isVisible: msme.isVisible,
        status: msme.status
      }
    });
  } catch (err) {
    console.error("Error toggling MSME visibility:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error updating MSME visibility" 
    });
  }
});

// Get products by MSME ID
app.get("/api/msme/:msmeId/products", async (req, res) => {
  try {
    const { msmeId } = req.params;
    const { category, availability } = req.query;
    
    let filter = { msmeId };
    if (category && category !== 'all') filter.category = category;
    if (availability && availability !== 'all') filter.availability = availability === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Error fetching MSME products:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error fetching MSME products" 
    });
  }
});

// Search products by hashtag
app.get("/api/products/search/hashtag/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    
    const products = await Product.findByHashtag(hashtag).populate('msmeId', 'businessName username');
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Error searching products by hashtag:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error searching products" 
    });
  }
});

// Get available products only
app.get("/api/products/available", async (req, res) => {
  try {
    const products = await Product.findAvailable().populate('msmeId', 'businessName username');
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Error fetching available products:", err);
    res.status(500).json({ 
      success: false, 
      error: "Error fetching available products" 
    });
  }
});

// --- Dashboard Routes ---

// Get individual store details (for customer store view)
app.get("/api/stores/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Find the MSME store
    const store = await MSME.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }
    
    // Only show visible stores to customers
    if (store.isVisible === false || store.status !== 'approved') {
      return res.status(404).json({ 
        success: false, 
        error: 'Store not available' 
      });
    }
    
    // Find the dashboard information
    let dashboard = await Dashboard.findByMsmeId(storeId);
    
    // If no dashboard exists, create a minimal one with store data
    if (!dashboard) {
      dashboard = {
        businessName: store.businessName,
        description: '',
        coverPhoto: null,
        storeLogo: null,
        contactNumber: store.contactNumber || '',
        location: store.address || '',
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          website: ''
        },
        rating: 0
      };
    }
    
    // Combine store and dashboard data, prioritizing dashboard info but keeping MSME ratings
    const storeWithDashboard = {
      ...store.toObject(),
      // Use dashboard information for business details
      businessName: dashboard.businessName || store.businessName,
      username: store.username, // Always from MSME model
      // Keep MSME rating data
      averageRating: store.averageRating || 0,
      totalRatings: store.totalRatings || 0,
      ratings: store.ratings || [],
      dashboard: {
        description: dashboard.description || '',
        coverPhoto: dashboard.coverPhoto,
        storeLogo: dashboard.storeLogo,
        contactNumber: dashboard.contactNumber || store.contactNumber || '',
        location: dashboard.location || store.address || '',
        socialLinks: dashboard.socialLinks || {
          facebook: '',
          instagram: '',
          twitter: '',
          website: ''
        },
        // Use MSME rating for display, not dashboard rating
        rating: store.averageRating || 0,
        totalRatings: store.totalRatings || 0
      }
    };
    
    res.json({ 
      success: true, 
      store: storeWithDashboard 
    });
  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Record page view for store
app.post("/api/stores/:storeId/view", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required"
      });
    }
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Validate store exists
    const store = await MSME.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found"
      });
    }
    
    // Get IP address and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Record the page view (will automatically handle one-per-day logic)
    const result = await PageView.recordView(storeId, customerId, ipAddress, userAgent);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error recording page view:", error);
    res.status(500).json({
      success: false,
      error: "Error recording page view"
    });
  }
});

// Get page view statistics for a store (for MSME dashboard)
app.get("/api/stores/:storeId/analytics", async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Validate store exists
    const store = await MSME.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found"
      });
    }
    
    // Get page view statistics
    const stats = await PageView.getStoreStats(storeId);
    
    // Get follower count
    const followerCount = await Customer.countDocuments({
      following: storeId
    });
    
    // Calculate weekly rating analysis
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    
    // Get ratings for the last 4 weeks
    const thisWeekRatings = store.ratings.filter(r => r.createdAt >= oneWeekAgo);
    const lastWeekRatings = store.ratings.filter(r => r.createdAt >= twoWeeksAgo && r.createdAt < oneWeekAgo);
    const twoWeeksAgoRatings = store.ratings.filter(r => r.createdAt >= threeWeeksAgo && r.createdAt < twoWeeksAgo);
    const threeWeeksAgoRatings = store.ratings.filter(r => r.createdAt >= fourWeeksAgo && r.createdAt < threeWeeksAgo);
    
    // Calculate average ratings for each week
    const calculateWeeklyAverage = (ratings) => {
      if (ratings.length === 0) return 0;
      return Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10;
    };
    
    const ratingAnalysis = {
      currentAverage: store.averageRating || 0,
      totalRatings: store.totalRatings || 0,
      weeklyBreakdown: [
        {
          week: 'This Week',
          average: calculateWeeklyAverage(thisWeekRatings),
          count: thisWeekRatings.length,
          period: 'current'
        },
        {
          week: 'Last Week',
          average: calculateWeeklyAverage(lastWeekRatings),
          count: lastWeekRatings.length,
          period: 'last'
        },
        {
          week: '2 Weeks Ago',
          average: calculateWeeklyAverage(twoWeeksAgoRatings),
          count: twoWeeksAgoRatings.length,
          period: 'two'
        },
        {
          week: '3 Weeks Ago',
          average: calculateWeeklyAverage(threeWeeksAgoRatings),
          count: threeWeeksAgoRatings.length,
          period: 'three'
        }
      ],
      trend: thisWeekRatings.length > 0 && lastWeekRatings.length > 0 
        ? (calculateWeeklyAverage(thisWeekRatings) - calculateWeeklyAverage(lastWeekRatings)).toFixed(1)
        : 0
    };
    
    res.json({
      success: true,
      analytics: {
        pageViews: stats,
        followers: followerCount,
        ratings: ratingAnalysis
      }
    });
  } catch (error) {
    console.error("Error fetching store analytics:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching analytics"
    });
  }
});

// Get all stores with dashboard information for customer view
app.get("/api/stores", async (req, res) => {
  try {
    // Fetch all visible and approved MSMEs
    const msmes = await MSME.find({ 
      status: 'approved', 
      isVisible: true 
    }).sort({ createdAt: -1 });

    // Fetch dashboard information for each MSME
    const storesWithDashboards = await Promise.all(
      msmes.map(async (msme) => {
        try {
          let dashboard = await Dashboard.findByMsmeId(msme._id);
          
          // If no dashboard exists, create and save a new one
          if (!dashboard) {
            console.log(`Creating new dashboard for MSME: ${msme.businessName}`);
            dashboard = new Dashboard({
              msmeId: msme._id,
              businessName: msme.businessName,
              description: '',
              coverPhoto: null,
              storeLogo: null,
              contactNumber: msme.contactNumber || '',
              location: msme.address || '',
              socialLinks: {
                facebook: '',
                instagram: '',
                twitter: '',
                website: ''
              },
              rating: 0,
              isPublic: true
            });
            
            try {
              await dashboard.save();
              console.log(`✅ Dashboard created for ${msme.businessName}`);
            } catch (saveError) {
              console.error(`❌ Error saving dashboard for ${msme.businessName}:`, saveError);
              // Continue with the unsaved dashboard object
            }
          } else {
            console.log(`✅ Dashboard found for ${msme.businessName}:`, {
              storeLogo: dashboard.storeLogo,
              coverPhoto: dashboard.coverPhoto,
              description: dashboard.description,
              location: dashboard.location
            });
          }

          // Get product count for this store
          const productCount = await Product.countDocuments({ msmeId: msme._id });
          
          // Get follower count for this store
          const followerCount = await Customer.countDocuments({ following: msme._id });

          return {
            _id: msme._id,
            msmeId: msme._id,
            businessName: dashboard.businessName || msme.businessName,
            category: msme.category,
            username: msme.username,
            status: msme.status,
            createdAt: msme.createdAt,
            address: msme.address, // Include MSME address as fallback
            // Include MSME rating data
            averageRating: msme.averageRating || 0,
            totalRatings: msme.totalRatings || 0,
            ratings: msme.ratings || [],
            // Include store statistics
            productCount: productCount,
            followerCount: followerCount,
            dashboard: {
              businessName: dashboard.businessName || msme.businessName,
              description: dashboard.description || '',
              coverPhoto: dashboard.coverPhoto,
              storeLogo: dashboard.storeLogo,
              contactNumber: dashboard.contactNumber || msme.contactNumber || '',
              location: dashboard.location || msme.address || '',
              socialLinks: dashboard.socialLinks || {
                facebook: '',
                instagram: '',
                twitter: '',
                website: ''
              },
              // Override dashboard rating with MSME rating
              rating: msme.averageRating || 0,
              totalRatings: msme.totalRatings || 0,
              isPublic: dashboard.isPublic !== false, // Default to true
              createdAt: dashboard.createdAt,
              updatedAt: dashboard.updatedAt
            }
          };
        } catch (error) {
          console.error(`Error fetching dashboard for ${msme.businessName}:`, error);
          
          // Get product count and follower count even in error case
          const productCount = await Product.countDocuments({ msmeId: msme._id }).catch(() => 0);
          const followerCount = await Customer.countDocuments({ following: msme._id }).catch(() => 0);
          
          return {
            _id: msme._id,
            msmeId: msme._id,
            businessName: msme.businessName,
            category: msme.category,
            username: msme.username,
            status: msme.status,
            createdAt: msme.createdAt,
            // Include MSME rating data even in error case
            averageRating: msme.averageRating || 0,
            totalRatings: msme.totalRatings || 0,
            ratings: msme.ratings || [],
            // Include store statistics
            productCount: productCount,
            followerCount: followerCount,
            dashboard: {
              businessName: msme.businessName,
              description: '',
              coverPhoto: null,
              storeLogo: null,
              contactNumber: msme.contactNumber || '',
              location: msme.address || '',
              socialLinks: {
                facebook: '',
                instagram: '',
                twitter: '',
                website: ''
              },
              rating: msme.averageRating || 0,
              totalRatings: msme.totalRatings || 0,
              isPublic: true
            }
          };
        }
      })
    );

    res.json({
      success: true,
      stores: storesWithDashboards
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stores"
    });
  }
});

// Follow/Unfollow store endpoint
app.post("/api/stores/:storeId/follow", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { customerId, action } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required"
      });
    }
    
    console.log('Follow/unfollow request - Store:', storeId, 'Customer:', customerId, 'Action:', action);
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log('Customer not found:', customerId);
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Validate store exists
    const store = await MSME.findById(storeId);
    if (!store) {
      console.log('Store not found:', storeId);
      return res.status(404).json({
        success: false,
        error: "Store not found"
      });
    }
    
    console.log('Before update - Customer following:', customer.following);
    const isFollowing = customer.following.includes(storeId);
    
    if (action === 'follow') {
      if (!isFollowing) {
        customer.following.push(storeId);
        await customer.save();
        console.log('Added to following, new array:', customer.following);
        
        // Create notification for store owner
        await createNotification(storeId, customerId, 'store_follow');
      }
      
      res.json({
        success: true,
        message: `Now following ${store.businessName}!`,
        following: true
      });
    } else if (action === 'unfollow') {
      if (isFollowing) {
        customer.following = customer.following.filter(
          id => id.toString() !== storeId
        );
        await customer.save();
        console.log('Removed from following, new array:', customer.following);
      }
      
      res.json({
        success: true,
        message: `Unfollowed ${store.businessName}`,
        following: false
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid action. Use 'follow' or 'unfollow'"
      });
    }
  } catch (error) {
    console.error("Error following/unfollowing store:", error);
    res.status(500).json({
      success: false,
      error: "Error processing follow request"
    });
  }
});

// Check if customer is following a store
app.get("/api/stores/:storeId/follow-status/:customerId", async (req, res) => {
  try {
    const { storeId, customerId } = req.params;
    
    console.log('Checking follow status for store:', storeId, 'customer:', customerId);
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log('Customer not found:', customerId);
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    console.log('Customer following array:', customer.following);
    const isFollowing = customer.following.includes(storeId);
    console.log('Is following result:', isFollowing);
    
    res.json({
      success: true,
      following: isFollowing
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({
      success: false,
      error: "Error checking follow status"
    });
  }
});

// Get customer's followed stores
app.get("/api/customers/:customerId/following", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId).populate({
      path: 'following',
      match: { status: 'approved', isVisible: true },
      select: 'businessName username category address createdAt averageRating totalRatings'
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Filter out any null following (in case of deleted stores)
    const validFollowing = customer.following.filter(store => store != null);
    
    // Add product count, follower count, and dashboard info for each store
    const followingWithStats = await Promise.all(
      validFollowing.map(async (store) => {
        const productCount = await Product.countDocuments({ msmeId: store._id });
        const followerCount = await Customer.countDocuments({ following: store._id });
        
        // Get dashboard information for better location data
        let dashboard = await Dashboard.findByMsmeId(store._id);
        if (!dashboard) {
          dashboard = {
            location: store.address || '',
            description: ''
          };
        }
        
        return {
          ...store.toObject(),
          productCount,
          followerCount,
          dashboard: {
            location: dashboard.location || store.address || 'Location not specified',
            description: dashboard.description || 'A great store with quality products'
          }
        };
      })
    );
    
    res.json({
      success: true,
      following: followingWithStats
    });
  } catch (error) {
    console.error("Error fetching followed stores:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching followed stores"
    });
  }
});

// Store rating endpoint
app.post("/api/stores/:storeId/rating", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating, user, userId } = req.body;
    
    console.log('Store rating request:', { storeId, rating, user, userId });
    
    // Validation
    if (!rating || !user || !userId) {
      return res.status(400).json({
        success: false,
        error: "Rating, user, and userId are required"
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }
    
    // Find the store
    const store = await MSME.findById(storeId);
    if (!store) {
      console.log('Store not found:', storeId);
      return res.status(404).json({
        success: false,
        error: "Store not found"
      });
    }
    
    console.log('Found store:', store.businessName);
    
    // Initialize ratings array if it doesn't exist
    if (!store.ratings) {
      store.ratings = [];
    }
    
    // Check if user already rated this store
    const existingRatingIndex = store.ratings.findIndex(r => r.userId === userId);
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      store.ratings[existingRatingIndex].rating = rating;
      store.ratings[existingRatingIndex].userName = user; // Make sure userName is set when updating
      store.ratings[existingRatingIndex].createdAt = new Date();
      console.log('Updated existing rating');
    } else {
      // Add new rating
      console.log('Adding new rating with user:', user, 'userId:', userId);
      const newRating = {
        userId,
        userName: user,
        rating,
        createdAt: new Date()
      };
      console.log('New rating object:', newRating);
      store.ratings.push(newRating);
      console.log('Added new rating');
    }
    
    // Recalculate average rating
    store.calculateAverageRating();
    await store.save();
    
    console.log('Rating saved successfully. Average:', store.averageRating);
    
    res.json({
      success: true,
      message: "Rating submitted successfully!",
      averageRating: store.averageRating,
      totalRatings: store.totalRatings
    });
  } catch (error) {
    console.error("Error submitting store rating:", error);
    res.status(500).json({
      success: false,
      error: "Error submitting rating"
    });
  }
});

// Get top rated products from a store
app.get("/api/msme/:storeId/products/top-rated", async (req, res) => {
  try {
    const { storeId } = req.params;
    
    console.log('Fetching top-rated products for store:', storeId);
    
    // Find all visible products from this store
    const products = await Product.find({ 
      msmeId: storeId,
      visible: true
    });
    
    console.log('Found products:', products.length);
    
    // Calculate rating for products that have feedback but no rating field
    const productsWithRatings = products.map(product => {
      let calculatedRating = product.rating;
      
      // If no rating but has feedback, calculate from feedback
      if (!calculatedRating && product.feedback && product.feedback.length > 0) {
        const sum = product.feedback.reduce((acc, fb) => acc + fb.rating, 0);
        calculatedRating = sum / product.feedback.length;
      }
      
      return {
        ...product.toObject(),
        rating: calculatedRating || 0,
        feedbackCount: product.feedback ? product.feedback.length : 0
      };
    });
    
    // Filter products with ratings > 0 and sort by rating
    const topRatedProducts = productsWithRatings
      .filter(product => product.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3); // Get top 3
    
    console.log('Top rated products:', topRatedProducts.length);
    
    res.json({
      success: true,
      products: topRatedProducts
    });
  } catch (error) {
    console.error("Error fetching top rated products:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching top rated products"
    });
  }
});

// Get product feedbacks from a store
app.get("/api/msme/:storeId/products/feedbacks", async (req, res) => {
  try {
    const { storeId } = req.params;
    
    console.log('Fetching product feedbacks for store:', storeId);
    
    // Find all visible products from this store that have feedback
    const products = await Product.find({ 
      msmeId: storeId,
      visible: true,
      feedback: { $exists: true, $not: { $size: 0 } }
    });
    
    console.log('Found products with feedback:', products.length);
    
    // Extract all feedbacks with product information
    const allFeedbacks = [];
    
    products.forEach(product => {
      if (product.feedback && product.feedback.length > 0) {
        product.feedback.forEach(feedback => {
          console.log('Processing feedback:', {
            userName: feedback.user, // Changed from userName to user
            feedback: feedback.comment, // Changed from feedback to comment
            rating: feedback.rating,
            productName: product.productName
          });
          allFeedbacks.push({
            ...feedback.toObject(),
            // Map the correct field names
            userName: feedback.user, // Map user to userName for frontend
            feedback: feedback.comment, // Map comment to feedback for frontend
            productId: product._id,
            productName: product.productName,
            productImage: product.picture,
            productPrice: product.price
          });
        });
      }
    });
    
    // Sort feedbacks by date (newest first) and limit to recent ones
    const sortedFeedbacks = allFeedbacks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10); // Get latest 10 feedbacks
    
    console.log('Total feedbacks found:', sortedFeedbacks.length);
    
    res.json({
      success: true,
      feedbacks: sortedFeedbacks
    });
  } catch (error) {
    console.error("Error fetching product feedbacks:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching product feedbacks"
    });
  }
});

// Get dashboard by MSME ID
app.get("/api/msme/:msmeId/dashboard", async (req, res) => {
  try {
    const { msmeId } = req.params;
    
    let dashboard = await Dashboard.findByMsmeId(msmeId);
    
    // If no dashboard exists, create a default one
    if (!dashboard) {
      const msme = await MSME.findById(msmeId);
      if (!msme) {
        return res.status(404).json({
          success: false,
          error: "MSME not found"
        });
      }
      
      dashboard = new Dashboard({
        msmeId,
        businessName: msme.businessName || msme.username,
        description: `Welcome to ${msme.businessName || msme.username}!`,
        rating: 4.0
      });
      await dashboard.save();
    }
    
    res.json({
      success: true,
      dashboard
    });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).json({
      success: false,
      error: "Error fetching dashboard"
    });
  }
});

// Create or update dashboard
app.post("/api/msme/dashboard", upload.fields([
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'storeLogo', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      msmeId,
      businessName,
      description,
      contactNumber,
      location,
      socialLinks,
      isPublic
    } = req.body;
    
    if (!msmeId) {
      return res.status(400).json({
        success: false,
        error: "MSME ID is required"
      });
    }
    
    // Parse socialLinks if it's a string
    let parsedSocialLinks = {};
    if (socialLinks) {
      try {
        parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (error) {
        console.error("Error parsing socialLinks:", error);
        parsedSocialLinks = {};
      }
    }
    
    // Prepare update data
    const updateData = {
      businessName,
      description,
      contactNumber,
      location,
      socialLinks: parsedSocialLinks,
      isPublic: isPublic === 'true' || isPublic === true
    };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.coverPhoto) {
        updateData.coverPhoto = req.files.coverPhoto[0].filename;
      }
      if (req.files.storeLogo) {
        updateData.storeLogo = req.files.storeLogo[0].filename;
      }
    }
    
    // Update or create dashboard
    let dashboard = await Dashboard.findOne({ msmeId });
    
    if (dashboard) {
      // Update existing dashboard
      Object.assign(dashboard, updateData);
      await dashboard.save();
    } else {
      // Create new dashboard
      dashboard = new Dashboard({
        msmeId,
        ...updateData,
        rating: 4.0 // Default rating
      });
      await dashboard.save();
    }
    
    res.json({
      success: true,
      message: "Dashboard updated successfully",
      dashboard
    });
  } catch (err) {
    console.error("Error updating dashboard:", err);
    res.status(500).json({
      success: false,
      error: "Error updating dashboard"
    });
  }
});

// Get all public dashboards
app.get("/api/dashboards/public", async (req, res) => {
  try {
    const dashboards = await Dashboard.findPublic();
    
    res.json({
      success: true,
      dashboards
    });
  } catch (err) {
    console.error("Error fetching public dashboards:", err);
    res.status(500).json({
      success: false,
      error: "Error fetching public dashboards"
    });
  }
});

// Get specific public dashboard by MSME ID
app.get("/api/dashboard/public/:msmeId", async (req, res) => {
  try {
    const { msmeId } = req.params;
    
    const dashboard = await Dashboard.findOne({ 
      msmeId, 
      isPublic: true 
    }).populate('msmeId', 'businessName username');
    
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: "Public dashboard not found"
      });
    }
    
    // Also get the products for this MSME
    const products = await Product.find({ 
      msmeId, 
      visible: true,
      availability: true 
    });
    
    res.json({
      success: true,
      dashboard,
      products
    });
  } catch (err) {
    console.error("Error fetching public dashboard:", err);
    res.status(500).json({
      success: false,
      error: "Error fetching public dashboard"
    });
  }
});

// Get customer's reviews/feedback
app.get("/api/customers/:customerId/reviews", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Try to find customer by MongoDB _id first, then by custom id field
    let customer = await Customer.findById(customerId);
    if (!customer) {
      customer = await Customer.findOne({ id: customerId });
    }
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    console.log(`Looking for reviews for customer: ${customer.firstname} ${customer.lastname} (MongoDB ID: ${customer._id}, Custom ID: ${customer.id})`);
    
    // Find all products that have feedback from this customer
    const customerName = `${customer.firstname} ${customer.lastname}`.trim();
    
    // Search by both MongoDB _id and custom id
    const products = await Product.find({
      $or: [
        { 'feedback.userId': customer._id.toString() },
        { 'feedback.userId': customer.id },
        { 'feedback.user': customerName }
      ]
    }).populate('msmeId', 'businessName username');
    
    console.log(`Found ${products.length} products with feedback for customer ${customerName}`);
    
    // Extract reviews made by this customer
    const customerReviews = [];
    
    products.forEach(product => {
      const customerFeedback = product.feedback.filter(
        fb => fb.userId === customer._id.toString() || 
              fb.userId === customer.id || 
              fb.user === customerName
      );
      
      console.log(`Product ${product.productName}: found ${customerFeedback.length} reviews`);
      
      customerFeedback.forEach(feedback => {
        customerReviews.push({
          _id: feedback._id,
          productId: product._id,
          productName: product.productName,
          productImage: product.picture,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
          store: product.msmeId
        });
      });
    });
    
    console.log(`Total customer reviews found: ${customerReviews.length}`);
    
    // Sort by most recent first
    customerReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      reviews: customerReviews
    });
  } catch (error) {
    console.error("Error fetching customer reviews:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching reviews"
    });
  }
});

// Edit customer review
app.put("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, customerId } = req.body;
    
    // Validate input
    if (!rating || !comment || !customerId) {
      return res.status(400).json({
        success: false,
        error: "Rating, comment, and customer ID are required"
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }
    
    // Find the product that contains this review
    const product = await Product.findOne({
      'feedback._id': reviewId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }
    
    // Find the specific review
    const review = product.feedback.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }
    
    // Verify that the customer owns this review
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    const customerName = `${customer.firstname} ${customer.lastname}`.trim();
    const isOwner = review.userId === customer._id.toString() || 
                   review.userId === customer.id || 
                   review.user === customerName;
    
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: "You can only edit your own reviews"
      });
    }
    
    // Update the review
    review.rating = rating;
    review.comment = comment;
    review.updatedAt = new Date();
    
    // Save the product with updated review
    await product.save();
    
    // Recalculate product rating
    const ratings = product.feedback.map(fb => fb.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    product.rating = averageRating;
    await product.save();
    
    console.log(`Review ${reviewId} updated by customer ${customerName}`);
    
    res.json({
      success: true,
      message: "Review updated successfully",
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        updatedAt: review.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      error: "Error updating review"
    });
  }
});

// Delete customer review
app.delete("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { customerId } = req.body;
    
    // Validate customer ID
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required"
      });
    }
    
    // Find the product that contains this review
    const product = await Product.findOne({
      'feedback._id': reviewId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }
    
    // Find the specific review
    const review = product.feedback.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }
    
    // Verify that the customer owns this review
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    const customerName = `${customer.firstname} ${customer.lastname}`.trim();
    const isOwner = review.userId === customer._id.toString() || 
                   review.userId === customer.id || 
                   review.user === customerName;
    
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews"
      });
    }
    
    // Remove the review
    product.feedback.pull({ _id: reviewId });
    
    // Recalculate product rating
    const ratings = product.feedback.map(fb => fb.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    product.rating = averageRating;
    
    // Save the product
    await product.save();
    
    console.log(`Review ${reviewId} deleted by customer ${customerName}`);
    
    res.json({
      success: true,
      message: "Review deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting review"
    });
  }
});

// --- Customer Favorites Routes ---
// Toggle product favorite (add/remove)
app.post("/api/customers/:customerId/favorites/:productId", async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    // Check if product is already in favorites
    const isFavorite = customer.favorites.includes(productId);
    
    if (isFavorite) {
      // Remove from favorites
      customer.favorites = customer.favorites.filter(
        (id) => id.toString() !== productId
      );
      await customer.save();
      
      res.json({
        success: true,
        message: `${product.productName} removed from favorites`,
        action: "removed",
        isFavorite: false
      });
    } else {
      // Add to favorites
      customer.favorites.push(productId);
      await customer.save();
      
      // Create notification for store owner
      await createNotification(product.msmeId, customerId, 'product_favorite', productId);
      
      res.json({
        success: true,
        message: `${product.productName} added to favorites`,
        action: "added",
        isFavorite: true
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      error: "Error updating favorites"
    });
  }
});

// Get customer's favorite products
app.get("/api/customers/:customerId/favorites", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId).populate({
      path: 'favorites',
      populate: {
        path: 'msmeId',
        select: 'businessName username'
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Filter out any null favorites (in case of deleted products)
    const validFavorites = customer.favorites.filter(fav => fav != null);
    
    res.json({
      success: true,
      favorites: validFavorites
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching favorites"
    });
  }
});

// Check if product is favorited by customer
app.get("/api/customers/:customerId/favorites/:productId/check", async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    const isFavorite = customer.favorites.includes(productId);
    
    res.json({
      success: true,
      isFavorite
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({
      success: false,
      error: "Error checking favorite status"
    });
  }
});

// --- Notification Routes ---

// Get notifications for a store
app.get("/api/notifications/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await Notification.find({ storeId })
      .populate('customerId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const unreadCount = await Notification.countDocuments({ 
      storeId, 
      isRead: false 
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching notifications"
    });
  }
});

// Mark notification as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: "Error marking notification as read"
    });
  }
});

// Mark all notifications as read for a store
app.put("/api/notifications/:storeId/read-all", async (req, res) => {
  try {
    const { storeId } = req.params;

    await Notification.updateMany(
      { storeId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: "Error marking all notifications as read"
    });
  }
});

// Create notification (internal helper function)
async function createNotification(storeId, customerId, type, productId = null) {
  try {
    console.log('Creating notification:', { storeId, customerId, type, productId });
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log('Customer not found for notification:', customerId);
      return;
    }

    // Create customer display name
    const customerName = customer.firstname && customer.lastname 
      ? `${customer.firstname} ${customer.lastname}`
      : customer.username || 'A customer';

    let message;
    if (type === 'store_follow') {
      message = `${customerName} started following your store`;
    } else if (type === 'product_favorite') {
      const product = await Product.findById(productId);
      const productName = product?.productName || product?.name || 'Unknown Product';
      message = `${customerName} favorited your product "${productName}"`;
    }

    const notification = new Notification({
      storeId,
      customerId,
      type,
      productId,
      message
    });

    await notification.save();
    console.log(`✅ Notification created successfully: ${message}`);
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
}

// Debug endpoint to check dashboard data
app.get("/api/debug/dashboards", async (req, res) => {
  try {
    const dashboards = await Dashboard.find({}).populate('msmeId', 'businessName username').limit(10);
    
    const dashboardInfo = dashboards.map(dashboard => ({
      msmeId: dashboard.msmeId?._id,
      businessName: dashboard.msmeId?.businessName || dashboard.businessName,
      username: dashboard.msmeId?.username,
      storeLogo: dashboard.storeLogo,
      coverPhoto: dashboard.coverPhoto,
      description: dashboard.description,
      location: dashboard.location,
      hasStoreLogo: !!dashboard.storeLogo,
      hasCoverPhoto: !!dashboard.coverPhoto,
      createdAt: dashboard.createdAt
    }));

    res.json({
      success: true,
      count: dashboards.length,
      dashboards: dashboardInfo
    });
  } catch (error) {
    console.error("Error fetching dashboard debug info:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching dashboard data"
    });
  }
});

// --- Customer Notification Routes ---

// Get notifications for a customer
app.get("/api/customer-notifications/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await CustomerNotificationService.getCustomerNotifications(
      customerId, 
      parseInt(limit), 
      parseInt(offset)
    );

    const unreadCount = await CustomerNotificationService.getUnreadCount(customerId);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching notifications"
    });
  }
});

// Get unread notification count for a customer
app.get("/api/customer-notifications/:customerId/unread-count", async (req, res) => {
  try {
    const { customerId } = req.params;
    const unreadCount = await CustomerNotificationService.getUnreadCount(customerId);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching unread count"
    });
  }
});

// Mark customer notification as read
app.put("/api/customer-notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required"
      });
    }

    await CustomerNotificationService.markAsRead(notificationId, customerId);

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking customer notification as read:", error);
    res.status(500).json({
      success: false,
      error: "Error marking notification as read"
    });
  }
});

// Mark all customer notifications as read
app.put("/api/customer-notifications/:customerId/read-all", async (req, res) => {
  try {
    const { customerId } = req.params;

    await CustomerNotificationService.markAllAsRead(customerId);

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all customer notifications as read:", error);
    res.status(500).json({
      success: false,
      error: "Error marking all notifications as read"
    });
  }
});

// Delete a customer notification
app.delete("/api/customer-notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required"
      });
    }

    await CustomerNotificationService.deleteNotification(notificationId, customerId);

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting customer notification:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting notification"
    });
  }
});

// --- Legacy User Routes (keep for backward compatibility) ---
app.post("/api/users", async (req, res) => {
  // ... existing user routes ...
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});