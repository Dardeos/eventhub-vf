import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ParticipantList = () => {
    const { user } = useContext(AuthContext);
    const [participants, setParticipants] = useState([]);
    const [editingId, setEditingId] = useState(null); 
    const [editData, setEditData] = useState({ name: '', email: '' }); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const res = await api.get('/participants/');
            setParticipants(res.data);
        } catch (err) {
            console.error("Failed to fetch participants");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (p) => {
        setEditingId(p.id);
        setEditData({ name: p.name, email: p.email });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ name: '', email: '' });
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/participants/${id}/`, editData);
            setParticipants(participants.map(p => p.id === id ? { ...p, ...editData } : p));
            setEditingId(null);
        } catch (err) {
            alert("Update failed. Check your permissions.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this participant?")) return;
        try {
            await api.delete(`/participants/${id}/`);
            setParticipants(participants.filter(p => p.id !== id));
        } catch (err) {
            console.error("Delete failed");
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black mb-6 text-brand-text">Manage Participants</h1>
                {(user?.role === 'admin' || user?.role === 'editor') && (
                        <Link to="/participants/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                            + Add Participant
                        </Link>
                    )}
            </div>
            <div className="overflow-x-auto bg-brand-card border border-brand-border rounded-xl">
                {participants.length === 0 ? (
                    <p className="p-4 opacity-70">No participants found.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/50">
                                <th className="p-4 font-bold uppercase text-xs opacity-60">Name</th>
                                <th className="p-4 font-bold uppercase text-xs opacity-60">Email</th>
                                <th className="p-4 font-bold uppercase text-xs opacity-60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((p) => (
                                <tr key={p.id} className="hover:bg-brand-bg/30 transition-colors border-b border-brand-border last:border-0">
                                    {editingId === p.id ? (
                                        <>
                                            <td className="p-4">
                                                <input 
                                                    className="bg-brand-bg border border-blue-500 rounded px-3 py-2 w-full text-brand-text outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    className="bg-brand-bg border border-blue-500 rounded px-3 py-2 w-full text-brand-text outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    value={editData.email}
                                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                                />
                                            </td>
                                            <td className="p-4 text-right flex gap-3 justify-end items-center mt-1">
                                                <button onClick={() => handleUpdate(p.id)} className="text-green-500 font-bold hover:underline">Save</button>
                                                <button onClick={cancelEdit} className="text-gray-400 hover:underline">Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 font-medium">{p.name}</td>
                                            <td className="p-4 opacity-80">{p.email}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-4 justify-end">
                                                    {(user?.role === 'admin' || user?.role === 'editor') && (
                                                        <button 
                                                            onClick={() => startEdit(p)}
                                                            className="text-blue-500 hover:text-blue-400 font-bold text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {user?.role === 'admin' && (
                                                        <button 
                                                            onClick={() => handleDelete(p.id)} 
                                                            className="text-red-500 hover:text-red-400 font-bold text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ParticipantList;