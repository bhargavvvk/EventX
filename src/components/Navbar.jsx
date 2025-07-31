import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectIsLoggedIn, selectUserRole, selectCanCreateEvents } from '../store/userSlice';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const userRole = useAppSelector(selectUserRole);
  const canCreateEvents = useAppSelector(selectCanCreateEvents);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <nav className="navbar navbar-dark" style={{ backgroundColor: "#003285" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">

          {/* Left: Brand */}
          <Link className="navbar-brand text-white fw-bold fs-4" to="/">EventX</Link>

          {/* Center: Search Bar */}
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

          {/* Right: Event link + Profile */}
          <div className="d-flex align-items-center gap-3">
            {!isLoggedIn ? (
              <Link className="nav-link text-white" to="/login">List your event</Link>
            ) : canCreateEvents ? (
              <>
                <Link className="nav-link text-white" to="/create-event">List your event</Link>
                <span className="text-white small">({userRole})</span>
                <button className="nav-link text-white border-0 bg-transparent" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <span className="text-white small">({userRole})</span>
                <button className="nav-link text-white border-0 bg-transparent" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            <Link className="nav-link" to="/profile">
              <img
                src="/profile.png"
                alt="Profile"
                width="32"
                height="32"
                className="rounded-circle"
              />
            </Link>
          </div>

        </div>
      </nav>
    </div>
  );
};

export default Navbar;