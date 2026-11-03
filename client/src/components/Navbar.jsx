import { NavLink } from "react-router-dom";

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <h1>🎂 Birthday Reminder</h1>
      <div className="links">
        <NavLink to="/friends">Friends</NavLink>
        <NavLink to="/family">Family</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <NavLink to="/add">+ Add</NavLink>
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
}
