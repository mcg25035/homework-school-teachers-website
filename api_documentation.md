# API Documentation

This document outlines the available API endpoints, their functionalities, parameters, and expected responses.

## 1. Article API (`api/article.php`)

### GET /api/article.php
Retrieves article(s).

#### Parameters:
- `article_id` (optional): The ID of the article to retrieve.
- `teacher_id` (optional): The ID of the teacher to retrieve articles by.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Article retrieved successfully",
    "data": {
      "article_id": "...",
      "teacher_id": "...",
      "title": "...",
      "content": "...",
      "status": "...",
      "allow_comments": "...",
      "comment_permission": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Articles retrieved successfully",
    "data": [
      { ...article_object_1 },
      { ...article_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** Article not found.

### POST /api/article.php
Creates a new article.

#### Parameters (Form Data):
- `teacher_id` (required): The ID of the teacher creating the article.
- `title` (required): The title of the article.
- `content` (required): The content of the article.
- `status` (required): The status of the article (e.g., 'published', 'draft').
- `allow_comments` (optional, default: 1): Whether comments are allowed (1 for true, 0 for false).
- `comment_permission` (optional): Specific permission for comments (e.g., 'all', 'registered_users').

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Article created successfully",
    "data": {
      "article_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to create article.

### PUT /api/article.php
Updates an existing article.

#### Parameters (Form Data):
- `article_id` (required, URL parameter): The ID of the article to update.
- `title` (optional): The new title of the article.
- `content` (optional): The new content of the article.
- `status` (optional): The new status of the article.
- `allow_comments` (optional): Whether comments are allowed.
- `comment_permission` (optional): Specific permission for comments.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Article updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `article_id` parameter.
- **Error (500 Internal Server Error):** Failed to update article.

### DELETE /api/article.php
Deletes an article.

#### Parameters:
- `article_id` (required, URL parameter): The ID of the article to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Article deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `article_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete article.

## 2. Auth API (`api/auth.php`)

### POST /api/auth.php
Handles user login.

#### Parameters (Form Data):
- `username` (required): The user's username.
- `password` (required): The user's password.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user_id": "...",
      "username": "..."
    }
  }
  ```
  (Sets `auth_token` cookie)
- **Error (400 Bad Request):** Missing username or password.
- **Error (401 Unauthorized):** Invalid username or password.

### DELETE /api/auth.php
Handles user logout.

#### Parameters:
- None (requires `auth_token` cookie).

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```
  (Clears `auth_token` cookie)
- **Error (400 Bad Request):** No token found.

### GET /api/auth.php
Checks user login status.

#### Parameters:
- None (requires `auth_token` cookie).

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in",
    "data": {
      "user_id": "...",
      "username": "..."
    }
  }
  ```
- **Error (401 Unauthorized):** Not logged in or Invalid token.
  (Clears invalid `auth_token` cookie)

## 3. Booking API (`api/booking.php`)

### GET /api/booking.php
Retrieves booking(s).

#### Parameters:
- `booking_id` (optional): The ID of the booking to retrieve.
- `teacher_id` (optional): The ID of the teacher to retrieve bookings for.
- `requester_user_id` (optional): The ID of the requester to retrieve bookings for (derived from session token).

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking retrieved successfully",
    "data": {
      "booking_id": "...",
      "teacher_id": "...",
      "requester_user_id": "...",
      "requester_name": "...",
      "requester_email": "...",
      "start_time": "...",
      "end_time": "...",
      "title": "...",
      "description": "...",
      "status": "...",
      "is_public_on_calendar": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Bookings retrieved successfully",
    "data": [
      { ...booking_object_1 },
      { ...booking_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (401 Unauthorized):** User not authorized.
- **Error (404 Not Found):** Booking not found.

### POST /api/booking.php
Creates a new booking.

#### Parameters (Form Data):
- `teacher_id` (required): The ID of the teacher for the booking.
- `start_time` (required): The start time of the booking (e.g., 'YYYY-MM-DD HH:MM:SS').
- `end_time` (required): The end time of the booking (e.g., 'YYYY-MM-DD HH:MM:SS').
- `title` (required): The title of the booking.
- `description` (optional): A description of the booking.
- `requester_user_id` (derived from session token): The ID of the user making the booking.
- `requester_name` (derived from authorized user): The name of the user making the booking.
- `requester_email` (derived from authorized user): The email of the user making the booking.

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "booking_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields or missing `teacher_id`.
- **Error (401 Unauthorized):** User not authorized.
- **Error (403 Forbidden):** User is not a teacher.
- **Error (404 Not Found):** Teacher not found.
- **Error (500 Internal Server Error):** Failed to create booking.

### PUT /api/booking.php
Updates an existing booking.

#### Parameters (Form Data):
- `booking_id` (required, URL parameter): The ID of the booking to update.
- `teacher_id` (optional): The new teacher ID (only allowed for requester when status is pending).
- `start_time` (optional): The new start time (only allowed for requester when status is pending or denied for re-submission).
- `end_time` (optional): The new end time (only allowed for requester when status is pending or denied for re-submission).
- `title` (optional): The new title (only allowed for requester when status is pending or denied for re-submission).
- `description` (optional): The new description (only allowed for requester when status is pending or denied for re-submission).
- `status` (optional): The new status (e.g., 'approved', 'denied', 'pending').
    - Requester can set to 'pending' on re-submission of a denied booking.
    - Teacher can change status when booking is pending.
- `is_public_on_calendar` (optional): Whether the booking is public on the calendar (1 for true, 0 for false).
    - Teacher can change this when booking is pending or approved.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `booking_id` parameter.
- **Error (401 Unauthorized):** User not authorized.
- **Error (403 Forbidden):** Unauthorized to update this booking or specific fields.
- **Error (404 Not Found):** Booking not found.
- **Error (500 Internal Server Error):** Failed to update booking.

### DELETE /api/booking.php
Deletes a booking.

#### Parameters:
- `booking_id` (required, URL parameter): The ID of the booking to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `booking_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete booking.

## 4. Comment API (`api/comment.php`)

### GET /api/comment.php
Retrieves comment(s).

#### Parameters:
- `comment_id` (optional): The ID of the comment to retrieve.
- `article_id` (optional): The ID of the article to retrieve comments for.
- `parent_comment_id` (optional): The ID of the parent comment to retrieve replies for.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Comment retrieved successfully",
    "data": {
      "comment_id": "...",
      "article_id": "...",
      "parent_comment_id": "...",
      "user_id": "...",
      "guest_name": "...",
      "guest_email": "...",
      "content": "...",
      "status": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Comments retrieved successfully",
    "data": [
      { ...comment_object_1 },
      { ...comment_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** Comment not found.

### POST /api/comment.php
Creates a new comment.

#### Parameters (Form Data):
- `article_id` (required): The ID of the article the comment belongs to.
- `parent_comment_id` (optional): The ID of the parent comment if this is a reply.
- `user_id` (optional): The ID of the user making the comment (if logged in).
- `guest_name` (optional): The name of the guest making the comment (if not logged in).
- `guest_email` (optional): The email of the guest making the comment (if not logged in).
- `content` (required): The content of the comment.
- `status` (optional, default: 'pending'): The status of the comment (e.g., 'approved', 'pending').

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Comment created successfully",
    "data": {
      "comment_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to create comment.

### PUT /api/comment.php
Updates an existing comment.

#### Parameters (Form Data):
- `comment_id` (required, URL parameter): The ID of the comment to update.
- `content` (optional): The new content of the comment.
- `status` (optional): The new status of the comment.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Comment updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `comment_id` parameter.
- **Error (500 Internal Server Error):** Failed to update comment.

### DELETE /api/comment.php
Deletes a comment.

#### Parameters:
- `comment_id` (required, URL parameter): The ID of the comment to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Comment deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `comment_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete comment.

## 5. Course API (`api/course.php`)

### GET /api/course.php
Retrieves course(s).

#### Parameters:
- `course_id` (optional): The ID of the course to retrieve.
- `teacher_id` (optional): The ID of the teacher to retrieve courses by.
- `public` (optional, any value): If present, retrieves all public courses.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course retrieved successfully",
    "data": {
      "course_id": "...",
      "teacher_id": "...",
      "course_code": "...",
      "course_name": "...",
      "description": "...",
      "schedule_info": "...",
      "is_public": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Courses retrieved successfully",
    "data": [
      { ...course_object_1 },
      { ...course_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** Course not found.

### POST /api/course.php
Creates a new course.

#### Parameters (Form Data):
- `course_code` (required): A unique code for the course.
- `course_name` (required): The name of the course.
- `description` (optional): A description of the course.
- `schedule_info` (optional): Information about the course schedule.
- `is_public` (optional, default: 0): Whether the course is public (1 for true, 0 for false).
- `teacher_id` (derived from session token): The ID of the teacher creating the course.

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Course created successfully",
    "data": {
      "course_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields or course code already in use.
- **Error (401 Unauthorized):** User not authorized.
- **Error (403 Forbidden):** Permission denied (user is not a teacher).
- **Error (500 Internal Server Error):** Failed to create course.

### PUT /api/course.php
Updates an existing course.

#### Parameters (Form Data):
- `course_id` (required, URL parameter): The ID of the course to update.
- `course_name` (optional): The new name of the course.
- `description` (optional): The new description of the course.
- `schedule_info` (optional): The new schedule information.
- `is_public` (optional): Whether the course is public.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course updated successfully",
    "data": {
      "course_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing `course_id` parameter.
- **Error (401 Unauthorized):** User not authorized.
- **Error (403 Forbidden):** Permission denied (user is not admin or not the course teacher).
- **Error (404 Not Found):** Course not found.
- **Error (500 Internal Server Error):** Failed to update course.

### DELETE /api/course.php
Deletes a course.

#### Parameters:
- `course_id` (required, URL parameter): The ID of the course to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `course_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete course.

## 6. Download API (`api/download.php`)

### GET /api/download.php
Downloads a shared file.

#### Parameters:
- `file_id` (required): The ID of the file to download.

#### Responses:
- **Success (File Download):** The file content is streamed as a download.
- **Error (400 Bad Request):** Missing `file_id` parameter.
- **Error (404 Not Found):** File not found in database or on server.

## 7. Enrollment API (`api/enrollment.php`)

### GET /api/enrollment.php
Retrieves enrollment status or course members/user courses.

#### Parameters:
- `course_id` (optional): The ID of the course.
- `user_id` (optional): The ID of the user.

#### Responses:
- **Success (200 OK):**
  - If `course_id` and `user_id` are provided:
    ```json
    {
      "success": true,
      "message": "Enrollment status retrieved successfully",
      "data": {
        "is_enrolled": true/false
      }
    }
    ```
  - If only `course_id` is provided:
    ```json
    {
      "success": true,
      "message": "Course members retrieved successfully",
      "data": [
        { "user_id": "...", "username": "...", "role": "..." },
        ...
      ]
    }
    ```
  - If only `user_id` is provided:
    ```json
    {
      "success": true,
      "message": "User courses retrieved successfully",
      "data": [
        { "course_id": "...", "course_name": "...", "teacher_id": "..." },
        ...
      ]
    }
    ```
- **Error (400 Bad Request):** Missing parameters.

### POST /api/enrollment.php
Enrolls a user in a course.

#### Parameters (Form Data):
- `course_id` (required): The ID of the course to enroll in.
- `user_id` (required): The ID of the user to enroll.

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "User enrolled successfully",
    "data": {
      "enrollment_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to enroll user.

### DELETE /api/enrollment.php
Unenrolls a user from a course.

#### Parameters:
- `course_id` (required, URL parameter): The ID of the course.
- `user_id` (required, URL parameter): The ID of the user.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "User unenrolled successfully"
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to unenroll user.

## 8. File API (`api/file.php`)

### GET /api/file.php
Retrieves file(s) metadata.

#### Parameters:
- `file_id` (optional): The ID of the file to retrieve.
- `uploader_id` (optional): The ID of the uploader to retrieve files by.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "File retrieved successfully",
    "data": {
      "file_id": "...",
      "uploader_id": "...",
      "filename": "...",
      "filepath": "...",
      "filesize": "...",
      "mimetype": "...",
      "uploaded_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Files retrieved successfully",
    "data": [
      { ...file_object_1 },
      { ...file_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** File not found.

### POST /api/file.php
Uploads a file and creates a file record.

#### Parameters (Form Data):
- `uploader_id` (required): The ID of the user uploading the file.
- `file` (required, file upload): The file to upload.
- `description` (optional): A description for the file.

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "file_id": "...",
      "filename": "...",
      "filepath": "...",
      "uploader_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields or file upload error.
- **Error (500 Internal Server Error):** Failed to create file record or move uploaded file.

### PUT /api/file.php
Updates file metadata.

#### Parameters (Form Data):
- `file_id` (required, URL parameter): The ID of the file to update.
- `filename` (optional): The new filename.
- `filepath` (optional): The new filepath.
- `description` (optional): The new description.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "File metadata updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `file_id` parameter.
- **Error (500 Internal Server Error):** Failed to update file metadata.

### DELETE /api/file.php
Deletes a file record and the physical file.

#### Parameters:
- `file_id` (required, URL parameter): The ID of the file to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "File deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `file_id` parameter.
- **Error (404 Not Found):** File not found.
- **Error (500 Internal Server Error):** Failed to delete file.

## 9. Permission API (`api/permission.php`)

### GET /api/permission.php
Retrieves file permissions or checks a specific permission.

#### Parameters:
- `file_id` (required): The ID of the file.
- `target_user_id` (optional): The ID of the user to check permission for.
- `access_level` (optional): The access level to check (e.g., 'read', 'write').

#### Responses:
- **Success (200 OK):**
  - If `target_user_id` and `access_level` are provided:
    ```json
    {
      "success": true,
      "message": "Permission check result",
      "data": {
        "has_permission": true/false
      }
    }
    ```
  - If only `file_id` is provided:
    ```json
    {
      "success": true,
      "message": "Permissions retrieved successfully",
      "data": [
        {
          "permission_id": "...",
          "file_id": "...",
          "share_type": "...",
          "target_user_id": "...",
          "target_course_id": "...",
          "access_level": "..."
        },
        ...
      ]
    }
    ```
- **Error (400 Bad Request):** Missing `file_id` parameter.

### POST /api/permission.php
Adds a new file permission.

#### Parameters (Form Data):
- `file_id` (required): The ID of the file to add permission for.
- `share_type` (required): The type of sharing (e.g., 'user', 'course', 'public').
- `target_user_id` (optional): The ID of the target user (if `share_type` is 'user').
- `target_course_id` (optional): The ID of the target course (if `share_type` is 'course').
- `access_level` (required): The access level (e.g., 'read', 'write').

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Permission added successfully",
    "data": {
      "permission_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to add permission.

### PUT /api/permission.php
Updates an existing file permission.

#### Parameters (Form Data):
- `permission_id` (required, URL parameter): The ID of the permission to update.
- `share_type` (optional): The new type of sharing.
- `target_user_id` (optional): The new target user ID.
- `target_course_id` (optional): The new target course ID.
- `access_level` (optional): The new access level.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Permission updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `permission_id` parameter.
- **Error (500 Internal Server Error):** Failed to update permission.

### DELETE /api/permission.php
Deletes a file permission.

#### Parameters:
- `permission_id` (required, URL parameter): The ID of the permission to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Permission deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `permission_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete permission.

## 10. Template API (`api/template.php`)

### GET /api/template.php
Retrieves markdown template(s).

#### Parameters:
- `template_id` (optional): The ID of the template to retrieve.
- `creator_id` (optional): The ID of the creator to retrieve templates by.
- `shared` (optional, any value): If present, retrieves all shared templates.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Template retrieved successfully",
    "data": {
      "template_id": "...",
      "creator_id": "...",
      "name": "...",
      "content": "...",
      "is_shared": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  or
  ```json
  {
    "success": true,
    "message": "Templates retrieved successfully",
    "data": [
      { ...template_object_1 },
      { ...template_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** Template not found.

### POST /api/template.php
Creates a new markdown template.

#### Parameters (Form Data):
- `creator_id` (required): The ID of the user creating the template.
- `name` (required): The name of the template.
- `content` (required): The markdown content of the template.
- `is_shared` (optional, default: 0): Whether the template is shared publicly (1 for true, 0 for false).

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Template created successfully",
    "data": {
      "template_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to create template.

### PUT /api/template.php
Updates an existing markdown template.

#### Parameters (Form Data):
- `template_id` (required, URL parameter): The ID of the template to update.
- `name` (optional): The new name of the template.
- `content` (optional): The new markdown content of the template.
- `is_shared` (optional): Whether the template is shared publicly.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Template updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `template_id` parameter.
- **Error (500 Internal Server Error):** Failed to update template.

### DELETE /api/template.php
Deletes a markdown template.

#### Parameters:
- `template_id` (required, URL parameter): The ID of the template to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Template deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `template_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete template.

## 11. User API (`api/user.php`)

### GET /api/user.php
Retrieves user(s) information.

#### Parameters:
- `user_id` (optional): The ID of the user to retrieve.
- `username` (optional): The username of the user to retrieve.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "user_id": "...",
      "username": "...",
      "email": "...",
      "full_name": "...",
      "role": "...",
      "profile_markdown": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
  (Note: `password_hash` is excluded from the response)
  or
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      { ...user_object_1 },
      { ...user_object_2 }
    ]
  }
  ```
- **Error (400 Bad Request):** Missing parameters.
- **Error (404 Not Found):** User not found.

### POST /api/user.php
Creates a new user (registration).

#### Parameters (Form Data):
- `username` (required): The desired username.
- `password` (required): The user's password.
- `email` (required): The user's email address.
- `full_name` (optional): The user's full name.
- `role` (optional, default: 'user'): The user's role (e.g., 'user', 'teacher', 'admin').
- `profile_markdown` (optional): Markdown content for the user's profile.

#### Responses:
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "user_id": "..."
    }
  }
  ```
- **Error (400 Bad Request):** Missing required fields.
- **Error (500 Internal Server Error):** Failed to create user.

### PUT /api/user.php
Updates an existing user's information.

#### Parameters (Form Data):
- `user_id` (required, URL parameter): The ID of the user to update.
- `username` (optional): The new username.
- `email` (optional): The new email address.
- `full_name` (optional): The new full name.
- `role` (optional): The new role.
- `profile_markdown` (optional): The new markdown content for the profile.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "User updated successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `user_id` parameter.
- **Error (500 Internal Server Error):** Failed to update user.

### DELETE /api/user.php
Deletes a user.

#### Parameters:
- `user_id` (required, URL parameter): The ID of the user to delete.

#### Responses:
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Error (400 Bad Request):** Missing `user_id` parameter.
- **Error (500 Internal Server Error):** Failed to delete user.
