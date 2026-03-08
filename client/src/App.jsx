import React, { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, []);

  return (
    <div>
      <h1>WikiLinks</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <a href="/logout">
            <button>Logout</button>
          </a>
        </div>
      ) : (
        <a href="http://localhost:5000/auth/google">
          <button>Login with Google</button>
        </a>
      )}
    </div>
  );
}

export default App;