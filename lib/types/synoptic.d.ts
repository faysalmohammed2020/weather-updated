import type { Station } from "./station";

export interface ObservingTimeMeta {
  utcTime?: string;
  stationId?: string;
  station?: Station;
  userId?: string;
}

export interface SynopticRecord {
  id: string;
  dataType?: string;
  ObservingTime?: ObservingTimeMeta;
  createdAt?: string;
  C1?: string | null;
  Iliii?: string | null;
  iRiXhvv?: string | null;
  Nddff?: string | null;
  S1nTTT?: string | null;
  S2nTddTddTdd?: string | null;
  P3PPP4PPPP?: string | null;
  RRRtR6?: string | null;
  wwW1W2?: string | null;
  NhClCmCh?: string | null;
  S2nTnTnTnInInInIn?: string | null;
  D56DLDMDH?: string | null;
  CD57DaEc?: string | null;
  C2?: string | null;
  GG?: string | null;
  P24Group58_59?: string | null;
  R24Group6_7?: string | null;
  NsChshs?: string | null;
  dqqqt90?: string | null;
  fqfqfq91?: string | null;
  avgTotalCloud?: string | null;
  weatherRemark?: string | null;
}

export interface SynopticHeaderInfo {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
}

export interface SynopticUser {
  id: string;
  role: string;
  station?: {
    id?: string;
    stationId?: string;
  };
}

export type SynopticFormData = Partial<
  Pick<
    SynopticRecord,
    | "C1"
    | "Iliii"
    | "iRiXhvv"
    | "Nddff"
    | "S1nTTT"
    | "S2nTddTddTdd"
    | "P3PPP4PPPP"
    | "RRRtR6"
    | "wwW1W2"
    | "NhClCmCh"
    | "S2nTnTnTnInInInIn"
    | "D56DLDMDH"
    | "CD57DaEc"
    | "C2"
    | "GG"
    | "P24Group58_59"
    | "R24Group6_7"
    | "NsChshs"
    | "dqqqt90"
    | "fqfqfq91"
    | "weatherRemark"
  >
>;
