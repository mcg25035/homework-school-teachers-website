import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock the API module
import * as api from '../src/api'; // Adjust path as necessary
import TeacherPublicPageView from '../src/components/TeacherPublicPageView'; // Adjust path

// Mock SWR's useSWR hook, which is used by useTeacherPage
jest.mock('../src/api', () => ({
  ...jest.requireActual('../src/api'), // Import and retain default exports
  useTeacherPage: jest.fn(),
}));

// Helper to mock useTeacherPage responses
const mockUseTeacherPage = (data, isLoading, isError, error = null) => {
  api.useTeacherPage.mockReturnValue({
    data,
    isLoading,
    isError,
    error,
  });
};

describe('TeacherPublicPageView Component', () => {
  const mockTeacherUserId = 123;

  beforeEach(() => {
    // Reset mocks before each test
    api.useTeacherPage.mockClear();
  });

  test('should display loading state initially', () => {
    mockUseTeacherPage(null, true, false);
    render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // For Spinner
    expect(screen.getByText(/Loading teacher page.../i)).toBeInTheDocument();
  });

  test('should display error message if data fetching fails (isError true)', () => {
    const errorMessage = 'Network Error';
    mockUseTeacherPage(null, false, true, { message: errorMessage });
    render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
    expect(screen.getByText(`Error loading teacher page: ${errorMessage}`)).toBeInTheDocument();
  });

  // The test 'should display warning if API returns success false or no data' is removed.
  // The `success: false` case from API is now handled by `isError: true` in useTeacherPage.
  // The "no data" (but successful fetch) case is handled by the tests below.
  
  test('should display "not set up or empty" message if content is null', () => {
    // Mocking useTeacherPage to return the direct data payload or default structure
    mockUseTeacherPage(
      { user_id: mockTeacherUserId, content: null, variables: {} }, // data
      false, // isLoading
      false, // isError
    );
    render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
    expect(screen.getByText(/This teacher has not set up their page content yet, or the content is empty./i)).toBeInTheDocument();
  });

  test('should display "not set up or empty" message if content is an empty string', () => {
    mockUseTeacherPage(
      { user_id: mockTeacherUserId, content: "", variables: {} }, // data
      false, // isLoading
      false, // isError
    );
    render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
    expect(screen.getByText(/This teacher has not set up their page content yet, or the content is empty./i)).toBeInTheDocument();
  });
  
  test('should display "not set up or empty" message if content is only whitespace', () => {
    mockUseTeacherPage(
      { user_id: mockTeacherUserId, content: "   ", variables: {} }, // data
      false, // isLoading
      false, // isError
    );
    render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
    expect(screen.getByText(/This teacher has not set up their page content yet, or the content is empty./i)).toBeInTheDocument();
  });

  describe('Variable Substitution and Rendering', () => {
    const mockVariables = {
      office_hours: 'Mon 10-12 AM',
      course_name: 'Introduction to Testing',
      contact_email: 'teacher@example.com',
    };

    test('should render content without variables if none are present in content', async () => {
      const content = 'This is some plain content.';
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: mockVariables }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      await waitFor(() => {
        expect(screen.getByText(content)).toBeInTheDocument();
      });
    });

    test('should substitute a single variable correctly', async () => {
      const content = 'My office hours are %office_hours%.';
      const expectedText = 'My office hours are Mon 10-12 AM.';
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: mockVariables }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    test('should substitute multiple different variables correctly', async () => {
      const content = 'Course: %course_name%. Contact: %contact_email%.';
      // const expectedText = 'Course: Introduction to Testing. Contact: teacher@example.com.';
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: mockVariables }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      await waitFor(() => {
        expect(screen.getByText((text) => text.startsWith('Course: Introduction to Testing.'))).toBeInTheDocument();
        expect(screen.getByText((text) => text.endsWith('Contact: teacher@example.com.'))).toBeInTheDocument();
      });
    });

    test('should substitute multiple occurrences of the same variable', async () => {
      const content = 'Email: %contact_email% or %contact_email%.';
      const expectedText = 'Email: teacher@example.com or teacher@example.com.';
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: mockVariables }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      await waitFor(() => {
         expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    test('should leave placeholder as is if variable is not found in variables object', async () => {
      const content = 'Details: %missing_variable%. Office: %office_hours%.';
      // const expectedText = 'Details: %missing_variable%. Office: Mon 10-12 AM.';
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: mockVariables }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      await waitFor(() => {
        expect(screen.getByText((text) => text.startsWith('Details: %missing_variable%.'))).toBeInTheDocument();
        expect(screen.getByText((text) => text.endsWith('Office: Mon 10-12 AM.'))).toBeInTheDocument();
      });
    });
    
    test('should render Markdown correctly after substitution', async () => {
      const content = '# Welcome %name%\nYour office: %office_hours%';
      const localVars = { name: 'Dr. Teacher', office_hours: 'Room 101' };
      mockUseTeacherPage( // Data is the direct payload
        { user_id: mockTeacherUserId, content, variables: localVars }, false, false
      );
      render(<TeacherPublicPageView teacherUserIdFromProp={mockTeacherUserId} />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1, name: /Welcome Dr. Teacher/i });
        expect(heading).toBeInTheDocument();
        expect(screen.getByText(/Your office: Room 101/i)).toBeInTheDocument();
      });
    });
  });
});
