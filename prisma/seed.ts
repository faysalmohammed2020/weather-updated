// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  // Non-destructive seed:
  // - No deleteMany() calls
  // - Only inserts missing records (safe for production-like DBs)
  console.log("🛡️ Non-destructive seed (no old data will be deleted)");


  // Seed stations
  const existingStations = await prisma.station.findMany({
    select: { stationId: true },
  });
  const existingStationIds = new Set(existingStations.map((s) => s.stationId));
  const stationsToCreate = stations.filter((s) => !existingStationIds.has(s.stationId));

  if (stationsToCreate.length > 0) {
    await prisma.station.createMany({
      data: stationsToCreate,
      // If a unique constraint exists, this is extra protection; otherwise it is harmless.
      skipDuplicates: true,
    });
  }

  console.log(`📡 Stations: added ${stationsToCreate.length}, already existed ${stations.length - stationsToCreate.length}`);

  const dhakaStation = await prisma.station.findFirst({
    where: { stationId: "41923" },
  });

  if (!dhakaStation) throw new Error("❌ Dhaka station not found!");

  console.log("🏙️ Dhaka station:", dhakaStation.id);


  // Demo users (always seeded)
  console.log("👥 Seeding demo users...");

  const demoUsers = [
    {
      name: "Nayma Baten",
      email: "shuvra.swc@gmail.com",
      role: "super_admin",
      password: "superadmin123",
    },
    {
      name: "Akram",
      email: "akramclimate@gmail.com",
      role: "super_admin",
      password: "superadmin123",
    },
    {
      name: "Rashaduzzaman",
      email: "rashaduzzamanbmd@gmail.com",
      role: "root_admin",
      password: "rootadmin123",
    },
  ];

  for (const demo of demoUsers) {
    const existingUser = await prisma.users.findUnique({
      where: { email: demo.email },
      select: { id: true, email: true, role: true },
    });

    if (existingUser) {
      console.log(`⏭️ User already exists, skipping → ${demo.email} (${existingUser.role ?? "no-role"})`);
      continue;
    }

    const hashed = await bcrypt.hash(demo.password, 10);

    const user = await prisma.users.create({
      data: {
        name: demo.name,
        email: demo.email,
        role: demo.role,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Dhaka",
        stationId: dhakaStation.id,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.accounts.create({
      data: {
        accountId: user.id,
        providerId: "credentials",
        userId: user.id,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`👤 Created user → ${demo.email} (${demo.role})`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
