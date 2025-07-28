require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const { WebhookClient } = require("dialogflow-fulfillment");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Setup
const client = new MongoClient("mongodb+srv://shafiqmisbah30:1rQViKgTfgUd0Vop@hrklaptop.yyu4xcv.mongodb.net/");
let db;
client.connect().then(() => {
  db = client.db("hrklaptop");
  console.log("✅ Connected to MongoDB");
}).catch(err => console.error("❌ MongoDB Error:", err));

// Gmail Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Test Route
app.get("/", (req, res) => {
  res.send("🤖 HRK Bot Webhook Running");
});

// Webhook Route
app.post("/webhook", async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  console.log("⚡ Intent Triggered:", agent.intent);

  // 🌟 Welcome Intent with Buttons
  function welcome(agent) {
    console.log("📍 Running: Welcome Intent");
   agent.add("👋 Welcome to *HRK Laptop Bot*! How can I assist you today?");
  }
   
  

  // 💻 ShowLaptopModelsIntent
  function showLaptopModels(agent) {
    console.log("📍 Running: ShowLaptopModelsIntent");

    agent.add("💻 *Here are some top-selling laptops:*");

    const laptops = [
      {
        name: "HP Pavilion 15",
        specs: "i5 12th Gen, 8GB RAM, 512GB SSD, Intel Iris Xe",
        price: "Rs. 165,000"
      },
      {
        name: "Dell Inspiron 14",
        specs: "i7 11th Gen, 16GB RAM, 1TB SSD, NVIDIA MX450",
        price: "Rs. 210,000"
      },
      {
        name: "Lenovo IdeaPad Gaming 3",
        specs: "Ryzen 5 5600H, 8GB RAM, 512GB SSD, GTX 1650",
        price: "Rs. 195,000"
      },
      {
        name: "Apple MacBook Air M2",
        specs: "8GB RAM, 256GB SSD, Retina Display",
        price: "Rs. 270,000"
      }
    ];

    laptops.forEach((laptop) => {
      agent.add(`🔹 *${laptop.name}*\n🛠️ ${laptop.specs}\n💵 ${laptop.price}`);
    });

    agent.add("🤔 Want to buy or ask questions? Type *register* or click *Register for a laptop*.");
  }

  // 📬 Lead Intent (Email + MongoDB)
  async function lead(agent) {
    console.log("📍 Running: Lead Intent");

    let { name, email, phone, range, address, modelType, laptopDetails } = agent.parameters;
    console.log("📦 Parameters received:", agent.parameters);

    if (typeof name === "object" && name !== null) {
      name = name.name || name.first || "";
    }

    if (!modelType || !laptopDetails) {
      agent.add("💻 Please specify your preferred brand and laptop details (e.g. RAM, storage, processor).");
      return;
    }

    if (!name || !email || !phone || !range || !address) {
      agent.add("❗ Please provide all required details: name, email, phone, budget, and address.");
      return;
    }

    const leadData = {
      name,
      email,
      phone,
      range,
      address,
      modelType,
      laptopDetails,
      createdAt: new Date(),
    };

    try {
      await db.collection("leads").insertOne(leadData);
      console.log("✅ Lead data saved to MongoDB");

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "🎉 HRK – Laptop Inquiry Received",
       html: `
<div style="background: linear-gradient(to right, #0f2027, #203a43, #2c5364); padding: 40px; font-family: 'Segoe UI', sans-serif; color: #eaeaea;">
  <div style="max-width: 600px; margin: auto; background: #1a1a1a; padding: 30px 40px; border-radius: 16px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
    
    <h2 style="text-align: center; font-size: 26px; color: #00e6ff; margin-bottom: 10px;">
      💻 HRK Laptop Bot – Request Confirmed
    </h2>
    <p style="text-align: center; font-size: 14px; color: #f5f5f5;">
      Hello <strong>${name}</strong>, your laptop request has been successfully submitted! 🎉<br>Here are the details you shared:
    </p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>📧 Email:</strong> ${email}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>📞 Phone:</strong> ${phone}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>💰 Budget:</strong> ${range}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>📍 Address:</strong> ${address}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>🏷️ Brand:</strong> ${modelType}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>📝 Laptop Specs:</strong> ${laptopDetails}</p>
      <p style="margin: 10px 0; color: #ffffff;"><strong>🕒 Submitted:</strong> ${new Intl.DateTimeFormat('en-PK', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Karachi'
      }).format(new Date())}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/923433452279" target="_blank"
         style="background-color: #25D366; color: #000; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
        <img src="https://store-images.s-microsoft.com/image/apps.8453.13655054093851568.4a371b72-2ce8-4bdb-9d83-be49894d3fa0.7f3687b9-847d-4f86-bb5c-c73259e2b38e" alt="WhatsApp" width="20" height="20" style="vertical-align: middle; margin-right: 8px;">
        Chat on WhatsApp
      </a>
    </div>

    <p style="text-align: center; font-size: 13px; color: #ccc;">🔐 Your data is safe & confidential.</p>
    <p style="text-align: center; font-size: 12px; color: #999;">Powered by <strong>HRK Laptop Bot 🤖</strong></p>

    <!-- Gmail Clipping Prevention Padding (100% working) -->
    <div style="display: none; white-space: nowrap; font-size: 15px; line-height: 0;">
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </div>

  </div>
</div>


        `,
      });

      console.log("✅ Email sent successfully to:", email);
      agent.add(`✅ Thank you, *${name}*! Your request for a *${modelType}* laptop has been submitted. We’ve emailed you the confirmation. 📩`);
    } catch (err) {
      console.error("❌ Error in Lead Intent:", err);
      agent.add("❌ There was a problem saving your details or sending the confirmation email. Please try again.");
    }
  }

  // 🧭 Fallback
  function fallback(agent) {
    console.log("📍 Running: Fallback Intent");
    agent.add("🤖 I didn’t fully understand. Please try again differently.");
  }

  // 💡 Intent Map
  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("lead", lead);
  intentMap.set("ShowLaptopModelsIntent", showLaptopModels);
  intentMap.set("Default Fallback Intent", fallback);

  agent.handleRequest(intentMap);
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 HRK Bot Webhook is running at http://localhost:${PORT}`);
});
