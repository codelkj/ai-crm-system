/**
 * Private Route Component
 * Redirects to login if user is not authenticated
 * Wraps authenticated routes with Enhanced Layout
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import EnhancedLayout from './EnhancedLayout';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? (
    <EnhancedLayout>{children}</EnhancedLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
