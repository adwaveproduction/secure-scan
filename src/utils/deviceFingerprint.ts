
/**
 * Utility pour générer et vérifier les empreintes numériques des appareils
 */

// Génère une empreinte numérique basée sur les caractéristiques de l'appareil
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    // Collecter des informations sur le navigateur et l'appareil
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const pixelRatio = window.devicePixelRatio;
    
    // Créer une chaîne unique avec toutes les informations
    const rawFingerprint = [
      userAgent, language, platform, screenWidth, screenHeight, 
      colorDepth, timezone, pixelRatio
    ].join('||');
    
    // Utiliser SubtleCrypto pour générer un hash SHA-256 de l'empreinte
    const msgBuffer = new TextEncoder().encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // Convertir le hash en chaîne hexadécimale
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'empreinte numérique:', error);
    // En cas d'erreur, générer un ID aléatoire comme fallback
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

// Vérifier si un appareil est reconnu pour une entreprise donnée
export const isDeviceRecognized = async (companyId: string): Promise<boolean> => {
  try {
    console.log('Vérification si l\'appareil est reconnu pour la compagnie:', companyId);
    
    // Générer l'empreinte de l'appareil actuel
    const currentFingerprint = await generateDeviceFingerprint();
    
    // Récupérer l'empreinte stockée dans le localStorage
    const storedFingerprint = localStorage.getItem(`employee_device_${companyId}`);
    
    console.log('Empreintes numériques:', {
      current: currentFingerprint,
      stored: storedFingerprint
    });
    
    if (!storedFingerprint) {
      console.log('Aucune empreinte stockée, appareil non reconnu');
      return false;
    }
    
    // Comparer les empreintes
    const isRecognized = currentFingerprint === storedFingerprint;
    console.log('Appareil reconnu:', isRecognized);
    return isRecognized;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'appareil:', error);
    return false;
  }
};

// Vérifier si un appareil est connu pour un employé
export const isKnownDevice = async (
  employeeId: string,
  companyId: string,
  supabase: any
): Promise<boolean> => {
  try {
    // Générer l'empreinte de l'appareil actuel
    const fingerprint = await generateDeviceFingerprint();
    
    // Vérifier si cette empreinte existe dans la base de données pour cet employé
    const { data, error } = await supabase
      .from('employee_devices')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('company_id', companyId)
      .eq('fingerprint', fingerprint)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'appareil:', error);
    return false;
  }
};

// Enregistrer l'empreinte numérique d'un nouvel appareil
export const registerDeviceFingerprint = async (
  employeeId: string,
  companyId: string,
  deviceName: string,
  supabase: any
): Promise<boolean> => {
  try {
    // Générer l'empreinte de l'appareil actuel
    const fingerprint = await generateDeviceFingerprint();
    
    // Enregistrer l'empreinte dans la base de données
    const { error } = await supabase
      .from('employee_devices')
      .insert([
        {
          employee_id: employeeId,
          company_id: companyId,
          fingerprint: fingerprint,
          device_name: deviceName,
          registered_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'appareil:', error);
    return false;
  }
};
