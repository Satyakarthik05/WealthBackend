const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const AgentRouter = require("./Routes/AgentRoutes");
const CustomerRoutes = require("./Routes/CustomerRoutes");
const CoreRoutes = require("./Routes/CoreRoutes");
const propertyRoutes = require("./Routes/PostPropertyRoutes");
const RequestProperty = require("./Routes/RequestPropertyRoute");
const fs = require("fs");
const https = require("https");
const DisConsExpert = require("./Routes/DisConsExpRoutes");
const District = require("./Models/Districts");
const ExpertRoutes = require("./Routes/ExpertRoute");
const NriRoutes = require("./Routes/NriRoute");
const SkillRoutes = require("./Routes/SkillRoutes");
const AllCounts = require("./Controllers/AllCollectionsCount");
const InvestorRoutes = require("./Routes/InvestorRouts");
const RequestExpertRoute = require("./Routes/RequstedExpertsRoutes");
const CoreClientRoutes = require("./Routes/CoreClientsRoutes");
const path = require("path");
const CoreProjectRoutes = require("./Routes/CoreProjectsRoutes");
const buyRoutes = require("./Routes/BuyPropertyRoutes");
const NotificationToken = require("./Routes/NoficationsRoutes");
const DistrictConstituency = require("./Routes/DistrictConsttuencyRoutes");
const Constituency = require("./Models/DistrictsConstituencysModel");
const ReqExp = require("./Routes/ReqExpRoutes");
const CallExecuteRoute = require("./Routes/CallExecutiveRouts");
const PushToken = require("./Models/NotificationToken");
const SuppliersRoutes = require("./Routes/Suppliersroutes");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const http = require("http");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const axios = require("axios");
const axiosRetry = require("axios-retry");
const socketIO = require("socket.io");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/uploads", express.static("uploads"));
app.use("/coreClients", express.static(path.join(__dirname, "coreClients")));
app.use("/coreProjects", express.static(path.join(__dirname, "coreProjects")));
app.use(
  "/valueProjects",
  express.static(path.join(__dirname, "valueProjects"))
);
app.use(
  "/ExpertMembers",
  express.static(path.join(__dirname, "ExpertMembers"))
);
app.use("/Agents", express.static(path.join(__dirname, "Agents")));
app.use("/Suppliers", express.static(path.join(__dirname, "Suppliers")));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json({ limit: "50mb" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled Error:`, err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const corsOptions = {
  origin: "*",
  methods: ["POST", "GET", "DELETE", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
};

app.use(cors(corsOptions));

mongoose
  .connect(
    "mongodb+srv://wealthassociates:Admin%40123open@wealthassociate.ytdcd.mongodb.net/?retryWrites=true&w=majority&appName=wealthassociate/WealthAssociate"
  )
  .then(() => console.log("mongodb Connected Successfully"))
  .catch((error) => console.error());

app.use("/agent", AgentRouter);
app.use("/customer", CustomerRoutes);
app.use("/core", CoreRoutes);
app.use("/properties", propertyRoutes);
app.use("/requestProperty", RequestProperty);
app.use("/discons", DisConsExpert);
app.use("/expert", ExpertRoutes);
app.use("/skillLabour", SkillRoutes);
app.use("/count", AllCounts);
app.use("/nri", NriRoutes);
app.use("/investors", InvestorRoutes);
app.use("/requestexpert", RequestExpertRoute);
app.use("/coreclient", CoreClientRoutes);
app.use("/coreproject", CoreProjectRoutes);
app.use("/buy", buyRoutes);
app.use("/noti", NotificationToken);
app.use("/alldiscons", DistrictConstituency);
app.use("/direqexp", ReqExp);
app.use("/callexe", CallExecuteRoute);
app.use("/suppliersvendors", SuppliersRoutes);

app.get("/admindata", (req, res) => {
  const UserName = "9063392872";
  const Password = "Admin@123open";

  res.status(200).json({ UserName, Password });
});

app.get("/serverCheck", (req, res) => {
  res.send("Hello Welcome to my wealthAssociat server");
});

const serviceAccount = {
  type: "service_account",
  project_id: "wealthassociate-73b2e",
  private_key_id: "8061ec845d264912da25d3a991eeaae7a86b1985",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDxlk0qAR9VQ0dw\nd7f4A12JBb5Xj3Ybe8amk89bOHCZZrcpNRdQsy2GvSAMWR6zJWMieq38P2iEQ4GI\ntndnOUWjZnAA9kCwcUjsbb7qUcPSrKQIkVDpmM/gha1+odRcdWDw9FKjG5Lvvfxz\nyUiI0I3Xj5ujsAVCQ9jRSQNlcxPL779LfcSMs2vRG6ltLMtKhZVtkz6XqV4sRGCU\nc38SD9X35yPqrv2nVfxtsiZWr/e1klEjEdNswyZssi/JG0RtKccR2+DMPw4u72km\nSm8L9CNVRkpLqDKnyOdB1y4/8GV7F7BcdA7/6rYwg7rzajzPqQB9a847IFyBi+oJ\nRdib09LJAgMBAAECggEAQ+kKtuiK3MZlUhWtNsAHbomZSHbQ7gfcvx2kt9FFQbHw\ngdplO++qOAp49E+nBBfZ5qrStqpCYI+zXXFhXjhovXaBvJt8crzdkWyGMssaP2H9\nWFU1B/1HTid1rjeigP0T65falPQe2VqwGQI3bBIoFTTOvPQxfj+hNq+OD1oKchRe\nglsuovHP9kos9hdpbg0ind3vFYMO7pIx7o1dEGacciGgeYdjeOdJa5gwfcRB05Ub\nlWMtL6ILW7M96eIVG3yM1hTOt6Rk0KLfc3ucUqVX44g6joLpqQXXu91nAlnx+XI8\nlKrUrQTCsKTD4jwYetlr+/+Rs230XHBkxSF5KWbIOwKBgQD5WQftFg/+EgGEoJz6\nyK5soItNf/0ok9R5dK2EGhLigYxC4FnhFLGVYzy6NA1xuuHwuLXqKM1yI8yyY+HT\nJowSwn3+wGqrIA2OWlUwXh3vHxN1KHiQIK48UXx6lFrnj7sjpDFKoAbv2ye+EN3p\nBH8PTn0A1dFFHpCx4oQa5r6WawKBgQD4CER7pL0/tRvkIxSR8psj1wkU+Qs3qgcb\nEGoDwRikGwWuT4ed5jktEzuF9/o740LaQ1edxVe76s/UzMHIoeWh/HtTF15nMuCa\nUi+f9jR+wHn+NflVa2GqgVY8avJ1eNrpvcPO2OsUxyliji995HhMHP4Fzojd+gHL\n1NKCb3xAmwKBgQCNtZmZlpZUMOuH8rgElxT6S2ugCgNYkluJA1Sx5Reifzm1sEek\ncdxTKGkU8gxJ/In4AyHwCGxqWAo3wChRlnC5IKv2omh9BORvaMtNh8+/XIv0Y6HR\nV6FuSmlSSQo43CjhIqmY3cXTf1vg2zki+xkzG8pTNTGP9MULM88cctMSLQKBgDSc\nJFKJne6+bp0UZ8+RQyD2AqIlNSDoertd3u7O7XgZlzni+qQeajBKbQy8jaJYURzU\nvefkLPjaFJ1RlSUGWhvi3xG/2jFPlF6HYjyuz3G3R+kI78sTjNLKvkzwbl9GdECy\nFK9ySWLN39RczmwIow+Z8rOunE9hMTJYARLTrOpTAoGAcLowxR5SzXda/7npEVvG\n2RjsbjV6l1WS3o/9jw+HwdoYS9RZVCMSf2p0qV7zmcQOzV1QkP+ImqaDKX7qy7xC\nEpztX3UxGXofxwi7uTfC/iPkSGZt4NxKY72R93Buy+u2fIbybrS4MV3piSD2h4a7\nwPOU46ueTsiV4z1yXtfvSnw=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@wealthassociate-73b2e.iam.gserviceaccount.com",
  client_id: "100459711122157944921",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40wealthassociate-73b2e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/send-notification", async (req, res) => {
  try {
    const { title, message, data } = req.body;

    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Both title and message are required",
      });
    }

    // Get all registered push tokens
    const allTokens = await PushToken.find({});

    if (!allTokens.length) {
      return res.status(200).json({
        success: true,
        message: "No devices registered to receive notifications",
      });
    }

    // Separate Expo and FCM tokens
    const expoMessages = [];
    const fcmMessages = [];

    allTokens.forEach((user) => {
      const notificationData = {
        ...data,
        type: "custom_notification",
        sentAt: new Date().toISOString(),
      };

      if (Expo.isExpoPushToken(user.expoPushToken)) {
        // Expo push notification (iOS and some Android)
        expoMessages.push({
          to: user.expoPushToken,
          sound: "default",
          title,
          body: message,
          data: notificationData,
          ...(user.deviceType === "android" && {
            priority: "high",
            channelId: "default",
          }),
        });
      } else {
        // FCM push notification (Android)
        fcmMessages.push({
          token: user.expoPushToken,
          notification: {
            title,
            body: message,
          },
          data: notificationData,
          android: {
            priority: "high",
            notification: {
              channelId: "default",
              sound: "default",
            },
          },
        });
      }
    });

    // Send Expo notifications
    const expoResults = await sendExpoNotifications(expoMessages);

    // Send FCM notifications
    const fcmResults = await sendFcmNotifications(fcmMessages);

    res.status(200).json({
      success: true,
      message: `Notifications processed for ${allTokens.length} devices`,
      data: {
        title,
        message,
        expoResults,
        fcmResults,
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Helper function for Expo notifications
async function sendExpoNotifications(messages) {
  if (!messages.length) return [];

  const chunks = expo.chunkPushNotifications(messages);
  const results = [];

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      results.push(...receipts);
    } catch (error) {
      console.error("Error sending Expo chunk:", error);
      results.push({ error: error.message });
    }
  }

  return results;
}

// Helper function for FCM notifications
async function sendFcmNotifications(messages) {
  if (!messages.length) return [];

  const results = [];

  for (const message of messages) {
    try {
      const response = await admin.messaging().send(message);
      results.push({
        success: true,
        messageId: response,
      });
    } catch (error) {
      console.error("Error sending FCM:", error);
      results.push({
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}
// Create HTTPS server


// Start HTTPS server on p

// const fs = require('fs');
const googleTTS = require('google-tts-api');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const text = "ప్రియమైన వెల్త్ అసోసియేట్, గుంటూరులో 30,000 రూపాయలకు ఒక అపార్ట్‌మెంట్ అమ్మకానికి ఉంది. మరిన్ని వివరాల కోసం 7796356789 నంబర్‌ను సంప్రదించండి"

// Step 2: Get TTS audio URL
const url = googleTTS.getAudioUrl(text, {
  lang: 'te',
  slow: false,
  host: 'https://translate.google.com',
});

// Step 3: Download and save the mp3
async function downloadMP3() {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync('output.mp3', buffer);
  console.log('✅ MP3 file saved as output.mp3');
}


// downloadMP3();


// const server = app.listen(3000, () => {
//   console.log("HTTP server running on port 3000");
// });
// const io = require("socket.io")(server, { /* cors config */ });



// Initial counts
let stats = {
  agents: 50,
  customers: 200,
  skilledResources: 100,
  investors: 20,
  nris: 10,
};
function incrementStat(key) {
  switch (key) {
    case 'agents':
      stats.agents += Math.floor(Math.random() * 3); // 0-2
      break;
    case 'customers':
      stats.customers += Math.floor(Math.random() * 5); // 0-4
      break;
    case 'skilledResources':
      stats.skilledResources += Math.floor(Math.random() * 2); // 0-1
      break;
    case 'investors':
      stats.investors += Math.floor(Math.random() * 2); // 0-1
      break;
    case 'nris':
      stats.nris += Math.floor(Math.random() * 1); // 0
      break;
  }
}
setInterval(() => incrementStat('agents'), 30 * 60 * 1000);
setInterval(() => incrementStat('customers'), 30 * 60 * 1000);
setInterval(() => incrementStat('skilledResources'), 30 * 60 * 1000);
setInterval(() => incrementStat('investors'), 30 * 60 * 1000);
setInterval(() => incrementStat('nris'), 30 * 60 * 1000);
app.get('/agentscountrandom', (req, res) => {
  res.json({ agents: stats.agents });
});

app.get('/customerscountrandom', (req, res) => {
  res.json({ customers: stats.customers });
});

app.get('/skilledcountrandom', (req, res) => {
  res.json({ skilledResources: stats.skilledResources });
});

app.get('/investorscountrandom', (req, res) => {
  res.json({ investors: stats.investors });
});

app.get('/nriscountrandom', (req, res) => {
  res.json({ nris: stats.nris });
});

const server = app.listen(3000, () => {
  console.log("Backend running on port 3000");
});

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
