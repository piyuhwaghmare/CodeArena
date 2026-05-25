import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Editor from './pages/Editor';
import Submissions from './pages/Submissions';
import Landing from './pages/Landing';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#00ff00'
    }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/editor" replace />;
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/editor" element={
                        <ProtectedRoute>
                            <Editor />
                        </ProtectedRoute>
                    }/>
                    <Route path="/submissions" element={
                        <ProtectedRoute>
                            <Submissions />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    }/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;