package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.AuthDTO;
import MadhavMathur.ExpenseHub.dto.ProfileDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final CategoryService categoryService;
    private final KeycloakAuthService keycloakAuthService;

    @Transactional
    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        if (profileRepository.findByEmail(profileDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        // 1. Create user in Keycloak (throws exception if fails)
        keycloakAuthService.registerUser(profileDTO.getEmail(), profileDTO.getFullName(), profileDTO.getPassword());
        keycloakAuthService.resetPassword(profileDTO.getEmail(), profileDTO.getPassword());

        // 2. Create user in local DB (no need to store password since Keycloak handles auth)
        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setPassword("");
        newProfile.setIsActive(true); // Active immediately for Keycloak
        newProfile = profileRepository.save(newProfile);

        // Seed default categories for user
        categoryService.createDefaultCategories(newProfile);

        return toDTO(newProfile);
    }

    public AuthDTO login(AuthDTO authDTO) {
        // Authenticate with Keycloak directly using Direct Access Grant
        Map<String, Object> tokens = keycloakAuthService.login(authDTO.getEmail(), authDTO.getPassword());

        return AuthDTO.builder()
                .email(authDTO.getEmail())
                .token((String) tokens.get("access_token")) // Return Keycloak access token to frontend
                .build();
    }

    public ProfileDTO getProfileByEmail(String email) {
        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDTO(profile);
    }

    @Transactional
    public ProfileDTO updateProfile(String email, ProfileDTO dto) {
        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        profile.setFullName(dto.getFullName());
        if (dto.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(dto.getProfileImageUrl());
        }
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            // Update password in Keycloak
            keycloakAuthService.resetPassword(email, dto.getPassword());
        }

        profile = profileRepository.save(profile);
        return toDTO(profile);
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Use our custom email flow to preserve the custom UI
        String token = UUID.randomUUID().toString();
        profile.setResetPasswordToken(token);
        profileRepository.save(profile);

        emailService.sendResetPasswordEmail(profile.getEmail(), token);
    }

    @Transactional
    public boolean completePasswordReset(String token, String newPassword) {
        ProfileEntity profile = profileRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token!"));

        // Sync new password to Keycloak
        keycloakAuthService.resetPassword(profile.getEmail(), newPassword);
        
        profile.setResetPasswordToken(null);
        profileRepository.save(profile);
        return true;
    }

    public ProfileEntity toEntity(ProfileDTO profileDTO) {
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity profileEntity) {
        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }
}
