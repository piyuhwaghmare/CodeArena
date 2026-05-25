import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();    //Get login from Gloabal data
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();    //avoid form from reload
        setError('');          //No Error
        setLoading(true);      //Loading...

        try {
            const data = await login(email, password);

            if (data.user.role === 'admin') {
               navigate('/admin');                // if role = 'admin'
            } else {
               navigate('/editor');               // if role = 'user'
            }

        } catch (err) {
            setError(
                err.response?.data?.error || 'Login failed. Try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* LOGO */}
                <div style={styles.logo}>                             
                    <span style={styles.logoText}>Code</span>
                    <span style={styles.logoAccent}>Arena</span>
                </div>

                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Login to continue coding</p>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>     
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}  //change as user types
                            placeholder="piyush@gmail.com"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}  //changes as user types
                            placeholder="••••••••"
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>     
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        backdropFilter: 'blur(10px)',
    },
    logo: {
        textAlign: 'center',
        marginBottom: '8px',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    logoText: {
        color: '#ffffff',
    },
    logoAccent: {
        color: '#00ff88',
    },
    title: {
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '22px',
        marginBottom: '8px',
    },
    subtitle: {
        textAlign: 'center',
        color: '#888',
        fontSize: '14px',
        marginBottom: '24px',
    },
    errorBox: {
        background: 'rgba(255,50,50,0.1)',
        border: '1px solid rgba(255,50,50,0.3)',
        borderRadius: '8px',
        padding: '12px',
        color: '#ff6b6b',
        fontSize: '14px',
        marginBottom: '16px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: '#aaa',
        fontSize: '14px',
    },
    input: {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#ffffff',
        fontSize: '15px',
        outline: 'none',
        transition: 'border 0.2s',
    },
    button: {
        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        border: 'none',
        borderRadius: '8px',
        padding: '14px',
        color: '#000000',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '8px',
        transition: 'opacity 0.2s',
    },
    switchText: {
        textAlign: 'center',
        color: '#888',
        fontSize: '14px',
        marginTop: '24px',
    },
    link: {
        color: '#00ff88',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};