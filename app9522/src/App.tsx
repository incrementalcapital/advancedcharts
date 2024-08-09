import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import TradingViewWidget from './TradingViewWidget';

Amplify.configure(awsExports);

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App" style={{ height: '100vh', width: '100%' }}>
          <h1>Welcome, {user?.username}!</h1>
          <button onClick={signOut}>Sign out</button>
          <TradingViewWidget />
        </div>
      )}
    </Authenticator>
  );
}

export default App;