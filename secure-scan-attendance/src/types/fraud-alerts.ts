
export interface FraudAlert {
  id: string;
  qr_id: string;
  timestamp: string;
  status: string;
  company_id: string;
  employee_name?: string;
  employee_email?: string;
  employee_id?: string | null; // UUID string format or null
  device_id?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  initial_device_id?: string;
}

export interface NormalizedEmployees {
  byEmail: Record<string, Employee>;
  byId: Record<string, Employee>;
  byDeviceId?: Record<string, Employee>;
}
