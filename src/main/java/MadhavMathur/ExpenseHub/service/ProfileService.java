package MadhavMathur.ExpenseHub.service;

import org.springframework.stereotype.Service;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService 
{
    private final ProfileRepository profileRepository;
}
