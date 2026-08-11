import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGODB_URI;
const adminPassword = process.env.ADMIN_PASSWORD || "wwe2k191";
const sessions = new Map();
const dataFile = join(__dirname, "data.json");
const client = mongoUri ? new MongoClient(mongoUri) : null;
let db;
let localState = {
  users: [],
  couriers: [],
  shipments: []
};

const nigeriaStates = [
  { state: "Abia", capital: "Umuahia" },
  { state: "Adamawa", capital: "Yola" },
  { state: "Akwa Ibom", capital: "Uyo" },
  { state: "Anambra", capital: "Awka" },
  { state: "Bauchi", capital: "Bauchi" },
  { state: "Bayelsa", capital: "Yenagoa" },
  { state: "Benue", capital: "Makurdi" },
  { state: "Borno", capital: "Maiduguri" },
  { state: "Cross River", capital: "Calabar" },
  { state: "Delta", capital: "Asaba" },
  { state: "Ebonyi", capital: "Abakaliki" },
  { state: "Edo", capital: "Benin City" },
  { state: "Ekiti", capital: "Ado Ekiti" },
  { state: "Enugu", capital: "Enugu" },
  { state: "FCT", capital: "Abuja" },
  { state: "Gombe", capital: "Gombe" },
  { state: "Imo", capital: "Owerri" },
  { state: "Jigawa", capital: "Dutse" },
  { state: "Kaduna", capital: "Kaduna" },
  { state: "Kano", capital: "Kano" },
  { state: "Katsina", capital: "Katsina" },
  { state: "Kebbi", capital: "Birnin Kebbi" },
  { state: "Kogi", capital: "Lokoja" },
  { state: "Kwara", capital: "Ilorin" },
  { state: "Lagos", capital: "Ikeja" },
  { state: "Nasarawa", capital: "Lafia" },
  { state: "Niger", capital: "Minna" },
  { state: "Ogun", capital: "Abeokuta" },
  { state: "Ondo", capital: "Akure" },
  { state: "Osun", capital: "Osogbo" },
  { state: "Oyo", capital: "Ibadan" },
  { state: "Plateau", capital: "Jos" },
  { state: "Rivers", capital: "Port Harcourt" },
  { state: "Sokoto", capital: "Sokoto" },
  { state: "Taraba", capital: "Jalingo" },
  { state: "Yobe", capital: "Damaturu" },
  { state: "Zamfara", capital: "Gusau" }
];

const seedData = {
  couriers: [
    {
      id: "CR-1001",
      name: "Maya Johnson",
      phone: "+234 801 111 2222",
      vehicle: "Motorbike",
      area: "Victoria Island",
      serviceState: "Lagos",
      serviceCapital: "Ikeja",
      profilePhoto: "",
      driversLicense: "DL-1001001",
      plateNumber: "LAG-482QX",
      status: "approved",
      createdAt: new Date()
    },
    {
      id: "CR-1002",
      name: "Tunde Salami",
      phone: "+234 802 333 4444",
      vehicle: "Van",
      area: "Ikeja",
      serviceState: "Lagos",
      serviceCapital: "Ikeja",
      profilePhoto: "",
      driversLicense: "DL-1001002",
      plateNumber: "LAG-904KT",
      status: "pending",
      createdAt: new Date()
    }
  ],
  shipments: [
    {
      id: "SL-483921",
      customerName: "Grace Hart",
      pickup: "25 Marina Street",
      dropoff: "7 Allen Avenue",
      deliveryState: "Lagos",
      deliveryCapital: "Ikeja",
      packageType: "Documents",
      notes: "Call on arrival",
      status: "Awaiting courier",
      courierId: null,
      createdAt: new Date()
    }
  ]
};

app.use(express.json());
app.use(express.static(__dirname));

function code(prefix) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function stateDetails(name) {
  const normalized = cleanText(name).toLowerCase();
  const details = nigeriaStates.find((item) => item.state.toLowerCase() === normalized);
  if (!details) {
    const error = new Error("Choose a valid Nigerian state.");
    error.status = 400;
    throw error;
  }

  return details;
}

function safeStateDetails(name) {
  try {
    return stateDetails(name || "Lagos");
  } catch (error) {
    return stateDetails("Lagos");
  }
}

function courierServiceState(courier) {
  return safeStateDetails(courier?.serviceState || courier?.state || "Lagos").state;
}

function shipmentDeliveryState(shipment) {
  return safeStateDetails(shipment?.deliveryState || shipment?.state || "Lagos").state;
}

function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, hash] = String(storedPassword || "").split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || ""
  };
}

function publicAdminUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    createdAt: user.createdAt
  };
}

function demoCourierEmail(courier) {
  const slug = cleanText(courier.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug || courier.id.toLowerCase()}@swiftlink.local`;
}

async function saveLocalState() {
  if (db) return;
  try {
    await writeFile(dataFile, JSON.stringify(localState, null, 2));
  } catch (error) {
    console.warn(`Could not save ${dataFile}; using in-memory data for this run.`);
  }
}

function matchesQuery(item, query = {}) {
  return Object.entries(query).every(([key, value]) => item[key] === value);
}

function applyProjection(item, projection) {
  if (!item) return null;
  const copy = { ...item };
  if (projection?._id === 0) {
    delete copy._id;
  }
  return copy;
}

function localCollection(name) {
  return {
    async findOne(query) {
      return localState[name].find((item) => matchesQuery(item, query)) || null;
    },
    async countDocuments() {
      return localState[name].length;
    },
    async insertOne(document) {
      localState[name].push({ ...document });
      await saveLocalState();
      return { acknowledged: true };
    },
    async insertMany(documents) {
      localState[name].push(...documents.map((document) => ({ ...document })));
      await saveLocalState();
      return { acknowledged: true };
    },
    async findOneAndUpdate(query, update, options = {}) {
      const item = localState[name].find((entry) => matchesQuery(entry, query));
      if (!item) return null;
      Object.assign(item, update?.$set || {});
      await saveLocalState();
      return applyProjection(item, options.projection);
    },
    async deleteOne(query) {
      const index = localState[name].findIndex((entry) => matchesQuery(entry, query));
      if (index === -1) return { deletedCount: 0 };
      localState[name].splice(index, 1);
      await saveLocalState();
      return { deletedCount: 1 };
    },
    async deleteMany(query) {
      const before = localState[name].length;
      localState[name] = localState[name].filter((entry) => !matchesQuery(entry, query));
      await saveLocalState();
      return { deletedCount: before - localState[name].length };
    },
    find() {
      return {
        sort(sortSpec = {}) {
          const [[field, direction] = ["createdAt", -1]] = Object.entries(sortSpec);
          const sorted = [...localState[name]].sort((a, b) => {
            const left = new Date(a[field] ?? 0).getTime();
            const right = new Date(b[field] ?? 0).getTime();
            return direction < 0 ? right - left : left - right;
          });

          return {
            async toArray() {
              return sorted.map((item) => applyProjection(item, { _id: 0 }));
            }
          };
        }
      };
    },
    async createIndex() {
      return null;
    }
  };
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !cleanText(body[field]));
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

function requireAuth(req, res, next) {
  const token = req.header("x-auth-token");
  const user = sessions.get(token);

  if (!user) {
    return res.status(401).json({ message: "Please log in first." });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "This account does not have access." });
    }

    next();
  };
}

async function collections() {
  if (!db) {
    return {
      users: localCollection("users"),
      couriers: localCollection("couriers"),
      shipments: localCollection("shipments")
    };
  }

  return {
    users: db.collection("users"),
    couriers: db.collection("couriers"),
    shipments: db.collection("shipments")
  };
}

async function findCourierForUser(couriers, user, extraQuery = {}) {
  const byUserId = await couriers.findOne({ userId: user.id, ...extraQuery });
  if (byUserId) return byUserId;

  if (!cleanText(user.phone)) return null;
  return couriers.findOne({ phone: cleanText(user.phone), ...extraQuery });
}

function courierForState(courier, role) {
  const copy = { ...courier };
  const location = safeStateDetails(copy.serviceState || copy.state || "Lagos");
  copy.serviceState = location.state;
  copy.serviceCapital = copy.serviceCapital || location.capital;
  delete copy._id;

  if (role !== "admin") {
    delete copy.profilePhoto;
    delete copy.driversLicense;
    delete copy.plateNumber;
  }

  return copy;
}

const completionReviewMs = 60 * 60 * 1000;

function shipmentForState(shipment) {
  const copy = { ...shipment };
  const location = safeStateDetails(copy.deliveryState || copy.state || "Lagos");
  copy.deliveryState = location.state;
  copy.deliveryCapital = copy.deliveryCapital || location.capital;
  delete copy._id;
  return copy;
}

async function autoCompleteExpiredShipments() {
  const { shipments } = await collections();
  const shipmentList = await shipments.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  const now = Date.now();
  const expired = shipmentList.filter(
    (shipment) =>
      shipment.status === "Pending customer confirmation" &&
      shipment.customerReviewDeadline &&
      new Date(shipment.customerReviewDeadline).getTime() <= now
  );

  await Promise.all(
    expired.map((shipment) =>
      shipments.findOneAndUpdate(
        { id: shipment.id, status: "Pending customer confirmation" },
        { $set: { status: "Delivered", completedAt: new Date(), autoCompletedAt: new Date() } },
        { returnDocument: "after", projection: { _id: 0 } }
      )
    )
  );
}

async function readState(user) {
  await autoCompleteExpiredShipments();
  const { users, couriers, shipments } = await collections();
  const [userList, courierList, shipmentList] = await Promise.all([
    user.role === "admin" ? users.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : [],
    couriers.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
    shipments.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
  ]);
  const visibleShipments =
    user.role === "customer" ? shipmentList.filter((shipment) => shipment.customerId === user.id) : shipmentList;

  return {
    users: user.role === "admin" ? userList.map(publicAdminUser) : [],
    couriers: courierList.map((courier) => courierForState(courier, user.role)),
    shipments: visibleShipments.map(shipmentForState)
  };
}

async function seedIfEmpty() {
  const { users, couriers, shipments } = await collections();
  const [adminUser, courierCount, shipmentCount] = await Promise.all([
    users.findOne({ role: "admin" }),
    couriers.countDocuments(),
    shipments.countDocuments()
  ]);

  if (!adminUser) {
    await users.insertOne({
      id: "USR-ADMIN",
      name: "Admin",
      email: "admin@swiftlink.local",
      role: "admin",
      passwordHash: hashPassword(adminPassword),
      createdAt: new Date()
    });
  }

  if (courierCount === 0) {
    await couriers.insertMany(seedData.couriers);
  }

  if (shipmentCount === 0) {
    await shipments.insertMany(seedData.shipments);
  }
}

async function ensureDemoCourierLogins() {
  const { users, couriers } = await collections();
  const courierList = await couriers.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  const demoCouriers = courierList.filter((courier) => !courier.userId && courier.status === "approved");

  await Promise.all(
    demoCouriers.map(async (courier) => {
      const email = demoCourierEmail(courier);
      let user = await users.findOne({ email });

      if (!user) {
        user = {
          id: `USR-${courier.id}`,
          name: courier.name,
          email,
          role: "courier",
          phone: courier.phone,
          passwordHash: hashPassword(adminPassword),
          createdAt: new Date()
        };
        await users.insertOne(user);
      }

      await couriers.findOneAndUpdate(
        { id: courier.id },
        { $set: { userId: user.id, serviceState: courierServiceState(courier), serviceCapital: safeStateDetails(courierServiceState(courier)).capital } },
        { returnDocument: "after", projection: { _id: 0 } }
      );
    })
  );
}

async function loadLocalState() {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    localState = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      couriers: Array.isArray(parsed.couriers) ? parsed.couriers : [],
      shipments: Array.isArray(parsed.shipments) ? parsed.shipments : []
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not read ${dataFile}; starting with fresh demo data.`);
    }
  }
}

app.post("/api/signup", async (req, res, next) => {
  try {
    const role = cleanText(req.body.role);
    if (!["customer", "courier"].includes(role)) {
      return res.status(400).json({ message: "Choose customer or courier." });
    }

    requireFields(req.body, ["name", "email", "password"]);

    let serviceLocation;
    if (role === "courier") {
      requireFields(req.body, ["phone", "serviceState", "area", "profilePhoto", "driversLicense", "plateNumber"]);
      serviceLocation = stateDetails(req.body.serviceState);
    }

    const { users, couriers } = await collections();
    const email = normalizeEmail(req.body.email);
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    if (role === "courier") {
      const phone = cleanText(req.body.phone);
      const plateNumber = cleanText(req.body.plateNumber).toUpperCase();
      const [existingPhone, existingPlate] = await Promise.all([
        couriers.findOne({ phone }),
        couriers.findOne({ plateNumber })
      ]);

      if (existingPhone) {
        return res.status(409).json({ message: "A courier with this phone number already exists." });
      }

      if (existingPlate) {
        return res.status(409).json({ message: "A courier with this plate number already exists." });
      }
    }

    const user = {
      id: code("USR"),
      name: cleanText(req.body.name),
      email,
      role,
      phone: cleanText(req.body.phone),
      passwordHash: hashPassword(cleanText(req.body.password)),
      createdAt: new Date()
    };

    await users.insertOne(user);

    if (role === "courier") {
      await couriers.insertOne({
        id: code("CR"),
        userId: user.id,
        name: user.name,
        phone: user.phone,
        vehicle: cleanText(req.body.vehicle) || "Motorbike",
        area: cleanText(req.body.area),
        serviceState: serviceLocation.state,
        serviceCapital: serviceLocation.capital,
        profilePhoto: cleanText(req.body.profilePhoto),
        driversLicense: cleanText(req.body.driversLicense),
        plateNumber: cleanText(req.body.plateNumber).toUpperCase(),
        status: "pending",
        createdAt: new Date()
      });
    }

    const token = randomUUID();
    sessions.set(token, publicUser(user));
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    requireFields(req.body, ["email", "password"]);

    const { users } = await collections();
    const user = await users.findOne({ email: normalizeEmail(req.body.email) });
    if (!user || !verifyPassword(cleanText(req.body.password), user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = randomUUID();
    sessions.set(token, publicUser(user));
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/logout", requireAuth, async (req, res) => {
  sessions.delete(req.header("x-auth-token"));
  res.json({ ok: true });
});

app.get("/api/state", requireAuth, async (req, res, next) => {
  try {
    res.json(await readState(req.user));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { users, couriers } = await collections();
    const user = await users.findOne({ id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot be deleted here." });
    }

    await users.deleteOne({ id: user.id });

    if (user.role === "courier") {
      await couriers.deleteMany({ userId: user.id });
      if (cleanText(user.phone)) {
        await couriers.deleteMany({ phone: cleanText(user.phone) });
      }
    }

    for (const [token, sessionUser] of sessions.entries()) {
      if (sessionUser.id === user.id) {
        sessions.delete(token);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/shipments", requireAuth, requireRole("customer", "admin"), async (req, res, next) => {
  try {
    requireFields(req.body, ["customerName", "pickup", "dropoff", "deliveryState"]);
    const deliveryLocation = stateDetails(req.body.deliveryState);

    const shipment = {
      id: code("SL"),
      customerId: req.user.id,
      customerName: cleanText(req.body.customerName) || req.user.name,
      pickup: cleanText(req.body.pickup),
      dropoff: cleanText(req.body.dropoff),
      deliveryState: deliveryLocation.state,
      deliveryCapital: deliveryLocation.capital,
      packageType: cleanText(req.body.packageType) || "Parcel",
      notes: cleanText(req.body.notes),
      status: "Awaiting courier",
      courierId: null,
      createdAt: new Date()
    };

    const { shipments } = await collections();
    await shipments.insertOne(shipment);
    res.status(201).json({ shipment });
  } catch (error) {
    next(error);
  }
});

app.post("/api/couriers", requireAuth, requireRole("courier", "admin"), async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "phone", "serviceState", "area", "profilePhoto", "driversLicense", "plateNumber"]);
    const serviceLocation = stateDetails(req.body.serviceState);

    const courier = {
      id: code("CR"),
      userId: req.user.id,
      name: cleanText(req.body.name),
      phone: cleanText(req.body.phone),
      vehicle: cleanText(req.body.vehicle) || "Motorbike",
      area: cleanText(req.body.area),
      serviceState: serviceLocation.state,
      serviceCapital: serviceLocation.capital,
      profilePhoto: cleanText(req.body.profilePhoto),
      driversLicense: cleanText(req.body.driversLicense),
      plateNumber: cleanText(req.body.plateNumber).toUpperCase(),
      status: "pending",
      createdAt: new Date()
    };

    const { couriers } = await collections();
    const existingUserCourier = await couriers.findOne({ userId: req.user.id });
    if (existingUserCourier) {
      return res.status(409).json({ message: "This account already has a courier registration." });
    }

    const existingPhone = await couriers.findOne({ phone: courier.phone });
    if (existingPhone) {
      return res.status(409).json({ message: "A courier with this phone number already exists." });
    }

    const existingPlate = await couriers.findOne({ plateNumber: courier.plateNumber });
    if (existingPlate) {
      return res.status(409).json({ message: "A courier with this plate number already exists." });
    }

    await couriers.insertOne(courier);
    res.status(201).json({ courier });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/couriers/me/location", requireAuth, requireRole("courier"), async (req, res, next) => {
  try {
    const serviceLocation = stateDetails(req.body.serviceState);
    const { couriers } = await collections();
    const courier = await findCourierForUser(couriers, req.user);

    if (!courier) {
      return res.status(404).json({ message: "Courier registration not found." });
    }

    const result = await couriers.findOneAndUpdate(
      { id: courier.id },
      { $set: { serviceState: serviceLocation.state, serviceCapital: serviceLocation.capital, locationUpdatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    if (!result) {
      return res.status(404).json({ message: "Courier registration not found." });
    }

    res.json({ courier: result });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/couriers/:id/status", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const status = cleanText(req.body.status);
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid courier status." });
    }

    const { couriers } = await collections();
    const result = await couriers.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, reviewedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    if (!result) {
      return res.status(404).json({ message: "Courier not found." });
    }

    res.json({ courier: result });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/shipments/:id/claim", requireAuth, requireRole("courier"), async (req, res, next) => {
  try {
    const { couriers, shipments } = await collections();
    const courier = await findCourierForUser(couriers, req.user, { status: "approved" });
    const shipment = await shipments.findOne({ id: req.params.id });

    if (!courier) {
      return res.status(401).json({ message: "Only approved couriers can take deliveries." });
    }

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    if (shipment.courierId || shipment.status !== "Awaiting courier") {
      return res.status(409).json({ message: "This delivery has already been taken." });
    }

    if (courierServiceState(courier) !== shipmentDeliveryState(shipment)) {
      return res.status(400).json({ message: "This delivery is outside your active state." });
    }

    const result = await shipments.findOneAndUpdate(
      { id: req.params.id, courierId: null, status: "Awaiting courier" },
      { $set: { courierId: courier.id, status: "Out for delivery", claimedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    if (!result) {
      return res.status(409).json({ message: "This delivery has already been taken." });
    }

    res.json({ shipment: result });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/shipments/:id/deliver", requireAuth, requireRole("courier"), async (req, res, next) => {
  try {
    const { couriers, shipments } = await collections();
    const shipment = await shipments.findOne({ id: req.params.id });
    const courier = await findCourierForUser(couriers, req.user, { id: shipment?.courierId, status: "approved" });

    if (!shipment || !courier) {
      return res.status(401).json({ message: "This delivery is not assigned to your approved courier account." });
    }

    if (shipment.status === "Delivered") {
      return res.status(409).json({ message: "This delivery is already complete." });
    }

    if (shipment.status === "Pending customer confirmation") {
      return res.status(409).json({ message: "This delivery is already waiting for customer confirmation." });
    }

    const result = await shipments.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          status: "Pending customer confirmation",
          deliveredAt: new Date(),
          customerReviewDeadline: new Date(Date.now() + completionReviewMs)
        }
      },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    res.json({ shipment: result });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/shipments/:id/confirm", requireAuth, requireRole("customer"), async (req, res, next) => {
  try {
    await autoCompleteExpiredShipments();
    const { shipments } = await collections();
    const shipment = await shipments.findOne({ id: req.params.id, customerId: req.user.id });

    if (!shipment) {
      return res.status(404).json({ message: "Delivery not found." });
    }

    if (shipment.status !== "Pending customer confirmation") {
      return res.status(409).json({ message: "This delivery is not waiting for confirmation." });
    }

    const result = await shipments.findOneAndUpdate(
      { id: req.params.id, customerId: req.user.id, status: "Pending customer confirmation" },
      { $set: { status: "Delivered", confirmedAt: new Date(), completedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    res.json({ shipment: result });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/shipments/:id/query", requireAuth, requireRole("customer"), async (req, res, next) => {
  try {
    await autoCompleteExpiredShipments();
    requireFields(req.body, ["query"]);
    const { shipments } = await collections();
    const shipment = await shipments.findOne({ id: req.params.id, customerId: req.user.id });

    if (!shipment) {
      return res.status(404).json({ message: "Delivery not found." });
    }

    if (shipment.status !== "Pending customer confirmation") {
      return res.status(409).json({ message: "This delivery is not waiting for confirmation." });
    }

    const result = await shipments.findOneAndUpdate(
      { id: req.params.id, customerId: req.user.id, status: "Pending customer confirmation" },
      {
        $set: {
          status: "Under investigation",
          queryText: cleanText(req.body.query),
          queriedAt: new Date()
        }
      },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    res.json({ shipment: result });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ message: error.message || "Server error" });
});

if (!client) {
  throw new Error("MONGODB_URI must be set. SwiftLink Courier stores all app data in MongoDB.");
}

await client.connect();
db = client.db("swiftlink_courier");

await Promise.all([
  (await collections()).couriers.createIndex({ id: 1 }, { unique: true }),
  (await collections()).couriers.createIndex({ phone: 1 }, { unique: true }),
  (await collections()).couriers.createIndex({ plateNumber: 1 }, { unique: true, sparse: true }),
  (await collections()).shipments.createIndex({ id: 1 }, { unique: true }),
  (await collections()).users.createIndex({ email: 1 }, { unique: true })
]);
await seedIfEmpty();
await ensureDemoCourierLogins();

app.listen(port, () => {
  console.log(`SwiftLink Courier running at http://localhost:${port}`);
});
