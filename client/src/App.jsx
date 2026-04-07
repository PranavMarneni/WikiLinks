import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './js/firebase';
import { connectSocket, disconnectSocket, getSocket } from './socket';
import DebugPanel from './DebugPanel';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    let cancelled = false;

    user.getIdToken().then((token) => {
      if (cancelled) return;
      const s = connectSocket(token);
      setSocket(s);
    });

    return () => {
      cancelled = true;
      disconnectSocket();
      setSocket(null);
    };
  }, [user, loading]);

  return <DebugPanel socket={socket} user={user} loading={loading} />;
}
