package MadhavMathur.ExpenseHub.service;

import org.springframework.stereotype.Service;


import MadhavMathur.ExpenseHub.repository.ProfileRepository;


import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class ProfileService 
{
    private final ProfileRepository profileRepository;
    
}
