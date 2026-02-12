import { useEffect, useState } from "react";
import socket from './socket';

function DebugPanel() {

const [status, setStatus] = useState('disconnected');
const [socketId, setSocketId] = useState('');
const [roomInput, setRoomInput] = useState('');
const [log, setLog] = useState([]);
const [roomCode, setRoomCode] = useState('');

useEffect(() => {
    socket.on('welcome', (data) => {
        setStatus('connected');
        setSocketId(data.id);
        setLog(prev => [...prev, `welcome: ${data.message}`]);
    });

    socket.on('disconnect', () => {
        setStatus('disconnected');
    });

    socket.on('pong', () => {
        setLog(prev => [...prev, 'pong received']);
    });

    socket.on('leaderboard:invalidate', () => {
      setLog(prev => [...prev, 'leaderboard:invalidate received']);
  });
}, []);

return (
      <div>
          <h2>Socket Debug Panel</h2>
          <p>Status: {status}</p>
          <p>Socket ID: {socketId}</p>

          <div>
              <input value={roomInput} onChange={e => setRoomInput(e.target.value)} placeholder="Room ID" />
              <button onClick={() => socket.emit('room:join', { playerName: 'Player2', roomId: roomInput }, (res) => console.log(res))}>Join Room</button>
              <button onClick={() => socket.emit('room:create', { playerName: 'Player1' }, (res) => setRoomCode(res.code))}>Create Room</button>
              <button onClick={() => socket.emit('leaderboard:invalidate', roomCode)}>Broadcast</button>
              <p>Room Code: {roomCode}</p>
              <button onClick={() => socket.emit('ping')}>Ping</button>
          </div>

          <h3>Event Log</h3>
          <ul>
              {log.map((entry, i) => <li key={i}>{entry}</li>)}
          </ul>
      </div>
  );
}

export default DebugPanel;