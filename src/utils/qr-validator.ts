
import { supabase, isUsingMockClient } from './supabase-client';

// Vérifier si un QR code est valide (actif)
export const validateQRCode = async (qrId: string, companyId: string, employeeInfo?: {
  name?: string;
  email?: string;
  deviceId?: string;
  id?: string;
  initialDeviceId?: string;
}): Promise<{
  isValid: boolean;
  isFraud: boolean;
  message: string;
  qrCode?: any;
}> => {
  try {
    console.log('Validating QR code:', { qrId, companyId, employeeInfo });
    
    // Si nous utilisons le client mock, toujours retourner un succès en mode démo
    if (isUsingMockClient) {
      console.log('Mode démo: Validation de QR code simulée pour', qrId, companyId);
      return {
        isValid: true,
        isFraud: false,
        message: 'QR code valide (mode démo)',
        qrCode: {
          id: qrId,
          company_id: companyId,
          active: true
        }
      };
    }
    
    // En développement, on vérifie quand même mais on permet plus de tests
    if (process.env.NODE_ENV === 'development') {
      // Rechercher le QR code dans la base de données
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .eq('company_id', companyId)
        .single();
      
      console.log('QR code validation result in dev mode:', { qrCode, error });
      
      // En développement, si le code existe mais n'est pas actif, on signale une fraude mais on permet de continuer
      if (qrCode && !qrCode.active) {
        console.log('Dev mode: Fraud detected but allowing for testing');
        // Signaler la fraude même en mode développement
        await reportFraudAttempt(companyId, qrId, employeeInfo);
        
        return {
          isValid: true, // En dev, on permet même les QR codes inactifs
          isFraud: true, // Mais on signale que c'est une fraude
          message: 'QR code expiré mais accepté en mode développement',
          qrCode: {
            ...qrCode,
            active: true // Forcer à actif pour le développement
          }
        };
      }
      
      // Si pas trouvé ou autre erreur, on permet quand même en dev
      if (error || !qrCode) {
        console.log('Dev mode: QR code not found but allowing for testing');
        return {
          isValid: true,
          isFraud: false,
          message: 'QR code accepté en mode développement',
          qrCode: {
            id: qrId,
            company_id: companyId,
            active: true
          }
        };
      }
      
      // QR Code trouvé et valide
      return {
        isValid: true,
        isFraud: false,
        message: 'QR code valide',
        qrCode: qrCode
      };
    }
    
    // En production, rechercher le QR code dans la base de données
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrId)
      .eq('company_id', companyId)
      .single();
    
    console.log('QR code validation result:', { qrCode, error });
    
    if (error) {
      console.error('Erreur lors de la recherche du QR code:', error);
      // C'est une tentative frauduleuse - QR code introuvable
      await reportFraudAttempt(companyId, qrId, employeeInfo);
      return {
        isValid: false,
        isFraud: true,
        message: 'QR code introuvable - tentative frauduleuse détectée'
      };
    }
    
    if (!qrCode) {
      // C'est une tentative frauduleuse - QR code introuvable
      await reportFraudAttempt(companyId, qrId, employeeInfo);
      return {
        isValid: false,
        isFraud: true,
        message: 'QR code introuvable - tentative frauduleuse détectée'
      };
    }
    
    // Vérifier si le QR code est actif
    if (!qrCode.active) {
      // C'est une tentative frauduleuse - l'employé utilise un ancien QR code
      await reportFraudAttempt(companyId, qrId, employeeInfo);
      
      return {
        isValid: false,
        isFraud: true,
        message: 'Tentative frauduleuse détectée: QR code désactivé'
      };
    }
    
    // QR code valide
    return {
      isValid: true,
      isFraud: false,
      message: 'QR code valide',
      qrCode: qrCode
    };
    
  } catch (error) {
    console.error('Erreur lors de la validation du QR code:', error);
    
    // Si nous sommes en développement, on permet quand même de continuer malgré l'erreur
    if (process.env.NODE_ENV === 'development') {
      console.log('Mode développement: QR code accepté malgré l\'erreur');
      return {
        isValid: true,
        isFraud: false,
        message: 'QR code valide (mode développement)',
        qrCode: {
          id: qrId,
          company_id: companyId,
          active: true
        }
      };
    }
    
    return {
      isValid: false,
      isFraud: false,
      message: 'Erreur de validation'
    };
  }
};

// Signaler une tentative de fraude
export const reportFraudAttempt = async (
  companyId: string, 
  qrId: string, 
  employeeInfo?: {
    name?: string;
    email?: string;
    deviceId?: string;
    id?: string;
    initialDeviceId?: string;
  }
): Promise<void> => {
  try {
    console.log('Reporting fraud attempt:', { companyId, qrId, employeeInfo });
    
    // Si nous utilisons le client mock, juste logger
    if (isUsingMockClient) {
      console.log('Mode démo: Tentative de fraude simulée enregistrée');
      return;
    }
    
    // Take the employee ID directly from the employeeInfo if provided
    // This is the same approach used in the time_tracking table
    let employeeId = employeeInfo?.id || null; 
    let employeeName = employeeInfo?.name || 'Inconnu';
    let employeeEmail = employeeInfo?.email || 'Non fourni';
    let deviceId = employeeInfo?.deviceId || 'Non identifié';
    
    console.log('Using employee info for fraud report:', { 
      employeeId, 
      employeeName, 
      employeeEmail,
      deviceId,
      initialDeviceId: employeeInfo?.initialDeviceId
    });
    
    // Get from session storage if not provided directly (fallback)
    if (!employeeId) {
      const storedEmployee = sessionStorage.getItem('employee_data');
      if (storedEmployee) {
        try {
          const parsedEmployee = JSON.parse(storedEmployee);
          if (parsedEmployee.id) {
            console.log('Using employee ID from session storage:', parsedEmployee.id);
            employeeId = parsedEmployee.id;
            employeeName = parsedEmployee.name || employeeName;
            employeeEmail = parsedEmployee.email || employeeEmail;
            // Use initialDeviceId if available, otherwise use current device
            if (parsedEmployee.initialDeviceId) {
              console.log('Found initial device ID in session storage:', parsedEmployee.initialDeviceId);
              deviceId = `${deviceId} (Original: ${parsedEmployee.initialDeviceId.substring(0, 10)}...)`;
            }
          }
        } catch (e) {
          console.error('Error parsing stored employee data:', e);
        }
      }
    }
    
    // Only as a last resort, try to look up by email
    if (!employeeId && employeeInfo?.email && employeeInfo.email !== 'Non fourni') {
      console.log(`Looking up employee by email: ${employeeInfo.email}`);
      
      const { data: employeeData, error } = await supabase
        .from('registered_employees')
        .select('id, name, initial_device_id')
        .eq('company_id', companyId)
        .eq('email', employeeInfo.email)
        .maybeSingle();
        
      if (!error && employeeData) {
        console.log(`Found employee in database:`, employeeData);
        employeeId = employeeData.id;
        employeeName = employeeData.name || employeeName;
        
        // Add initial device ID information if available
        if (employeeData.initial_device_id) {
          console.log('Found initial device ID in database:', employeeData.initial_device_id);
          deviceId = `${deviceId} (Original: ${employeeData.initial_device_id.substring(0, 10)}...)`;
        }
      } else if (error) {
        console.error('Error looking up employee by email:', error);
      } else {
        console.log('No employee found with that email');
      }
    }
    
    console.log('Final employee info for fraud report:', { 
      employeeId, 
      employeeName, 
      employeeEmail,
      deviceId
    });
    
    // Enregistrer la tentative de fraude avec les informations de l'employé
    const { error, data } = await supabase
      .from('fraud_alerts')
      .insert([
        {
          company_id: companyId,
          qr_id: qrId,
          timestamp: new Date().toISOString(),
          status: 'new',
          employee_name: employeeName,
          employee_email: employeeEmail,
          employee_id: employeeId, // This will be a UUID or null
          device_id: deviceId
        }
      ])
      .select();
      
    if (error) {
      console.error('Error reporting fraud attempt:', error);
    } else {
      console.log('Fraud attempt successfully recorded in database:', data);
      console.log('Employee ID stored in record:', employeeId);
    }
      
  } catch (error) {
    console.error('Erreur lors du signalement de fraude:', error);
  }
};
