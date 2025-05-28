import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DevTeacherPagePortal from '../src/components/DevTeacherPagePortal'; // Adjust path as necessary

describe('DevTeacherPagePortal Component', () => {
  let setActiveComponentMock;

  beforeEach(() => {
    // Create a fresh mock for setActiveComponent before each test
    setActiveComponentMock = jest.fn();
  });

  test('should render the input field and button', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    expect(screen.getByLabelText(/Teacher User ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Teacher Page/i })).toBeInTheDocument();
  });

  test('should update teacherIdInput state on input change', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const inputField = screen.getByLabelText(/Teacher User ID/i);
    fireEvent.change(inputField, { target: { value: '123' } });
    
    expect(inputField.value).toBe('123');
  });

  test('should call setActiveComponent with correct parameters on button click with valid ID', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const inputField = screen.getByLabelText(/Teacher User ID/i);
    fireEvent.change(inputField, { target: { value: '456' } });
    
    const button = screen.getByRole('button', { name: /View Teacher Page/i });
    fireEvent.click(button);
    
    expect(setActiveComponentMock).toHaveBeenCalledTimes(1);
    expect(setActiveComponentMock).toHaveBeenCalledWith('TeacherPublicPageView', { 
      teacherUserIdFromProp: 456 
    });
    // Also check that no error message is displayed
    expect(screen.queryByText(/Please enter a valid positive Teacher ID./i)).not.toBeInTheDocument();
  });

  test('should display error message and not call setActiveComponent for empty ID', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const button = screen.getByRole('button', { name: /View Teacher Page/i });
    fireEvent.click(button); // Click with empty input
    
    expect(screen.getByText(/Please enter a valid positive Teacher ID./i)).toBeInTheDocument();
    expect(setActiveComponentMock).not.toHaveBeenCalled();
  });

  test('should display error message and not call setActiveComponent for non-numeric ID', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const inputField = screen.getByLabelText(/Teacher User ID/i);
    fireEvent.change(inputField, { target: { value: 'abc' } });
    
    const button = screen.getByRole('button', { name: /View Teacher Page/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/Please enter a valid positive Teacher ID./i)).toBeInTheDocument();
    expect(setActiveComponentMock).not.toHaveBeenCalled();
  });

  test('should display error message and not call setActiveComponent for non-positive ID (e.g., zero or negative)', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const inputField = screen.getByLabelText(/Teacher User ID/i);
    fireEvent.change(inputField, { target: { value: '0' } }); // Test with zero
    
    const button = screen.getByRole('button', { name: /View Teacher Page/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/Please enter a valid positive Teacher ID./i)).toBeInTheDocument();
    expect(setActiveComponentMock).not.toHaveBeenCalled();

    fireEvent.change(inputField, { target: { value: '-5' } }); // Test with negative
    fireEvent.click(button);
    expect(screen.getByText(/Please enter a valid positive Teacher ID./i)).toBeInTheDocument();
    expect(setActiveComponentMock).toHaveBeenCalledTimes(0); // Still 0 times
  });

  test('should clear error message when user starts typing after an error was shown', () => {
    render(<DevTeacherPagePortal setActiveComponent={setActiveComponentMock} />);
    
    const inputField = screen.getByLabelText(/Teacher User ID/i);
    const button = screen.getByRole('button', { name: /View Teacher Page/i });

    // Trigger an error
    fireEvent.click(button);
    expect(screen.getByText(/Please enter a valid positive Teacher ID./i)).toBeInTheDocument();

    // Start typing
    fireEvent.change(inputField, { target: { value: '1' } });
    expect(screen.queryByText(/Please enter a valid positive Teacher ID./i)).not.toBeInTheDocument();
  });
});
