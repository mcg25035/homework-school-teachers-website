import React from 'react';

// Existing components
import Component1 from './components/Component1';
import Component2 from './components/Component2';
import Component3 from './components/Component3';
import Profile from './components/Profile';
import Settings from './components/Settings';
import CourseList from './components/CourseList';
import Course from './components/Course';
import MyBookings from './components/MyBookings';
import TeacherBookings from './components/TeacherBookings';

// New Article Components
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import CreateArticle from './components/CreateArticle';
import EditArticle from './components/EditArticle';
import TeacherCalendar from './components/TeacherCalendar';
import TeacherPersonalPageEditor from './components/TeacherPersonalPageEditor';
import TeacherPublicPageView from './components/TeacherPublicPageView';
import DevTeacherPagePortal from './components/DevTeacherPagePortal'; // Import new component
import ManageCourseEnrollment from './components/ManageCourseEnrollment'; // Import ManageCourseEnrollment
import MyCourses from './components/MyCourses'; // Import MyCourses

const components = {
  Component1: Component1,
  Component2: Component2,
  Component3: Component3,
  Profile: Profile,
  Settings: Settings,
  CourseList: CourseList,
  Course: Course,
  MyBookings: MyBookings,
  TeacherBookings: TeacherBookings,
  // Add new component mappings
  ArticleList: ArticleList,
  ArticleView: ArticleView,
  CreateArticle: CreateArticle,
  EditArticle: EditArticle,
  TeacherCalendar: TeacherCalendar,
  TeacherPersonalPageEditor: TeacherPersonalPageEditor,
  TeacherPublicPageView: TeacherPublicPageView,
  DevTeacherPagePortal: DevTeacherPagePortal,   // Add new component to the map
  ManageCourseEnrollment: ManageCourseEnrollment, // Add ManageCourseEnrollment to the map
  MyCourses: MyCourses, // Add MyCourses to the map
};

// Modified renderComponent to accept and pass props
function renderComponent(componentName, componentProps = {}) {
  const Component = components[componentName] || components['Component1']; // Fallback to Component1

  if (!Component) {
    console.error(`Component "${componentName}" not found.`);
    // You could render a specific "NotFound" component here if you have one
    return <div>Error: Component "{componentName}" not found.</div>;
  }

  // Spread the componentProps (which includes user and setActiveComponent from App.js)
  return <Component {...componentProps} />;
}

export default renderComponent;
