-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" INTEGER,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT,
    "backupCodes" TEXT,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "targetId" TEXT,
    "actorEmail" TEXT,
    "targetEmail" TEXT,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionText" TEXT,
    "module" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "securityCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservingTime" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "utcTime" TIMESTAMP(3) NOT NULL,
    "localTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservingTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeteorologicalEntry" (
    "id" TEXT NOT NULL,
    "observingTimeId" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "subIndicator" TEXT NOT NULL,
    "alteredThermometer" TEXT NOT NULL,
    "barAsRead" TEXT NOT NULL,
    "correctedForIndex" TEXT NOT NULL,
    "heightDifference" TEXT NOT NULL,
    "correctionForTemp" TEXT NOT NULL,
    "stationLevelPressure" TEXT NOT NULL,
    "seaLevelReduction" TEXT NOT NULL,
    "correctedSeaLevelPressure" TEXT NOT NULL,
    "afternoonReading" TEXT NOT NULL,
    "pressureChange24h" TEXT NOT NULL,
    "dryBulbAsRead" TEXT NOT NULL,
    "wetBulbAsRead" TEXT NOT NULL,
    "maxMinTempAsRead" TEXT NOT NULL,
    "dryBulbCorrected" TEXT NOT NULL,
    "wetBulbCorrected" TEXT NOT NULL,
    "maxMinTempCorrected" TEXT NOT NULL,
    "Td" TEXT NOT NULL,
    "relativeHumidity" TEXT NOT NULL,
    "squallConfirmed" TEXT NOT NULL,
    "squallForce" TEXT NOT NULL,
    "squallDirection" TEXT NOT NULL,
    "squallTime" TEXT NOT NULL,
    "horizontalVisibility" TEXT NOT NULL,
    "miscMeteors" TEXT NOT NULL,
    "pastWeatherW1" TEXT NOT NULL,
    "pastWeatherW2" TEXT NOT NULL,
    "presentWeatherWW" TEXT NOT NULL,
    "c2Indicator" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeteorologicalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherObservation" (
    "id" TEXT NOT NULL,
    "tabActive" TEXT NOT NULL,
    "cardIndicator" TEXT,
    "observingTimeId" TEXT NOT NULL,
    "lowCloudForm" TEXT,
    "lowCloudHeight" TEXT,
    "lowCloudAmount" TEXT,
    "lowCloudDirection" TEXT,
    "mediumCloudForm" TEXT,
    "mediumCloudHeight" TEXT,
    "mediumCloudAmount" TEXT,
    "mediumCloudDirection" TEXT,
    "highCloudForm" TEXT,
    "highCloudHeight" TEXT,
    "highCloudAmount" TEXT,
    "highCloudDirection" TEXT,
    "totalCloudAmount" TEXT,
    "layer1Form" TEXT,
    "layer1Height" TEXT,
    "layer1Amount" TEXT,
    "layer2Form" TEXT,
    "layer2Height" TEXT,
    "layer2Amount" TEXT,
    "layer3Form" TEXT,
    "layer3Height" TEXT,
    "layer3Amount" TEXT,
    "layer4Form" TEXT,
    "layer4Height" TEXT,
    "layer4Amount" TEXT,
    "rainfallTimeStart" TIMESTAMP(3),
    "rainfallTimeEnd" TIMESTAMP(3),
    "rainfallSincePrevious" TEXT,
    "rainfallDuringPrevious" TEXT,
    "rainfallLast24Hours" TEXT,
    "isIntermittentRain" BOOLEAN,
    "windFirstAnemometer" TEXT,
    "windSecondAnemometer" TEXT,
    "windSpeed" TEXT,
    "windDirection" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "observerInitial" TEXT,

    CONSTRAINT "WeatherObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL,
    "observingTimeId" TEXT NOT NULL,
    "dataType" TEXT,
    "avStationPressure" TEXT,
    "avSeaLevelPressure" TEXT,
    "avDryBulbTemperature" TEXT,
    "avWetBulbTemperature" TEXT,
    "maxTemperature" TEXT,
    "minTemperature" TEXT,
    "totalPrecipitation" TEXT,
    "avDewPointTemperature" TEXT,
    "avRelativeHumidity" TEXT,
    "windSpeed" TEXT,
    "windDirectionCode" TEXT,
    "maxWindSpeed" TEXT,
    "maxWindDirection" TEXT,
    "avTotalCloud" TEXT,
    "lowestVisibility" TEXT,
    "totalRainDuration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SynopticCode" (
    "id" TEXT NOT NULL,
    "observingTimeId" TEXT NOT NULL,
    "dataType" TEXT DEFAULT 'SYNOP',
    "C1" TEXT,
    "Iliii" TEXT,
    "iRiXhvv" TEXT,
    "Nddff" TEXT,
    "S1nTTT" TEXT,
    "S2nTddTddTdd" TEXT,
    "P3PPP4PPPP" TEXT,
    "RRRtR6" TEXT,
    "wwW1W2" TEXT,
    "NhClCmCh" TEXT,
    "S2nTnTnTnInInInIn" TEXT,
    "D56DLDMDH" TEXT,
    "CD57DaEc" TEXT,
    "avgTotalCloud" TEXT,
    "C2" TEXT,
    "GG" TEXT,
    "P24Group58_59" TEXT,
    "R24Group6_7" TEXT,
    "NsChshs" TEXT,
    "dqqqt90" TEXT,
    "fqfqfq91" TEXT,
    "weatherRemark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SynopticCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agroclimatological_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "elevation" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "utcTime" TIMESTAMP(3) NOT NULL,
    "solarRadiation" DOUBLE PRECISION,
    "sunShineHour" DOUBLE PRECISION,
    "airTempDry05m" DOUBLE PRECISION,
    "airTempWet05m" DOUBLE PRECISION,
    "airTempDry12m" DOUBLE PRECISION,
    "airTempWet12m" DOUBLE PRECISION,
    "airTempDry22m" DOUBLE PRECISION,
    "airTempWet22m" DOUBLE PRECISION,
    "minTemp" DOUBLE PRECISION,
    "maxTemp" DOUBLE PRECISION,
    "meanTemp" DOUBLE PRECISION,
    "grassMinTemp" DOUBLE PRECISION,
    "soilTemp5cm" DOUBLE PRECISION,
    "soilTemp10cm" DOUBLE PRECISION,
    "soilTemp20cm" DOUBLE PRECISION,
    "soilTemp30cm" DOUBLE PRECISION,
    "soilTemp50cm" DOUBLE PRECISION,
    "soilMoisture0to20cm" DOUBLE PRECISION,
    "soilMoisture20to50cm" DOUBLE PRECISION,
    "panWaterEvap" DOUBLE PRECISION,
    "relativeHumidity" DOUBLE PRECISION,
    "evaporation" DOUBLE PRECISION,
    "dewPoint" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "userId" TEXT,
    "stationId" TEXT NOT NULL,

    CONSTRAINT "agroclimatological_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilMoistureData" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "depth" INTEGER NOT NULL,
    "w1" DOUBLE PRECISION NOT NULL,
    "w2" DOUBLE PRECISION NOT NULL,
    "w3" DOUBLE PRECISION NOT NULL,
    "Ws" DOUBLE PRECISION NOT NULL,
    "Ds" DOUBLE PRECISION NOT NULL,
    "Sm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SoilMoistureData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunshineData" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "hours" JSONB NOT NULL,
    "stationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SunshineData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_token_idx" ON "sessions"("userId", "token");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");

-- CreateIndex
CREATE INDEX "logs_userId_idx" ON "logs"("userId");

-- CreateIndex
CREATE INDEX "logs_targetId_idx" ON "logs"("targetId");

-- CreateIndex
CREATE INDEX "logs_role_idx" ON "logs"("role");

-- CreateIndex
CREATE INDEX "logs_action_idx" ON "logs"("action");

-- CreateIndex
CREATE INDEX "ObservingTime_userId_idx" ON "ObservingTime"("userId");

-- CreateIndex
CREATE INDEX "ObservingTime_localTime_idx" ON "ObservingTime"("localTime");

-- CreateIndex
CREATE UNIQUE INDEX "ObservingTime_utcTime_stationId_key" ON "ObservingTime"("utcTime", "stationId");

-- CreateIndex
CREATE INDEX "MeteorologicalEntry_observingTimeId_idx" ON "MeteorologicalEntry"("observingTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "agroclimatological_data_stationId_date_key" ON "agroclimatological_data"("stationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SoilMoistureData_date_depth_stationId_key" ON "SoilMoistureData"("date", "depth", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "SunshineData_date_stationId_key" ON "SunshineData"("date", "stationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservingTime" ADD CONSTRAINT "ObservingTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservingTime" ADD CONSTRAINT "ObservingTime_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeteorologicalEntry" ADD CONSTRAINT "MeteorologicalEntry_observingTimeId_fkey" FOREIGN KEY ("observingTimeId") REFERENCES "ObservingTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherObservation" ADD CONSTRAINT "WeatherObservation_observingTimeId_fkey" FOREIGN KEY ("observingTimeId") REFERENCES "ObservingTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_observingTimeId_fkey" FOREIGN KEY ("observingTimeId") REFERENCES "ObservingTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynopticCode" ADD CONSTRAINT "SynopticCode_observingTimeId_fkey" FOREIGN KEY ("observingTimeId") REFERENCES "ObservingTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agroclimatological_data" ADD CONSTRAINT "agroclimatological_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agroclimatological_data" ADD CONSTRAINT "agroclimatological_data_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilMoistureData" ADD CONSTRAINT "SoilMoistureData_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilMoistureData" ADD CONSTRAINT "SoilMoistureData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunshineData" ADD CONSTRAINT "SunshineData_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunshineData" ADD CONSTRAINT "SunshineData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
