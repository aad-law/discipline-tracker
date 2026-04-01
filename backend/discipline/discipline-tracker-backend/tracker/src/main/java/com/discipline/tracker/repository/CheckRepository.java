package com.discipline.tracker.repository;

import com.discipline.tracker.entity.Check;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CheckRepository extends JpaRepository<Check, Long> {

    // Find all checks for a specific habit
    List<Check> findByHabitId(Long habitId);

    // Find all checks for a specific habit on a specific date
    Optional<Check> findByHabitIdAndCheckedDate(Long habitId, LocalDate checkedDate);

    // Find all checks within a date range (used in analytics)
    List<Check> findByCheckedDateBetween(LocalDate start, LocalDate end);
}