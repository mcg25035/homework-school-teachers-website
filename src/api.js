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
        mutate(`${API_ENDPOINT}/article.php`); // Revalidate article list
        if (url.includes('article_id=')) {
           mutate(url); // Revalidate specific article
        }
      } else if (url.includes('/booking.php')) {
        mutate(`${API_ENDPOINT}/booking.php`); // Revalidate booking list
         if (url.includes('booking_id=')) {
           mutate(url); // Revalidate specific booking
        }
      } else if (url.includes('/comment.php')) {
        mutate(`${API_ENDPOINT}/comment.php`); // Revalidate comment list
         if (url.includes('comment_id=')) {
           mutate(url); // Revalidate specific comment
        }
      } else if (url.includes('/course.php')) {
        // Default mutate logic for course.php if no specific revalidateKey was provided
        // This might not be ideal if the mutation URL doesn't contain the necessary params
        // const urlParams = new URLSearchParams(url.split('?')[1]);
        // const teacherId = urlParams.get('teacher_id');
        // if (teacherId) {
        //   mutate(`${API_ENDPOINT}/course.php?teacher_id=${teacherId}`, { revalidate: true }); // Revalidate course list for specific teacher
        // } else {
        //   mutate(`${API_ENDPOINT}/course.php`, { revalidate: true }); // Revalidate general course list
        // }
        //  if (url.includes('course_id=')) {
        //    mutate(url, { revalidate: true }); // Revalidate specific course
        // }
      } else if (url.includes('/enrollment.php')) {
        mutate(`${API_ENDPOINT}/enrollment.php`); // Revalidate enrollment list
         if (url.includes('course_id=') || url.includes('user_id=')) {
           mutate(url); // Revalidate specific enrollment status or user/course lists
        }
      } else if (url.includes('/file.php')) {
        mutate(`${API_ENDPOINT}/file.php`); // Revalidate file list
         if (url.includes('file_id=')) {
           mutate(url); // Revalidate specific file
        }
      } else if (url.includes('/permission.php')) {
        mutate(`${API_ENDPOINT}/permission.php`); // Revalidate permission list
         if (url.includes('permission_id=')) {
           mutate(url); // Revalidate specific permission
        }
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
  return performMutation(`${API_ENDPOINT}/course.php`, 'POST', courseData, revalidateKey);
}

export async function updateCourse(courseId, courseData) {
  return performMutation(`${API_ENDPOINT}/course.php?course_id=${courseId}`, 'PUT', courseData);
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

  const { data, error } = useSWR(url, fetcher);

  return {
    enrollment: data ? data.data : null,
    enrollments: data ? (Array.isArray(data.data) ? data.data : []) : [],
    isLoading: !error && !data,
    isError: error
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
