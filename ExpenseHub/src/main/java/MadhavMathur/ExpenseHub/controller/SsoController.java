package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.CategoryService;
import MadhavMathur.ExpenseHub.service.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles SSO authentication flows (Google, Microsoft).
 * The frontend redirects the user to Keycloak (which brokers to the IdP),
 * and after authentication, sends the authorization code here for exchange.
 */
@Slf4j
@RestController
@RequestMapping("/auth/sso")
@RequiredArgsConstructor
public class SsoController {

    private final KeycloakAuthService keycloakAuthService;
    private final ProfileRepository profileRepository;
    private final CategoryService categoryService;

    /**
     * GET /auth/sso/url?provider=google&redirect_uri=http://localhost:5173/auth/callback
     * Returns the SSO redirect URL for the given provider.
     */
    @GetMapping("/url")
    public ResponseEntity<Map<String, String>> getSsoUrl(
            @RequestParam String provider,
            @RequestParam("redirect_uri") String redirectUri
    ) {
        String url = keycloakAuthService.getSsoRedirectUrl(provider, redirectUri);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * POST /auth/sso/callback
     * Exchanges the authorization code from SSO for Keycloak tokens.
     * Also auto-provisions a local profile if the user doesn't exist yet.
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> handleSsoCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String redirectUri = body.get("redirect_uri");

        if (code == null || redirectUri == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing code or redirect_uri"));
        }

        try {
            // Exchange the authorization code for tokens
            Map<String, Object> tokens = keycloakAuthService.exchangeCode(code, redirectUri);
            String accessToken = (String) tokens.get("access_token");

            // Get user info from the token
            Map<String, String> userInfo = keycloakAuthService.getUserInfo(accessToken);
            String email = userInfo.get("email");
            String name = userInfo.get("name");

            // Auto-provision local profile if user doesn't exist
            if (email != null && !email.isEmpty()) {
                autoProvisionProfile(email, name);
            }

            return ResponseEntity.ok(tokens);
        } catch (Exception e) {
            log.error("SSO callback failed", e);
            return ResponseEntity.badRequest().body(Map.of("message", "SSO authentication failed: " + e.getMessage()));
        }
    }

    /**
     * Creates a local ProfileEntity for SSO users who don't have one yet.
     */
    private void autoProvisionProfile(String email, String fullName) {
        if (profileRepository.findByEmail(email).isPresent()) {
            return; // Profile already exists
        }

        ProfileEntity profile = ProfileEntity.builder()
                .email(email)
                .fullName(fullName != null && !fullName.isEmpty() ? fullName : email)
                .password("") // SSO users don't have a local password
                .isActive(true)
                .build();

        profile = profileRepository.save(profile);
        categoryService.createDefaultCategories(profile);
        log.info("Auto-provisioned local profile for SSO user: {}", email);
    }
}
