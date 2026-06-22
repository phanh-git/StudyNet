package com.gr1.studynet_backend.controller;

import com.gr1.studynet_backend.dto.AdminGroupRowResponse;
import com.gr1.studynet_backend.dto.AdminOverviewResponse;
import com.gr1.studynet_backend.dto.AdminUserRowResponse;
import com.gr1.studynet_backend.dto.FeedPostResponse;
import com.gr1.studynet_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/overview")
    public AdminOverviewResponse getOverview() {
        return adminService.getOverview();
    }

    @GetMapping("/users")
    public List<AdminUserRowResponse> getUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/groups")
    public List<AdminGroupRowResponse> getGroups() {
        return adminService.getGroups();
    }

    @GetMapping("/posts")
    public List<FeedPostResponse> getPosts() {
        return adminService.getPosts();
    }
}
