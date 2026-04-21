import { useEffect, useState } from "react";
import Header from "./components/Header";
import { loginWithGoogle } from "./js/auth";

function DebugPanel({ socket, user, loading }) {
const [connectionInfo, setConnectionInfo] = useState({
    status: 'disconnected',
    socketId: '',
    userId: '',
});
const [log, setLog] = useState([]);
const [leaderboard, setLeaderboard] = useState([]);

useEffect(() => {
    if (!socket) {
        return;
    }

    const onWelcome = (data) => {
        setConnectionInfo({
            status: 'connected',
            socketId: data.id,
            userId: data.userId || '',
        });
        setLog(prev => [...prev, { type: 'info', text: `welcome: ${data.message} (user: ${data.userId})` }]);
    };
    const onConnectError = (err) => {
        setConnectionInfo(prev => ({ ...prev, status: 'disconnected' }));
        setLog(prev => [...prev, { type: 'info', text: `connect_error: ${err.message}` }]);
    };
    const onDisconnect = () => {
        setConnectionInfo(prev => ({
            ...prev,
            status: 'disconnected',
            socketId: '',
            userId: '',
        }));
    };
    const onPong = () => setLog(prev => [...prev, { type: 'info', text: 'pong received' }]);
    const onLeaderboardUpdate = (data) => {
        setLeaderboard(data);
        setLog(prev => [...prev, { type: 'leaderboard', text: `leaderboard:update` }]);
    };
    const onGameStarted = () => setLog(prev => [...prev, { type: 'game', text: 'game:started' }]);
    const onGameClicked = () => setLog(prev => [...prev, { type: 'game', text: 'game:clicked' }]);
    const onPlayerFinished = () => setLog(prev => [...prev, { type: 'game', text: 'game:player-finished' }]);

    socket.on('welcome', onWelcome);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong);
    socket.on('leaderboard:update', onLeaderboardUpdate);
    socket.on('game:started', onGameStarted);
    socket.on('game:clicked', onGameClicked);
    socket.on('game:player-finished', onPlayerFinished);

    return () => {
        socket.off('welcome', onWelcome);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.off('pong', onPong);
        socket.off('leaderboard:update', onLeaderboardUpdate);
        socket.off('game:started', onGameStarted);
        socket.off('game:clicked', onGameClicked);
        socket.off('game:player-finished', onPlayerFinished);
    };
}, [socket]);

const status = socket ? connectionInfo.status : 'disconnected';
const socketId = socket ? connectionInfo.socketId : '';
const userId = socket ? connectionInfo.userId : '';

const logColor = { info: '#888', game: '#4ec94e', leaderboard: '#f0a500' };

const btnStyle = (bg, disabled) => ({
    padding: '6px 12px', borderRadius: 4, background: bg,
    color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
});

const disabled = !socket || status !== 'connected';

return (
    <div style={{ fontFamily: 'monospace', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

        <Header />

        <div style={{ padding: '16px', background: '#1e1e1e', color: '#d4d4d4', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 8, overflow: 'hidden' }}>

            {/* Auth + connection info */}
            <div>
                <h2 style={{ color: '#61dafb', margin: '0 0 8px 0' }}>Socket Debug Panel</h2>
                {loading ? (
                    <p style={{ margin: '2px 0', color: '#888' }}>Loading auth...</p>
                ) : !user ? (
                    <p style={{ margin: '2px 0' }}>
                        <span style={{ color: '#f0a500' }}>Not logged in</span> —{' '}
                        <a onClick={loginWithGoogle} style={{ color: '#61dafb', cursor: 'pointer', textDecoration: 'underline' }}>
                            Sign in with Google
                        </a>
                    </p>
                ) : (
                    <>
                        <p style={{ margin: '2px 0' }}>User: <span style={{ color: '#4ec94e' }}>{user.displayName || user.email}</span></p>
                        <p style={{ margin: '2px 0' }}>Status: <span style={{ color: status === 'connected' ? '#4ec94e' : '#f44747' }}>{status}</span></p>
                        <p style={{ margin: '2px 0', fontSize: 11, color: '#888' }}>Socket ID: {socketId}</p>
                        <p style={{ margin: '2px 0', fontSize: 11, color: '#888' }}>User ID: {userId}</p>
                    </>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button disabled={disabled} onClick={() => socket.emit('ping')} style={btnStyle('#444', disabled)}>Ping</button>
                <button disabled={disabled} onClick={() => socket.emit('game:start', { startPage: 'Cat', targetPage: 'Dog' }, (res) => setLog(prev => [...prev, { type: 'game', text: `game:start — ${JSON.stringify(res)}` }]))} style={btnStyle('#2d7a2d', disabled)}>Start Game</button>
                <button disabled={disabled} onClick={() => socket.emit('game:click', { newPage: 'Animal' }, (res) => setLog(prev => [...prev, { type: 'game', text: `game:click — ${JSON.stringify(res)}` }]))} style={btnStyle('#2d7a2d', disabled)}>Click</button>
                <button disabled={disabled} onClick={() => socket.emit('game:player-finished')} style={btnStyle('#7a2d2d', disabled)}>Finish</button>
            </div>

            {/* Lower split */}
            <div style={{ display: 'flex', gap: 12, flexGrow: 1, overflow: 'hidden' }}>

                {/* Event log */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3 style={{ color: '#888', fontSize: 12, margin: '0 0 4px 0' }}>Event Log</h3>
                    <ul style={{ listStyle: 'none', margin: 0, padding: '8px', background: '#2d2d2d', borderRadius: 4, overflowY: 'auto', flexGrow: 1 }}>
                        {log.map((entry, i) => (
                            <li key={i} style={{ fontSize: 11, padding: '3px 0', borderBottom: '1px solid #3a3a3a', color: logColor[entry.type] || '#d4d4d4' }}>
                                {entry.text}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Leaderboard */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3 style={{ color: '#888', fontSize: 12, margin: '0 0 4px 0' }}>Leaderboard</h3>
                    <div style={{ background: '#2d2d2d', borderRadius: 4, padding: '8px', flexGrow: 1, overflowY: 'auto' }}>
                        {leaderboard.length === 0
                            ? <p style={{ color: '#555', fontSize: 11, margin: 0 }}>No data yet</p>
                            : leaderboard.map((p, i) => (
                                <div key={p.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #3a3a3a', fontSize: 12 }}>
                                    <span style={{ color: '#888' }}>#{i + 1} {p.displayName || p.userId.slice(-6)}</span>
                                    <span style={{ color: p.completed ? '#4ec94e' : '#f0a500' }}>{p.clicks} clicks {p.completed ? '✓' : ''}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </div>
        </div>
    </div>
);
}

export default DebugPanel;
