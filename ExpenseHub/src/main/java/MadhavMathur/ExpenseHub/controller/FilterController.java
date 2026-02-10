package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.FilterDTO;
import MadhavMathur.ExpenseHub.dto.RecentTransactionDTO;
import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/filter")
@RequiredArgsConstructor
public class FilterController {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileRepository profileRepository;

    @PostMapping
    public ResponseEntity<List<RecentTransactionDTO>> filterTransactions(
            @RequestBody FilterDTO filter,
            Principal principal) {
        
        ProfileEntity profile = profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        List<RecentTransactionDTO> list = new ArrayList<>();
        Long profileId = profile.getId();

        // 1. Fetch data depending on type filter
        boolean fetchExpense = filter.getType() == null || "ALL".equalsIgnoreCase(filter.getType()) || "EXPENSE".equalsIgnoreCase(filter.getType());
        boolean fetchIncome = filter.getType() == null || "ALL".equalsIgnoreCase(filter.getType()) || "INCOME".equalsIgnoreCase(filter.getType());

        if (fetchExpense) {
            List<ExpenseEntity> expenses = expenseRepository.findByProfileId(profileId);
            for (ExpenseEntity e : expenses) {
                list.add(RecentTransactionDTO.builder()
                        .id(e.getId())
                        .profileId(profileId)
                        .name(e.getName())
                        .amount(e.getAmount())
                        .date(e.getDate())
                        .icon(e.getIcon())
                        .categoryId(e.getCategory() != null ? e.getCategory().getId() : null)
                        .categoryName(e.getCategory() != null ? e.getCategory().getName() : "General")
                        .type("EXPENSE")
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .build());
            }
        }

        if (fetchIncome) {
            List<IncomeEntity> incomes = incomeRepository.findByProfileId(profileId);
            for (IncomeEntity i : incomes) {
                list.add(RecentTransactionDTO.builder()
                        .id(i.getId())
                        .profileId(profileId)
                        .name(i.getName())
                        .amount(i.getAmount())
                        .date(i.getDate())
                        .icon(i.getIcon())
                        .categoryId(i.getCategory() != null ? i.getCategory().getId() : null)
                        .categoryName(i.getCategory() != null ? i.getCategory().getName() : "General")
                        .type("INCOME")
                        .createdAt(i.getCreatedAt())
                        .updatedAt(i.getUpdatedAt())
                        .build());
            }
        }

        // 2. Apply Filters (category, date-range, keyword)
        if (filter.getCategoryId() != null) {
            list = list.stream()
                    .filter(t -> t.getCategoryId() != null && t.getCategoryId().equals(filter.getCategoryId()))
                    .collect(Collectors.toList());
        }

        if (filter.getStartDate() != null) {
            list = list.stream()
                    .filter(t -> !t.getDate().isBefore(filter.getStartDate()))
                    .collect(Collectors.toList());
        }

        if (filter.getEndDate() != null) {
            list = list.stream()
                    .filter(t -> !t.getDate().isAfter(filter.getEndDate()))
                    .collect(Collectors.toList());
        }

        if (filter.getKeyword() != null && !filter.getKeyword().trim().isEmpty()) {
            String kw = filter.getKeyword().toLowerCase().trim();
            list = list.stream()
                    .filter(t -> t.getName().toLowerCase().contains(kw))
                    .collect(Collectors.toList());
        }

        // 3. Apply Sorting
        String field = filter.getSortField() != null ? filter.getSortField().toLowerCase() : "date";
        boolean desc = filter.getSortOrder() == null || "desc".equalsIgnoreCase(filter.getSortOrder());

        Comparator<RecentTransactionDTO> comp;
        switch (field) {
            case "amount":
                comp = Comparator.comparing(RecentTransactionDTO::getAmount);
                break;
            case "name":
                comp = Comparator.comparing(RecentTransactionDTO::getName);
                break;
            case "date":
            default:
                comp = Comparator.comparing(RecentTransactionDTO::getDate);
                break;
        }

        if (desc) {
            comp = comp.reversed();
        }

        list.sort(comp);
        return ResponseEntity.ok(list);
    }
}
