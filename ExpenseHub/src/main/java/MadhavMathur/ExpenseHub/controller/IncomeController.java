package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.IncomeDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;
    private final ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getIncomes(Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return ResponseEntity.ok(incomeService.getIncomesByProfile(profile.getId()));
    }

    @PostMapping
    public ResponseEntity<IncomeDTO> createIncome(@RequestBody IncomeDTO incomeDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        IncomeDTO created = incomeService.createIncome(incomeDTO, profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeDTO> updateIncome(@PathVariable Long id, @RequestBody IncomeDTO incomeDTO, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        IncomeDTO updated = incomeService.updateIncome(id, incomeDTO, profile.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id, Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        incomeService.deleteIncome(id, profile.getId());
        return ResponseEntity.noContent().build();
    }
}
