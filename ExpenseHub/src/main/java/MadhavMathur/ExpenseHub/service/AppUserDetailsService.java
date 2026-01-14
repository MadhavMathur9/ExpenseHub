package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String pwd = profile.getPassword();
        if (pwd == null || pwd.isEmpty()) {
            pwd = "{noop}unused"; // SSO/Keycloak users don't have a local password
        }

        return User.withUsername(profile.getEmail())
                .password(pwd)
                .disabled(!profile.getIsActive())
                .authorities("ROLE_USER")
                .build();
    }
}
