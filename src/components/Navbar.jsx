import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleAddEventClick = () => {
    console.log("handleAddEventClick");
    const token = localStorage.getItem("token");
    const role = getUserRole();

    if (!token) {
      console.log("No token");
      navigate("/login");

    } else if (role === "club-admin") {
      console.log("Club admin");
      navigate("/add-event");
    } else {
      alert("Only admins can list events.");
    }
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
            <button 
              className="nav-link text-white btn btn-link p-0 border-0" 
              onClick={handleAddEventClick}
              style={{ background: 'none', textDecoration: 'none' }}
            >
              List your event
            </button>
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