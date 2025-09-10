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

// --- Legacy User Routes (keep for backward compatibility) ---
app.post("/api/users", async (req, res) => {
  // ... existing user routes ...
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});