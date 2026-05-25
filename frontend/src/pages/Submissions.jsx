import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/user/submissions');
            setSubmissions(res.data);
        } catch (err) {
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'accepted':
                return { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',
                         border: 'rgba(0,255,136,0.3)' };
            case 'error':
                return { color: '#ff6b6b', bg: 'rgba(255,80,80,0.1)',
                         border: 'rgba(255,80,80,0.3)' };
            case 'running':
                return { color: '#00aaff', bg: 'rgba(0,170,255,0.1)',
                         border: 'rgba(0,170,255,0.3)' };
            default:
                return { color: '#ffc800', bg: 'rgba(255,200,0,0.1)',
                         border: 'rgba(255,200,0,0.3)' };
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={styles.container}>

            {/* Navbar */}
            <div style={styles.navbar}>
                <div style={styles.logo}>
                    <span style={{ color: '#fff' }}>Code</span>
                    <span style={{ color: '#00ff88' }}>Arena</span>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.username}>
                        👤 {user?.username}
                    </span>
                    <button
                        onClick={() => navigate('/editor')}
                        style={styles.navBtn}
                    >
                        ← Back to Editor
                    </button>
                    <button
                        onClick={handleLogout}
                        style={styles.logoutBtn}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Submissions</h1>
                    <p style={styles.subtitle}>
                        {submissions.length} total submissions
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={styles.center}>
                        <p style={{ color: '#00aaff' }}>
                            Loading submissions...
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && submissions.length === 0 && (
                    <div style={styles.center}>
                        <p style={{ fontSize: '48px' }}>📭</p>
                        <p style={{ color: '#666', marginTop: '16px' }}>
                            No submissions yet
                        </p>
                        <button
                            onClick={() => navigate('/editor')}
                            style={styles.goCodeBtn}
                        >
                            Start Coding
                        </button>
                    </div>
                )}

                {/* Submissions Table */}
                {!loading && submissions.length > 0 && (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Problem</th>
                                    <th style={styles.th}>Language</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Time</th>
                                    <th style={styles.th}>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub, index) => {
                                    const s = getStatusStyle(sub.status);
                                    return (
                                        <tr
                                            key={sub.id}
                                            style={{
                                                ...styles.tableRow,
                                                background: index % 2 === 0
                                                    ? 'rgba(255,255,255,0.02)'
                                                    : 'transparent'
                                            }}
                                        >
                                            <td style={styles.td}>
                                                {sub.id}
                                            </td>
                                            <td style={styles.td}>
                                                {sub.problem || 'General'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.langBadge}>
                                                    {sub.language}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: s.color,
                                                    background: s.bg,
                                                    border: `1px solid ${s.border}`
                                                }}>
                                                    {sub.status === 'accepted'
                                                        ? '✅ Accepted'
                                                        : sub.status === 'error'
                                                        ? '❌ Error'
                                                        : sub.status === 'running'
                                                        ? '⚡ Running'
                                                        : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {sub.exec_time_ms
                                                    ? `${sub.exec_time_ms}ms`
                                                    : '-'}
                                            </td>
                                            <td style={styles.td}>
                                                {formatDate(sub.submitted_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0f0f23',
        color: '#ffffff',
    },
    navbar: {
        height: '56px',
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(0,255,136,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    username: {
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(0,255,255,0.7)',
        margin: '20px',
        border: '3px solid #00ffff',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #ff00ff85, #00ffff61, #00ff9977)',
        boxShadow: `
            0 0 10px #00ffff3e,
            0 0 20px #ff00ff48,
            0 0 40px #00ff9956
        `,
        textShadow: '0 0 8px rgba(255,255,255,0.8)',
        display: 'inline-block'
    },
    navBtn: {
        background: 'transparent',
        border: '1px solid rgba(0,255,136,0.4)',
        borderRadius: '6px',
        padding: '6px 14px',
        color: '#00ff88',
        cursor: 'pointer',
        fontSize: '13px',
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,80,80,0.4)',
        borderRadius: '6px',
        padding: '6px 14px',
        color: '#ff6b6b',
        cursor: 'pointer',
        fontSize: '13px',
    },
    content: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#666',
        fontSize: '14px',
    },
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: '8px',
    },
    errorBox: {
        background: 'rgba(255,50,50,0.1)',
        border: '1px solid rgba(255,50,50,0.3)',
        borderRadius: '8px',
        padding: '16px',
        color: '#ff6b6b',
        marginBottom: '24px',
    },
    goCodeBtn: {
        marginTop: '16px',
        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        color: '#000',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px',
    },
    tableWrapper: {
        overflowX: 'auto',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    th: {
        padding: '14px 16px',
        textAlign: 'left',
        color: '#888',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableRow: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.15s',
    },
    td: {
        padding: '14px 16px',
        color: '#ccc',
        fontSize: '14px',
    },
    langBadge: {
        background: 'rgba(0,170,255,0.1)',
        border: '1px solid rgba(0,170,255,0.3)',
        borderRadius: '4px',
        padding: '2px 8px',
        color: '#00aaff',
        fontSize: '12px',
        fontWeight: 'bold',
    },
};