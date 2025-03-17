import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import ScanHeader from '@/components/scan/ScanHeader';
import LoadingState from '@/components/scan/LoadingState';
import InvalidQRState from '@/components/scan/InvalidQRState';
import TimeTrackingComponent from '@/components/scan/TimeTrackingComponent';
import { useScanValidator, ScanState } from '@/hooks/useScanValidator';
import { Button } from '@/components/ui/button';

const ScanQRCode = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    state,
    employeeId,
    companyId,
    employeeData,
    errorMessage
  } = useScanValidator();

  // Check for the logout flag in session storage
  useEffect(() => {
    const hasLoggedOut = sessionStorage.getItem('scan_logged_out') === 'true';
    
    // If the user has logged out and is trying to access the scan page directly
    // without a new QR code scan, redirect them to the home page
    if (hasLoggedOut && !searchParams.get('data')) {
      navigate('/', { replace: true });
    } else if (searchParams.get('data')) {
      // New QR scan, clear the logout flag
      sessionStorage.removeItem('scan_logged_out');
    }
  }, [searchParams, navigate]);

  // Handle redirection to registration page when needed
  useEffect(() => {
    if (state === ScanState.REGISTRATION && companyId) {
      navigate(`/register?companyId=${companyId}`);
    }
  }, [state, companyId, navigate]);
  
  // Force new registration by clearing stored fingerprint
  const handleForceNewRegistration = () => {
    // Add forceNew=true to search params
    if (companyId) {
      localStorage.removeItem(`employee_device_${companyId}`);
      const currentData = searchParams.get('data');
      if (currentData) {
        setSearchParams({ data: currentData, forceNew: 'true' });
      } else {
        // If no data, we can't do anything
        console.error('No QR data available, cannot force new registration');
      }
    }
  };

  // Render the appropriate component based on state
  const renderContent = () => {
    switch (state) {
      case ScanState.LOADING:
        return <LoadingState />;
        
      case ScanState.INVALID_QR:
        return (
          <>
            <InvalidQRState errorMessage={errorMessage} />
            {companyId && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleForceNewRegistration}
                  className="mt-2"
                >
                  Forcer une nouvelle inscription
                </Button>
              </div>
            )}
          </>
        );
        
      case ScanState.TIME_TRACKING:
        console.log('Rendering TimeTrackingComponent with employeeId:', employeeId);
        return (
          <>
            {(employeeId && companyId) ? (
              <TimeTrackingComponent 
                employeeId={employeeId} 
                companyId={companyId}
                employeeName={employeeData?.name}
              />
            ) : null}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Layout>
      <PageTransition>
        <div className="container max-w-md mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <ScanHeader state={state} />
            {renderContent()}
          </motion.div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default ScanQRCode;
