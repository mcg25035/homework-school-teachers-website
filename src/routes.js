import React from 'react';
import Component1 from './components/Component1';
import Component2 from './components/Component2';
import Component3 from './components/Component3';
import Profile from './components/Profile';
import Settings from './components/Settings';
import CourseList from './components/CourseList';
import Course from './components/Course';

const components = {
  Component1: Component1,
  Component2: Component2,
  Component3: Component3,
  Profile: Profile,
  Settings: Settings,
  CourseList: CourseList,
  Course: Course,
};

function renderComponent(activeComponent) {
  let Component = components[activeComponent] || Component1;
  return <Component />;
}

export default renderComponent;
