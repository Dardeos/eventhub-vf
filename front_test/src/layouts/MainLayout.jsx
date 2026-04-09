// Primary layout wrapper handling responsive navigation, theme toggling, and nested route rendering
import { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MainLayout = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); 
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement; 
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="p-6 text-brand-text bg-brand-bg min-h-screen">Loading...</div>;
    
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300 flex flex-col">
            
            <nav className="bg-brand-card border-b border-brand-border p-4 shadow-sm transition-colors duration-300 relative z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-xl font-black tracking-wider text-blue-600 dark:text-blue-400">
                        <Link to="/">EventHub</Link>
                    </div>

                    <button 
                        className="md:hidden p-2 rounded-lg border border-brand-border"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>

                    <div className="hidden md:flex gap-6 items-center font-medium">
                        <Link to="/" className="hover:text-blue-500 transition-colors">Dashboard</Link>
                        <Link to="/events" className="hover:text-blue-500 transition-colors">Events</Link>
                        <Link to="/participants" className="hover:text-blue-500 transition-colors">Participants</Link>
                        <Link to="/node-stats" className="hover:text-blue-500 font-bold transition-colors flex items-center gap-1">Node Stats</Link>
                        <div className="border-l border-brand-border pl-6 flex items-center gap-4">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-1.5 px-3 rounded-lg border border-brand-border bg-brand-bg hover:opacity-70 transition-opacity text-sm shadow-sm"
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>

                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full whitespace-nowrap">
                                Role: {user?.role || 'viewer'}
                            </span>

                            {user?.role === 'admin' && (
                                <a href={`${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/admin/`} target="_blank" rel="noopener noreferrer" className="border border-brand-border bg-brand-bg px-3 py-1 rounded hover:opacity-70 text-sm transition-colors">
                                    Admin
                                </a>
                            )}

                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {menuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-brand-card border-b border-brand-border p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="font-bold py-2 border-b border-brand-border/50">Dashboard</Link>
                        <Link to="/events" onClick={() => setMenuOpen(false)} className="font-bold py-2 border-b border-brand-border/50">Events</Link>
                        <Link to="/participants" onClick={() => setMenuOpen(false)} className="font-bold py-2 border-b border-brand-border/50">Participants</Link>
                        <Link to="/node-stats" onClick={() => setMenuOpen(false)} className="font-bold py-2 border-b border-brand-border/50 text-indigo-600 dark:text-indigo-400">Node Stats</Link>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 px-4 rounded-lg border border-brand-border bg-brand-bg flex-1 flex justify-center"
                            >
                                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                            </button>
                            {user?.role === 'admin' && (
                                <a href={`${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/admin/`} target="_blank" rel="noopener noreferrer" className="border border-brand-border bg-brand-bg p-2 px-4 rounded hover:opacity-70 text-sm transition-colors">
                                    Admin
                                </a>
                            )}
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 text-white p-2 px-4 rounded-lg font-bold flex-1"
                            >
                                Logout
                            </button>
                        </div>
                        <div className="text-center text-xs opacity-50">
                            Logged in as: {user?.username} ({user?.role})
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;