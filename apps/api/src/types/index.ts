import type {
  Unit,
  UserRole,
  VerificationChannel,
  VerificationResult,
} from "../generated/prisma/client";

export type {
  Batch,
  Company,
  CustodyEvent,
  Product,
  Report,
  SmsTemplate,
  Unit,
  User,
  Verification,
} from "../generated/prisma/client";

export type {
  BatchStatus,
  CompanyStatus,
  HolderType,
  ProductCategory,
  UnitStatus,
  UserRole,
  VerificationChannel,
  VerificationResult,
} from "../generated/prisma/client";

export interface AuthUser {
  id: number;
  companyId: number | null;
  email: string;
  role: UserRole;
}

export interface VerifyInput {
  code: string;
  channel: VerificationChannel;
  actorPhone?: string;
  actorIp?: string;
  gatewayMessageId?: string;
}

export interface VerifyOutput {
  result: VerificationResult;
  unit: Unit | null;
  productName: string | null;
  batchNumber: string | null;
  expiresAt: string | null;
  firstVerifiedAt: string | null;
  message: string;
}
