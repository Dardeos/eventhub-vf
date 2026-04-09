import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const EventList = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [statusFilter, dateFilter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (dateFilter) {
                const parts = dateFilter.split('/');
                if (parts.length === 3) {
                    params.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else {
                    params.date = dateFilter; 
                }
            }

            // Retrieves the list of events from the API applying active status and date filters
            const response = await api.get('/events/', { params });
            setEvents(response.data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch events.');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/events/${id}/`);
            setEvents(prev => prev.filter(event => event.id !== id));
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black">Events Management</h1>
                
                {(user?.role === 'admin' || user?.role === 'editor') && (
                    <Link to="/events/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                        + Create Event
                    </Link>
                )}
            </div>

            <div className="flex flex-wrap gap-4 mb-8 bg-brand-card p-4 rounded-xl border border-brand-border shadow-sm">
                <div className="flex flex-col">
                    <label className="text-sm font-bold opacity-70 mb-1">Status</label>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)} 
                        className="p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-text outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="finished">Finished</option>
                    </select>
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-bold opacity-70 mb-1">Date</label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)} 
                            className="p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-text outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {dateFilter && (
                            <button onClick={() => setDateFilter('')} className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 font-bold transition">
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="text-lg opacity-70">Loading events...</p>
            ) : error ? (
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg font-medium">{error}</div>
            ) : events.length === 0 ? (
                <p className="text-lg opacity-70">No events found matching your filters.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="border border-brand-border p-6 rounded-xl shadow-md bg-brand-card flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-lg">
                            <div>
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="font-bold text-xl line-clamp-1 break-words">{event.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase shrink-0 ${
                                        event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
                                        event.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                                        'bg-gray-500/20 text-gray-500'
                                    }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <p className="opacity-70 mb-4 font-medium flex items-center gap-2">
                                    {event.date ? event.date.split('T')[0] : 'No Date Set'}
                                </p>
                            </div>
                            
                            <div className="mt-4 flex gap-3 pt-4 border-t border-brand-border">
                                <Link to={`/events/${event.id}`} className="flex-1 text-center bg-brand-bg border border-brand-border py-2 rounded font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition">View</Link>
                                
                                {(user?.role === 'admin' || user?.role === 'editor') && (
                                    <Link to={`/events/edit/${event.id}`} className="flex-1 text-center bg-brand-bg border border-brand-border py-2 rounded font-bold hover:opacity-70 transition">Edit</Link>
                                )}
                                
                                {user?.role === 'admin' && (
                                    <button onClick={() => handleDelete(event.id)} className="flex-1 text-center bg-red-500/10 text-red-500 border border-red-500/20 py-2 rounded font-bold hover:bg-red-500 hover:text-white transition">
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;