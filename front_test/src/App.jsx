// Main application router implementing protected routes and rendering logic
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import EventList from './pages/Events/EventList';
import EventDetails from './pages/Events/EventDetails';
import EventForm from './pages/Events/EventForm';
import ParticipantList from './pages/Participants/ParticipantList';
import ParticipantForm from './pages/Participants/ParticipantForm';
import NodeStats from './pages/NodeStats';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route index element={<Dashboard />} />
                        
                        <Route path="events" element={<EventList />} />
                        <Route path="events/new" element={<EventForm />} />
                        <Route path="events/edit/:id" element={<EventForm />} />
                        <Route path="events/:id" element={<EventDetails />} />

                        <Route path="participants" element={<ParticipantList />} />
                        <Route path="participants/new" element={<ParticipantForm />} />
                        <Route path="participants/edit/:id" element={<ParticipantForm />} />
                        <Route path="node-stats" element={<NodeStats />} />
                    </Route>
                    <Route path="*" element={<div>404</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;