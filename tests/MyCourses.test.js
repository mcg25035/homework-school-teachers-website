import React from 'react';
import { render, screen } from '@testing-library/react';
import MyCourses from '../src/components/MyCourses';

describe('MyCourses Component', () => {
  test('renders placeholder text', () => {
    render(<MyCourses />);
    const placeholderText = screen.getByText(/My Courses Page/i);
    expect(placeholderText).toBeInTheDocument();
  });
});
