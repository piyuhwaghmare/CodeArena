import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add problem form
    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        difficulty: 'easy'
    });

    // Test cases management
    const [selectedProblemId, setSelectedProblemId] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [newTestCase, setNewTestCase] = useState({
        input: '',
        expected_output: '',
        is_hidden: false
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/editor');
        }
    }, [user]);

    useEffect(() => {
        fetchStats();    //Fetch status to show to user
        fetchProblems(); // Fetch problems on mount so they're available for test cases tab
    }, []);

    useEffect(() => {
        if (activeTab === 'problems') fetchProblems();
        if (activeTab === 'submissions') fetchSubmissions();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);      //Fetch on chaning the active tab by user click

    const fetchStats = async () => {
        const res = await api.get('/admin/stats');
        setStats(res.data);
    };

    const fetchProblems = async () => {
        setLoading(true);
        const res = await api.get('/admin/problems');
        setProblems(res.data);
        setLoading(false);
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        const res = await api.get('/admin/submissions');
        setSubmissions(res.data);
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(res.data);
        setLoading(false);
    };

    const addProblem = async () => {
        if (!newProblem.title || !newProblem.description) return;
        try {
            await api.post('/admin/problems', newProblem);
            setNewProblem({ title: '', description: '', difficulty: 'easy' });
            fetchProblems();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add problem');
        }
    };

    const deleteProblem = async (id) => {
        if (!confirm('Delete this problem?')) return;
        await api.delete(`/admin/problems/${id}`);
        fetchProblems();
        fetchStats();
    };

    const deleteSubmission = async (id) => {
        if (!confirm('Delete this submission?')) return;
        await api.delete(`/admin/submissions/${id}`);
        fetchSubmissions();
        fetchStats();
    };

    const deleteUser = async (id) => {
        if (!confirm('Delete this user? This will delete all their submissions too.')) return;
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
        fetchStats();
    };

    // Test case management functions
    const fetchTestCases = async (problemId) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/problems/${problemId}/testcases`);
            setTestCases(res.data);
            setSelectedProblemId(problemId);
        } catch (err) {
            alert('Failed to fetch test cases');
        }
        setLoading(false);
    };

    const addTestCase = async () => {
        if (!selectedProblemId) {
            alert('Please select a problem first');
            return;
        }
        if (!newTestCase.expected_output) {
            alert('Expected output is required');
            return;
        }
        try {
            await api.post(`/admin/problems/${selectedProblemId}/testcases`, newTestCase);
            setNewTestCase({ input: '', expected_output: '', is_hidden: false });
            fetchTestCases(selectedProblemId);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add test case');
        }
    };

    const deleteTestCase = async (id) => {
        if (!confirm('Delete this test case?')) return;
        try {
            await api.delete(`/admin/testcases/${id}`);
            fetchTestCases(selectedProblemId);
        } catch (err) {
            alert('Failed to delete test case');
        }
    };

    const getDifficultyStyle = (diff) => {
        if (diff === 'easy') return { color: '#00ff88' };
        if (diff === 'medium') return { color: '#ffc800' };
        return { color: '#ff6b6b' };
    };

    const getStatusColor = (status) => {
        if (status === 'accepted') return '#00ff88';
        if (status === 'error') return '#ff6b6b';
        if (status === 'running') return '#00aaff';
        return '#ffc800';
    };

    return (
        <div style={styles.container}>

            {/* Navbar */}
            <div style={styles.navbar}>
                <div style={styles.logo}>
                    <span style={{ color: '#fff' }}>Code</span>
                    <span style={{ color: '#00ff88' }}>Arena</span>
                    <span style={styles.adminBadge}>ADMIN</span>
                </div>
                <div style={styles.navRight}>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>
                        👤 {user?.username}
                    </span>
                    <button
                        onClick={() => navigate('/editor')}
                        style={styles.navBtn}
                    >
                        Editor
                    </button>
                    <button
                        onClick={async () => {
                            await logout();
                            navigate('/login');
                        }}
                        style={styles.logoutBtn}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.content}>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {['stats', 'problems', 'testcases', 'submissions', 'users'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...styles.tab,
                                background: activeTab === tab
                                    ? 'rgba(0,255,136,0.1)'
                                    : 'transparent',
                                color: activeTab === tab
                                    ? '#00ff88'
                                    : '#888',
                                borderBottom: activeTab === tab
                                    ? '2px solid #00ff88'
                                    : '2px solid transparent',
                            }}
                        >
                            {tab === 'testcases' ? 'Test Cases' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Stats Tab */}
                {activeTab === 'stats' && stats && (
                    <div>
                        <h2 style={styles.sectionTitle}>Dashboard</h2>
                        <div style={styles.statsGrid}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                                { label: 'Total Problems', value: stats.totalProblems, icon: '📝' },
                                { label: 'Total Submissions', value: stats.totalSubmissions, icon: '📤' },
                                { label: 'Accepted', value: stats.acceptedCount, icon: '✅' },
                            ].map(stat => (
                                <div key={stat.label} style={styles.statCard}>
                                    <div style={styles.statIcon}>{stat.icon}</div>
                                    <div style={styles.statValue}>{stat.value}</div>
                                    <div style={styles.statLabel}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Problems Tab */}
                {activeTab === 'problems' && (
                    <div>
                        <h2 style={styles.sectionTitle}>Problems</h2>

                        {/* Add Problem Form */}
                        <div style={styles.formCard}>
                            <h3 style={styles.formTitle}>Add New Problem</h3>
                            <div style={styles.formGrid}>
                                <input
                                    placeholder="Problem title"
                                    value={newProblem.title}
                                    onChange={e => setNewProblem({
                                        ...newProblem,
                                        title: e.target.value
                                    })}
                                    style={styles.input}
                                />
                                <select
                                    value={newProblem.difficulty}
                                    onChange={e => setNewProblem({
                                        ...newProblem,
                                        difficulty: e.target.value
                                    })}
                                    style={styles.select}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="Problem description..."
                                value={newProblem.description}
                                onChange={e => setNewProblem({
                                    ...newProblem,
                                    description: e.target.value
                                })}
                                style={styles.textarea}
                                rows={3}
                            />
                            <button
                                onClick={addProblem}
                                style={styles.addBtn}
                            >
                                + Add Problem
                            </button>
                        </div>

                        {/* Problems List */}
                        {loading ? (
                            <p style={{ color: '#666' }}>Loading...</p>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Title</th>
                                            <th style={styles.th}>Difficulty</th>
                                            <th style={styles.th}>Created</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {problems.map(p => (
                                            <tr key={p.id} style={styles.tableRow}>
                                                <td style={styles.td}>{p.id}</td>
                                                <td style={styles.td}>{p.title}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...getDifficultyStyle(p.difficulty),
                                                        fontWeight: 'bold',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {p.difficulty}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {new Date(p.created_at)
                                                        .toLocaleDateString()}
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => deleteProblem(p.id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        ✕ Delete
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setActiveTab('testcases');
                                                            fetchTestCases(p.id);
                                                        }}
                                                        style={{
                                                            ...styles.deleteBtn,
                                                            background: 'rgba(0,170,255,0.1)',
                                                            borderColor: 'rgba(0,170,255,0.3)',
                                                            color: '#00aaff',
                                                            marginLeft: '8px'
                                                        }}
                                                    >
                                                        📝 Test Cases
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Test Cases Tab */}
                {activeTab === 'testcases' && (
                    <div>
                        <h2 style={styles.sectionTitle}>Test Cases Management</h2>

                        {/* Problem Selector */}
                        <div style={styles.formCard}>
                            <h3 style={styles.formTitle}>Select Problem</h3>
                            <select
                                value={selectedProblemId || ''}
                                onChange={(e) => {
                                    const id = parseInt(e.target.value);
                                    if (id) fetchTestCases(id);
                                }}
                                style={styles.select}
                            >
                                <option value="">-- Select a Problem --</option>
                                {problems.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} ({p.difficulty})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Add Test Case Form */}
                        {selectedProblemId && (
                            <div style={styles.formCard}>
                                <h3 style={styles.formTitle}>
                                    Add Test Case for: {problems.find(p => p.id === selectedProblemId)?.title}
                                </h3>
                                
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={styles.label}>Input (stdin)</label>
                                    <textarea
                                        placeholder="Enter input for the test case (leave empty if no input needed)"
                                        value={newTestCase.input}
                                        onChange={e => setNewTestCase({
                                            ...newTestCase,
                                            input: e.target.value
                                        })}
                                        style={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={styles.label}>Expected Output *</label>
                                    <textarea
                                        placeholder="Enter expected output (required)"
                                        value={newTestCase.expected_output}
                                        onChange={e => setNewTestCase({
                                            ...newTestCase,
                                            expected_output: e.target.value
                                        })}
                                        style={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#aaa',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={newTestCase.is_hidden}
                                            onChange={e => setNewTestCase({
                                                ...newTestCase,
                                                is_hidden: e.target.checked
                                            })}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        Hidden Test Case (users won't see input/output, only pass/fail)
                                    </label>
                                </div>

                                <button
                                    onClick={addTestCase}
                                    style={styles.addBtn}
                                >
                                    + Add Test Case
                                </button>
                            </div>
                        )}

                        {/* Test Cases List */}
                        {selectedProblemId && (
                            <div>
                                <h3 style={{
                                    color: '#aaa',
                                    fontSize: '16px',
                                    marginBottom: '16px',
                                    fontWeight: '600'
                                }}>
                                    Test Cases ({testCases.length})
                                </h3>

                                {loading ? (
                                    <p style={{ color: '#666' }}>Loading...</p>
                                ) : testCases.length === 0 ? (
                                    <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                                        No test cases yet. Add one above.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {testCases.map((tc, index) => (
                                            <div key={tc.id} style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <span style={{
                                                            color: '#00ff88',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px'
                                                        }}>
                                                            Test Case #{index + 1}
                                                        </span>
                                                        {tc.is_hidden && (
                                                            <span style={{
                                                                background: 'rgba(255,200,0,0.1)',
                                                                border: '1px solid rgba(255,200,0,0.3)',
                                                                borderRadius: '4px',
                                                                padding: '2px 8px',
                                                                color: '#ffc800',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                🔒 HIDDEN
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTestCase(tc.id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        ✕ Delete
                                                    </button>
                                                </div>

                                                <div style={{ display: 'grid', gap: '12px' }}>
                                                    <div>
                                                        <div style={{
                                                            color: '#888',
                                                            fontSize: '12px',
                                                            marginBottom: '6px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Input:
                                                        </div>
                                                        <pre style={{
                                                            background: 'rgba(0,0,0,0.3)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            padding: '10px',
                                                            color: '#ccc',
                                                            fontSize: '13px',
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            margin: 0
                                                        }}>
                                                            {tc.input || '(no input)'}
                                                        </pre>
                                                    </div>

                                                    <div>
                                                        <div style={{
                                                            color: '#888',
                                                            fontSize: '12px',
                                                            marginBottom: '6px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Expected Output:
                                                        </div>
                                                        <pre style={{
                                                            background: 'rgba(0,0,0,0.3)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            padding: '10px',
                                                            color: '#00ff88',
                                                            fontSize: '13px',
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            margin: 0
                                                        }}>
                                                            {tc.expected_output}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedProblemId && (
                            <p style={{
                                color: '#666',
                                textAlign: 'center',
                                padding: '60px 20px',
                                fontSize: '14px'
                            }}>
                                👆 Select a problem above to manage its test cases
                            </p>
                        )}
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div>
                        <h2 style={styles.sectionTitle}>All Submissions</h2>
                        {loading ? (
                            <p style={{ color: '#666' }}>Loading...</p>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>User</th>
                                            <th style={styles.th}>Problem</th>
                                            <th style={styles.th}>Language</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Time</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(s => (
                                            <tr key={s.id} style={styles.tableRow}>
                                                <td style={styles.td}>{s.id}</td>
                                                <td style={styles.td}>{s.username}</td>
                                                <td style={styles.td}>
                                                    {s.problem || 'General'}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.langBadge}>
                                                        {s.language}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        color: getStatusColor(s.status),
                                                        fontWeight: 'bold',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {s.exec_time_ms
                                                        ? `${s.exec_time_ms}ms`
                                                        : '-'}
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() =>
                                                            deleteSubmission(s.id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <h2 style={styles.sectionTitle}>All Users</h2>
                        {loading ? (
                            <p style={{ color: '#666' }}>Loading...</p>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Username</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Role</th>
                                            <th style={styles.th}>Submissions</th>
                                            <th style={styles.th}>Accepted</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={styles.tableRow}>
                                                <td style={styles.td}>{u.id}</td>
                                                <td style={styles.td}>
                                                    {u.username}
                                                </td>
                                                <td style={styles.td}>{u.email}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        color: u.role === 'admin'
                                                            ? '#ffc800'
                                                            : '#00aaff',
                                                        fontWeight: 'bold',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {u.total_submissions}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        color: '#00ff88'
                                                    }}>
                                                        {u.accepted}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() =>
                                                                deleteUser(u.id)}
                                                            style={styles.deleteBtn}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
        borderBottom: '1px solid rgba(255,200,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    adminBadge: {
        background: 'rgba(255,200,0,0.2)',
        border: '1px solid rgba(255,200,0,0.4)',
        borderRadius: '4px',
        padding: '2px 8px',
        color: '#ffc800',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '32px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    tab: {
        padding: '10px 24px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
        textTransform: 'capitalize',
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '24px',
        color: '#ffffff',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
    },
    statIcon: {
        fontSize: '32px',
        marginBottom: '12px',
    },
    statValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#00ff88',
        marginBottom: '8px',
    },
    statLabel: {
        color: '#666',
        fontSize: '13px',
    },
    formCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
    },
    formTitle: {
        color: '#aaa',
        fontSize: '14px',
        marginBottom: '16px',
        fontWeight: '600',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '12px',
        marginBottom: '12px',
    },
    input: {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '14px',
        outline: 'none',
    },
    select: {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '14px',
        cursor: 'pointer',
    },
    textarea: {
        width: '100%',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        marginBottom: '12px',
        boxSizing: 'border-box',
    },
    addBtn: {
        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
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
    },
    tableRow: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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
    deleteBtn: {
        background: 'rgba(255,80,80,0.1)',
        border: '1px solid rgba(255,80,80,0.3)',
        borderRadius: '6px',
        padding: '4px 10px',
        color: '#ff6b6b',
        cursor: 'pointer',
        fontSize: '12px',
    },
    label: {
        display: 'block',
        color: '#888',
        fontSize: '12px',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '600',
    },
};