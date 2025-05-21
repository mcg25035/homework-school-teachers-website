import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import renderComponent from './routes';
import Login from './auth/Login';
import { useLoginStatus, login, logout } from './api';

function App() {
  const [activeComponent, setActiveComponent] = useState('Component1');
  const { isLoggedIn, user, isLoading: isLoginStatusLoading } = useLoginStatus();

  console.log('isLoggedIn:', isLoggedIn);

  const functionList = [
    {
      component: 'Component1',
      display: 'Function 1',
    },
    {
      component: 'Component2',
      display: 'Function 2',
    },
    {
      component: 'Component3',
      display: 'Function 3',
    },
    {
      component: 'CourseList',
      display: '課程',
    },
  ];

  if (isLoginStatusLoading) {
    return <div>Loading login status...</div>;
  }

  return (
    <div>
      <Header
        functionList={functionList}
        setActiveComponent={setActiveComponent}
        isLoggedIn={isLoggedIn}
        user={user}
        logout={logout}
      />
      <main className="container py-5" style={{ marginTop: '80px', marginBottom: '60px' }}>
        {isLoggedIn ? (
          renderComponent(activeComponent)
        ) : (
          <Login login={login} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
