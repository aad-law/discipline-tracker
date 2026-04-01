package com.discipline.tracker.service;

import com.discipline.tracker.entity.Check;
import com.discipline.tracker.repository.CheckRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service 
public class CheckService {

    private final CheckRepository checkRepository;

    public CheckService(CheckRepository checkRepository) {
        this.checkRepository = checkRepository;
    }

    public List<Check> getChecksForHabit(Long habitId) {
        return checkRepository.findByHabitId(habitId);
    }

    public Check toggleCheck(Long habitId, LocalDate date) {
        // If check exists → delete it (uncheck)
        // If check doesn't exist → create it (check)
        return checkRepository.findByHabitIdAndCheckedDate(habitId, date)
            .map(existing -> {
                checkRepository.delete(existing);
                return (Check) null;
            })
            .orElseGet(() -> {
                Check newCheck = new Check();
                newCheck.setHabitId(habitId);
                newCheck.setCheckedDate(date);
                return checkRepository.save(newCheck);
            });
    }
}