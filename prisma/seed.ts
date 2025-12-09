// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  console.log("🧹 Clearing existing data...");

  // MUST delete in dependency order
  await prisma.logs.deleteMany();
  await prisma.twoFactor.deleteMany();
  await prisma.verifications.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.accounts.deleteMany();

  await prisma.agroclimatologicalData.deleteMany();
  await prisma.soilMoistureData.deleteMany();
  await prisma.sunshineData.deleteMany();

  await prisma.synopticCode.deleteMany();
  await prisma.meteorologicalEntry.deleteMany();
  await prisma.weatherObservation.deleteMany();
  await prisma.dailySummary.deleteMany();

  await prisma.observingTime.deleteMany();

  await prisma.users.deleteMany();
  await prisma.station.deleteMany();

  console.log("✅ All old data cleared");


  // Seed stations
  await prisma.station.createMany({
    data: stations,
    skipDuplicates: true,
  });

  console.log(`📡 Seeded ${stations.length} stations`);

  const dhakaStation = await prisma.station.findFirst({
    where: { stationId: "41923" },
  });

  if (!dhakaStation) throw new Error("❌ Dhaka station not found!");

  console.log("🏙️ Dhaka station:", dhakaStation.id);


  // Demo users
  const demoUsers = [
    {
      name: "Super Admin",
      email: "superadmin@example.com",
      role: "super_admin",
      password: "superadmin123",
    },
    {
      name: "Dhaka Station Admin",
      email: "stationadmin@example.com",
      role: "station_admin",
      password: "stationadmin123",
    },
    {
      name: "Observer",
      email: "observer@example.com",
      role: "observer",
      password: "observer123",
    },
  ];

  for (const demo of demoUsers) {
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
