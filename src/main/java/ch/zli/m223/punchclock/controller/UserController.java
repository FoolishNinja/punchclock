package ch.zli.m223.punchclock.controller;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import ch.zli.m223.punchclock.repository.ApplicationUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private ApplicationUserRepository applicationUserRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public UserController(ApplicationUserRepository applicationUserRepository,
                          BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.applicationUserRepository = applicationUserRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    /**
     * Signup endpoint to create a new user
     *
     * Here is how to create new credentials and how to use them:
     *
     * # registers a new user
     * curl -H "Content-Type: application/json" -X POST -d '{
     *     "username": "admin",
     *     "password": "password"
     * }' http://localhost:8080/users/sign-up
     *
     * # logs into the application (JWT is generated)
     * curl -i -H "Content-Type: application/json" -X POST -d '{
     *     "username": "admin",
     *     "password": "password"
     * }' http://localhost:8080/login
     *
     * # Fetches all entries
     * curl \
     * -H "Authorization: Bearer xxx.yyy.zzz" \
     * -X GET  http://localhost:8080/entries
     *
     * @param {ApplicationUser} user
     */
    @PostMapping("/sign-up")
    public void signUp(@RequestBody ApplicationUser user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        applicationUserRepository.save(user);
    }
}