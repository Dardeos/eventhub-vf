import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);

    const [stats, setStats] = useState({
        events: 0,
        participants: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetches event and participant totals concurrently using Promise.all
                const [eventsRes, participantsRes] = await Promise.all([
                    api.get('/events/'),
                    api.get('/participants/')
                ]);

                setStats({
                    events: eventsRes?.data?.length || 0,
                    participants: participantsRes?.data?.length || 0
                });

            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Failed to load dashboard data.");
                setStats({ events: 0, participants: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [authLoading, user]); 

    if (authLoading) {
        return <p className="p-6">Loading user...</p>;
    }

    if (loading) {
        return <p className="p-6">Loading dashboard...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-600">{error}</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to EventHub!</h1>

            <p className="text-gray-600 mb-8">
                You are logged in as{' '}
                <strong>{user?.role || 'user'}</strong>.
                {user?.role === 'viewer' &&
                    " You have read-only access to the system."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">
                        Total Events
                    </h2>

                    <p className="text-4xl font-black text-blue-600 mb-4">
                        {stats.events}
                    </p>

                    <Link
                        to="/events"
                        className="text-blue-500 hover:underline"
                    >
                        Manage Events →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">
                        Total Participants
                    </h2>

                    <p className="text-4xl font-black text-green-600 mb-4">
                        {stats.participants}
                    </p>

                    <Link
                        to="/participants"
                        className="text-green-500 hover:underline"
                    >
                        Manage Participants →
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;