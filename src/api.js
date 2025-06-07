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
  // Determine the SWR key. If no specific IDs are provided for fetching,
  // and we intend to fetch only when an ID is present (e.g., teacherId for user's articles),
  // then the key should be null to prevent fetching all articles.
  let swrKey = null;
  if (articleId) {
    swrKey = `${API_ENDPOINT}/article.php?article_id=${articleId}`;
  } else if (teacherId) {
    // Only fetch if teacherId is explicitly provided for fetching user's articles
    swrKey = `${API_ENDPOINT}/article.php?teacher_id=${teacherId}`;
  } else {
    // If neither articleId nor teacherId is provided, do not fetch.
    // To fetch all articles, a separate function or explicit parameter could be used.
    swrKey = null;
  }

  const { data, error } = useSWR(swrKey, fetcher);

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
  let swrKey = null;
  if (fileId) {
    swrKey = `${API_ENDPOINT}/file.php?file_id=${fileId}`;
  } else if (uploaderId) {
    // Only fetch if uploaderId is explicitly provided
    swrKey = `${API_ENDPOINT}/file.php?uploader_id=${uploaderId}`;
  } else {
    // If neither fileId nor uploaderId is provided, do not fetch.
    // To fetch all files, a separate function or explicit parameter could be used.
    swrKey = null;
  }

  const { data, error } = useSWR(swrKey, fetcher);

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
  let fetchKey = null;
  let isFetchingSpecificUser = false;

  if (params) {
    isFetchingSpecificUser = !!params.user_id; // Are we trying to fetch a specific user?
    if (params.user_id || (typeof params.username === 'string' && params.username.trim() !== '')) {
      // Only set fetchKey if user_id is present, or username is a non-empty string.
      const query = new URLSearchParams(params);
      const queryString = query.toString();
      if (queryString) { // Ensure there's something to query by
        fetchKey = `${API_ENDPOINT}/user.php?${queryString}`;
      }
    }
    // Note: If params is an empty object {} or contains only empty username,
    // fetchKey remains null, and no API call will be made to fetch all users.
    // This is a change from previous behavior where {} would fetch all users.
    // To fetch all users, a specific parameter like { all: true } could be introduced if needed.
  }

  const { data, error } = useSWR(fetchKey, fetcher);

  let usersData = isFetchingSpecificUser ? null : [];

  if (fetchKey && data) { // data will only be present if fetchKey was not null and SWR returned data
    if (data.success) {
      if (Array.isArray(data.data)) {
        usersData = data.data;
      } else if (data.data) {
        usersData = [data.data]; // Wrap single object in array
      } else {
        usersData = []; // API success but data.data is null/undefined
      }
    } else if (!data.success && isFetchingSpecificUser && !params.username) {
      // API call for a specific user failed (e.g., user not found)
      usersData = null;
    } else {
      // General API failure for a search or other non-specific user fetch
      usersData = [];
    }
  } else if (!fetchKey) {
    // No fetch was made, maintain default initial state
    usersData = isFetchingSpecificUser ? null : [];
  }
  // Error state (e.g. network error) will be handled by isError, usersData can remain as default

  // If a specific user_id was requested (and fetch was attempted or not)
  if (isFetchingSpecificUser) {
    if (Array.isArray(usersData) && usersData.length === 1) {
      usersData = usersData[0]; // Extract single user from array
    } else if (Array.isArray(usersData) && usersData.length === 0) {
      // If fetchKey was null (e.g. invalid user_id format passed in params preventing fetchKey construction)
      // OR if fetch was made and API returned empty array for that user_id
      usersData = null;
    }
    // If usersData is already a single object (from previous logic) or null, it's fine.
  }

  const isLoading = fetchKey ? (!error && !data) : false;

  return {
    users: usersData,
    isLoading,
    isError: error || null, // Ensure isError is explicitly null if error is undefined
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

// Student Courses API
/**
 * Fetches enrolled courses for a given student.
 * @param {number|string} userId - The ID of the student.
 * @returns {{courses: Object[], isLoading: boolean, isError: Error}}
 */
export function useStudentCourses(userId) {
  // If userId is not provided, don't fetch data
  const url = userId ? `${API_ENDPOINT}/enrollment.php?user_id=${userId}` : null;
  // The SWR key is the URL itself. If URL is null, SWR won't fetch.
  const { data: apiResponse, error } = useSWR(url, fetcher);

  let transformedCourses = [];
  if (userId && apiResponse && apiResponse.success && apiResponse.data) {
    const enrollments = Array.isArray(apiResponse.data) ? apiResponse.data : [];

    transformedCourses = enrollments.map(enrollment => {
      // Ensure course_id exists before creating the placeholder name
      if (enrollment && typeof enrollment.course_id !== 'undefined') {
        return {
          id: enrollment.course_id,
          name: `Course ${enrollment.course_id}` // Placeholder name
          // enrollment_id: enrollment.enrollment_id, // Optionally include other enrollment details
          // student_id: enrollment.student_id,
          // enrolled_at: enrollment.enrolled_at
        };
      }
      return null; // Or handle enrollments without course_id differently
    }).filter(course => course !== null); // Filter out any nulls if course_id was missing
  }

  return {
    courses: transformedCourses,
    isLoading: userId ? (!error && !apiResponse) : false, // Only loading if userId was provided
    isError: error
  };
}

// Course Content API functions

// GET /api/course_content.php?course_id={course_id}
export const getCourseContent = async (courseId) => {
  console.log(`API CALL (Real): getCourseContent for courseId: ${courseId}`);
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists, as per typical API security for fetching user-related data.
  // The API documentation for GET /api/course_content.php implies user context is needed
  // due to permission checks (public vs. private courses, user enrollment/ownership).
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/course_content.php?course_id=${courseId}`, {
      method: 'GET',
      headers: headers,
    });

    const result = await response.json();

    if (!response.ok) {
      // If response is not OK (e.g., 400, 401, 403, 404, 500),
      // use the message from the API response if available, otherwise a default error.
      // This covers cases like "Unauthorized: Please log in.", "Forbidden: ...", "Not Found: ..."
      throw new Error(result.message || `Error ${response.status}: Failed to fetch course content`);
    }

    // According to the API documentation, on HTTP 200 OK, the response is:
    // { success: true, message: "Course content retrieved successfully.", data: [...] }
    // or an error structure like { success: false, message: "..." } for logical errors handled by the backend (e.g. bad request if course_id required but missing)
    if (result.success) {
      return result.data; // This should be the array of content items.
    } else {
      // If the API itself returns success: false (even with a 200 OK, though less common for GETs),
      // use its message.
      throw new Error(result.message || 'API returned success: false but no error message.');
    }
  } catch (error) {
    // This catch block handles network errors, JSON parsing errors, or errors thrown from above.
    console.error('Error in getCourseContent:', error.message);
    // Re-throw the error so the calling component (CourseContent.js) can catch it
    // and update its UI (e.g., show an error message to the user).
    throw error;
  }
};

// POST /api/course_content.php
export const addCourseContent = async (courseId, articleId, fileId) => {
  console.log(`API CALL (Real): addCourseContent for courseId: ${courseId}`, { articleId, fileId });
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = {
    course_id: courseId,
  };
  if (articleId) {
    body.article_id = articleId;
  } else if (fileId) {
    body.file_id = fileId;
  }

  // Basic validation, though API docs say course_id and one of article/file_id are required.
  // The calling component (AddCourseContentModal) should ensure these are provided.
  if (!body.course_id || (!body.article_id && !body.file_id)) {
    console.error('addCourseContent: course_id and either article_id or file_id must be provided.');
    // Return structure consistent with API error for client-side validation failure.
    return { success: false, message: 'Bad Request: Course ID and either article_id or file_id is required from client-side check.' };
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/course_content.php`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // The API documentation specifies various success (201) and error (400, 401, 403, 500) responses.
    // We'll return the parsed result directly, as CourseContent.js expects an object with 'success' and 'message'.
    // If !response.ok, result should contain { success: false, message: "..." } from the API.
    // If response.ok (e.g. 201), result should contain { success: true, message: "...", data: {id: ...} }.
    return result;

  } catch (error) {
    console.error('Network or parsing error in addCourseContent:', error);
    // Return an error structure consistent with API responses for unhandled errors.
    return { success: false, message: error.message || 'Network error or failed to parse response.' };
  }
};

// DELETE /api/course_content.php?id={content_id}
export const deleteCourseContent = async (courseId, articleId, fileId) => {
  console.log(`API CALL (Real): deleteCourseContent for courseId: ${courseId}, articleId: ${articleId}, fileId: ${fileId}`);
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let queryString = `course_id=${courseId}`;
  if (articleId) {
    queryString += `&article_id=${articleId}`;
  } else if (fileId) {
    queryString += `&file_id=${fileId}`;
  } else {
    console.error('deleteCourseContent: Either articleId or fileId must be provided.');
    return { success: false, message: 'Bad Request: Either article_id or file_id is required for deletion.' };
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/course_content.php?${queryString}`, {
      method: 'DELETE',
      headers: headers,
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Network or parsing error in deleteCourseContent:', error);
    return { success: false, message: error.message || 'Network error or failed to parse response.' };
  }
};
