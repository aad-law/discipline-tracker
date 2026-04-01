package com.discipline.tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "checks")
public class Check {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;        // was Long

    @Column(name = "habit_id", nullable = false)
    private Long  habitId;

    @Column(name = "checked_date", nullable = false)
    private LocalDate checkedDate;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId2) { this.habitId = habitId2; }

    public LocalDate getCheckedDate() { return checkedDate; }
    public void setCheckedDate(LocalDate checkedDate) { this.checkedDate = checkedDate; }
    }

