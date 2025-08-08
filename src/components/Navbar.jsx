import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole, isAuthenticated, isAdmin, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const role = getUserRole();
  const isUserAdmin = isAdmin();

  const handleAddEventClick = () => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else if (isAdmin()) {
      navigate("/admindashboard");
    } else {
      alert("Only admins can list events.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar navbar-dark" style={{ backgroundColor: "#003285" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">

          {/* Left: Brand */}
          <Link className="navbar-brand text-white fw-bold fs-4" to="/">EventX</Link>

          {/* Center: Search Bar - Hidden for club-admin users */}
          {!isUserAdmin && (
            <form className="d-flex mx-auto" role="search" style={{ width: "400px" }}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search events"
                aria-label="Search"
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
          )}

          {/* Right: List Event + Profile Dropdown */}
          <div className="d-flex align-items-center gap-3">

            {/* List Event */}
            <button
              className="nav-link text-white btn btn-link p-0 border-0"
              onClick={handleAddEventClick}
              style={{ background: 'none', textDecoration: 'none' }}
            >
              List your event
            </button>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button
                className="btn p-0 border-0 bg-transparent"
                type="button"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <img
                  src="/profile.png"
                  alt="Profile"
                  width="32"
                  height="32"
                  className="rounded-circle"
                />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                {!isLoggedIn && (
                  <li>
                    <Link className="dropdown-item" to="/login">Login</Link>
                  </li>
                )}
                {isLoggedIn && role === 'user' && (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/my-events">Registered Events</Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                )}
                {isLoggedIn && role === 'club-admin' && (
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

