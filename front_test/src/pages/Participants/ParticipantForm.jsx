import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ParticipantForm = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        user:user?.id,
        name: '',
        email: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post('/participants/', formData);
            navigate('/participants');
        } catch (error) {
            console.error(error.response?.data || error);
            setError("Failed to create participant. Please check the details.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text outline-none focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-brand-card border border-brand-border rounded-2xl shadow-xl transition-colors">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2 text-brand-text">Add Participant</h1>
                <p className="opacity-60 font-medium">Register a new person for your events.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 font-bold text-sm">
                     {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="block mb-2 text-sm font-bold opacity-80 text-brand-text">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Jane Doe"
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-bold opacity-80 text-brand-text">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jane@example.com"
                        className={inputClass}
                        required
                    />
                </div>

                <div className="pt-4 border-t border-brand-border flex gap-4">
                    <button 
                        type="button" 
                        onClick={() => navigate('/participants')}
                        className="flex-1 bg-brand-bg border border-brand-border font-bold py-4 rounded-xl hover:opacity-70 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Participant'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ParticipantForm;