require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin.model");

async function checkAdminLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/elakonv"
    );
    console.log("✅ Connected to MongoDB");

    // Check all admin accounts
    const admins = await Admin.find({});
    console.log(`\n📊 Found ${admins.length} admin accounts in database:`);

    if (admins.length === 0) {
      console.log("❌ No admin accounts found in database");
      console.log("💡 You can only use the hardcoded credentials:");
      console.log("   Username: admin");
      console.log("   Password: admin123");
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Account:`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.status}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt}`);

        if (admin.status !== "active") {
          console.log(
            `   ⚠️  WARNING: Account is ${admin.status} - this will cause 401 errors`
          );
        }
      });
    }

    // Test hardcoded credentials logic
    console.log("\n🔐 Hardcoded Admin Credentials (always available):");
    console.log("   Username: admin");
    console.log("   Password: admin123");

    // Test a specific username/password if provided via command line
    const testUsername = process.argv[2];
    const testPassword = process.argv[3];

    if (testUsername && testPassword) {
      console.log(
        `\n🧪 Testing credentials: ${testUsername} / ${testPassword}`
      );

      // Check hardcoded first
      if (testUsername === "admin" && testPassword === "admin123") {
        console.log("✅ Hardcoded admin credentials are VALID");
      } else {
        // Check database admin
        const admin = await Admin.findOne({ username: testUsername });

        if (!admin) {
          console.log("❌ Admin not found in database");
        } else if (admin.status !== "active") {
          console.log(
            `❌ Admin account status is '${admin.status}' (must be 'active')`
          );
        } else {
          const isPasswordValid = await bcrypt.compare(
            testPassword,
            admin.password
          );
          if (isPasswordValid) {
            console.log("✅ Database admin credentials are VALID");
          } else {
            console.log("❌ Password is incorrect");
          }
        }
      }
    }

    console.log("\n💡 To test specific credentials, run:");
    console.log("   node check-admin-login.js username password");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Create an admin account if needed
async function createAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/elakonv"
    );
    console.log("✅ Connected to MongoDB");

    const username = process.argv[3] || "testadmin";
    const password = process.argv[4] || "testpass123";
    const email = process.argv[5] || "admin@elako.com";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      console.log("❌ Admin with this username or email already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = new Admin({
      username,
      password: hashedPassword,
      firstname: "Test",
      lastname: "Admin",
      email,
      role: "admin",
      status: "active",
      createdBy: "system",
    });

    await admin.save();
    console.log("✅ Admin account created successfully:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === "create") {
  createAdmin();
} else {
  checkAdminLogin();
}
