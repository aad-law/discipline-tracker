package com.discipline.tracker.repository;

import com.discipline.tracker.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    // JpaRepository gives you findAll, findById, save, deleteById for free
}