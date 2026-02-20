package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        emailService.sendActivationEmail(email, "test-token-12345");
        return ResponseEntity.ok("Test email trigger logged. Check console for confirmation link!");
    }
}
