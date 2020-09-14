package ch.zli.m223.punchclock.controller;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import ch.zli.m223.punchclock.domain.Entry;
import ch.zli.m223.punchclock.repository.ApplicationUserRepository;
import ch.zli.m223.punchclock.service.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.ws.rs.BadRequestException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private ApplicationUserRepository applicationUserRepository;
    private UserDetailsServiceImpl userDetailsService;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public UserController(ApplicationUserRepository applicationUserRepository, UserDetailsServiceImpl userDetailsService, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.applicationUserRepository = applicationUserRepository;
        this.userDetailsService = userDetailsService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    /**
     * Signup endpoint to create a new user
     * <p>
     * Here is how to create new credentials and how to use them:
     * <p>
     * # registers a new user
     * curl -H "Content-Type: application/json" -X POST -d '{
     * "username": "admin",
     * "password": "password"
     * }' http://localhost:8080/users/sign-up
     * <p>
     * # logs into the application (JWT is generated)
     * curl -i -H "Content-Type: application/json" -X POST -d '{
     * "username": "admin",
     * "password": "password"
     * }' http://localhost:8080/login
     * <p>
     * # Fetches all entries
     * curl \
     * -H "Authorization: Bearer xxx.yyy.zzz" \
     * -X GET  http://localhost:8080/entries
     *
     * @param {ApplicationUser} user
     */
    @PostMapping("/sign-up")
    @ResponseStatus(HttpStatus.OK)
    public void signUp(@RequestBody ApplicationUser user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        applicationUserRepository.save(user);
    }

    @GetMapping("/role")
    @ResponseStatus(HttpStatus.OK)
    public String role(Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        return applicationUser.getRole();
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ApplicationUser> findAll(Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if (!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        return applicationUserRepository.findAll().stream().peek(user -> user.setPassword("")).collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationUser createUser(@RequestBody ApplicationUser user, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if (!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        return applicationUserRepository.save(user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable long id, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if (!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        Optional<ApplicationUser> a = applicationUserRepository.findById(id);
        if (a.isEmpty()) throw new BadRequestException();
        applicationUserRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApplicationUser updateUser(@PathVariable long id, @Valid @RequestBody ApplicationUser user, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        Optional<ApplicationUser> a = applicationUserRepository.findById(id);
        if (a.isEmpty()) throw new BadRequestException();
        a.get().setRole(user.getRole());
        a.get().setUsername(user.getUsername());
        a.get().setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        if (!applicationUser.getRole().equals("ADMIN"))
            throw new BadRequestException();
        return applicationUserRepository.save(a.get());
    }
}