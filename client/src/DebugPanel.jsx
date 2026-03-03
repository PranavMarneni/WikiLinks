import { useEffect, useState } from "react";
import socket from './socket';

function DebugPanel() {

const [status, setStatus] = useState('disconnected');
const [socketId, setSocketId] = useState('');
const [roomInput, setRoomInput] = useState('');
const [log, setLog] = useState([]);
const [roomCode, setRoomCode] = useState('');
const [leaderboard, setLeaderboard] = useState([]);

useEffect(() => {
    const onWelcome = (data) => {
        setStatus('connected');
        setSocketId(data.id);
        setLog(prev => [...prev, { type: 'info', text: `welcome: ${data.message}` }]);
    };
    const onDisconnect = () => setStatus('disconnected');
    const onPong = () => setLog(prev => [...prev, { type: 'info', text: 'pong received' }]);
    const onLeaderboardInvalidate = () => setLog(prev => [...prev, { type: 'info', text: 'leaderboard:invalidate received' }]);
    const onRoomJoined = (data) => setLog(prev => [...prev, { type: 'room', text: `room:joined — ${Object.keys(data.room.players).length} players` }]);
    const onLeaderboardUpdate = (data) => {
        setLeaderboard(data);
        setLog(prev => [...prev, { type: 'leaderboard', text: `leaderboard:update` }]);
    };
    const onGameStarted = () => setLog(prev => [...prev, { type: 'game', text: 'game:started' }]);
    const onGameClicked = () => setLog(prev => [...prev, { type: 'game', text: 'game:clicked' }]);
    const onPlayerFinished = () => setLog(prev => [...prev, { type: 'game', text: 'game:player-finished' }]);

    socket.on('welcome', onWelcome);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong);
    socket.on('leaderboard:invalidate', onLeaderboardInvalidate);
    socket.on('room:joined', onRoomJoined);
    socket.on('leaderboard:update', onLeaderboardUpdate);
    socket.on('game:started', onGameStarted);
    socket.on('game:clicked', onGameClicked);
    socket.on('game:player-finished', onPlayerFinished);

    return () => {
        socket.off('welcome', onWelcome);
        socket.off('disconnect', onDisconnect);
        socket.off('pong', onPong);
        socket.off('leaderboard:invalidate', onLeaderboardInvalidate);
        socket.off('room:joined', onRoomJoined);
        socket.off('leaderboard:update', onLeaderboardUpdate);
        socket.off('game:started', onGameStarted);
        socket.off('game:clicked', onGameClicked);
        socket.off('game:player-finished', onPlayerFinished);
    };
}, []);

const logColor = { info: '#888', room: '#61dafb', game: '#4ec94e', leaderboard: '#f0a500' };

const btnStyle = (bg) => ({ padding: '6px 12px', borderRadius: 4, background: bg, color: '#fff', border: 'none', cursor: 'pointer' });

return (
    <div style={{ fontFamily: 'monospace', height: '100vh', padding: '16px', background: '#1e1e1e', color: '#d4d4d4', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: 8 }}>

        {/* Top bar */}
        <div>
            <h2 style={{ color: '#61dafb', margin: '0 0 8px 0' }}>Socket Debug Panel</h2>
            <p style={{ margin: '2px 0' }}>Status: <span style={{ color: status === 'connected' ? '#4ec94e' : '#f44747' }}>{status}</span></p>
            <p style={{ margin: '2px 0', fontSize: 11, color: '#888' }}>Socket ID: {socketId}</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <input value={roomInput} onChange={e => setRoomInput(e.target.value)} placeholder="Room ID"
                style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #444', background: '#2d2d2d', color: '#d4d4d4' }} />
            <button onClick={() => socket.emit('room:join', { playerName: 'Player2', roomId: roomInput }, (res) => { setLog(prev => [...prev, { type: 'room', text: `room:join — ${JSON.stringify(res)}` }]); if (res.code) setRoomCode(res.code); })} style={btnStyle('#0e639c')}>Join Room</button>
            <button onClick={() => socket.emit('room:create', { playerName: 'Player1' }, (res) => { setLog(prev => [...prev, { type: 'room', text: `room:create — ${JSON.stringify(res)}` }]); if (res.code) setRoomCode(res.code); })} style={btnStyle('#0e639c')}>Create Room</button>
            <button onClick={() => socket.emit('ping')} style={btnStyle('#444')}>Ping</button>
            <span style={{ padding: '6px 0', fontSize: 12 }}>Room: <strong style={{ color: '#61dafb' }}>{roomCode || '—'}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => socket.emit('game:start', { code: roomCode, startPage: 'Cat', targetPage: 'Dog' }, (res) => setLog(prev => [...prev, { type: 'game', text: `game:start — ${JSON.stringify(res)}` }]))} style={btnStyle('#2d7a2d')}>Start Game</button>
            <button onClick={() => socket.emit('game:click', { newPage: 'Animal' }, (res) => setLog(prev => [...prev, { type: 'game', text: `game:click — ${JSON.stringify(res)}` }]))} style={btnStyle('#2d7a2d')}>Click</button>
            <button onClick={() => socket.emit('game:player-finished', { code: roomCode })} style={btnStyle('#7a2d2d')}>Finish</button>
        </div>

        {/* Lower split */}
        <div style={{ display: 'flex', gap: 12, flexGrow: 1, overflow: 'hidden' }}>

            {/* Event log - 2/3 */}
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

            {/* Leaderboard - 1/3 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <h3 style={{ color: '#888', fontSize: 12, margin: '0 0 4px 0' }}>Leaderboard</h3>
                <div style={{ background: '#2d2d2d', borderRadius: 4, padding: '8px', flexGrow: 1, overflowY: 'auto' }}>
                    {leaderboard.length === 0
                        ? <p style={{ color: '#555', fontSize: 11, margin: 0 }}>No data yet</p>
                        : leaderboard.map((p, i) => (
                            <div key={p.sessionId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #3a3a3a', fontSize: 12 }}>
                                <span style={{ color: '#888' }}>#{i + 1} {p.sessionId.slice(-6)}</span>
                                <span style={{ color: p.completed ? '#4ec94e' : '#f0a500' }}>{p.clicks} clicks {p.completed ? '✓' : ''}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    </div>
);
}

export default DebugPanel;
