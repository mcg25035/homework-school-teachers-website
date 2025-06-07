import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import renderComponent from './routes';
import Login from './auth/Login';
import { Button } from 'react-bootstrap';
import { useLoginStatus, login, logout } from './api';

function App() {
  // Modified activeComponentState to store name and props
  const [activeComponentState, setActiveComponentState] = useState({ name: 'Component1', props: {} });
  const { isLoggedIn, user, role, isLoading: isLoginStatusLoading } = useLoginStatus(); // Get role directly

  console.log('isLoggedIn:', isLoggedIn, 'User object:', user, 'User role:', role); // Keep this log

  // Define the function to update activeComponentState
  const handleSetActiveComponent = (componentName, componentProps = {}) => {
    // Redirect Profile and Settings for teachers
    if (role === 'teacher') {
      if (componentName === 'Profile') {
        setActiveComponentState({ name: 'TeacherPublicPageView', props: { teacherId: user.user_id } });
        return;
      }
      if (componentName === 'Settings') {
        setActiveComponentState({ name: 'TeacherPersonalPageEditor', props: {} });
        return;
      }
    }
    setActiveComponentState({ name: componentName, props: componentProps });
  };

  const functionList = [
    { component: 'CourseList', display: '課程', roles: ['teacher'] },
    { component: 'MyBookings', display: '我的預約', roles: ['user'] },
    { component: 'TeacherBookings', display: '查看預約', roles: ['teacher'] },
    { component: 'ArticleList', display: '文章', roles: ['user', 'teacher'] },
    { component: 'TeacherCalendar', display: '行事曆', roles: ['teacher'] },
    { component: 'TeacherPersonalPageEditor', display: '編輯個人頁面', roles: ['teacher', 'user'] },
    { component: 'TeacherPublicPageView', display: '個人頁面展示', roles: ['teacher'], hidden: true }, // Add TeacherPublicPageView to functionList
    { component: 'DevTeacherPagePortal', display: '個人頁面模板', roles: ['teacher'] }, // Changed display and roles for DevTeacherPagePortal
    { component: 'FileUpload', display: '檔案上傳', roles: ['teacher'] },
    { component: 'FileListAndDownload', display: '檔案列表與下載', roles: ['teacher'] },
    { component: 'MyCourses', display: '我的課程', roles: ['user'] },
    { component: 'CourseContent', display: '課程內容', roles: ['user', 'teacher'], hidden: true },
    { component: 'ManageCourseEnrollment', display: '管理學生', roles: ['teacher'], hidden: true },
    { component: 'CreateCourse', display: '創建課程', roles: ['teacher'], hidden: true},
    { component: 'EditCourse', display: '編輯課程', roles: ['teacher'], hidden: true },
    { component: 'CreateArticle', display: '創建文章', roles: ['teacher'], hidden: true },
    { component: 'EditArticle', display: '編輯文章', roles: ['teacher'], hidden: true },
  ];

  // Use useEffect to handle initial component display or redirect on role change
  React.useEffect(() => {
    if (isLoginStatusLoading) {
      return; // Do nothing while login status is loading
    }

    if (isLoggedIn && role) {
      const currentComponentInfo = functionList.find(
        (item) => item.component === activeComponentState.name
      );

      // If current component requires roles and user's role is not included,
      // or if current component is not found, redirect to Component1.
      if (!currentComponentInfo || (currentComponentInfo.roles && !currentComponentInfo.roles.includes(role))) {
        handleSetActiveComponent('Component1');
      }
    } else if (!isLoggedIn) {
      // If not logged in, ensure we are on the login page or a public page.
      // For simplicity, if not logged in, we let the main render logic handle showing Login.
      // If activeComponentState.name is not 'Login' and it's not a public page,
      // it will be handled by the getComponentToRender logic.
    }
  }, [isLoggedIn, role, activeComponentState.name, isLoginStatusLoading]); // Depend on isLoggedIn, role, and activeComponentState.name

  const getComponentToRender = () => {
    if (isLoginStatusLoading) {
      return <div>Loading login status...</div>;
    }

    if (!isLoggedIn) {
      return <Login login={login} />;
    }

    const activeComponentInfo = functionList.find(
      (item) => item.component === activeComponentState.name
    );

    // If component not found in functionList, or no roles defined, assume accessible for all logged-in users
    if (!activeComponentInfo) {
      // Fallback to a default component if the active component is not found in the list
      return renderComponent('Component1', { // Render Component1 as a safe fallback
        ...activeComponentState.props,
        user: user,
        setActiveComponent: handleSetActiveComponent,
        isLoggedIn: isLoggedIn, // Pass isLoggedIn to Component1
      });
    }

    // If roles are not explicitly defined for a component, it's accessible to all logged-in users.
    // Otherwise, check if the user's role is included in the allowed roles for the component.
    if (!activeComponentInfo.roles || (role && activeComponentInfo.roles.includes(role))) {
      return renderComponent(activeComponentState.name, {
        ...activeComponentState.props,
        user: user,
        setActiveComponent: handleSetActiveComponent,
      });
    } else {
      // User does not have the required role
      return (
        <div className="text-center mt-5">
          <h3>Access Denied</h3>
          <p>您沒有權限訪問此頁面。</p>
          <Button variant="primary" onClick={() => handleSetActiveComponent('Component1')}>
            返回首頁
          </Button>
        </div>
      );
    }
  };

  return (
    <div>
      <Header
        functionList={functionList}
        setActiveComponent={handleSetActiveComponent}
        isLoggedIn={isLoggedIn}
        user={user}
        logout={logout}
        userRole={role} // Pass role to Header
      />
      <main className="container py-5" style={{ marginTop: '80px', marginBottom: '60px' }}>
        {getComponentToRender()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
