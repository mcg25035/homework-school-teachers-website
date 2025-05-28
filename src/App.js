import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import renderComponent from './routes';
import Login from './auth/Login';
import { useLoginStatus, login, logout } from './api';

function App() {
  // Modified activeComponentState to store name and props
  const [activeComponentState, setActiveComponentState] = useState({ name: 'Component1', props: {} });
  const { isLoggedIn, user, isLoading: isLoginStatusLoading } = useLoginStatus();

  console.log('isLoggedIn:', isLoggedIn, 'User object:', user); // Keep this log

  // Define the function to update activeComponentState
  const handleSetActiveComponent = (componentName, componentProps = {}) => {
    setActiveComponentState({ name: componentName, props: componentProps });
  };

  const functionList = [
    { component: 'Component1', display: 'Function 1' },
    { component: 'Component2', display: 'Function 2' },
    { component: 'Component3', display: 'Function 3' },
    { component: 'CourseList', display: '課程' },
    { component: 'MyBookings', display: '預約時間' },
    { component: 'TeacherBookings', display: '查看預約' },
    { component: 'ArticleList', display: '文章' }, // Added ArticleList
    { component: 'TeacherCalendar', display: '行事曆' },
    { component: 'TeacherPersonalPageEditor', display: '編輯個人頁面' }, 
    // Add the new portal entry:
    { component: 'DevTeacherPagePortal', display: 'Dev: View Teacher Page' }, 
  ];

  if (isLoginStatusLoading) {
    return <div>Loading login status...</div>;
  }

  return (
    <div>
      <Header
        functionList={functionList}
        // Header expects setActiveComponent to take a string.
        // We adapt by wrapping handleSetActiveComponent or relying on its flexibility if only name is passed.
        // For items in functionList, Header calls setActiveComponent(item.component).
        // handleSetActiveComponent will receive componentName = item.component, props = {}. This is correct.
        setActiveComponent={handleSetActiveComponent}
        isLoggedIn={isLoggedIn}
        user={user}
        logout={logout}
      />
      <main className="container py-5" style={{ marginTop: '80px', marginBottom: '60px' }}>
        {isLoggedIn ? (
          // Pass name, and combine stored props with user and setActiveComponent
          renderComponent(
            activeComponentState.name, 
            { 
              ...activeComponentState.props, 
              user: user, // Pass user object
              setActiveComponent: handleSetActiveComponent // Pass the setter function
            }
          )
        ) : (
          <Login login={login} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
