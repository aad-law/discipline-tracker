package com.discipline.tracker.controller;

import com.discipline.tracker.entity.Habit;
import com.discipline.tracker.service.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173") // your React port
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<Habit> getAll() {
        return habitService.getAllHabits();
    }

    @PostMapping
    public Habit create(@RequestBody Habit habit) {
        return habitService.createHabit(habit);
    }

    @PatchMapping("/{id}")
    public Habit update(@PathVariable Long id, @RequestBody Habit habit) {
        return habitService.updateHabit(id, habit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return ResponseEntity.noContent().build();
    }
}