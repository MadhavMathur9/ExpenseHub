package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.ExpenseDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpenses(Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return ResponseEntity.ok(expenseService.getExpensesByProfile(profile.getId()));
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@RequestBody ExpenseDTO expenseDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        ExpenseDTO created = expenseService.createExpense(expenseDTO, profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO expenseDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        ExpenseDTO updated = expenseService.updateExpense(id, expenseDTO, profile.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        expenseService.deleteExpense(id, profile.getId());
        return ResponseEntity.noContent().build();
    }
}
