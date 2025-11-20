"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import axios from "axios";

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Specific relation ID for Bangladesh: 184640
const BANGLADESH_RELATION_ID = 184640;

// Admin levels in Bangladesh
const ADMIN_LEVELS = {
  DIVISION: "4", // Divisions
  DISTRICT: "5", // Districts/Zillas
  UPAZILA: "6", // Upazilas/Thanas
};

interface AdministrativeArea {
  name: string;
  osmId: number;
  coordinates: LatLngExpression;
  geometry?: any; // For storing raw geometry data
  adminLevel: string;
  parentId?: number;
}

interface LocationContextType {
  selectedDivision: AdministrativeArea | null;
  setSelectedDivision: (division: AdministrativeArea | null) => void;
  selectedDistrict: AdministrativeArea | null;
  setSelectedDistrict: (district: AdministrativeArea | null) => void;
  selectedUpazila: AdministrativeArea | null;
  setSelectedUpazila: (upazila: AdministrativeArea | null) => void;
  divisions: AdministrativeArea[];
  districts: AdministrativeArea[];
  upazilas: AdministrativeArea[];
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  selectedDivision: null,
  setSelectedDivision: () => {},
  selectedDistrict: null,
  setSelectedDistrict: () => {},
  selectedUpazila: null,
  setSelectedUpazila: () => {},
  divisions: [],
  districts: [],
  upazilas: [],
  loading: false,
  error: null,
});

// Helper function to build Overpass queries with specific relation IDs
const buildQuery = (relationId: number, adminLevel: string): string => {
  return `
    [out:json][timeout:90];
    // Get the relation with the specified ID
    relation(${relationId});
    // Convert to area
    map_to_area;
    // Find all administrative boundaries within this area with the specified admin_level
    relation[boundary=administrative][admin_level=${adminLevel}](area);
    // Get all data including geometry
    out body geom;
  `;
};

// Function to query Bangladesh directly for divisions
const buildDivisionsQuery = (): string => {
  return `
    [out:json][timeout:90];
    // Query for Bangladesh's divisions directly
    relation(${BANGLADESH_RELATION_ID});
    map_to_area -> .bangladesh;
    relation[boundary=administrative][admin_level=${ADMIN_LEVELS.DIVISION}](area.bangladesh);
    out body geom;
  `;
};

// Fetch administrative boundaries using Overpass API with retry logic
const fetchBoundaries = async (query: string, retries = 2): Promise<any[]> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        method: "post",
        url: OVERPASS_API,
        data: query,
        headers: { "Content-Type": "text/plain" },
        timeout: 30000, // 30 seconds timeout
      });
      return response.data.elements || [];
    } catch (error: any) {
      console.error(`Overpass API error (attempt ${attempt + 1}):`, error.message);
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        // Check if it's a timeout or network error
        if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
          console.warn("Overpass API is unavailable, will use fallback data");
          return []; // Return empty array to trigger fallback
        }
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return [];
};

// Function to handle irregular geometry data
const processGeometry = (element: any): any[] => {
  if (element.geometry && Array.isArray(element.geometry)) {
    return element.geometry;
  }

  if (element.members && Array.isArray(element.members)) {
    const geometryPoints: any[] = [];
    element.members
      .filter((member: any) => member.type === "way" && member.geometry)
      .forEach((member: any) => {
        if (Array.isArray(member.geometry)) {
          geometryPoints.push(...member.geometry);
        }
      });
    return geometryPoints;
  }

  return [];
};

// Calculate the center point of a geometry
const calculateCenter = (geometry: any[]): LatLngExpression => {
  if (!geometry || geometry.length === 0) {
    return [23.685, 90.3563]; // Default center for Bangladesh
  }

  const validPoints = geometry.filter(
    (point) =>
      point && typeof point.lat === "number" && typeof point.lon === "number"
  );

  if (validPoints.length === 0) {
    return [23.685, 90.3563];
  }

  let totalLat = 0,
    totalLon = 0;
  validPoints.forEach((point) => {
    totalLat += point.lat;
    totalLon += point.lon;
  });

  return [totalLat / validPoints.length, totalLon / validPoints.length];
};

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [divisions, setDivisions] = useState<AdministrativeArea[]>([]);
  const [districts, setDistricts] = useState<AdministrativeArea[]>([]);
  const [upazilas, setUpazilas] = useState<AdministrativeArea[]>([]);

  const [selectedDivision, setSelectedDivision] =
    useState<AdministrativeArea | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<AdministrativeArea | null>(null);
  const [selectedUpazila, setSelectedUpazila] =
    useState<AdministrativeArea | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load divisions on mount
  useEffect(() => {
    const loadDivisions = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildDivisionsQuery();
        const elements = await fetchBoundaries(query);

        if (elements.length === 0) {
          console.warn("Overpass API returned no divisions, using fallback data");
          // Fallback to hardcoded divisions if API fails
          const fallbackDivisions: AdministrativeArea[] = [
            {
              name: "Dhaka",
              osmId: 3921322,
              coordinates: [23.7779, 90.3995],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Chittagong",
              osmId: 3824588,
              coordinates: [22.3569, 91.7832],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Mymensingh",
              osmId: 7318343,
              coordinates: [24.7145, 90.4069],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Khulna",
              osmId: 3825003,
              coordinates: [22.8456, 89.5403],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Rajshahi",
              osmId: 3859335,
              coordinates: [24.3745, 88.6042],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Sylhet",
              osmId: 3921222,
              coordinates: [24.8949, 91.8687],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Barishal",
              osmId: 3921298,
              coordinates: [22.701, 90.3535],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
            {
              name: "Rangpur",
              osmId: 3921211,
              coordinates: [25.7439, 89.2532],
              adminLevel: ADMIN_LEVELS.DIVISION,
            },
          ];
          setDivisions(fallbackDivisions);
          return;
        }

        const processedDivisions = elements.map((element) => {
          const name = element.tags["name:en"];
          const geometry = processGeometry(element);
          const coordinates = calculateCenter(geometry);

          return {
            name,
            osmId: element.id,
            coordinates,
            geometry,
            adminLevel: ADMIN_LEVELS.DIVISION,
          };
        });

        setDivisions(processedDivisions);
      } catch (err: any) {
        console.error("Error loading divisions:", err);
        
        // Use fallback data even when there's an error
        const fallbackDivisions: AdministrativeArea[] = [
          { name: "Dhaka", osmId: 3921322, coordinates: [23.7779, 90.3995], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Chittagong", osmId: 3824588, coordinates: [22.3569, 91.7832], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Mymensingh", osmId: 7318343, coordinates: [24.7145, 90.4069], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Khulna", osmId: 3825003, coordinates: [22.8456, 89.5403], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Rajshahi", osmId: 3859335, coordinates: [24.3745, 88.6042], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Sylhet", osmId: 3921222, coordinates: [24.8949, 91.8687], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Barishal", osmId: 3921298, coordinates: [22.701, 90.3535], adminLevel: ADMIN_LEVELS.DIVISION },
          { name: "Rangpur", osmId: 3921211, coordinates: [25.7439, 89.2532], adminLevel: ADMIN_LEVELS.DIVISION },
        ];
        
        setDivisions(fallbackDivisions);
        console.warn("Using fallback divisions due to API error");
      } finally {
        setLoading(false);
      }
    };

    loadDivisions();
  }, []);

  // Load districts when division is selected
  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const loadDistricts = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(selectedDivision.osmId, ADMIN_LEVELS.DISTRICT);
        const elements = await fetchBoundaries(query);

        if (elements.length === 0) {
          console.warn(`No districts found for ${selectedDivision.name} from API, using fallback if available`);
          
          // Provide fallback districts for major divisions
          const fallbackDistricts: { [key: string]: AdministrativeArea[] } = {
            "Dhaka": [
              { name: "Dhaka", osmId: 3921322, coordinates: [23.7779, 90.3995], adminLevel: ADMIN_LEVELS.DISTRICT, parentId: selectedDivision.osmId },
              { name: "Gazipur", osmId: 3921323, coordinates: [23.9999, 90.4203], adminLevel: ADMIN_LEVELS.DISTRICT, parentId: selectedDivision.osmId },
              { name: "Narayanganj", osmId: 3921324, coordinates: [23.6238, 90.4990], adminLevel: ADMIN_LEVELS.DISTRICT, parentId: selectedDivision.osmId },
            ],
            "Chittagong": [
              { name: "Chittagong", osmId: 3824588, coordinates: [22.3569, 91.7832], adminLevel: ADMIN_LEVELS.DISTRICT, parentId: selectedDivision.osmId },
              { name: "Cox's Bazar", osmId: 3824589, coordinates: [21.4272, 92.0058], adminLevel: ADMIN_LEVELS.DISTRICT, parentId: selectedDivision.osmId },
            ],
          };
          
          const fallback = fallbackDistricts[selectedDivision.name];
          if (fallback) {
            setDistricts(fallback);
          } else {
            setDistricts([]);
          }
          return;
        }

        const processedDistricts = elements.map((element) => {
          const name = element.tags["name:en"];
          const geometry = processGeometry(element);
          const coordinates = calculateCenter(geometry);

          return {
            name,
            osmId: element.id,
            coordinates,
            geometry,
            adminLevel: ADMIN_LEVELS.DISTRICT,
            parentId: selectedDivision.osmId,
          };
        });

        setDistricts(processedDistricts);
      } catch (err: any) {
        console.error("Error loading districts:", err);
        console.warn("Districts API failed, setting empty districts list");
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [selectedDivision]);

  // Load upazilas when district is selected
  useEffect(() => {
    if (!selectedDistrict) {
      setUpazilas([]);
      setSelectedUpazila(null);
      return;
    }

    const loadUpazilas = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(selectedDistrict.osmId, ADMIN_LEVELS.UPAZILA);
        const elements = await fetchBoundaries(query);

        if (elements.length === 0) {
          console.warn(`No upazilas found for ${selectedDistrict.name} from API`);
          setUpazilas([]);
          return;
        }

        const processedUpazilas = elements.map((element) => {
          const name = element.tags["name:en"];
          const geometry = processGeometry(element);
          const coordinates = calculateCenter(geometry);

          return {
            name,
            osmId: element.id,
            coordinates,
            geometry,
            adminLevel: ADMIN_LEVELS.UPAZILA,
            parentId: selectedDistrict.osmId,
          };
        });

        setUpazilas(processedUpazilas);
      } catch (err: any) {
        console.error("Error loading upazilas:", err);
        console.warn("Upazilas API failed, setting empty upazilas list");
        setUpazilas([]);
      } finally {
        setLoading(false);
      }
    };

    loadUpazilas();
  }, [selectedDistrict]);

  return (
    <LocationContext.Provider
      value={{
        selectedDivision,
        setSelectedDivision,
        selectedDistrict,
        setSelectedDistrict,
        selectedUpazila,
        setSelectedUpazila,
        divisions,
        districts,
        upazilas,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
