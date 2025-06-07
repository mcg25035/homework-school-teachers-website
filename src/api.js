import useSWR, { mutate } from 'swr';

const fetcher = (...args) => {
  return fetch(...args).then(res => res.json());
};

// Conditionally set API_ENDPOINT based on environment
const API_ENDPOINT = process.env.NODE_ENV === 'development'
  ? '/api' // Use proxy in development
  : process.env.REACT_APP_API_BASE_URL; // Use full URL from .env in production

// Helper function for mutations
// Added optional revalidateKey parameter
async function performMutation(url, method, data, revalidateKey = null) {
  try {
    const options = {
      method: method,
      headers: {},
    };

    if (data) {
      if (data instanceof FormData) {
        // For file uploads, let fetch set the Content-Type header
        options.body = data;
      } else {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = new URLSearchParams(data).toString();
      }
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      // Invalidate relevant SWR cache entries after successful mutation
      // Use the provided revalidateKey if available, otherwise use default logic
      if (revalidateKey) {
        mutate(revalidateKey, { revalidate: true });
      } else if (url.includes('/auth.php')) {
        mutate(`${API_ENDPOINT}/auth.php`); // Revalidate login status
      } else if (url.includes('/article.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/article.php`), { revalidate: true });
      } else if (url.includes('/booking.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/booking.php`), { revalidate: true });
      } else if (url.includes('/calendar.php')) { // ADD THIS BLOCK
        mutate(key => key.startsWith(`${API_ENDPOINT}/calendar.php`), { revalidate: true });
      } else if (url.includes('/comment.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/comment.php`), { revalidate: true });
      } else if (url.includes('/course.php')) {
        // Course mutations already pass revalidateKey, but for consistency and broader revalidation
        // if revalidateKey is not explicitly passed, we can use this.
        // For now, keep it as is, as createCourse and updateCourse handle it.
        // If a direct mutation to course.php without revalidateKey is added, this would be needed.
        // mutate(key => key.startsWith(`${API_ENDPOINT}/course.php`), { revalidate: true });
      } else if (url.includes('/enrollment.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/enrollment.php`), { revalidate: true });
      } else if (url.includes('/file.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/file.php`), { revalidate: true });
      } else if (url.includes('/permission.php')) {
        mutate(key => key.startsWith(`${API_ENDPOINT}/permission.php`), { revalidate: true });
      }


      return { success: true, data: result.data, message: result.message };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * @typedef {Object} User
 * @property {number} user_id - The ID of the user.
 * @property {string} username - The username of the user.
 */

/**
 * @typedef {Object} LoginStatus
 * @property {User} user - The logged-in user object.
 * @property {boolean} isLoggedIn - Indicates if the user is logged in. 
 * @property {boolean} isLoading - Indicates if the login status is being loaded.
 * @property {Error} isError - Error object if there was an error fetching the login status.
 */

// Authentication API
/**
 * @returns {LoginStatus} The login status object.
 */
export function useLoginStatus() {
  const { data, error } = useSWR(`${API_ENDPOINT}/auth.php`, fetcher);

  return {
    user: data ? data.data : null,
    isLoggedIn: data ? data.success : false,
    isLoading: !error && !data,
    isError: error
  };
}

export async function login(username, password) {
  return performMutation(`${API_ENDPOINT}/auth.php`, 'POST', { username, password });
}

export async function logout() {
   return performMutation(`${API_ENDPOINT}/auth.php`, 'DELETE');
}

// Article API
export function useArticle(articleId, teacherId) {
  let url = `${API_ENDPOINT}/article.php`;
  if (articleId) {
    url += `?article_id=${articleId}`;
  } else if (teacherId) {
    url += `?teacher_id=${teacherId}`;
  } else {
    // Fetch all articles if no specific ID is provided
    url = `${API_ENDPOINT}/article.php`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    article: data ? data.data : null,
    articles: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

export async function createArticle(articleData) {
  return performMutation(`${API_ENDPOINT}/article.php`, 'POST', articleData);
}

export async function updateArticle(articleId, articleData) {
  return performMutation(`${API_ENDPOINT}/article.php?article_id=${articleId}`, 'PUT', articleData);
}

export async function deleteArticle(articleId) {
  return performMutation(`${API_ENDPOINT}/article.php?article_id=${articleId}`, 'DELETE');
}

// Booking API
export function useBooking(bookingId, teacherId, requesterUserId) {
  let url = `${API_ENDPOINT}/booking.php`;
  if (bookingId) {
    url += `?booking_id=${bookingId}`;
  } else if (teacherId) {
    url += `?teacher_id=${teacherId}`;
  } else if (requesterUserId) {
    url += `?requester_user_id=${requesterUserId}`;
  } else {
    url = `${API_ENDPOINT}/booking.php`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    booking: data ? data.data : null,
    bookings: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

export async function createBooking(bookingData) {
  return performMutation(`${API_ENDPOINT}/booking.php`, 'POST', bookingData);
}

export async function updateBooking(bookingId, bookingData) {
  return performMutation(`${API_ENDPOINT}/booking.php?booking_id=${bookingId}`, 'PUT', bookingData);
}

export async function deleteBooking(bookingId) {
  return performMutation(`${API_ENDPOINT}/booking.php?booking_id=${bookingId}`, 'DELETE');
}

// Comment API
export function useComment(commentId, articleId, parentCommentId) {
  let url = `${API_ENDPOINT}/comment.php`;
  if (commentId) {
    url += `?comment_id=${commentId}`;
  } else if (articleId) {
    url += `?article_id=${articleId}`;
  } else if (parentCommentId) {
    url += `?parent_comment_id=${parentCommentId}`;
  } else {
     url = `${API_ENDPOINT}/comment.php`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    comment: data ? data.data : null,
    comments: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

export async function createComment(commentData) {
  return performMutation(`${API_ENDPOINT}/comment.php`, 'POST', commentData);
}

export async function updateComment(commentId, commentData) {
  return performMutation(`${API_ENDPOINT}/comment.php?comment_id=${commentId}`, 'PUT', commentData);
}

export async function deleteComment(commentId) {
  return performMutation(`${API_ENDPOINT}/comment.php?comment_id=${commentId}`, 'DELETE');
}

// Course API
export function useCourse(courseId, teacherId, publicCourses) {
  let url = `${API_ENDPOINT}/course.php`;
  if (courseId) {
    url += `?course_id=${courseId}`;
  } else if (teacherId) {
    url += `?teacher_id=${teacherId}`;
  } else if (publicCourses) {
    url += `?public=${publicCourses}`;
  } else {
     url = `${API_ENDPOINT}/course.php`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    course: data ? data.data : null,
    courses: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

// Modified createCourse to accept teacherId and pass the revalidation key
export async function createCourse(courseData, teacherId) {
  const revalidateKey = teacherId ? `${API_ENDPOINT}/course.php?teacher_id=${teacherId}` : `${API_ENDPOINT}/course.php`;
  return await performMutation(`${API_ENDPOINT}/course.php`, 'POST', courseData, revalidateKey);
}

export async function updateCourse(courseId, courseData, teacherId) {
  const revalidateKey = teacherId ? `${API_ENDPOINT}/course.php?teacher_id=${teacherId}` : `${API_ENDPOINT}/course.php`;
  return await performMutation(`${API_ENDPOINT}/course.php?course_id=${courseId}`, 'PUT', courseData, revalidateKey);
}

export async function deleteCourse(courseId) {
  return performMutation(`${API_ENDPOINT}/course.php?course_id=${courseId}`, 'DELETE');
}

// Download API
// Note: Download is a special case as it streams file content, not JSON.
// SWR is typically for data fetching, not file downloads.
// This function remains a standard fetch call.
export async function downloadFile(fileId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/download.php?file_id=${fileId}`);

    if (response.ok) {
      // The file content is streamed directly, so we don't need to parse JSON
      return { success: true, data: response };
    } else {
      // Read the error message from the response
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Enrollment API
export function useEnrollment(courseId, userId) {
  let url = `${API_ENDPOINT}/enrollment.php`;
  if (courseId && userId) {
    url += `?course_id=${courseId}&user_id=${userId}`;
  } else if (courseId) {
    url += `?course_id=${courseId}`;
  } else if (userId) {
    url += `?user_id=${userId}`;
  } else {
     url = `${API_ENDPOINT}/enrollment.php`;
  }

  // Destructure mutate and rename it to revalidateEnrollments for clarity
  const { data, error, mutate: revalidateEnrollments } = useSWR(url, fetcher);

  return {
    enrollment: data ? data.data : null, // If fetching a specific enrollment
    enrollments: data ? (Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])) : [], // For lists
    isLoading: !error && !data,
    isError: error,
    revalidateEnrollments, // Expose mutate for manual revalidation
  };
}

export async function createEnrollment(enrollmentData) {
  return performMutation(`${API_ENDPOINT}/enrollment.php`, 'POST', enrollmentData);
}

export async function deleteEnrollment(courseId, userId) {
  return performMutation(`${API_ENDPOINT}/enrollment.php?course_id=${courseId}&user_id=${userId}`, 'DELETE');
}

// File API
export function useFile(fileId, uploaderId) {
  let url = `${API_ENDPOINT}/file.php`;
  if (fileId) {
    url += `?file_id=${fileId}`;
  } else if (uploaderId) {
    url += `?uploader_id=${uploaderId}`;
  } else {
     url = `${API_ENDPOINT}/file.php`;
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    file: data ? data.data : null,
    files: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

export async function createFile(fileData) {
   // File upload uses FormData, handle separately in performMutation
  return performMutation(`${API_ENDPOINT}/file.php`, 'POST', fileData);
}

export async function updateFile(fileId, fileData) {
  return performMutation(`${API_ENDPOINT}/file.php?file_id=${fileId}`, 'PUT', fileData);
}

export async function deleteFile(fileId) {
  return performMutation(`${API_ENDPOINT}/file.php?file_id=${fileId}`, 'DELETE');
}

// Permission API
export function usePermission(fileId, targetUserId, accessLevel) {
  let url = `${API_ENDPOINT}/permission.php`;
   url += `?file_id=${fileId}`;
  if (targetUserId && accessLevel) {
    url += `&target_user_id=${targetUserId}&access_level=${accessLevel}`;
  } else {
     url = `${API_ENDPOINT}/permission.php?file_id=${fileId}`; // file_id is required for GET
  }

  const { data, error } = useSWR(url, fetcher);

  return {
    permission: data ? data.data : null,
    permissions: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
  };
}

export async function createPermission(permissionData) {
  return performMutation(`${API_ENDPOINT}/permission.php`, 'POST', permissionData);
}

export async function updatePermission(permissionId, permissionData) {
  return performMutation(`${API_ENDPOINT}/permission.php?permission_id=${permissionId}`, 'PUT', permissionData);
}

export async function deletePermission(permissionId) {
  return performMutation(`${API_ENDPOINT}/permission.php?permission_id=${permissionId}`, 'DELETE');
}

// Teacher Page API
export function useTeacherPage(userId) {
  const numericUserId = parseInt(userId, 10);
  const url = `${API_ENDPOINT}/teacher_page.php?user_id=${numericUserId}`;
  const { data: apiResponse, error, mutate } = useSWR(url, fetcher);

  const isLoading = !error && apiResponse === undefined;
  let responseData = null; // This will be the 'data' object returned by the hook
  let hookError = null;    // This will be the 'isError' object returned by the hook

  if (isLoading) {
    // Data is loading, responseData remains null or undefined
    responseData = undefined;
  } else if (error) {
    // SWR fetcher encountered an error (e.g., network issue)
    responseData = { user_id: numericUserId, content: null, variables: {} }; // Provide default structure
    hookError = error;
  } else if (apiResponse) {
    // We have a response from the API
    if (apiResponse.success) {
      if (apiResponse.data && apiResponse.data.content !== undefined) {
        // API success and page data exists
        responseData = {
          ...apiResponse.data, // contains content, potentially user_id and variables
          user_id: parseInt(apiResponse.data.user_id || numericUserId, 10), // Ensure user_id from data or param
          variables: typeof apiResponse.data.variables === 'string'
            ? JSON.parse(apiResponse.data.variables) // Parse if string
            : (apiResponse.data.variables || {}),   // Use as is or default to empty object
        };
      } else {
        // API success but no specific page data (e.g., new teacher, page not yet created)
        responseData = { user_id: numericUserId, content: null, variables: {} };
      }
    } else {
      // API returned { success: false, message: "..." }
      responseData = { user_id: numericUserId, content: null, variables: {} }; // Provide default structure
      hookError = new Error(apiResponse.message || `Failed to fetch teacher page for user ${numericUserId}. API returned success:false.`);
    }
  } else {
    // Fallback for any other unexpected state (apiResponse is null/undefined without error)
    responseData = { user_id: numericUserId, content: null, variables: {} }; // Default structure
    hookError = new Error(`Unexpected response state for teacher page user ${numericUserId}.`);
  }

  return {
    data: responseData, // This is the 'data' object from the API response, or default structure.
    isLoading: isLoading,
    isError: hookError, // null if no error, Error object otherwise.
    mutate,
  };
}

export async function updateTeacherPage(userId, content, variables) {
  const numericUserId = parseInt(userId, 10);
  const revalidateKey = `${API_ENDPOINT}/teacher_page.php?user_id=${numericUserId}`;
  
  const payload = {
    content: content, // string
    variables: JSON.stringify(variables || {}), // JSON stringified string
  };

  // The API infers user_id from the session for PUT requests to /teacher_page.php
  // The revalidateKey ensures the correct user's page cache is updated.
  return performMutation(
    `${API_ENDPOINT}/teacher_page.php`, // URL for PUT
    'PUT',
    payload,
    revalidateKey
  );
}

// (Make sure this is placed before the last export default or at a similar appropriate location with other API groups)

// User API
/**
 * Fetches users based on provided parameters.
 * @param {Object} [params] - Optional parameters for filtering users.
 * @param {number} [params.user_id] - User ID to fetch a specific user.
 * @param {string} [params.username] - Username to search for.
 * @returns {{users: User[] | User | null, isLoading: boolean, isError: Error}}
 */
export function useUsers(params = {}) {
  const query = new URLSearchParams(params);
  const queryString = query.toString();
  const url = `${API_ENDPOINT}/user.php${queryString ? '?' + queryString : ''}`;

  const { data, error } = useSWR(url, fetcher);

  // Ensure data.data is an array if it's not, for consistency,
  // especially when fetching a single user by ID.
  let usersData = null;
  if (data && data.success) {
    if (Array.isArray(data.data)) {
      usersData = data.data;
    } else if (data.data) {
      // If a single user is fetched, API might return an object directly
      usersData = [data.data];
    } else {
      usersData = []; // API returned success:true but data.data is null or undefined
    }
  } else if (data && !data.success && params.user_id && !params.username) {
    // If fetching a single user by ID and it's not found, API might return {success: false, message: "..."}
    // In this specific case, we want to return null for a single user lookup that fails.
    // For searches (e.g. by username), an empty array is more appropriate for "no results".
    usersData = null;
  } else {
    usersData = []; // Default to empty array for other cases (error, no data, or search returning no results)
  }

  // If a specific user_id was passed and we expect a single user object
  if (params.user_id && usersData && usersData.length === 1) {
    usersData = usersData[0];
  } else if (params.user_id && usersData && usersData.length === 0) {
    // If user_id was provided but no user was found (e.g. API returns empty array or handled as such)
    usersData = null;
  }


  return {
    users: usersData, // This can be an array of users, a single user object, or null
    isLoading: !error && !data,
    isError: error,
  };
}

// Calendar API

/**
 * @typedef {Object} CalendarEvent
 * @property {number} event_id - The ID of the event.
 * @property {string} title - The title of the event.
 * @property {string} description - The description of the event.
 * @property {string} start_datetime - The start date and time (YYYY-MM-DD HH:MM:SS).
 * @property {string} end_datetime - The end date and time (YYYY-MM-DD HH:MM:SS).
 * @property {number} user_id - The ID of the user who owns the event.
 * @property {number} is_public - Whether the event is public (1) or private (0).
 */

/**
 * Fetches calendar events based on provided parameters.
 * @param {Object} params - Parameters for filtering events.
 * @param {number} [params.userId] - User ID to fetch events for.
 * @param {string} [params.startDate] - YYYY-MM-DD, fetch events starting after this date.
 * @param {string} [params.endDate] - YYYY-MM-DD, fetch events ending before this date.
 * @param {string} [params.month] - YYYY-MM, fetch events for a specific month.
 * @param {string} [params.view] - 'public' to fetch all public events.
 * @param {number} [params.eventId] - Specific event_id to fetch.
 * @returns {{events: CalendarEvent[], isLoading: boolean, isError: Error}}
 */
export function useCalendarEvents({ userId, startDate, endDate, month, view, eventId } = {}) {
  let query = new URLSearchParams();
  if (eventId) query.set('event_id', eventId);
  if (userId) query.set('user_id', userId);
  if (startDate) query.set('start_date', startDate);
  if (endDate) query.set('end_date', endDate);
  if (month) query.set('month', month);
  if (view) query.set('view', view);

  const queryString = query.toString();
  const url = `${API_ENDPOINT}/calendar.php${queryString ? '?' + queryString : ''}`;

  const { data, error, mutate: revalidateEvents } = useSWR(url, fetcher);

  return {
    events: data && data.success ? (Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])) : [],
    isLoading: !error && !data,
    isError: error,
    revalidateEvents // Expose mutate function for manual revalidation if needed
  };
}

/**
 * Creates a new calendar event.
 * @param {Object} eventData - The event data.
 * @param {string} eventData.title - Event title.
 * @param {string} [eventData.description] - Event description.
 * @param {string} eventData.start_datetime - Start time (YYYY-MM-DD HH:MM:SS).
 * @param {string} eventData.end_datetime - End time (YYYY-MM-DD HH:MM:SS).
 * @param {number} [eventData.is_public] - 0 for private (default), 1 for public.
 * @returns {Promise<{success: boolean, data?: any, error?: string, message?: string}>}
 */
export async function createCalendarEvent(eventData) {
  // performMutation will handle Content-Type and stringifying the body
  return performMutation(`${API_ENDPOINT}/calendar.php`, 'POST', eventData);
}

/**
 * Deletes a calendar event.
 * @param {number} eventId - The ID of the event to delete.
 * @returns {Promise<{success: boolean, data?: any, error?: string, message?: string}>}
 */
export async function deleteCalendarEvent(eventId) {
  return performMutation(`${API_ENDPOINT}/calendar.php?event_id=${eventId}`, 'DELETE');
}

// (Optional for now: updateCalendarEvent)
/*
export async function updateCalendarEvent(eventId, eventData) {
  return performMutation(`${API_ENDPOINT}/calendar.php?event_id=${eventId}`, 'PUT', eventData);
}
*/
