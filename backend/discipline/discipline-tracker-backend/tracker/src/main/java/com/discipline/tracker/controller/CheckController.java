package com.discipline.tracker.controller;

import com.discipline.tracker.entity.Check;
import com.discipline.tracker.service.CheckService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/checks")
@CrossOrigin(origins = "http://localhost:5173")
public class CheckController {

    private final CheckService checkService;

    public CheckController(CheckService checkService) {
        this.checkService = checkService;
    }

    @GetMapping("/{habitId}")
    public List<Check> getForHabit(@PathVariable Long habitId) {
        return checkService.getChecksForHabit(habitId);
    }

    // POST /api/checks/3/2025-03-31  → toggles that day
    @PostMapping("/{habitId}/{date}")
    public Check toggle(@PathVariable Long habitId, @PathVariable String date) {
        return checkService.toggleCheck(habitId, LocalDate.parse(date));
    }
}
