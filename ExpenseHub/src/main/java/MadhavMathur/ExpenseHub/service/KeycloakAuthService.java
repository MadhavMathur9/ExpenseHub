package MadhavMathur.ExpenseHub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service for interacting with Keycloak's REST APIs.
 * Handles Direct Access Grant (login), user creation (registration),
 * password reset, and authorization code exchange (SSO).
 */
@Slf4j
@Service
public class KeycloakAuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakUrl;

    @Value("${keycloak.realm:expensehub}")
    private String realm;

    @Value("${keycloak.client-id:expensehub-app}")
    private String clientId;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    // ─── Direct Access Grant (login with email/password) ───────────────

    /**
     * Authenticate user via Keycloak's token endpoint using Resource Owner Password Credentials.
     * Returns the full token response (access_token, refresh_token, etc.)
     */
    public Map<String, Object> login(String email, String password) {
        String tokenUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", clientId);
        form.add("username", email);
        form.add("password", password);
        form.add("scope", "openid profile email");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, new HttpEntity<>(form, headers), String.class
            );

            JsonNode json = objectMapper.readTree(response.getBody());
            return Map.of(
                    "access_token", json.get("access_token").asText(),
                    "refresh_token", json.has("refresh_token") ? json.get("refresh_token").asText() : "",
                    "expires_in", json.get("expires_in").asInt(),
                    "token_type", json.get("token_type").asText()
            );
        } catch (HttpClientErrorException e) {
            log.warn("Keycloak login failed: {}", e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new IllegalArgumentException("Invalid email or password.");
            }
            throw new RuntimeException("Keycloak authentication failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Keycloak login error", e);
            throw new RuntimeException("Keycloak authentication failed: " + e.getMessage());
        }
    }

    // ─── User Registration via Admin REST API ──────────────────────────

    /**
     * Create a new user in Keycloak and set their password.
     */
    public void registerUser(String email, String fullName, String password) {
        String adminToken = getAdminAccessToken();
        String usersUrl = keycloakUrl + "/admin/realms/" + realm + "/users";

        // Split fullName into first/last
        String[] nameParts = fullName.trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // Build user representation
        Map<String, Object> userRep = Map.of(
                "username", email,
                "email", email,
                "firstName", firstName,
                "lastName", lastName,
                "enabled", true,
                "emailVerified", true,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", password,
                        "temporary", false
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        try {
            restTemplate.exchange(usersUrl, HttpMethod.POST, new HttpEntity<>(userRep, headers), String.class);
            log.info("User {} created in Keycloak", email);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                log.info("User {} already exists in Keycloak, skipping creation", email);
                return; // User already exists in Keycloak — that's fine
            }
            log.error("Failed to create user in Keycloak: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to create user in Keycloak: " + e.getMessage());
        }
    }

    // ─── Password Reset via Admin REST API ─────────────────────────────

    /**
     * Reset a user's password in Keycloak.
     */
    public void resetPassword(String email, String newPassword) {
        String adminToken = getAdminAccessToken();
        String userId = getUserIdByEmail(email, adminToken);

        if (userId == null) {
            throw new IllegalArgumentException("User not found in Keycloak: " + email);
        }

        String resetUrl = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/reset-password";

        Map<String, Object> credential = Map.of(
                "type", "password",
                "value", newPassword,
                "temporary", false
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        try {
            restTemplate.exchange(resetUrl, HttpMethod.PUT, new HttpEntity<>(credential, headers), String.class);
            log.info("Password reset in Keycloak for user: {}", email);
        } catch (Exception e) {
            log.warn("Failed to reset password in Keycloak for {}: {}", email, e.getMessage());
        }
    }

    // ─── SSO Authorization Code Exchange ───────────────────────────────

    /**
     * Exchange an authorization code (from Google/Microsoft SSO) for Keycloak tokens.
     */
    public Map<String, Object> exchangeCode(String code, String redirectUri) {
        String tokenUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("code", code);
        form.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, new HttpEntity<>(form, headers), String.class
            );

            JsonNode json = objectMapper.readTree(response.getBody());
            return Map.of(
                    "access_token", json.get("access_token").asText(),
                    "refresh_token", json.has("refresh_token") ? json.get("refresh_token").asText() : "",
                    "expires_in", json.get("expires_in").asInt(),
                    "token_type", json.get("token_type").asText()
            );
        } catch (Exception e) {
            log.error("Failed to exchange SSO authorization code", e);
            throw new RuntimeException("SSO authentication failed: " + e.getMessage());
        }
    }

    // ─── Build SSO Redirect URL ────────────────────────────────────────

    /**
     * Build the Keycloak authorization URL for a given identity provider.
     * Uses kc_idp_hint to skip Keycloak's login page and go directly to the provider.
     */
    public String getSsoRedirectUrl(String provider, String redirectUri) {
        try {
            String encodedRedirectUri = java.net.URLEncoder.encode(redirectUri, "UTF-8");
            return keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/auth"
                    + "?client_id=" + clientId
                    + "&redirect_uri=" + encodedRedirectUri
                    + "&response_type=code"
                    + "&scope=openid profile email"
                    + "&kc_idp_hint=" + provider
                    + "&prompt=select_account";
        } catch (java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("UTF-8 encoding not supported", e);
        }
    }

    // ─── Get User Info from Keycloak Token ─────────────────────────────

    /**
     * Fetch user info from Keycloak using an access token.
     */
    public Map<String, String> getUserInfo(String accessToken) {
        String userInfoUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );

            JsonNode json = objectMapper.readTree(response.getBody());
            return Map.of(
                    "email", json.has("email") ? json.get("email").asText() : "",
                    "name", json.has("name") ? json.get("name").asText() :
                            (json.has("preferred_username") ? json.get("preferred_username").asText() : ""),
                    "sub", json.has("sub") ? json.get("sub").asText() : ""
            );
        } catch (Exception e) {
            log.error("Failed to fetch user info from Keycloak", e);
            throw new RuntimeException("Failed to fetch user info: " + e.getMessage());
        }
    }

    // ─── Internal Helpers ──────────────────────────────────────────────

    /**
     * Delete a user from Keycloak via the Admin REST API.
     */
    public void deleteUser(String email) {
        String adminToken = getAdminAccessToken();
        String userId = getUserIdByEmail(email, adminToken);

        if (userId == null) {
            log.warn("Cannot delete Keycloak user: user not found for email {}", email);
            return; // Not fatal — local data is already gone
        }

        String deleteUrl = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
            log.info("Keycloak user deleted for: {}", email);
        } catch (Exception e) {
            log.warn("Failed to delete Keycloak user for {}: {}", email, e.getMessage());
        }
    }

    private String getAdminAccessToken() {
        String tokenUrl = keycloakUrl + "/realms/master/protocol/openid-connect/token";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", "admin-cli");
        form.add("username", adminUsername);
        form.add("password", adminPassword);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, new HttpEntity<>(form, headers), String.class
            );
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("access_token").asText();
        } catch (Exception e) {
            log.error("Failed to get Keycloak admin token", e);
            throw new RuntimeException("Cannot connect to Keycloak admin: " + e.getMessage());
        }
    }

    private String getUserIdByEmail(String email, String adminToken) {
        String usersUrl = keycloakUrl + "/admin/realms/" + realm + "/users?email=" + email + "&exact=true";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    usersUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );
            JsonNode users = objectMapper.readTree(response.getBody());
            if (users.isArray() && !users.isEmpty()) {
                return users.get(0).get("id").asText();
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to lookup user in Keycloak: {}", e.getMessage());
            return null;
        }
    }
}
