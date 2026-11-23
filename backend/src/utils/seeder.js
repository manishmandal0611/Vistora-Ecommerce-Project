import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear Bluetooth headphones with active noise cancellation, 35-hour battery life, and plush memory foam ear cushions.",
    price: 2999,
    category: "Electronics",
    brand: "SoundPulse",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 25,
    rating: 4.7,
  },
  {
    name: "Minimalist Mechanical Keyboard",
    description:
      "Compact 75% wireless mechanical keyboard with hot-swappable tactile switches and white LED backlight.",
    price: 4499,
    category: "Electronics",
    brand: "KeyCraft",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
    stock: 18,
    rating: 4.8,
  },
  {
    name: "Classic Cotton Overshirt",
    description:
      "Breathable heavyweight cotton overshirt tailored for everyday layering across casual and smart-casual outfits.",
    price: 1599,
    category: "Fashion",
    brand: "UrbanLoom",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    stock: 30,
    rating: 4.4,
  },
  {
    name: "Everyday Running Sneakers",
    description:
      "Lightweight cushioned running shoes with breathable mesh upper and high-grip rubber outsole.",
    price: 2799,
    category: "Fashion",
    brand: "StrideLab",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    stock: 20,
    rating: 4.6,
  },
  {
    name: "Pour-Over Coffee Maker Set",
    description:
      "Borosilicate glass coffee carafe with reusable stainless steel filter for clean, rich morning brews.",
    price: 1299,
    category: "Home & Kitchen",
    brand: "BrewWorks",
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    stock: 15,
    rating: 4.5,
  },
  {
    name: "Clean Code & System Design Handbook",
    description:
      "Practical guide covering modular architecture, API design, database indexing, and maintainable software engineering.",
    price: 799,
    category: "Books",
    brand: "TechPress",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 40,
    rating: 4.9,
  },
  {
    name: "Non-Slip Yoga & Workout Mat",
    description:
      "High-density 6mm TPE exercise mat with alignment markings and carrying strap for home workouts.",
    price: 999,
    category: "Fitness",
    brand: "CoreFlex",
    image:
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80",
    stock: 22,
    rating: 4.3,
  },
  {
    name: "Classic Leather Analog Watch",
    description:
      "Minimalist stainless steel timepiece with genuine leather strap and water-resistant casing.",
    price: 2199,
    category: "Accessories",
    brand: "ChronoCraft",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    stock: 16,
    rating: 4.6,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@vistora.dev";
    const customerEmail = "customer@vistora.dev";

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Store Admin",
        email: adminEmail,
        password: "Password123!",
        role: "admin",
        address: {
          street: "101 Tech Park Road",
          city: "Noida",
          state: "Uttar Pradesh",
          postalCode: "201301",
          country: "India",
        },
      });
    }

    const existingCustomer = await User.findOne({ email: customerEmail });
    if (!existingCustomer) {
      await User.create({
        name: "Demo Customer",
        email: customerEmail,
        password: "Password123!",
        role: "user",
        address: {
          street: "42 Sector 18 Market",
          city: "Noida",
          state: "Uttar Pradesh",
          postalCode: "201301",
          country: "India",
        },
      });
    }

    await Product.deleteMany({});
    const productsWithCreator = sampleProducts.map((item) => ({
      ...item,
      createdBy: adminUser._id,
    }));
    await Product.insertMany(productsWithCreator);

    console.log("VISTORA database seeded successfully!");
    console.log("Admin Login:    admin@vistora.dev / Password123!");
    console.log("Customer Login: customer@vistora.dev / Password123!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seedDatabase();
