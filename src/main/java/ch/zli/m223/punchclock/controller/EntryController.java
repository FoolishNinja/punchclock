package ch.zli.m223.punchclock.controller;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import ch.zli.m223.punchclock.domain.Entry;
import ch.zli.m223.punchclock.service.EntryService;
import ch.zli.m223.punchclock.service.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.ws.rs.BadRequestException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/entries")
public class EntryController {
    private EntryService entryService;
    private UserDetailsServiceImpl userDetailsService;

    public EntryController(EntryService entryService, UserDetailsServiceImpl userDetailsService) {
        this.entryService = entryService;
        this.userDetailsService = userDetailsService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Entry> getAllEntries(Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if(applicationUser.getRole().equals("ADMIN")) return entryService.findAll();
        return entryService.findAll().stream().filter(entry -> entry.getApplicationUser().getId() == applicationUser.getId()).collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Entry createEntry(@Valid @RequestBody Entry entry, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        entry.setApplicationUser(applicationUser);
        return entryService.createEntry(entry);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable long id, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        Optional<Entry> entry = entryService.findById(id);
        if(entry.isEmpty()) throw new BadRequestException();
        if(!applicationUser.getRole().equals("ADMIN") && entry.get().getApplicationUser().getId() != applicationUser.getId()) throw new BadRequestException();
        entryService.deleteEntry(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Entry updateEntry(@Valid @RequestBody Entry entry, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        Optional<Entry> e = entryService.findById(entry.getId());
        if(e.isEmpty()) throw new BadRequestException();
        if(!applicationUser.getRole().equals("ADMIN") && e.get().getApplicationUser().getId() != applicationUser.getId()) throw new BadRequestException();
        return entryService.updateEntry(entry);
    }
}
