package com.discipline.tracker.service;

import com.discipline.tracker.entity.Habit;
import com.discipline.tracker.repository.HabitRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HabitService {

    private final HabitRepository habitRepository;

    // Constructor injection (better than @Autowired)
    public HabitService(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }

    public Habit createHabit(Habit habit) {
        return habitRepository.save(habit);
    }

    public Habit updateHabit(Long id, Habit updated) {
        Habit existing = habitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Habit not found"));

        existing.setName(updated.getName());
        existing.setIcon(updated.getIcon());
        existing.setTime(updated.getTime());

        return habitRepository.save(existing);
    }

    public void deleteHabit(Long id) {
        habitRepository.deleteById(id);
    }
}