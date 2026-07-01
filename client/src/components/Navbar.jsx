import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🗂️ TaskManager</Link>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <span className="navbar-user">👤 {user.name}</span>
            <span className="navbar-role">{user.role}</span>
            {user.role === 'admin' && (
              <Link to="/admin" className="navbar-link">Admin Panel</Link>
            )}
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;