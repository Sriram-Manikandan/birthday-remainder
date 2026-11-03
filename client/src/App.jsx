import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReminderAlert from "./components/ReminderAlert";
import PeoplePage from "./pages/PeoplePage";
import PersonForm from "./pages/PersonForm";
import CalendarPage from "./pages/CalendarPage";

export default function App() {
  // Light/dark mode: remembered in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // CSS reads this
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="container">
        <ReminderAlert />
        <Routes>
          <Route path="/" element={<Navigate to="/friends" />} />
          <Route path="/friends" element={<PeoplePage group="friend" />} />
          <Route path="/family" element={<PeoplePage group="family" />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/add" element={<PersonForm />} />
          <Route path="/edit/:id" element={<PersonForm />} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
