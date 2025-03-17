
import QRCode from 'qrcode';
import { supabase, isUsingMockClient } from './supabase-client';

// Générer un QR code valide jusqu'à régénération
export const generateQRCode = async (
  companyId: string
): Promise<{ qrUrl: string; qrId: string }> => {
  const now = new Date();
  
  // Créer un identifiant unique pour ce QR code
  const qrId = crypto.randomUUID();
  
  // Créer un token avec données nécessaires
  const token = {
    companyId,
    qrId,
    timestamp: now.getTime(),
    // Ajoutez un identifiant unique pour éviter la réutilisation
    nonce: Math.random().toString(36).substring(2, 15)
  };
  
  // Convertir les données en chaîne JSON
  const qrData = JSON.stringify(token);
  
  // Créer une URL complète pour la page de scan
  const baseUrl = window.location.origin;
  const scanUrl = `${baseUrl}/scan?data=${encodeURIComponent(qrData)}`;
  
  console.log('Generated scan URL:', scanUrl);
  console.log('QR data:', qrData);
  
  // Générer l'URL du QR code avec l'URL complète
  const qrUrl = await QRCode.toDataURL(scanUrl);
  
  // Sauvegarder le nouveau QR code dans Supabase et désactiver les anciens
  await saveQRCodeToSupabase(companyId, qrId);
  
  return { qrUrl, qrId };
};

// Sauvegarder un nouveau QR code dans Supabase
const saveQRCodeToSupabase = async (
  companyId: string, 
  qrId: string
): Promise<void> => {
  try {
    // Si nous utilisons le client mock, juste logger
    if (isUsingMockClient) {
      console.log('Mode démo: Nouveau QR code simulé enregistré', {
        qrId,
        companyId,
        active: true
      });
      return;
    }
    
    console.log('Saving QR code to Supabase:', { qrId, companyId });
    
    // Désactiver tous les anciens QR codes de cette entreprise
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ active: false })
      .eq('company_id', companyId)
      .eq('active', true);
      
    if (updateError) {
      console.error('Error deactivating old QR codes:', updateError);
    }
    
    // Insérer le nouveau QR code
    const { error: insertError } = await supabase
      .from('qr_codes')
      .insert([
        {
          id: qrId,
          company_id: companyId,
          active: true,
          created_at: new Date().toISOString()
        }
      ]);
      
    if (insertError) {
      console.error('Error inserting new QR code:', insertError);
      throw new Error('Échec de sauvegarde du QR code');
    }
    
    console.log('Successfully saved QR code to Supabase');
      
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du QR code:', error);
    throw new Error('Échec de sauvegarde du QR code');
  }
};

// Décoder les données du QR code
export const decodeQRCode = (qrData: string): any => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Erreur lors du décodage du QR code:', error);
    throw new Error('Format de QR code invalide');
  }
};
