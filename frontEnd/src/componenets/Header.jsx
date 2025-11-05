import { Link, Outlet } from "react-router";

export default function Header()
{
  return<>
  <header className="header">
    <h1>Task Tracker & Swapper</h1>
    <nav className="nav-links">
    <Link to="/login">Login</Link>
    <Link to="/">Signup</Link>
    <Link to="/dashboard">DashBoard</Link>
    </nav>
  </header>
  <Outlet/>
  </>
}