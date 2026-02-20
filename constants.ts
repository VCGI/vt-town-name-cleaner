import { ExtraField } from './types';

export const APP_TITLE = "Vermont Town Name Cleaner";
export const DATA_URL = "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town-alias.json";

export const VT_GREEN = "#006039";
export const VT_BLUE = "#003865";
export const VT_GOLD = "#FFB81C";

export const EXTRA_FIELDS: ExtraField[] = [
  { id: 'county', label: 'County' },
  { id: 'latitude', label: 'Latitude' },
  { id: 'longitude', label: 'Longitude' },
  { id: 'ct_code', label: 'CT_CODE (AOT)' },
  { id: 'mcode', label: 'MCODE (E911)' },
  { id: 'aoe_code', label: 'AOE_CODE (AOE)' },
  { id: 'rpc', label: 'RPC' }
];

export const RAW_DATA_RESOURCES = [
  { title: "Town Names with no geometry (CSV)", url: "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town.csv", size: "10 KB" },
  { title: "Town Boundary GeoJSON", url: "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town.json", size: "2.03 MB" },
  { title: "Town Boundary GeoJSON (Simplified 20%)", url: "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town-simplified-20.json", size: "122 KB" },
  { title: "Town Boundary TopoJSON", url: "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town-topo.json", size: "304 KB" },
  { title: "Town Name Aliases (JSON)", url: "https://s3.us-east-2.amazonaws.com/vtopendata-prd/Boundaries/vt-town-alias.json", size: "236 KB" }
];