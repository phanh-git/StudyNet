package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.repository.UserRepository;
import com.gr1.studynet_backend.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username.trim().toLowerCase())
            .map(AuthenticatedUser::new)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng."));
    }
}
