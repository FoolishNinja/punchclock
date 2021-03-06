package ch.zli.m223.punchclock.controller;

import ch.zli.m223.punchclock.domain.ApplicationUser;
import ch.zli.m223.punchclock.domain.Category;
import ch.zli.m223.punchclock.service.CategoryService;
import ch.zli.m223.punchclock.service.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.BadRequestException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {
    private CategoryService categoryService;
    private UserDetailsServiceImpl userDetailsService;

    public CategoryController(CategoryService categoryService, UserDetailsServiceImpl userDetailsService) {
        this.categoryService = categoryService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Category createCategory(@RequestBody Category category, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if(!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        return categoryService.createCategory(category);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Category> getAllCategories() {
        return categoryService.findAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable long id, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if(!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        categoryService.deleteCategory(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Category updateCategory(@RequestBody Category category, Principal principal) {
        ApplicationUser applicationUser = userDetailsService.getUserByUsername(principal.getName());
        if(!applicationUser.getRole().equals("ADMIN")) throw new BadRequestException();
        return categoryService.updateCategory(category);
    }


}
