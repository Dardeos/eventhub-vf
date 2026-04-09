import { useEffect, useState, useContext } from 'react'; 
import { nodeApi } from '../services/api';
import { AuthContext } from '../context/AuthContext'; 
import { Link } from 'react-router-dom';

const NodeStats = () => {
    const { user } = useContext(AuthContext); 
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Determines if the current user has write-access based on their role
    const canManage = user?.role === 'admin' || user?.role === 'editor';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        status: 'upcoming'
    });

    const fetchData = async () => {
        try {
            const [statsRes, eventsRes] = await Promise.all([
                nodeApi.get('/stats'),
                nodeApi.get('/events')
            ]);
            setStats(statsRes.data);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error("Node backend connection error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const startEdit = (event) => {
        if (!canManage) return; 
        setEditingId(event.id);
        setFormData({
            title: event.title,
            description: event.description || '',
            date: event.date ? event.date.split('T')[0] : '', 
            status: event.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', description: '', date: '', status: 'upcoming' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canManage) return alert("Unauthorized");  

        try {
            if (editingId) {
                await nodeApi.put(`/events/${editingId}`, formData);
            } else {
                await nodeApi.post('/events', formData);
            }
            cancelEdit();
            fetchData();
        } catch (err) {
            alert("Save failed: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!canManage || user?.role !== 'admin') {
             return alert("Only admins can delete events.");
        }
        if (!window.confirm("Delete this event?")) return;
        try {
            await nodeApi.delete(`/events/${id}`);
            fetchData();
        } catch (err) {
            console.error("Delete failed");
        }
    };

    if (loading) return <p className="p-6 text-brand-text">Loading Node data...</p>;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-black mb-6 text-brand-text">Node Technical Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats?.total} color="blue" />
                <StatCard label="Upcoming" value={stats?.upcoming} color="yellow" />
                <StatCard label="Ongoing" value={stats?.ongoing} color="green" />
                <StatCard label="Finished" value={stats?.finished} color="red" />
            </div>

            {canManage && (
                <div className={`p-6 rounded-xl border transition-colors ${editingId ? 'border-blue-500 bg-blue-500/5' : 'bg-brand-card border-brand-border'}`}>
                    <h2 className="text-xl font-bold text-brand-text mb-4">
                        {editingId ? "Edit Event" : "New Event"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                type="text" placeholder="Event Title" required
                                className="bg-brand-bg border border-brand-border p-3 rounded-lg text-brand-text focus:border-blue-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <input 
                                type="date" required
                                className="bg-brand-bg border border-brand-border p-3 rounded-lg text-brand-text focus:border-blue-500 outline-none"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <textarea 
                            placeholder="Detailed description"
                            className="w-full bg-brand-bg border border-brand-border p-3 rounded-lg text-brand-text h-24 focus:border-blue-500 outline-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <div className="flex gap-4">
                            <select 
                                className="bg-brand-bg border border-brand-border p-3 rounded-lg text-brand-text outline-none"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="finished">Finished</option>
                            </select>

                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
                                {editingId ? "Save Changes" : "Create via Node"}
                            </button>

                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="px-6 bg-brand-border text-brand-text rounded-lg hover:opacity-80">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto bg-brand-card border border-brand-border rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                            <th className="p-4 font-bold uppercase text-xs opacity-60 text-brand-text">Event</th>
                            <th className="p-4 font-bold uppercase text-xs opacity-60 text-brand-text">Date</th>
                            <th className="p-4 font-bold uppercase text-xs opacity-60 text-brand-text">Status</th>
                            {canManage && <th className="p-4 font-bold uppercase text-xs opacity-60 text-brand-text text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id} className="hover:bg-brand-bg/30 transition-colors border-b border-brand-border last:border-0">
                                <td className="p-4">
                                    <Link to={`/events/${event.id}`} className="hover:underline group">
                                        <p className="font-bold text-brand-text group-hover:text-blue-500 transition-colors">{event.title}</p>
                                    </Link>
                                    <p className="text-xs opacity-60 truncate max-w-xs text-brand-text">{event.description}</p>
                                </td>
                                <td className="p-4 text-brand-text opacity-80">{new Date(event.date).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        event.status === 'finished' ? 'bg-red-500/20 text-red-500' : 
                                        event.status === 'ongoing' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        {event.status}
                                    </span>
                                </td>
                                {canManage && (
                                    <td className="p-4 text-right">
                                        <div className="flex gap-4 justify-end">
                                            <button 
                                                onClick={() => startEdit(event)}
                                                className="text-blue-500 hover:text-blue-400 font-bold text-sm"
                                            >
                                                Edit
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button 
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-red-500 hover:text-red-400 font-bold text-sm"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => {
    const colorMap = {
        blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
        yellow: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
        green: 'text-green-500 border-green-500/20 bg-green-500/5',
        red: 'text-red-500 border-red-500/20 bg-red-500/5'
    };

    return (
        <div className={`p-4 border rounded-xl ${colorMap[color]}`}>
            <p className="text-xs uppercase font-black opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-black">{value || 0}</p>
        </div>
    );
};

export default NodeStats;