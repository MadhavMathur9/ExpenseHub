package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
@RequiredArgsConstructor
public class FinancialAdvisorController {

    private final GeminiService geminiService;
    private final ProfileRepository profileRepository;

    @RequestMapping(value = "/insights", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, String>> getInsights(
            @RequestParam(value = "context", required = false) String context,
            Principal principal) {
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        String insights = geminiService.getFinancialInsights(profile.getId(), context);
        return ResponseEntity.ok(Map.of("insights", insights));
    }
}
