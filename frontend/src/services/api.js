const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
const AUTH_TOKEN_STORAGE_KEY = 'studynet-auth-token';
const AUTH_USER_STORAGE_KEY = 'studynet-auth-user';

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Auth-Token': token } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.assign('/login');
      }
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Đã xảy ra lỗi khi gọi API.');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((response) => {
    return response;
  });
}

export async function loginWithToken(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Đăng nhập thất bại.');
  }

  const authToken = response.headers.get('X-Auth-Token');
  const body = await response.json();
  if (!authToken) {
    throw new Error('Đăng nhập thành công nhưng không nhận được phiên đăng nhập.');
  }

  setAuthToken(authToken);
  return { ...body, authToken };
}

export function fetchCurrentUser() {
  return request('/auth/me');
}

export function logoutRequest() {
  return request('/auth/logout', {
    method: 'POST',
  }).finally(() => {
    clearAuthSession();
  });
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchSubjects() {
  return request('/subjects');
}

export function fetchFeed(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.subjectId) searchParams.set('subjectId', params.subjectId);
  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  if (params.type && params.type !== 'ALL') searchParams.set('type', params.type);
  if (params.sortBy && params.sortBy !== 'LATEST') searchParams.set('sortBy', params.sortBy);

  const query = searchParams.toString();
  return request(`/feed${query ? `?${query}` : ''}`);
}

export function createPost(payload) {
  return request('/feed', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePost(postId, payload) {
  return request(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deletePost(postId) {
  return request(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export function reactToPost(postId, payload) {
  return request(`/posts/${postId}/reactions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export function addComment(postId, payload) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteComment(postId, commentId) {
  return request(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export function fetchUserGroups() {
  return request('/users/me/groups');
}

export function fetchAllGroups(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.subjectId) searchParams.set('subjectId', params.subjectId);
  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  if (params.page) searchParams.set('page', params.page);
  if (params.size) searchParams.set('size', params.size);

  const query = searchParams.toString();
  return request(`/groups${query ? `?${query}` : ''}`);
}

export function fetchGroupDetail(groupId) {
  return request(`/groups/${groupId}`);
}

export function createGroup(payload) {
  return request('/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function joinGroup(groupId) {
  return request(`/groups/${groupId}/join`, {
    method: 'POST',
  });
}

export function cancelJoinRequest(groupId) {
  return request(`/groups/${groupId}/join`, {
    method: 'DELETE',
  });
}

export function approveGroupMember(groupId, targetUserId) {
  return request(`/groups/${groupId}/members/${targetUserId}/approve`, {
    method: 'PATCH',
  });
}

export function rejectGroupMember(groupId, targetUserId, payload) {
  return request(`/groups/${groupId}/members/${targetUserId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function leaveGroup(groupId) {
  return request(`/groups/${groupId}/members`, {
    method: 'DELETE',
  });
}

export function deleteGroup(groupId) {
  return request(`/groups/${groupId}`, {
    method: 'DELETE',
  });
}

export function fetchUnreadNotificationCount() {
  return request('/users/me/notifications/unread-count');
}

export function fetchNotifications() {
  return request('/users/me/notifications');
}

export function markNotificationAsRead(notificationId) {
  return request(`/users/me/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function fetchUserProfile(userId) {
  return request(`/users/${userId}/profile`);
}

export function fetchUserPosts(userId) {
  return request(`/users/${userId}/posts`);
}

export function seedSampleData() {
  return request('/dev/seed', {
    method: 'POST',
  });
}

export function seedDemoData() {
  return request('/dev/seed-demo', {
    method: 'POST',
  });
}
