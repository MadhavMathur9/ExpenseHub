package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.ExpenseDTO;
import MadhavMathur.ExpenseHub.entity.CategoryEntity;
import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.CategoryRepository;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public List<ExpenseDTO> getExpensesByProfile(Long profileId) {
        return expenseRepository.findByProfileIdOrderByDateDesc(profileId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getExpensesByProfileAndDateBetween(Long profileId, LocalDate start, LocalDate end) {
        return expenseRepository.findByProfileIdAndDateBetweenOrderByDateDesc(profileId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ExpenseDTO createExpense(ExpenseDTO dto, ProfileEntity profile) {
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        ExpenseEntity expense = ExpenseEntity.builder()
                .name(dto.getName())
                .amount(dto.getAmount())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .icon(category.getIcon())
                .category(category)
                .profile(profile)
                .build();

        expense = expenseRepository.save(expense);
        return toDTO(expense);
    }

    public ExpenseDTO updateExpense(Long id, ExpenseDTO dto, Long profileId) {
        ExpenseEntity expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        if (!expense.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on expense");
        }

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        expense.setName(dto.getName());
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        expense.setCategory(category);
        expense.setIcon(category.getIcon());

        expense = expenseRepository.save(expense);
        return toDTO(expense);
    }

    public void deleteExpense(Long id, Long profileId) {
        ExpenseEntity expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        if (!expense.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on expense");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseDTO toDTO(ExpenseEntity entity) {
        return ExpenseDTO.builder()
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
