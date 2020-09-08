package ch.zli.m223.punchclock.repository;

import ch.zli.m223.punchclock.domain.BackgroundColor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackgroundColorRepository extends JpaRepository<BackgroundColor, Long> {
}
