import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, participantsRes, regRes] = await Promise.all([
                    api.get(`/events/${id}/`),
                    api.get('/participants/'),
                    api.get(`/registrations/?event=${id}`) 
                ]);

                setEvent(eventRes.data);
                setParticipants(participantsRes.data || []);
                const eventRegs = (regRes.data || []).filter(r => r.event === parseInt(id));
                setRegistrations(eventRegs);
                
            } catch (error) {
                console.error(error);
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);


    const myParticipant = participants.find(p => 
        p.name?.toLowerCase() === user?.username?.toLowerCase()
    );
    const isAlreadyRegistered = myParticipant 
        ? registrations.some(r => r.participant === myParticipant.id)
        : false;
    const myRegistration = registrations.find(r => r.participant === myParticipant?.id);
        
    if (authLoading || loading) {
        return <p className="p-6">Loading data...</p>;
    }

    if (error) return <p className="p-6 text-red-500 font-bold">{Error}</p>;


    const handleRegister = async (e, participantId = null) => {
        if (e) e.preventDefault();
        setMessage(null);
        const idToRegister = participantId || selectedParticipant;

        if (!idToRegister) {
            setMessage({ type: 'error', text: 'Please select a participant.' });
            return;
        }

        try {
            const newReg = await api.post('/registrations/', {
                event: parseInt(id),
                participant: parseInt(idToRegister)
            });

            setMessage({ type: 'success', text: 'Registered successfully!' });
            setRegistrations([...registrations, newReg.data]);
            setSelectedParticipant('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.status === 400 ? 'Already registered.' : 'Failed to register.' });
        }
    };

    const handleDeleteRegistration = async (registrationId) => {
        if (!window.confirm("Are you sure you want to remove this participant?")) return;
        try {
            await api.delete(`/registrations/${registrationId}/`);
            setRegistrations(prev => prev.filter(r => r.id !== registrationId));
            setMessage({ type: 'success', text: 'Participant removed successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove participant.' });
        }
    };

    if (loading) return <p className="p-6">Loading event details...</p>;
    if (error) return <p className="p-6 text-red-500 font-bold">{error}</p>;

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="min-w-0">
                <h1 className="text-4xl font-black mb-4 break-words">{event.title}</h1>
                <p className="mb-8 text-lg opacity-80 break-words whitespace-pre-wrap max-w-full">
                    {event.description}
                </p>

                <h3 className="text-2xl font-bold mb-4 border-b border-brand-border pb-2">Currently Registered</h3>
                {registrations.length === 0 ? (
                    <p className="opacity-60 italic">No one is registered for this event yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {registrations.map(reg => {
                            const p = participants.find(part => part.id === reg.participant);
                            const participantName = p ? p.name : 'Unknown Participant';
                            const initial = p && p.name ? p.name.toUpperCase() : '?';

                            return (
                                <li key={reg.id} className="p-3 bg-brand-card border border-brand-border rounded-lg shadow-sm flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                                            {initial[0]}
                                        </div>
                                        <span className="font-medium truncate">{participantName}</span>
                                    </div>

                                    {(user?.role === 'admin' || user?.role === 'editor') && (
                                        <button 
                                            onClick={() => handleDeleteRegistration(reg.id)}
                                            className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-md text-sm font-bold transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div>
                <div className="bg-brand-card border border-brand-border p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">Register a Participant</h3>

                    {message && (
                        <div className={`p-3 mb-4 rounded font-medium ${
                            message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {user?.role === 'viewer' ? (
                        isAlreadyRegistered ? (
                            <div className="flex flex-col gap-4 text-center">
                                <div className="py-2">
                                    <span className="text-green-500 font-bold text-lg">You are registered!</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteRegistration(myRegistration?.id)}
                                    className="text-red-500 hover:text-red-600 font-semibold text-sm hover:underline transition-all"
                                >
                                    Leave this event
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 text-center">
                                <p className="opacity-80">Register to attend the event</p>
                                <button 
                                    onClick={() => handleRegister(null, myParticipant?.id)} 
                                    className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                    disabled={!myParticipant}
                                >
                                    {myParticipant ? "Join Event" : "Syncing Profile..."}
                                </button>
                                {!myParticipant && !loading && (
                                    <p className="text-xs text-red-400 mt-2">
                                        Note: Your username ({user?.username}) must match a Participant name.
                                    </p>
                                )}
                            </div>
                        )
                    ) : (
                        participants.length === 0 ? (
                            <p className="opacity-60">No participants available to register.</p>
                        ) : (
                            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                                <select
                                    value={selectedParticipant}
                                    onChange={(e) => setSelectedParticipant(e.target.value)}
                                    className="p-3 rounded bg-brand-bg border border-brand-border text-brand-text focus:ring-2 focus:ring-blue-500 outline-none w-full"
                                >
                                    <option value="" className="bg-brand-bg text-brand-text">-- Select a Participant --</option>
                                    {participants.map(p => (
                                        <option key={p.id} value={p.id} className="bg-brand-bg text-brand-text">
                                            {p.name} 
                                        </option>
                                    ))}
                                </select>

                                <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors">
                                    Register for Event
                                </button>
                            </form>
                        )
                    )}

                    
                </div>
            </div>
        </div>
    );
};

export default EventDetails;