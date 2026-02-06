package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.CategoryDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getCategories(Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return ResponseEntity.ok(categoryService.getCategoriesByProfile(profile.getId()));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        CategoryDTO created = categoryService.createCategory(categoryDTO, profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        CategoryDTO updated = categoryService.updateCategory(id, categoryDTO, profile.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        categoryService.deleteCategory(id, profile.getId());
        return ResponseEntity.noContent().build();
    }
}
