package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.SavingsDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.SavingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsController {

    private final SavingsService savingsService;
    private final ProfileRepository profileRepository;

    /**
     * GET /api/savings?period={monthly|quarterly|yearly|total}
     */
    @GetMapping
    public ResponseEntity<SavingsDTO> getSavings(
            @RequestParam(value = "period", defaultValue = "quarterly") String period,
            Principal principal) {

        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        SavingsDTO result = savingsService.getSavings(period, profile.getId());
        return ResponseEntity.ok(result);
    }
}
