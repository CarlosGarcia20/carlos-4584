import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/UseAuth';

export function ProtectedRoute() {
   const { user } = useAuth();
   return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
   const { user } = useAuth();
   return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}