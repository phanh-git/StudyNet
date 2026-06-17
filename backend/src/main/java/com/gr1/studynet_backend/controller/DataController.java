package com.gr1.studynet_backend.controller;

import com.gr1.studynet_backend.dto.CreateSampleDataResponse;
import com.gr1.studynet_backend.service.SampleDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DataController {
    private final SampleDataService sampleDataService;

    @PostMapping("/seed")
    public CreateSampleDataResponse seed() {
        sampleDataService.seedIfNeeded();
        return new CreateSampleDataResponse("Sample data ready");
    }

    @PostMapping("/seed-demo")
    public CreateSampleDataResponse seedDemo() {
        sampleDataService.appendDemoData();
        return new CreateSampleDataResponse("Extra demo data ready");
    }
}
