import { ValidationStatus } from './clearance';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
}

export interface ExtractedField {
  fieldName: string;
  label: string;
  ocrValue: string;
  hospitalValue: string;
  status: ValidationStatus;
  confidence: number;
  box?: BoundingBox;
}

export interface CardSample {
  id: string;
  payerName: string;
  planType: string;
  patientName: string;
  memberId: string;
  groupNumber: string;
  dob: string;
  rxBin: string;
  rxPcn: string;
  cardImageColor: string;
  fields: ExtractedField[];
}
