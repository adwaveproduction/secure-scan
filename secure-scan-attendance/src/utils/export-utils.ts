
/**
 * Utilitaires pour l'export de données en Excel
 */
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Exporte les données au format Excel et déclenche le téléchargement
 * @param data Les données à exporter
 * @param fileName Nom du fichier Excel sans extension
 * @param sheetName Nom de la feuille Excel
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = 'Données'
): void => {
  try {
    // Création du workbook et ajout de la feuille avec les données
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Génération du fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Téléchargement du fichier
    saveAs(blob, `${fileName}.xlsx`);
    
    console.log(`Export Excel réussi: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
  }
};

/**
 * Formate les données pour différents types d'export
 */
export const formatEmployeeListData = (employees: any[]) => {
  return employees.map(employee => ({
    Nom: employee.name,
    Email: employee.email,
    "Date d'inscription": new Date().toLocaleDateString('fr-FR')
  }));
};

export const formatEmployeeMetricsData = (metrics: any[]) => {
  return metrics.map(employee => ({
    Employé: employee.name,
    Email: employee.email,
    "Jours travaillés": employee.daysWorked,
    "Heures totales": employee.totalHours,
    "Moyenne quotidienne (h)": employee.averageHoursPerDay
  }));
};

export const formatMonthlyTotalsData = (employee: any, monthlyTotals: any[]) => {
  return monthlyTotals.map(monthData => ({
    Employé: employee.name,
    Email: employee.email,
    Mois: monthData.monthName,
    "Heures totales": monthData.totalHours
  }));
};
