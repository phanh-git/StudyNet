package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.security.AuthenticatedUser;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    public AuthenticatedUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new AuthenticationCredentialsNotFoundException("Bạn cần đăng nhập để thực hiện thao tác này.");
        }

        return user;
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
