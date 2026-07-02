const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config({ path: './.env' });

const products = [
  {
    name: "Diamond Ring",
    description: "Elegant diamond ring with 18k gold setting. Perfect for special occasions.",
    price: 1299.99,
    category: "Rings",
    image: "Jevel1.jpg",
    stock: 10,
    featured: true,
    rating: 4.8,
    reviews: [
      { user: "Sarah M.", rating: 5, comment: "Beautiful ring, excellent quality!", date: new Date() },
      { user: "John D.", rating: 4, comment: "Great value for money", date: new Date() }
    ],
    specifications: {
      material: "18k Gold",
      stoneType: "Diamond",
      clarity: "VS1",
      color: "D",
      cut: "Round Brilliant",
      weight: "1.0ct",
      setting: "Prong",
      certification: "GIA"
    }
  },
  {
    name: "Pearl Necklace",
    description: "Freshwater pearl necklace with silver clasp. Classic elegance for any occasion.",
    price: 899.99,
    category: "Necklaces",
    image: "Jevel2.jpg",
    stock: 15,
    featured: true,
    rating: 4.6,
    reviews: [
      { user: "Emma L.", rating: 5, comment: "Stunning necklace!", date: new Date() }
    ],
    specifications: {
      material: "Sterling Silver",
      stoneType: "Freshwater Pearl",
      clarity: "AAA",
      color: "White",
      cut: "Round",
      weight: "8-9mm",
      setting: "String",
      certification: "Certificate of Authenticity"
    }
  },
  {
    name: "Sapphire Earrings",
    description: "Blue sapphire stud earrings in white gold. Timeless beauty with modern appeal.",
    price: 649.99,
    category: "Earrings",
    image: "Jevel3.jpg",
    stock: 20,
    featured: true,
    rating: 4.7,
    reviews: [],
    specifications: {
      material: "White Gold",
      stoneType: "Sapphire",
      clarity: "VS2",
      color: "Blue",
      cut: "Round",
      weight: "0.5ct each",
      setting: "Stud",
      certification: "GIA"
    }
  },
  {
    name: "Gold Bracelet",
    description: "18k gold bracelet with intricate design. A statement piece for any outfit.",
    price: 799.99,
    category: "Bracelets",
    image: "Jevel4.jpg",
    stock: 25,
    featured: true,
    rating: 4.5,
    reviews: [],
    specifications: {
      material: "18k Gold",
      stoneType: "None",
      clarity: "N/A",
      color: "Yellow Gold",
      cut: "N/A",
      weight: "15g",
      setting: "Solid",
      certification: "Hallmark"
    }
  },
  {
    name: "Emerald Pendant",
    description: "Natural emerald pendant on gold chain. A touch of luxury for everyday wear.",
    price: 549.99,
    category: "Pendants",
    image: "Jevel5.jpg",
    stock: 12,
    featured: true,
    rating: 4.5,
    reviews: [],
    specifications: {
      material: "18k Gold",
      stoneType: "Emerald",
      clarity: "SI1",
      color: "Green",
      cut: "Oval",
      weight: "0.75ct",
      setting: "Pendant",
      certification: "GIA"
    }
  },
  {
    name: "Ruby Ring",
    description: "Stunning ruby ring with diamond accents. Perfect for making a statement.",
    price: 999.99,
    category: "Rings",
    image: "Jevel6.jpg",
    stock: 8,
    featured: true,
    rating: 4.7,
    reviews: [],
    specifications: {
      material: "18k Gold",
      stoneType: "Ruby",
      clarity: "VS1",
      color: "Red",
      cut: "Round",
      weight: "1.2ct",
      setting: "Halo",
      certification: "GIA"
    }
  },
  {
    name: "Silver Chain",
    description: "Sterling silver chain necklace. Versatile and elegant for any style.",
    price: 299.99,
    category: "Necklaces",
    image: "Jevel7.jpg",
    stock: 30,
    featured: false,
    rating: 4.4,
    reviews: [],
    specifications: {
      material: "Sterling Silver",
      stoneType: "None",
      clarity: "N/A",
      color: "Silver",
      cut: "N/A",
      weight: "8g",
      setting: "Chain",
      certification: "Hallmark"
    }
  },
  {
    name: "Diamond Studs",
    description: "Classic diamond stud earrings. Essential pieces for any jewelry collection.",
    price: 749.99,
    category: "Earrings",
    image: "Jevel8.jpg",
    stock: 18,
    featured: true,
    rating: 4.8,
    reviews: [],
    specifications: {
      material: "White Gold",
      stoneType: "Diamond",
      clarity: "VS2",
      color: "D",
      cut: "Round Brilliant",
      weight: "0.3ct each",
      setting: "Stud",
      certification: "GIA"
    }
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelsnyou', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
