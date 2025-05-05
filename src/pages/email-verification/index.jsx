import React, { useState } from 'react';
import { ToggleableEmailForm } from '../../features/auth';

const EmailVerificationPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  return <ToggleableEmailForm isOpen={isOpen} onClose={handleClose} />;
};

export default EmailVerificationPage; 