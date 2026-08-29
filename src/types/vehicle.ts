export type VehicleCategory = 'Hyper GT' | 'Supercar' | 'Performance SUV';

export interface VehicleModel {
  id: string;
  name: string;
  tagline: string;
  category: VehicleCategory;
  basePrice: number;
  specs: {
    horsepower: number;
    acceleration060: number; // in seconds
    topSpeedMph: number;
    rangeMiles: number;
    drivetrain: string;
    batteryKwh?: number;
    engineDisplacement?: string;
    weightLbs: number;
    cargoSpaceCuFt: number;
  };
  description: string;
  bodyStyle: 'coupe' | 'gt' | 'suv';
  availableColors: PaintColor[];
  availableWheels: WheelOption[];
  availableCalipers: CaliperOption[];
  availableAero: AeroPackage[];
  availableRoofs: RoofOption[];
  availableInteriors: InteriorOption[];
  availablePackages: PerformancePackage[];
}

export type PaintFinish = 'metallic' | 'gloss' | 'matte' | 'iridescent' | 'satin';

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  secondaryHex?: string;
  finish: PaintFinish;
  roughness: number;
  metalness: number;
  clearcoat: number;
  price: number;
  description: string;
}

export interface WheelFinish {
  id: string;
  name: string;
  hex: string;
  price: number;
}

export interface WheelOption {
  id: string;
  name: string;
  sizeInches: number;
  style: 'turbine' | 'v-spoke' | 'aero-blade' | 'monoblock';
  price: number;
  spokeCount: number;
  description: string;
  finishes: WheelFinish[];
}

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
  price: number;
  brand: string;
}

export interface AeroPackage {
  id: string;
  name: string;
  type: 'integrated' | 'active-wing' | 'carbon-track' | 'gt-ducktail';
  price: number;
  downforceLbs: number;
  description: string;
}

export interface RoofOption {
  id: string;
  name: string;
  material: 'body' | 'gloss-black' | 'carbon-weave' | 'panoramic-glass';
  price: number;
  description: string;
}

export interface InteriorOption {
  id: string;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  materials: string;
  ambientLightHex: string;
  price: number;
  description: string;
}

export interface PerformancePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  hpBonus?: number;
  weightReductionLbs?: number;
  badge?: string;
}

export interface VehicleConfiguration {
  modelId: string;
  colorId: string;
  finishType: PaintFinish;
  wheelId: string;
  wheelFinishId: string;
  caliperColorId: string;
  aeroPackageId: string;
  roofId: string;
  interiorId: string;
  ambientLightColor: string;
  packageIds: string[];
  // View states
  doorsOpen: boolean;
  headlightsOn: boolean;
  activeSpoilerDeployed: boolean;
  xRayMode: boolean;
  studioPreset: 'pristine' | 'cyberpunk' | 'sunset' | 'stealth';
  cameraAngle: 'hero' | 'front' | 'side' | 'rear' | 'top' | 'wheel' | 'cockpit';
  autoRotate: boolean;
}

export interface ShowroomLocation {
  id: string;
  name: string;
  city: string;
  stateCountry: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  hasTrack: boolean;
  operatingHours: string;
  coordinates: { lat: number; lng: number };
}

export interface TestDriveAppointment {
  id: string;
  modelId: string;
  modelName: string;
  configurationSummary: string;
  locationId: string;
  locationName: string;
  date: string;
  timeSlot: string;
  experienceType: 'track' | 'road' | 'concierge-home';
  customerName: string;
  email: string;
  phone: string;
  driverLicenseNumber: string;
  homeDeliveryAddress?: string;
  preferredTuning: 'Comfort & Luxury' | 'Sport Plus' | 'Track Extreme';
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  estimatedPrice: number;
}

export type PaymentMethod = 'finance' | 'lease' | 'cash';

export interface FinanceCalculation {
  method: PaymentMethod;
  vehicleTotalPrice: number;
  baseMSRP: number;
  optionsTotal: number;
  downPayment: number;
  downPaymentPercent: number;
  tradeInValue: number;
  termMonths: number;
  aprPercent: number;
  salesTaxPercent: number;
  dealerFee: number;
  destinationFee: number;
  // Computed outputs
  totalTaxAmount: number;
  netFinancedAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalCost: number;
  // Lease specific
  leaseMileageLimit: number;
  leaseMoneyFactor: number;
  residualPercent: number;
  residualValue: number;
  leaseMonthlyDepreciation: number;
  leaseMonthlyRentCharge: number;
}

export interface SavedBuild {
  id: string;
  timestamp: string;
  modelName: string;
  config: VehicleConfiguration;
  totalPrice: number;
  notes?: string;
}
