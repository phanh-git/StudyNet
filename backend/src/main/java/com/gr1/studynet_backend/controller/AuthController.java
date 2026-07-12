package com.gr1.studynet_backend.controller;

import com.gr1.studynet_backend.dto.AuthResponse;
import com.gr1.studynet_backend.dto.LoginRequest;
import com.gr1.studynet_backend.dto.RegisterRequest;
import com.gr1.studynet_backend.dto.UserResponse;
import com.gr1.studynet_backend.security.AuthenticatedUser;
import com.gr1.studynet_backend.service.AuthService;
import com.gr1.studynet_backend.service.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest servletRequest,
        HttpServletResponse servletResponse
    ) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().trim().toLowerCase(),
                request.getPassword()
            )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = servletRequest.getSession(true);

        securityContextRepository.saveContext(context, servletRequest, servletResponse);
        servletResponse.setHeader("X-Auth-Token", session.getId());

        return new AuthResponse(
            "Đăng nhập thành công.",
            authService.getCurrentUser((AuthenticatedUser) authentication.getPrincipal())
        );
    }

    @GetMapping("/me")
    public UserResponse me() {
        return authService.getCurrentUser(currentUserService.getCurrentUser());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleBadRequest(IllegalArgumentException exception) {
        return exception.getMessage();
    }
}
