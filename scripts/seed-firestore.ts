import "dotenv/config";
import { adminDb } from "../src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function img(seed: string, i: number) {
  return `https://picsum.photos/seed/${slugify(seed)}-${i}/700/700`;
}

type ProductSeed = {
  title: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  reviews: { author: string; rating: number; title: string; body: string }[];
};

type CategorySeed = {
  name: string;
  icon: string;
  products: ProductSeed[];
};

const categories: CategorySeed[] = [
  {
    name: "Mobiles",
    icon: "smartphone",
    products: [
      {
        title: "Pulse X13 5G Smartphone (128GB, 8GB RAM)",
        brand: "Pulse",
        description:
          "6.7-inch AMOLED display, 5000mAh battery with 67W fast charging, triple camera setup with 108MP main sensor, and 5G connectivity across all major bands.",
        price: 18999,
        mrp: 24999,
        reviews: [
          { author: "Ankit R.", rating: 5, title: "Great value flagship killer", body: "Camera quality is stunning for the price. Battery easily lasts a full day of heavy use." },
          { author: "Sneha M.", rating: 4, title: "Solid performer", body: "Fast and smooth, though the fingerprint sensor is occasionally slow to unlock." },
        ],
      },
      {
        title: "Orbit Lite 4G Smartphone (64GB, 4GB RAM)",
        brand: "Orbit",
        description: "Budget-friendly 4G phone with a 6.5-inch HD+ display, dual camera, and a 5000mAh battery that easily lasts two days on light use.",
        price: 7499,
        mrp: 9999,
        reviews: [
          { author: "Ramesh K.", rating: 4, title: "Good for basic use", body: "Perfect as a backup phone or for elderly parents. Simple and reliable." },
        ],
      },
      {
        title: "Vortex Pro 5G (256GB, 12GB RAM)",
        brand: "Vortex",
        description: "Flagship-tier performance with a Snapdragon-class processor, 120Hz curved AMOLED display, and IP68 water resistance.",
        price: 42999,
        mrp: 54999,
        reviews: [
          { author: "Priya S.", rating: 5, title: "Worth every rupee", body: "The display and gaming performance are top notch. No lag even with heavy multitasking." },
          { author: "Vikram T.", rating: 5, title: "Best phone I've owned", body: "Camera at night is incredible. Battery lasts all day even with heavy screen time." },
        ],
      },
      {
        title: "Nimbus Buds Wireless Earbuds",
        brand: "Nimbus",
        description: "True wireless earbuds with active noise cancellation, 30-hour total battery life with the charging case, and IPX5 sweat resistance.",
        price: 1999,
        mrp: 3499,
        reviews: [
          { author: "Divya P.", rating: 4, title: "Great sound for the price", body: "ANC works well in office noise. Bass could be a touch stronger but overall very happy." },
        ],
      },
      {
        title: "PowerBank 20000mAh Fast Charge",
        brand: "Voltix",
        description: "20000mAh power bank with 22.5W fast charging, dual USB-A and USB-C output, and a digital battery percentage display.",
        price: 1499,
        mrp: 2299,
        reviews: [
          { author: "Karan B.", rating: 5, title: "Charges my phone 4 times", body: "Solid build quality and charges fast. Great for travel." },
        ],
      },
    ],
  },
  {
    name: "Electronics",
    icon: "tv",
    products: [
      {
        title: "CrystalView 43-inch 4K Smart TV",
        brand: "CrystalView",
        description: "43-inch 4K Ultra HD LED display with built-in streaming apps, voice remote, and Dolby Audio support.",
        price: 24999,
        mrp: 34999,
        reviews: [
          { author: "Amit J.", rating: 5, title: "Picture quality is excellent", body: "Colors pop and the smart interface is snappy. No complaints so far." },
          { author: "Neha G.", rating: 4, title: "Good TV for the price", body: "Sound is a bit weak, ended up pairing a soundbar, but the picture is great." },
        ],
      },
      {
        title: "AirCool Tower Fan with Remote",
        brand: "AirCool",
        description: "Bladeless tower fan with 3 speed settings, oscillation, timer function, and a whisper-quiet motor.",
        price: 3299,
        mrp: 4499,
        reviews: [
          { author: "Sunita R.", rating: 4, title: "Quiet and effective", body: "Cools the room well and barely makes any noise at night." },
        ],
      },
      {
        title: "SoundWave Bluetooth Party Speaker",
        brand: "SoundWave",
        description: "70W portable Bluetooth speaker with RGB lights, 12-hour battery, and TWS pairing for stereo sound.",
        price: 3999,
        mrp: 5999,
        reviews: [
          { author: "Rohit D.", rating: 5, title: "Party essential", body: "Insanely loud for its size and the bass hits hard. Great for house parties." },
        ],
      },
      {
        title: "ChillTech 1.5 Ton Split AC",
        brand: "ChillTech",
        description: "5-star rated inverter split AC with copper condenser, dual filtration, and quiet 32dB operation.",
        price: 32999,
        mrp: 44999,
        reviews: [
          { author: "Manoj S.", rating: 5, title: "Cools fast, low electricity bill", body: "Installation was easy and it cools a 150 sq ft room in minutes." },
        ],
      },
      {
        title: "FocusBook 14-inch Laptop (i5, 16GB, 512GB SSD)",
        brand: "FocusBook",
        description: "14-inch FHD laptop with 11th-gen Intel Core i5, 16GB RAM, 512GB NVMe SSD, and a backlit keyboard.",
        price: 47999,
        mrp: 59999,
        reviews: [
          { author: "Ishaan V.", rating: 5, title: "Excellent for work and study", body: "Fast boot times, handles multiple Chrome tabs and Excel without any lag." },
          { author: "Pooja N.", rating: 4, title: "Great value laptop", body: "Build quality feels premium. Battery lasts about 6 hours of regular use." },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    icon: "shirt",
    products: [
      {
        title: "Men's Slim Fit Cotton Casual Shirt",
        brand: "Urbane",
        description: "100% breathable cotton shirt with a modern slim fit, available in solid colors, perfect for office or casual wear.",
        price: 799,
        mrp: 1499,
        reviews: [
          { author: "Arjun M.", rating: 4, title: "Nice fabric", body: "Fits true to size and the fabric feels premium for the price." },
        ],
      },
      {
        title: "Women's Floral Wrap Dress",
        brand: "Aisha & Co.",
        description: "Flowy floral wrap dress in soft rayon fabric, perfect for summer outings and casual gatherings.",
        price: 1099,
        mrp: 1999,
        reviews: [
          { author: "Kavya L.", rating: 5, title: "Beautiful and comfortable", body: "Got so many compliments wearing this. True to size and great quality." },
        ],
      },
      {
        title: "Classic Leather Wallet for Men",
        brand: "Craftline",
        description: "Genuine leather bi-fold wallet with 6 card slots, coin pocket, and RFID-blocking lining.",
        price: 599,
        mrp: 999,
        reviews: [
          { author: "Suresh P.", rating: 5, title: "Sturdy and stylish", body: "Great stitching quality, doesn't feel like a budget wallet at all." },
        ],
      },
      {
        title: "Running Sports Shoes - Lightweight",
        brand: "SprintFlex",
        description: "Lightweight mesh running shoes with cushioned sole, breathable design, and durable rubber outsole.",
        price: 1799,
        mrp: 2999,
        reviews: [
          { author: "Deepak H.", rating: 4, title: "Comfortable for daily runs", body: "Good grip and cushioning. Sizing runs slightly small, order one size up." },
          { author: "Meera T.", rating: 5, title: "Love these!", body: "Super light and comfortable even after long walks." },
        ],
      },
      {
        title: "Unisex Analog Wrist Watch",
        brand: "Chronos",
        description: "Minimalist analog watch with stainless steel strap, scratch-resistant glass, and 30m water resistance.",
        price: 1299,
        mrp: 2499,
        reviews: [
          { author: "Farhan A.", rating: 4, title: "Classy design", body: "Looks much more expensive than it is. Strap is comfortable too." },
        ],
      },
    ],
  },
  {
    name: "Home & Kitchen",
    icon: "sofa",
    products: [
      {
        title: "NonStick Cookware Set (5 Pieces)",
        brand: "CuisinePro",
        description: "5-piece non-stick cookware set including tawa, kadhai, and saucepans, safe for gas and induction cooktops.",
        price: 1899,
        mrp: 3199,
        reviews: [
          { author: "Lakshmi V.", rating: 5, title: "Great non-stick quality", body: "Food doesn't stick at all and cleaning is super easy." },
        ],
      },
      {
        title: "Memory Foam Pillow (Set of 2)",
        brand: "SleepSoft",
        description: "Orthopedic memory foam pillows with cooling gel-infused cover, ideal for neck and back support.",
        price: 899,
        mrp: 1599,
        reviews: [
          { author: "Anita K.", rating: 5, title: "Neck pain gone!", body: "Noticed a big difference in my sleep quality within a week." },
        ],
      },
      {
        title: "750W Mixer Grinder with 3 Jars",
        brand: "HomeChef",
        description: "Powerful 750W motor with 3 stainless steel jars for grinding, chutney, and juicing, plus overload protection.",
        price: 2499,
        mrp: 3799,
        reviews: [
          { author: "Geeta R.", rating: 4, title: "Powerful motor", body: "Grinds even hard spices smoothly. A bit noisy but performance is great." },
        ],
      },
      {
        title: "Cotton Bedsheet with 2 Pillow Covers",
        brand: "WeaveHome",
        description: "King-size 100% cotton bedsheet with a vibrant printed design and two matching pillow covers.",
        price: 799,
        mrp: 1399,
        reviews: [
          { author: "Ritu S.", rating: 4, title: "Soft and vibrant colors", body: "Color hasn't faded even after multiple washes." },
        ],
      },
      {
        title: "Stainless Steel Water Bottle 1L",
        brand: "HydroFlow",
        description: "Double-wall vacuum insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
        price: 599,
        mrp: 999,
        reviews: [
          { author: "Nikhil B.", rating: 5, title: "Keeps water cold all day", body: "Took it on a trek and water was still cold after 20 hours." },
        ],
      },
    ],
  },
  {
    name: "Books",
    icon: "book",
    products: [
      {
        title: "The Silent Ledger — A Financial Thriller",
        brand: "Penbound Press",
        description: "A gripping thriller about a forensic accountant who uncovers a conspiracy hidden inside a century-old bank.",
        price: 299,
        mrp: 499,
        reviews: [
          { author: "Tanvi J.", rating: 5, title: "Couldn't put it down", body: "Fast-paced and full of twists. Finished it in two sittings." },
        ],
      },
      {
        title: "Atomic Focus: Building Habits That Stick",
        brand: "Northstar Books",
        description: "A practical guide to building sustainable habits and improving focus in a distraction-filled world.",
        price: 349,
        mrp: 599,
        reviews: [
          { author: "Yash K.", rating: 5, title: "Life-changing", body: "Simple, actionable advice. I've already applied several tips from this book." },
          { author: "Simran D.", rating: 4, title: "Good read", body: "A bit repetitive in places but overall very useful." },
        ],
      },
      {
        title: "Culinary India: 100 Regional Recipes",
        brand: "Tasteworks",
        description: "A beautifully illustrated cookbook featuring 100 authentic recipes from across India's diverse regions.",
        price: 449,
        mrp: 799,
        reviews: [
          { author: "Radha M.", rating: 5, title: "Beautiful recipes", body: "Every recipe I've tried so far has turned out perfectly. Gorgeous photography too." },
        ],
      },
    ],
  },
  {
    name: "Beauty & Personal Care",
    icon: "sparkles",
    products: [
      {
        title: "Vitamin C Brightening Face Serum",
        brand: "GlowLab",
        description: "20% Vitamin C serum with hyaluronic acid for brighter, even-toned skin. Suitable for all skin types.",
        price: 649,
        mrp: 999,
        reviews: [
          { author: "Aditi C.", rating: 5, title: "Visible glow in 2 weeks", body: "My skin tone looks so much more even now. Absorbs quickly too." },
        ],
      },
      {
        title: "Herbal Shampoo & Conditioner Combo",
        brand: "NatureRoots",
        description: "Sulfate-free herbal shampoo and conditioner combo infused with amla, bhringraj, and hibiscus extracts.",
        price: 499,
        mrp: 799,
        reviews: [
          { author: "Bhavna P.", rating: 4, title: "Hair feels healthier", body: "Less hairfall since I started using this. Smells great too." },
        ],
      },
      {
        title: "Electric Trimmer for Men",
        brand: "GroomTech",
        description: "Cordless electric trimmer with titanium-coated blades, 40 length settings, and 90-minute runtime.",
        price: 999,
        mrp: 1599,
        reviews: [
          { author: "Rahul S.", rating: 4, title: "Sharp and long-lasting battery", body: "Trims evenly and the battery easily lasts 2 weeks of daily use." },
        ],
      },
    ],
  },
  {
    name: "Sports & Fitness",
    icon: "dumbbell",
    products: [
      {
        title: "Adjustable Dumbbell Set (Pair, 20kg)",
        brand: "IronCore",
        description: "Adjustable pair of dumbbells with weight plates from 2.5kg to 10kg each, perfect for home workouts.",
        price: 2999,
        mrp: 4499,
        reviews: [
          { author: "Varun G.", rating: 5, title: "Great for home gym", body: "Solid build and easy to adjust the weight plates." },
        ],
      },
      {
        title: "Yoga Mat with Carry Strap (6mm)",
        brand: "ZenFit",
        description: "Extra-thick 6mm non-slip yoga mat made from eco-friendly TPE material, includes a carry strap.",
        price: 599,
        mrp: 999,
        reviews: [
          { author: "Sana R.", rating: 5, title: "Comfortable cushioning", body: "Doesn't slip even during sweaty sessions. Great thickness for joint support." },
        ],
      },
      {
        title: "Resistance Bands Set (5 Levels)",
        brand: "FlexBand",
        description: "Set of 5 resistance bands with varying tension levels, includes door anchor and carry bag.",
        price: 449,
        mrp: 799,
        reviews: [
          { author: "Aakash M.", rating: 4, title: "Versatile for full body workouts", body: "Great for travel workouts. Bands are durable and haven't snapped yet." },
        ],
      },
      {
        title: "Smart Fitness Band with Heart Rate Monitor",
        brand: "PulseTrack",
        description: "Fitness band with continuous heart rate monitoring, sleep tracking, SpO2 sensor, and 10-day battery life.",
        price: 1499,
        mrp: 2499,
        reviews: [
          { author: "Nisha D.", rating: 4, title: "Accurate tracking", body: "Steps and heart rate readings match closely with my other devices." },
          { author: "Gaurav L.", rating: 5, title: "Great battery life", body: "Charge once, forget for over a week. Very happy with this purchase." },
        ],
      },
    ],
  },
  {
    name: "Toys & Games",
    icon: "puzzle",
    products: [
      {
        title: "Wooden Building Blocks Set (100 Pieces)",
        brand: "TinkerTots",
        description: "100-piece natural wooden building block set that encourages creativity and motor skill development in kids.",
        price: 799,
        mrp: 1299,
        reviews: [
          { author: "Shalini K.", rating: 5, title: "My kid loves it", body: "Great quality wood, no sharp edges, and keeps my 4-year-old busy for hours." },
        ],
      },
      {
        title: "Remote Control Stunt Car",
        brand: "TurboToys",
        description: "360-degree rotating RC stunt car with rechargeable battery and rugged all-terrain wheels.",
        price: 1199,
        mrp: 1999,
        reviews: [
          { author: "Rohan V.", rating: 4, title: "Fun for the whole family", body: "Fast and durable, survived several crashes without breaking." },
        ],
      },
      {
        title: "1000-Piece Jigsaw Puzzle - World Map",
        brand: "PuzzleCraft",
        description: "1000-piece high-quality cardboard jigsaw puzzle featuring a detailed illustrated world map.",
        price: 449,
        mrp: 699,
        reviews: [
          { author: "Meenal S.", rating: 5, title: "High quality pieces", body: "Pieces fit together perfectly and the artwork is beautiful once complete." },
        ],
      },
    ],
  },
];

async function clearCollection(path: string) {
  const snap = await adminDb.collection(path).get();
  await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
}

async function main() {
  console.log("Clearing existing catalog data...");
  const productsSnap = await adminDb.collection("products").get();
  for (const doc of productsSnap.docs) {
    await clearCollection(`products/${doc.id}/reviews`);
    await doc.ref.delete();
  }
  await clearCollection("categories");
  await clearCollection("orders");

  console.log("Seeding categories and products...");
  let productCount = 0;

  for (const cat of categories) {
    const categorySlug = slugify(cat.name);
    await adminDb.collection("categories").doc(categorySlug).set({
      name: cat.name,
      icon: cat.icon,
    });

    for (const p of cat.products) {
      const productSlug = slugify(p.title);
      const images = [img(p.title, 1), img(p.title, 2), img(p.title, 3)];
      const rating =
        p.reviews.length > 0
          ? Math.round((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 10) / 10
          : 4.3;

      const productRef = adminDb.collection("products").doc(productSlug);
      await productRef.set({
        title: p.title,
        brand: p.brand,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        stock: 50 + Math.floor(Math.random() * 100),
        rating,
        reviewCount: p.reviews.length,
        images,
        categorySlug,
        categoryName: cat.name,
        createdAt: FieldValue.serverTimestamp(),
      });

      for (const r of p.reviews) {
        await productRef.collection("reviews").add({
          author: r.author,
          rating: r.rating,
          title: r.title,
          body: r.body,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      productCount += 1;
    }
  }

  console.log(`Seeded ${categories.length} categories and ${productCount} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
