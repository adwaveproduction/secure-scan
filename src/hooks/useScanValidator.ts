
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeQRCode } from '@/utils/qr-generator';
import { generateDeviceFingerprint, isDeviceRecognized } from '@/utils/deviceFingerprint';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { validateQRCode } from '@/utils/qr-validator';

// Define the scan states enum
export enum ScanState {
  LOADING = 'LOADING',
  INVALID_QR = 'INVALID_QR',
  TIME_TRACKING = 'TIME_TRACKING',
  REGISTRATION = 'REGISTRATION'
}

// Define the hook return type
interface ScanValidationResult {
  state: ScanState;
  employeeId: string | null;
  companyId: string | null;
  employeeData: any;
  errorMessage: string;
}

export const useScanValidator = (): ScanValidationResult => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ScanState>(ScanState.LOADING);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('QR code invalide ou expiré');

  useEffect(() => {
    const validateScan = async () => {
      try {
        // Check if the user has logged out and requires a new scan
        const hasLoggedOut = sessionStorage.getItem('scan_logged_out') === 'true';
        const qrData = searchParams.get('data');
        
        // If logged out and trying to use the same URL, show invalid QR
        if (hasLoggedOut && qrData && !searchParams.get('forceNew')) {
          console.log('User has logged out and requires a new QR scan');
          setErrorMessage('Session terminée. Veuillez scanner un nouveau QR code.');
          setState(ScanState.INVALID_QR);
          return;
        }
        
        const forceNew = searchParams.get('forceNew') === 'true';
        
        if (!qrData) {
          setState(ScanState.INVALID_QR);
          return;
        }
        
        console.log('Raw QR Data received:', qrData);
        
        // Décoder les données du QR code
        let decodedData;
        try {
          decodedData = decodeQRCode(qrData);
          console.log('Decoded QR data:', decodedData);
        } catch (error) {
          console.error('Invalid QR code format:', error);
          setErrorMessage('Format de QR code invalide');
          setState(ScanState.INVALID_QR);
          return;
        }
        
        if (!decodedData || !decodedData.companyId || !decodedData.qrId) {
          console.error('Malformed QR code:', decodedData);
          setErrorMessage('QR code mal formaté');
          setState(ScanState.INVALID_QR);
          return;
        }
        
        // Générer l'empreinte de l'appareil pour traçabilité
        const deviceId = await generateDeviceFingerprint();
        console.log('Generated device fingerprint:', deviceId);
        
        // Récupérer les infos employé si disponibles du sessionStorage
        const storedEmployee = sessionStorage.getItem('employee_data');
        let employeeInfo: { name?: string; email?: string; deviceId: string; id?: string; initialDeviceId?: string } = { deviceId };
        
        if (storedEmployee) {
          try {
            const parsedEmployee = JSON.parse(storedEmployee);
            console.log('Found stored employee data:', parsedEmployee);
            employeeInfo = {
              ...employeeInfo,
              name: parsedEmployee.name,
              email: parsedEmployee.email,
              id: parsedEmployee.id,
              initialDeviceId: parsedEmployee.initialDeviceId
            };
            console.log('Using stored employee info for validation:', employeeInfo);
          } catch (e) {
            console.error('Error parsing stored employee data:', e);
          }
        }
        
        // Valider le QR code
        console.log('Validating QR code with data:', decodedData);
        const validation = await validateQRCode(decodedData.qrId, decodedData.companyId, employeeInfo);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
          setErrorMessage(validation.message);
          setState(ScanState.INVALID_QR);
          return;
        }
        
        // Si c'est une tentative de fraude en mode développement, on peut quand même continuer
        if (validation.isFraud && process.env.NODE_ENV === 'development') {
          console.log('Fraud attempt detected but continuing in development mode');
        }
        
        // Stocker l'ID de l'entreprise
        setCompanyId(decodedData.companyId);
        
        // Check if device is recognized for this company
        const isRecognized = await isDeviceRecognized(decodedData.companyId);
        
        console.log('Device recognition check:', { 
          isRecognized, 
          forceNew 
        });
        
        if (isRecognized && !forceNew && !hasLoggedOut) {
          console.log('Device recognized, looking for employee');
          
          // Get the stored device fingerprint for this company
          const storedFingerprint = localStorage.getItem(`employee_device_${decodedData.companyId}`);
          console.log('Stored fingerprint:', storedFingerprint);
          
          // Device is recognized, find employee in database with matching device fingerprint
          const { data: employeeWithDeviceData, error: deviceError } = await supabase
            .from('registered_employees')
            .select('*')
            .eq('company_id', decodedData.companyId)
            .eq('initial_device_id', storedFingerprint)
            .maybeSingle();
          
          console.log('Employee search by device fingerprint result:', { 
            employeeWithDeviceData, 
            deviceError 
          });
          
          if (!deviceError && employeeWithDeviceData) {
            // Employee found by device fingerprint
            console.log('Found employee by device fingerprint:', employeeWithDeviceData);
            setEmployeeId(employeeWithDeviceData.id);
            setEmployeeData({
              id: employeeWithDeviceData.id,
              name: employeeWithDeviceData.name,
              email: employeeWithDeviceData.email,
              initialDeviceId: employeeWithDeviceData.initial_device_id
            });
            
            // Store employee data in session storage for future use
            sessionStorage.setItem('employee_data', JSON.stringify({
              id: employeeWithDeviceData.id,
              name: employeeWithDeviceData.name,
              email: employeeWithDeviceData.email,
              initialDeviceId: employeeWithDeviceData.initial_device_id
            }));
            
            setState(ScanState.TIME_TRACKING);
          } else {
            // If we couldn't find an employee by device fingerprint, let's try by employee ID from storage
            console.log('Employee not found by device fingerprint, trying by stored ID');
            
            if (employeeInfo.id) {
              console.log('Looking up employee by ID:', employeeInfo.id);
              const { data: employeeById, error: idError } = await supabase
                .from('registered_employees')
                .select('*')
                .eq('company_id', decodedData.companyId)
                .eq('id', employeeInfo.id)
                .maybeSingle();
                
              if (!idError && employeeById) {
                console.log('Found employee by ID:', employeeById);
                setEmployeeId(employeeById.id);
                setEmployeeData({
                  id: employeeById.id,
                  name: employeeById.name,
                  email: employeeById.email,
                  initialDeviceId: employeeById.initial_device_id
                });
                
                setState(ScanState.TIME_TRACKING);
                return;
              }
            }
            
            // If we still can't find the employee, redirect to registration
            console.log('No employee found, redirecting to registration');
            setState(ScanState.REGISTRATION);
          }
        } else {
          console.log('Device not recognized, force new registration, or logged out recently, redirecting to registration');
          // Device not recognized or forced new registration, redirect to registration
          setState(ScanState.REGISTRATION);
          
          // If logged out, clear the flag since we're starting a new registration flow
          if (hasLoggedOut) {
            sessionStorage.removeItem('scan_logged_out');
          }
        }
        
      } catch (error) {
        console.error('Error validating scan:', error);
        setErrorMessage('Erreur lors de la validation du QR code');
        setState(ScanState.INVALID_QR);
      }
    };
    
    validateScan();
  }, [searchParams]);

  return {
    state,
    employeeId,
    companyId,
    employeeData,
    errorMessage
  };
};
