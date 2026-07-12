const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
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
  if (params.currentUserId) searchParams.set('currentUserId', params.currentUserId);

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

export function deletePost(postId, userId) {
  return request(`/posts/${postId}?userId=${userId}`, {
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

export function deleteComment(postId, commentId, userId) {
  return request(`/posts/${postId}/comments/${commentId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

export function fetchUserGroups(userId) {
  return request(`/users/${userId}/groups`);
}

export function fetchAllGroups(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.subjectId) searchParams.set('subjectId', params.subjectId);
  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  if (params.page) searchParams.set('page', params.page);
  if (params.size) searchParams.set('size', params.size);

  const query = searchParams.toString();
  return request(`/groups${query ? `?${query}` : ''}`);
}

export function fetchGroupDetail(groupId, userId) {
  const query = userId ? `?userId=${userId}` : '';
  return request(`/groups/${groupId}${query}`);
}

export function createGroup(payload) {
  return request('/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function joinGroup(groupId, userId) {
  return request(`/groups/${groupId}/join?userId=${userId}`, {
    method: 'POST',
  });
}

export function cancelJoinRequest(groupId, userId) {
  return request(`/groups/${groupId}/join?userId=${userId}`, {
    method: 'DELETE',
  });
}

export function approveGroupMember(groupId, targetUserId, userId) {
  return request(`/groups/${groupId}/members/${targetUserId}/approve?userId=${userId}`, {
    method: 'PATCH',
  });
}

export function rejectGroupMember(groupId, targetUserId, payload) {
  return request(`/groups/${groupId}/members/${targetUserId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function leaveGroup(groupId, userId) {
  return request(`/groups/${groupId}/members?userId=${userId}`, {
    method: 'DELETE',
  });
}

export function deleteGroup(groupId, userId) {
  return request(`/groups/${groupId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

export function fetchUnreadNotificationCount(userId) {
  return request(`/users/${userId}/notifications/unread-count`);
}

export function fetchNotifications(userId) {
  return request(`/users/${userId}/notifications`);
}

export function markNotificationAsRead(userId, notificationId) {
  return request(`/users/${userId}/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function fetchUserProfile(userId) {
  return request(`/users/${userId}/profile`);
}

export function fetchUserPosts(userId, currentUserId) {
  const query = currentUserId ? `?currentUserId=${currentUserId}` : '';
  return request(`/users/${userId}/posts${query}`);
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
