package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.IncomeDTO;
import MadhavMathur.ExpenseHub.entity.CategoryEntity;
import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.CategoryRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;

    public List<IncomeDTO> getIncomesByProfile(Long profileId) {
        return incomeRepository.findByProfileIdOrderByDateDesc(profileId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<IncomeDTO> getIncomesByProfileAndDateBetween(Long profileId, LocalDate start, LocalDate end) {
        return incomeRepository.findByProfileIdAndDateBetweenOrderByDateDesc(profileId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public IncomeDTO createIncome(IncomeDTO dto, ProfileEntity profile) {
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        IncomeEntity income = IncomeEntity.builder()
                .name(dto.getName())
                .amount(dto.getAmount())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .icon(category.getIcon())
                .category(category)
                .profile(profile)
                .build();

        income = incomeRepository.save(income);
        return toDTO(income);
    }

    public IncomeDTO updateIncome(Long id, IncomeDTO dto, Long profileId) {
        IncomeEntity income = incomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income not found"));

        if (!income.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on income");
        }

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        income.setName(dto.getName());
        income.setAmount(dto.getAmount());
        income.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        income.setCategory(category);
        income.setIcon(category.getIcon());

        income = incomeRepository.save(income);
        return toDTO(income);
    }

    public void deleteIncome(Long id, Long profileId) {
        IncomeEntity income = incomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income not found"));

        if (!income.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on income");
        }

        incomeRepository.delete(income);
    }

    public IncomeDTO toDTO(IncomeEntity entity) {
        return IncomeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .amount(entity.getAmount())
                .date(entity.getDate())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "General")
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
