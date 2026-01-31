package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.RecentTransactionDTO;
import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public Map<String, Object> getDashboardData(Long profileId) {
        BigDecimal totalIncome = incomeRepository.sumAmountByProfileId(profileId);
        BigDecimal totalExpense = expenseRepository.sumAmountByProfileId(profileId);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        // Fetch all transactions to build distributions and recent list
        List<ExpenseEntity> expenses = expenseRepository.findByProfileId(profileId);
        List<IncomeEntity> incomes = incomeRepository.findByProfileId(profileId);

        // Build category-wise distributions
        Map<String, BigDecimal> expenseByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory().getName() : "General",
                        Collectors.reducing(BigDecimal.ZERO, ExpenseEntity::getAmount, BigDecimal::add)
                ));

        Map<String, BigDecimal> incomeByCategory = incomes.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getCategory() != null ? i.getCategory().getName() : "General",
                        Collectors.reducing(BigDecimal.ZERO, IncomeEntity::getAmount, BigDecimal::add)
                ));

        // Create recent transactions list (combine, sort by date, limit to 10)
        List<RecentTransactionDTO> recentTransactions = new ArrayList<>();

        for (ExpenseEntity e : expenses) {
            recentTransactions.add(RecentTransactionDTO.builder()
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

        for (IncomeEntity i : incomes) {
            recentTransactions.add(RecentTransactionDTO.builder()
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

        // Sort descending by date, then by createdAt if date is same
        recentTransactions.sort((t1, t2) -> {
            int dateCompare = t2.getDate().compareTo(t1.getDate());
            if (dateCompare != 0) return dateCompare;
            if (t2.getCreatedAt() != null && t1.getCreatedAt() != null) {
                return t2.getCreatedAt().compareTo(t1.getCreatedAt());
            }
            return 0;
        });

        // Limit to 10 recent transactions
        List<RecentTransactionDTO> limitedTransactions = recentTransactions.stream()
                .limit(10)
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalIncome", totalIncome);
        dashboard.put("totalExpense", totalExpense);
        dashboard.put("balance", balance);
        dashboard.put("recentTransactions", limitedTransactions);
        dashboard.put("expenseByCategory", expenseByCategory);
        dashboard.put("incomeByCategory", incomeByCategory);

        return dashboard;
    }
}
