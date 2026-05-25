import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div style={styles.container}>

            {/* Navbar */}
            <div style={styles.navbar}>
                <div style={styles.logo}>
                    <span style={{ color: '#fff' }}>Code</span>            
                    <span style={{ color: '#00ff88' }}>Arena</span>
                </div>
                <div style={styles.navRight}>
                    {user ? (
                        <button
                            onClick={() => navigate('/editor')}         //Button to navigate to editor
                            style={styles.primaryBtn}
                        >
                            Go to Editor
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}        //Button to login if not to access editor
                                style={styles.ghostBtn}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}     //Button to Register if not have any account
                                style={styles.primaryBtn}
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.badge}>
                    Distributed Code Execution Engine
                </div>
                <h1 style={styles.heroTitle}>
                    Code. Execute. <span style={{ color: '#00ff88' }}>Win.</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    A real-time code execution platform built with
                    Docker sandboxes, Redis queues, and WebSocket
                    live results.
                </p>
                <div style={styles.heroBtns}>
                    <button
                        onClick={() => navigate(user ? '/editor' : '/register')}
                        style={styles.primaryBtn}
                    >
                        {user ? 'Start Coding' : 'Get Started Free'}
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.ghostBtn}
                    >
                        Login
                    </button>
                </div>

                {/* Tech Stack */}
                <div style={styles.techStack}>
                    {['Docker', 'Redis', 'BullMQ', 'WebSockets',           //Tech Stack use in Project
                      'PostgreSQL', 'Node.js', 'React'].map(tech => (
                        <span key={tech} style={styles.techBadge}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div style={styles.features}>
                {[
                    {
                        icon: '🐳',
                        title: 'Docker Sandboxed',
                        desc: 'Code runs in isolated containers with memory and CPU limits. Zero security risk.'
                    },
                    {
                        icon: '⚡',
                        title: 'Real-time Results',
                        desc: 'WebSocket powered live results. See output the moment execution completes.'
                    },
                    {
                        icon: '📋',
                        title: 'Queue System',
                        desc: 'Redis BullMQ handles concurrent submissions. Never crashes under load.'
                    },
                    {
                        icon: '🔒',
                        title: 'JWT Auth',
                        desc: 'Secure authentication with access tokens, refresh tokens, and Redis blacklisting.'
                    },
                ].map(feature => (
                    <div key={feature.title} style={styles.featureCard}>
                        <div style={styles.featureIcon}>{feature.icon}</div>
                        <h3 style={styles.featureTitle}>{feature.title}</h3>
                        <p style={styles.featureDesc}>{feature.desc}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
    },
    navbar: {
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    navRight: {
        display: 'flex',
        gap: '12px',
    },
    hero: {
        textAlign: 'center',
        padding: '100px 24px 80px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    badge: {
        display: 'inline-block',
        background: 'rgba(0,255,136,0.1)',
        border: '1px solid rgba(0,255,136,0.3)',
        borderRadius: '20px',
        padding: '6px 16px',
        color: '#00ff88',
        fontSize: '20px',
        marginBottom: '24px',
    },
    heroTitle: {
        fontSize: '56px',
        fontWeight: 'bold',
        lineHeight: 1.2,
        marginBottom: '20px',
    },
    heroSubtitle: {
        fontSize: '18px',
        color: '#888',
        lineHeight: 1.7,
        marginBottom: '40px',
    },
    heroBtns: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '48px',
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 28px',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '15px',
        cursor: 'pointer',
    },
    ghostBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        padding: '12px 28px',
        color: '#ffffff',
        fontSize: '15px',
        cursor: 'pointer',
    },
    techStack: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
    },
    techBadge: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        padding: '6px 14px',
        color: '#aaa',
        fontSize: '13px',
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px 80px',
    },
    featureCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '28px 24px',
        textAlign: 'center',
    },
    featureIcon: {
        fontSize: '36px',
        marginBottom: '16px',
    },
    featureTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#ffffff',
    },
    featureDesc: {
        fontSize: '14px',
        color: '#666',
        lineHeight: 1.6,
    },
};