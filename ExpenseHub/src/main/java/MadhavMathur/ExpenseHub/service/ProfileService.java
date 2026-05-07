package MadhavMathur.ExpenseHub.service;

import org.springframework.stereotype.Service;

import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.dto.ProfileDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
// import MadhavMathur.ExpenseHub.dto.AuthDTO;

// import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

// import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class ProfileService {
    private final ProfileRepository profileRepository;

    // Helper Method
    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);

        return toDTO(newProfile);
    }
    // Helper Method

    public ProfileEntity toEntity(ProfileDTO profileDTO) {
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                // .password(passwordEncoder.encode(profileDTO.getPassword()))
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();

    }
    // Helper Method

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
