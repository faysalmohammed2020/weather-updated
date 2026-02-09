// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import { observerUserSeeds } from "../data/observer-users";
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

  // Station users (one per station)
  console.log("🏢 Seeding station users...");

  const stationUserSeeds = [
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Amin",
      email: "amin.07@gmail.com",
      role: "station_admin",
      password: "stationad123",
    },
    {
      stationName: "Rajarhat",
      stationId: "41856",
      name: "Subal Chandra Sarker",
      email: "agrometrajarhat@gmail.com",
      role: "station_admin",
      password: "stationad124",
    },
    {
      stationName: "Tetulia",
      stationId: "41850",
      name: "Jitendranath Roy",
      email: "jitendronathroy58@gmail.com",
      role: "station_admin",
      password: "stationad125",
    },
    {
      stationName: "Comilla",
      stationId: "41933",
      name: "SYED ARIFUR RAHMAN",
      email: "arifurzahed78@gmail.com",
      role: "station_admin",
      password: "stationad126",
    },
    {
      stationName: "Patuakhali",
      stationId: "41960",
      name: "Mahabuba Sukhi",
      email: "mahabubasukhi@gmail.com",
      role: "station_admin",
      password: "stationad127",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Mohammad Giasuddin",
      email: "met.giasuddin@gmail.com",
      role: "station_admin",
      password: "stationad128",
    },
    {
      stationName: "Rangpur",
      stationId: "41859",
      name: "Md. Mostafizar Rahman",
      email: "mostafiz.bmd16@gmail.com",
      role: "station_admin",
      password: "stationad129",
    },
    {
      stationName: "Madaripur",
      stationId: "41939",
      name: "Md.Moniruzzaman",
      email: "moniruzzaman8129@gmail.com",
      role: "station_admin",
      password: "stationad130",
    },
    {
      stationName: "Mymensingh",
      stationId: "41886",
      name: "Mohammad Anwar Hossain",
      email: "anwarbmd1@gmail.com",
      role: "station_admin",
      password: "stationad131",
    },
    {
      stationName: "Teknaf",
      stationId: "41998",
      name: "Khandakar Shafiul Alam",
      email: "shafiul246@gmail.com",
      role: "station_admin",
      password: "stationad132",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Mohammad Amir Hossain",
      email: "amir.bmd24@gmail.com",
      role: "station_admin",
      password: "stationad133",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Hasna Banu",
      email: "hasnabanu92bmd@gmail.com",
      role: "station_admin",
      password: "stationad134",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Md.Shahidul Islalm",
      email: "shahidulbmd91@gmail.com",
      role: "station_admin",
      password: "stationad135",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Rumana Amin",
      email: "rumana.amin.07@gmail.com",
      role: "station_admin",
      password: "stationad136",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Ronjon Kumar Kundu",
      email: "ronjon.phy85@gmail.com",
      role: "station_admin",
      password: "stationad137",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Fahmida Haris",
      email: "fahmidaharis.office@gmail.com",
      role: "station_admin",
      password: "stationad138",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "israt jahan joarder",
      email: "israt.emu@outlook.com",
      role: "station_admin",
      password: "stationad139",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Mst Nahar Banu",
      email: "mnaharbanu1987@gmail.com",
      role: "station_admin",
      password: "stationad140",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "most sarmin akter",
      email: "sarminaktersima13@gmail.com",
      role: "station_admin",
      password: "stationad141",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "tahmina akter sheuli",
      email: "tahmina82bmd@gmail.com",
      role: "station_admin",
      password: "stationad142",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Shahanara Akter",
      email: "shahanara.bmd@gmail.com",
      role: "station_admin",
      password: "stationad143",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Md .Mazibor Rahman",
      email: "mr_bmd@yahoo.com",
      role: "station_admin",
      password: "stationad144",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Lipika Biswas",
      email: "lipi251083@gmail.com",
      role: "station_admin",
      password: "stationad145",
    },
    {
      stationName: "Narayanganj",
      stationId: "41925",
      name: "Md Humayun Kabir",
      email: "humayunkabirbmd@gmail.com",
      role: "station_admin",
      password: "stationad146",
    },
    {
      stationName: "Dimla",
      stationId: "41851",
      name: "Md. Abdus Sabur Mia",
      email: "saburmia2320@gmail.com",
      role: "station_admin",
      password: "stationad147",
    },
    {
      stationName: "Srimangal",
      stationId: "41915",
      name: "Md. Anisur Rahman",
      email: "anismet2013@gmail.com",
      role: "station_admin",
      password: "stationad148",
    },
    {
      stationName: "Rajarhat",
      stationId: "41856",
      name: "Subal Chandra Sarker",
      email: "agrometrajarhat@gmail,com",
      role: "station_admin",
      password: "stationad149",
    },
    {
      stationName: "Tarash",
      stationId: "41897",
      name: "Md. Zahedul Islam",
      email: "agmet.tarash.bmd@gmail.com",
      role: "station_admin",
      password: "stationad150",
    },
    {
      stationName: "Mongla",
      stationId: "41958",
      name: "Md.Harun-or-Rashid",
      email: "metm4665@gmail.com",
      role: "station_admin",
      password: "stationad151",
    },
    {
      stationName: "Dinajpur",
      stationId: "41863",
      name: "Md.Tofazzal Hossain",
      email: "tzlbmd@gmail.com",
      role: "station_admin",
      password: "stationad152",
    },
    {
      stationName: "Chuadanga",
      stationId: "41926",
      name: "Md. Jaminur Rahman",
      email: "jaminur.math13@gmail.com",
      role: "station_admin",
      password: "stationad153",
    },
    {
      stationName: "Jessore",
      stationId: "41936",
      name: "Md Kuddus Halder",
      email: "moon13may@gmail.com",
      role: "station_admin",
      password: "stationad154",
    },
    {
      stationName: "Netrokona",
      stationId: "41888",
      name: "Md.Mamun",
      email: "mamun.metasst@gmail.com",
      role: "station_admin",
      password: "stationad155",
    },
    {
      stationName: "Narsingdi",
      stationId: "41924",
      name: "Humayun Kabir Talukder",
      email: "hkt141187@gmail.com",
      role: "station_admin",
      password: "stationad156",
    },
    {
      stationName: "Gopalganj",
      stationId: "41938",
      name: "Abu sufian",
      email: "amogbmd@gmail.com",
      role: "station_admin",
      password: "stationad157",
    },
    {
      stationName: "Nikli",
      stationId: "41902",
      name: "Md Jahedul Islam Masum",
      email: "fco.nikli.bmd@gmail.com",
      role: "station_admin",
      password: "stationad158",
    },
    {
      stationName: "Barisal",
      stationId: "41950",
      name: "MD ABU JAFAR",
      email: "abujafar4u@gmail.com",
      role: "station_admin",
      password: "stationad159",
    },
    {
      stationName: "Kumarkhali",
      stationId: "41927",
      name: "Md. Mamun Ar Rashid",
      email: "kumarkhalibmd@gmail.com",
      role: "station_admin",
      password: "stationad160",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Md. Ashraful Alam",
      email: "a.alam2006@gmail.com",
      role: "station_admin",
      password: "stationad161",
    },
    {
      stationName: "Ashuganj_Brahmanbaria",
      stationId: "41916",
      name: "Anwar hossain",
      email: "asugonjbmd41916@gmail.com",
      role: "station_admin",
      password: "stationad162",
    },
    {
      stationName: "Faridpur",
      stationId: "41929",
      name: "Md.Samadul Haque",
      email: "weatherofficefaridpur@gmail.com",
      role: "station_admin",
      password: "stationad163",
    },
    {
      stationName: "Ramgati_Lakshmipur",
      stationId: "41961",
      name: "Md.Shohrab hossain",
      email: "ramgatibmd@gmail.com",
      role: "station_admin",
      password: "stationad164",
    },
    {
      stationName: "Teknaf",
      stationId: "41998",
      name: "Khandakar Shafiul Alam",
      email: "teknaf41998@gmail.com",
      role: "station_admin",
      password: "stationad165",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Muhammad Faruque Iqbal Bhuiyan",
      email: "fibhuiyan@yahoo.com",
      role: "station_admin",
      password: "stationad166",
    },
    {
      stationName: "Coxs_Bazar",
      stationId: "41992",
      name: "Cox's Station Admin",
      email: "coxadmin@gmail.com",
      role: "station_admin",
      password: "stationad167",
    },
    {
      stationName: "Dhaka",
      stationId: "41923",
      name: "Dhaka Station Admin",
      email: "dhakastation@gmail.com",
      role: "station_admin",
      password: "stationad168",
    }
  ];

  const stationSeedIds = stationUserSeeds.map((seed) => seed.stationId);
  const stationSeedRecords = await prisma.station.findMany({
    where: { stationId: { in: stationSeedIds } },
  });
  const stationByStationId = new Map(
    stationSeedRecords.map((station) => [station.stationId, station])
  );

  for (const seed of stationUserSeeds) {
    const station = stationByStationId.get(seed.stationId);
    if (!station) {
      throw new Error(
        `❌ Station not found for seed user: ${seed.stationName} (${seed.stationId})`
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: seed.email },
      select: { id: true, email: true, role: true },
    });

    if (existingUser) {
      console.log(
        `⏭️ User already exists, skipping → ${seed.email} (${existingUser.role ?? "no-role"})`
      );
      continue;
    }

    const hashed = await bcrypt.hash(seed.password, 10);

    const user = await prisma.users.create({
      data: {
        name: seed.name,
        email: seed.email,
        role: seed.role,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        division: seed.stationName,
        district: seed.stationName,
        upazila: seed.stationName,
        stationId: station.id,
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

    console.log(
      `👤 Created station user → ${seed.email} (${seed.role}) [${seed.stationName}]`
    );
  }

  // Observer users (from observer list.xlsx)
  console.log("🧭 Seeding observer users...");

  const observerStationAliases: Record<string, string> = {
    Bogura: "Bogra",
    Chattogram: "Chittagong",
    Hizla_Barishal: "Hijla_Barishal",
    "Maijdee Court": "M.Court",
    Saidpur: "Sayedpur",
    Sreemangal: "Srimangal",
  };

  const normalizeObserverStationName = (stationName: string) =>
    observerStationAliases[stationName] ?? stationName;

  const observerStationNames = Array.from(
    new Set(
      observerUserSeeds.map((seed) =>
        normalizeObserverStationName(seed.stationName)
      )
    )
  );

  const observerStationRecords = await prisma.station.findMany({
    where: { name: { in: observerStationNames } },
  });
  const observerStationByName = new Map(
    observerStationRecords.map((station) => [station.name, station])
  );

  for (const seed of observerUserSeeds) {
    const normalizedStationName = normalizeObserverStationName(seed.stationName);
    const station = observerStationByName.get(normalizedStationName);

    if (!station) {
      throw new Error(
        `❌ Station not found for observer seed user: ${seed.stationName} (normalized: ${normalizedStationName})`
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: seed.email },
      select: { id: true, email: true, role: true },
    });

    if (existingUser) {
      console.log(
        `⏭️ Observer already exists, skipping → ${seed.email} (${existingUser.role ?? "no-role"})`
      );
      continue;
    }

    const hashed = await bcrypt.hash(seed.password, 10);

    const user = await prisma.users.create({
      data: {
        name: seed.name,
        email: seed.email,
        role: seed.role,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        division: normalizedStationName,
        district: normalizedStationName,
        upazila: normalizedStationName,
        stationId: station.id,
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

    console.log(
      `👁️ Created observer user → ${seed.email} (${seed.role}) [${normalizedStationName}]`
    );
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
