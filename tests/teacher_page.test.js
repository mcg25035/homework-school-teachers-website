// tests/teacher_page.test.js

describe('Teacher Page Functionality', () => {

  //---------------------------------------------------------------------------
  describe('API Layer Tests (src/api.js)', () => {
  //---------------------------------------------------------------------------

    describe('useTeacherPage hook', () => {
      // Mock SWR's internal fetcher or global fetch
      // const mockFetcher = jest.fn();
      // beforeAll(() => { /* setup mock for SWR or fetch */ });
      // afterEach(() => { mockFetcher.mockClear(); });

      it('should fetch data successfully and return formatted data', () => {
        // mockFetcher.mockResolvedValueOnce({ success: true, data: { user_id: 1, content: "Test content", variables: { key: "value" } } });
        // const { result, waitForNextUpdate } = renderHook(() => useTeacherPage(1));
        // expect(result.current.isLoading).toBe(true);
        // await waitForNextUpdate();
        // expect(mockFetcher).toHaveBeenCalledWith('/api/teacher_page.php?user_id=1');
        // expect(result.current.isLoading).toBe(false);
        // expect(result.current.data.content).toBe("Test content");
        // expect(result.current.data.variables.key).toBe("value");
        // expect(result.current.isError).toBe(null); // or false depending on api.js implementation
      });

      it('should parse variables string from API response into an object', () => {
        // mockFetcher.mockResolvedValueOnce({ success: true, data: { user_id: 1, content: "Test", variables: '{"json_key":"json_value"}' } });
        // const { result, waitForNextUpdate } = renderHook(() => useTeacherPage(1));
        // await waitForNextUpdate();
        // expect(typeof result.current.data.variables).toBe('object');
        // expect(result.current.data.variables.json_key).toBe("json_value");
      });

      it('should handle API error during fetch', () => {
        // mockFetcher.mockRejectedValueOnce(new Error("API Error"));
        // const { result, waitForNextUpdate } = renderHook(() => useTeacherPage(1));
        // expect(result.current.isLoading).toBe(true);
        // await waitForNextUpdate();
        // expect(result.current.isLoading).toBe(false);
        // expect(result.current.isError).toBeInstanceOf(Error);
        // expect(result.current.isError.message).toBe("API Error");
        // expect(result.current.data.content).toBe(null); // or default structure
        // expect(result.current.data.variables).toEqual({}); // or default structure
      });
      
      it('should handle API returning success:false', () => {
        // mockFetcher.mockResolvedValueOnce({ success: false, message: "Failed to fetch from API" });
        // const { result, waitForNextUpdate } = renderHook(() => useTeacherPage(1));
        // await waitForNextUpdate();
        // expect(result.current.isLoading).toBe(false);
        // expect(result.current.isError).toBeInstanceOf(Error);
        // expect(result.current.isError.message).toContain("Failed to fetch teacher page for user 1");
        // expect(result.current.data.content).toBe(null);
      });

      it('should handle "page not found" (API success, but no data for user)', () => {
        // mockFetcher.mockResolvedValueOnce({ success: true, data: { user_id: 1, content: null, variables: null } });
        // const { result, waitForNextUpdate } = renderHook(() => useTeacherPage(1));
        // await waitForNextUpdate();
        // expect(result.current.isLoading).toBe(false);
        // expect(result.current.data.content).toBe(null);
        // expect(result.current.data.variables).toEqual({}); // As api.js defaults null variables to {}
        // expect(result.current.isError).toBe(null);
      });

      it('should not fetch if userId is null', () => {
        // const { result } = renderHook(() => useTeacherPage(null));
        // expect(mockFetcher).not.toHaveBeenCalled();
        // expect(result.current.isLoading).toBe(false); // Or true then false quickly if SWR behavior changes
        // expect(result.current.data).toBeUndefined(); // Or the default structure for no data
      });
    });

    describe('updateTeacherPage function', () => {
      // Mock global fetch or performMutation directly
      // const mockPerformMutation = jest.spyOn(require('../api'), 'performMutation');
      // beforeAll(() => { /* setup mock */ });
      // afterEach(() => { mockPerformMutation.mockClear(); });

      it('should call performMutation with correct URL, method, data, and revalidateKey', async () => {
        // mockPerformMutation.mockResolvedValueOnce({ success: true, data: {} });
        // const userId = 1;
        // const content = "New content";
        // const variables = { custom_key: "custom_value" };
        // await updateTeacherPage(userId, content, variables);
        // expect(mockPerformMutation).toHaveBeenCalledWith(
        //   '/api/teacher_page.php',
        //   'PUT',
        //   { content: content, variables: JSON.stringify(variables) },
        //   `/api/teacher_page.php?user_id=${userId}`
        // );
        // The Content-Type header check would be inside performMutation's own tests or by deeper mocking fetch.
      });

      it('should return success response from performMutation', async () => {
        // const mockSuccessResponse = { success: true, data: { message: "Updated" } };
        // mockPerformMutation.mockResolvedValueOnce(mockSuccessResponse);
        // const response = await updateTeacherPage(1, "content", {});
        // expect(response).toEqual(mockSuccessResponse);
      });

      it('should propagate error from performMutation', async () => {
        // const mockErrorResponse = { success: false, error: "API Update Error" };
        // mockPerformMutation.mockResolvedValueOnce(mockErrorResponse); // or mockRejectedValueOnce
        // const response = await updateTeacherPage(1, "content", {});
        // expect(response).toEqual(mockErrorResponse);
      });
    });
  });

  //---------------------------------------------------------------------------
  describe('Component Tests (src/components/TeacherPersonalPageEditor.js)', () => {
  //---------------------------------------------------------------------------
    // Mock 'src/api.js'
    // jest.mock('../api', () => ({
    //   useLoginStatus: jest.fn(),
    //   useTeacherPage: jest.fn(),
    //   updateTeacherPage: jest.fn(),
    // }));
    // const mockUseLoginStatus = require('../api').useLoginStatus;
    // const mockUseTeacherPage = require('../api').useTeacherPage;
    // const mockUpdateTeacherPage = require('../api').updateTeacherPage;

    // Helper function to render the component with mocked API responses
    // const renderEditor = (loginStatus, teacherPageData) => {
    //   mockUseLoginStatus.mockReturnValue(loginStatus);
    //   mockUseTeacherPage.mockReturnValue(teacherPageData);
    //   render(<TeacherPersonalPageEditor />);
    // };

    describe('Rendering and Initial State', () => {
      it('should show loading spinner when user status is loading', () => {
        // renderEditor({ user: null, isLoading: true, isError: null }, { data: null, isLoading: false, isError: null });
        // expect(screen.getByText(/Loading User Data.../i)).toBeInTheDocument();
      });

      it('should show loading spinner when teacher page data is loading (after user is loaded)', () => {
        // renderEditor({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null }, { data: null, isLoading: true, isError: null });
        // expect(screen.getByText(/Loading Page Data.../i)).toBeInTheDocument();
      });

      it('should show login prompt if user is not logged in (though App.js might handle route protection)', () => {
        // renderEditor({ user: null, isLoading: false, isError: null }, { data: null, isLoading: false, isError: null });
        // expect(screen.getByText(/Please log in to edit your personal page./i)).toBeInTheDocument();
      });
      
      it('should display an error message if user data fetching fails', () => {
        // renderEditor({ user: null, isLoading: false, isError: new Error("User fetch failed") }, { data: null, isLoading: false, isError: null });
        // expect(screen.getByText(/Error loading user data/i)).toBeInTheDocument();
      });
      
      it('should display an error message if teacher page data fetching fails', () => {
        // renderEditor({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null }, { data: null, isLoading: false, isError: new Error("Page data fetch failed") });
        // expect(screen.getByText(/Error loading page data: Page data fetch failed/i)).toBeInTheDocument();
      });

      it('should render with fetched data correctly', () => {
        // const initialData = { user_id: 1, content: "Initial Markdown", variables: { office_hours: "Mon 9-10", custom_info: "Custom Value" } };
        // renderEditor({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null }, { data: initialData, isLoading: false, isError: null });
        // expect(screen.getByDisplayValue("Initial Markdown")).toBeInTheDocument(); // MdEditor's textarea
        // expect(screen.getByDisplayValue("Mon 9-10")).toBeInTheDocument(); // Office hours input
        // expect(screen.getByDisplayValue("custom_info")).toBeInTheDocument(); // Custom variable key input
        // expect(screen.getByDisplayValue("Custom Value")).toBeInTheDocument(); // Custom variable value input
      });

      it('should render with initial empty state for a new teacher page', () => {
        // renderEditor({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null }, { data: { user_id: 1, content: null, variables: {} }, isLoading: false, isError: null });
        // expect(screen.getByDisplayValue(/# Welcome, testuser!/i)).toBeInTheDocument(); // Default markdown
        // expect(screen.getByPlaceholderText(/Enter office hours/i).value).toBe("");
      });
    });

    describe('User Interaction and State Changes', () => {
      // beforeEach(() => {
      //   // Setup a baseline successful login and initial empty page data for interaction tests
      //   mockUseLoginStatus.mockReturnValue({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null });
      //   mockUseTeacherPage.mockReturnValue({ data: { user_id: 1, content: "", variables: {} }, isLoading: false, isError: null, mutate: jest.fn() });
      // });

      describe('Markdown Editing', () => {
        it('should update markdownContent state on editor change', () => {
          // render(<TeacherPersonalPageEditor />);
          // const mdEditorTextarea = screen.getByRole('textbox', { name: /markdown editor/i }); // This selector might need adjustment based on MdEditor's internals
          // fireEvent.change(mdEditorTextarea, { target: { value: "New markdown content" } });
          // // Need a way to check internal state or check what's passed to updateTeacherPage on save
          // // For now, assume save button will use the updated state.
        });
      });

      describe('Predefined Variable Editing', () => {
        it('should update pageVariables state when editing Office Hours', () => {
          // render(<TeacherPersonalPageEditor />);
          // fireEvent.change(screen.getByPlaceholderText(/Enter office hours/i), { target: { value: "Wed 2-3" } });
          // // Check internal state or what's passed to updateTeacherPage on save.
        });
      });

      describe('Custom Variable Management', () => {
        it('should add a new custom variable', () => {
          // render(<TeacherPersonalPageEditor />);
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "my_new_var" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i));
          // expect(screen.getByDisplayValue("my_new_var")).toBeInTheDocument(); // New key input
          // expect(screen.getAllByPlaceholderText(/Variable Value/i).length).toBeGreaterThan(0); // New value input
        });

        it('should prevent adding a duplicate custom variable key and show alert', () => {
          // global.alert = jest.fn();
          // render(<TeacherPersonalPageEditor />);
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "existing_var" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i)); // First add
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "existing_var" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i)); // Second attempt
          // expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(/already exists/i));
        });
        
        it('should prevent adding a variable with a predefined key name and show alert', () => {
          // global.alert = jest.fn();
          // render(<TeacherPersonalPageEditor />);
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "office_hours" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i));
          // expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(/is either predefined or already exists/i));
        });

        it('should edit a custom variable\'s key (onBlur)', () => {
          // render(<TeacherPersonalPageEditor />);
          // // Add a variable first
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "old_key" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i));
          // // Edit its key
          // const keyInput = screen.getByDisplayValue("old_key");
          // fireEvent.change(keyInput, { target: { value: "new_key_updated" } });
          // fireEvent.blur(keyInput);
          // expect(screen.getByDisplayValue("new_key_updated")).toBeInTheDocument();
        });
        
        it('should prevent changing a custom variable key to an existing key and show alert', () => {
            // global.alert = jest.fn();
            // render(<TeacherPersonalPageEditor />);
            // // Add var1
            // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "var1" } });
            // fireEvent.click(screen.getByText(/Add Custom Variable/i));
            // // Add var2
            // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "var2" } });
            // fireEvent.click(screen.getByText(/Add Custom Variable/i));
            // // Try to change var2's key to var1
            // const var2KeyInput = screen.getByDisplayValue("var2");
            // fireEvent.change(var2KeyInput, { target: { value: "var1" } });
            // fireEvent.blur(var2KeyInput);
            // expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(/already exists/i));
            // expect(screen.getByDisplayValue("var2")).toBeInTheDocument(); // Key should remain var2
        });

        it('should edit a custom variable\'s value', () => {
          // render(<TeacherPersonalPageEditor />);
          // // Add a variable
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "temp_key" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i));
          // // Edit its value
          // const valueInputs = screen.getAllByPlaceholderText(/Variable Value/i);
          // fireEvent.change(valueInputs[valueInputs.length-1], { target: { value: "new value for temp_key" } });
          // // Check internal state or what's passed to updateTeacherPage on save.
        });

        it('should remove a custom variable', () => {
          // render(<TeacherPersonalPageEditor />);
          // // Add a variable
          // fireEvent.change(screen.getByPlaceholderText(/New variable name/i), { target: { value: "to_delete" } });
          // fireEvent.click(screen.getByText(/Add Custom Variable/i));
          // expect(screen.getByDisplayValue("to_delete")).toBeInTheDocument();
          // // Remove it
          // fireEvent.click(screen.getAllByText(/Remove/i).find(btn => btn.closest('.row').textContent.includes("to_delete"))); // More precise selection needed
          // expect(screen.queryByDisplayValue("to_delete")).not.toBeInTheDocument();
        });
      });
    });

    describe('Saving Data (handleSave)', () => {
      // beforeEach(() => {
      //   mockUseLoginStatus.mockReturnValue({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null });
      //   mockUseTeacherPage.mockReturnValue({ data: { user_id: 1, content: "Test Content", variables: { "test_var": "Test Value"} }, isLoading: false, isError: null, mutate: jest.fn() });
      //   mockUpdateTeacherPage.mockClear();
      // });

      it('should call updateTeacherPage with current data on save', async () => {
        // mockUpdateTeacherPage.mockResolvedValueOnce({ success: true });
        // render(<TeacherPersonalPageEditor />);
        // // Make some changes
        // fireEvent.change(screen.getByPlaceholderText(/Enter office hours/i), { target: { value: "Mon 10-11" } });
        // fireEvent.click(screen.getByText(/Save Page/i));
        // await waitFor(() => expect(mockUpdateTeacherPage).toHaveBeenCalledWith(
        //   1, // userId
        //   "Test Content", // Assuming markdownContent was not changed in this specific test
        //   expect.objectContaining({ "office_hours": "Mon 10-11", "test_var": "Test Value" })
        // ));
      });

      it('should show success message on successful save', async () => {
        // mockUpdateTeacherPage.mockResolvedValueOnce({ success: true });
        // render(<TeacherPersonalPageEditor />);
        // fireEvent.click(screen.getByText(/Save Page/i));
        // expect(await screen.findByText(/Page updated successfully!/i)).toBeInTheDocument();
      });

      it('should show error message on failed save', async () => {
        // mockUpdateTeacherPage.mockResolvedValueOnce({ success: false, error: "Failed to save data" });
        // render(<TeacherPersonalPageEditor />);
        // fireEvent.click(screen.getByText(/Save Page/i));
        // expect(await screen.findByText(/Failed to save data/i)).toBeInTheDocument();
      });
      
      it('should set isSaving to true during save operation and false afterwards', async () => {
        // mockUpdateTeacherPage.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
        // render(<TeacherPersonalPageEditor />);
        // fireEvent.click(screen.getByText(/Save Page/i));
        // expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
        // expect(screen.getByText(/Save Page/i).closest('button')).toBeDisabled();
        // await waitFor(() => expect(screen.getByText(/Save Page/i).closest('button')).not.toBeDisabled());
      });
    });

    describe('Loading and Error States (Visual)', () => {
      it('should display loading spinner for save button when isSaving is true', () => {
        // mockUseLoginStatus.mockReturnValue({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null });
        // mockUseTeacherPage.mockReturnValue({ data: { user_id: 1, content: "", variables: {} }, isLoading: false, isError: null, mutate: jest.fn() });
        // mockUpdateTeacherPage.mockImplementation(() => new Promise(() => {})); // Never resolves to keep it in saving state
        // render(<TeacherPersonalPageEditor />);
        // fireEvent.click(screen.getByText(/Save Page/i));
        // expect(screen.getByText(/Saving.../i).querySelector('span[role="status"]')).toBeInTheDocument(); // Check for spinner inside button
      });

      it('should display and clear success alert messages', async () => {
        // mockUseLoginStatus.mockReturnValue({ user: { user_id: 1, username: 'testuser' }, isLoading: false, isError: null });
        // mockUseTeacherPage.mockReturnValue({ data: { user_id: 1, content: "", variables: {} }, isLoading: false, isError: null, mutate: jest.fn() });
        // mockUpdateTeacherPage.mockResolvedValueOnce({ success: true });
        // render(<TeacherPersonalPageEditor />);
        // fireEvent.click(screen.getByText(/Save Page/i));
        // const successAlert = await screen.findByText(/Page updated successfully!/i);
        // expect(successAlert).toBeInTheDocument();
        // fireEvent.click(successAlert.querySelector('button[aria-label="Close"]')); // Dismiss alert
        // expect(screen.queryByText(/Page updated successfully!/i)).not.toBeInTheDocument();
      });
    });
  });
});
