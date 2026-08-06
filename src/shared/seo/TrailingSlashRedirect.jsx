import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Client-side trailing-slash cleanup: /moving/ → /moving
 * (Server 301 should also be configured on the host.)
 */
export default function TrailingSlashRedirect({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      navigate(`${pathname.replace(/\/+$/, '')}${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return children;
}
