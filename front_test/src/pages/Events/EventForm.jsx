import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '', 
        date: '', 
        status: 'upcoming', 
        description: ''
    });
    
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchEvent = async () => {
                try {
                    const response = await api.get(`/events/${id}/`);
                    const eventData = response.data;
                    
                    let formattedDate = '';
                    if (eventData.date) {
                        const dateObj = new Date(eventData.date);
                        const year = dateObj.getUTCFullYear();
                        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getUTCDate()).padStart(2, '0');
                        
                        formattedDate = `${year}-${month}-${day}`;
                    }
                    
                    setFormData({
                        title: eventData.title || '',
                        date: formattedDate, 
                        status: eventData.status || 'upcoming',
                        description: eventData.description || ''
                    });
                } catch (err) {
                    console.error("Fetch error:", err);
                    setError("Failed to load event data.");
                } finally {
                    setLoading(false);
                }
            };
            fetchEvent();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await api.put(`/events/${id}/`, formData);
            } else {
                await api.post('/events/', formData);
            }
            navigate('/events');
        } catch (err) {
            console.error("Submit error:", err.response?.data || err);
            setError("Failed to save the event. Please check the form data.");
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-xl font-bold opacity-70">Loading event data...</div>;

    const inputClass = "w-full p-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text outline-none focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="max-w-2xl mx-auto bg-brand-card border border-brand-border p-8 rounded-2xl shadow-xl mt-10 transition-colors">
            <h1 className="text-3xl font-black mb-6 text-brand-text">
                {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 font-bold text-sm">
                     {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label className="font-bold opacity-80 text-sm text-brand-text">Event Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        className={inputClass} 
                        placeholder="e.g. Annual Tech Conference"
                    />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <label className="font-bold opacity-80 text-sm text-brand-text">Date</label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                        className={inputClass} 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-bold opacity-80 text-sm text-brand-text">Status</label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        className={inputClass}
                    >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="finished">Finished</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-bold opacity-80 text-sm text-brand-text">Description</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="5" 
                        className={inputClass} 
                        placeholder="Details about the event..."
                    ></textarea>
                </div>

                <div className="flex gap-4 mt-4 pt-4 border-t border-brand-border">
                    <button 
                        type="button" 
                        onClick={() => navigate('/events')}
                        className="flex-1 bg-brand-bg border border-brand-border font-bold py-3 rounded-lg hover:opacity-70 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="flex- bg-blue-600 text-white font-black py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;