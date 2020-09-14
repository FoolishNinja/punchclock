package ch.zli.m223.punchclock.controller;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import ch.zli.m223.punchclock.domain.BackgroundColor;
import ch.zli.m223.punchclock.service.BackgroundColorService;
import ch.zli.m223.punchclock.service.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.BadRequestException;
import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/background-color")
public class BackgroundColorController {
    private BackgroundColorService backgroundColorService;
    private UserDetailsServiceImpl userDetailsService;

    public BackgroundColorController(BackgroundColorService backgroundColorService, UserDetailsServiceImpl userDetailsService) {
        this.backgroundColorService = backgroundColorService;
        this.userDetailsService = userDetailsService;
    }

    @GetMapping()
    @ResponseStatus(HttpStatus.OK)
    public BackgroundColor getBackgroundColor() {
        Optional<BackgroundColor> backgroundColor = backgroundColorService.getBackgroundColor();
        if(backgroundColor.isEmpty()) throw new BadRequestException();
        return backgroundColor.get();
    }

    @PutMapping("/{id}")
    public BackgroundColor updateBackgroundColor(BackgroundColor backgroundColor, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if(!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        return backgroundColorService.updateBackgroundColor(backgroundColor);
    }
}
