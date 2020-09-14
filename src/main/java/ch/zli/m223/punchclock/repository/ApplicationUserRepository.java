package ch.zli.m223.punchclock.repository;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationUserRepository extends JpaRepository<ApplicationUser, Long> {
    ApplicationUser findByUsername(String username);

    /**@Query( countQuery = "SELECT count(*) FROM ApplicationUser",
    nativeQuery = true
    )
    int getApplicationUserByCount();
     **/
}