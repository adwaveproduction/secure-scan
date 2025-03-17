
// This file re-exports all functions from the refactored modules
// for backward compatibility

import { generateQRCode, decodeQRCode } from './qr-generator';
import { validateQRCode, reportFraudAttempt } from './qr-validator';
import { checkEmployeeExists, createEmployee } from './employee-manager';

export {
  generateQRCode,
  decodeQRCode,
  validateQRCode,
  reportFraudAttempt,
  checkEmployeeExists,
  createEmployee
};
