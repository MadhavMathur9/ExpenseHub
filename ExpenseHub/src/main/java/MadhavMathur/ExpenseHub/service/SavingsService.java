package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.SavingsDTO;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.IsoFields;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    /**
     * Compute savings (income − expenses) for the requested period and the
     * immediately preceding equivalent period.
     *
     * @param period "monthly" | "quarterly" | "yearly" | "total"
     * @param profileId the authenticated user's profile id
     */
    public SavingsDTO getSavings(String period, Long profileId) {
        LocalDate today = LocalDate.now();

        LocalDate[] current = dateRange(period, today, 0);
        LocalDate[] previous = period.equals("total") ? null : dateRange(period, today, -1);

        BigDecimal currentIncome;
        BigDecimal currentExpense;

        if (current == null) {
            // "total" — no date filter
            currentIncome = incomeRepository.sumAmountByProfileId(profileId);
            currentExpense = expenseRepository.sumAmountByProfileId(profileId);
        } else {
            currentIncome = incomeRepository.sumAmountByProfileIdAndDateBetween(profileId, current[0], current[1]);
            currentExpense = expenseRepository.sumAmountByProfileIdAndDateBetween(profileId, current[0], current[1]);
        }

        BigDecimal currentSavings = currentIncome.subtract(currentExpense);

        // Previous period comparison (skipped for "total")
        BigDecimal prevSavings = null;
        Double percentChange = null;

        if (previous != null) {
            BigDecimal prevIncome = incomeRepository.sumAmountByProfileIdAndDateBetween(
                    profileId, previous[0], previous[1]);
            BigDecimal prevExpense = expenseRepository.sumAmountByProfileIdAndDateBetween(
                    profileId, previous[0], previous[1]);
            prevSavings = prevIncome.subtract(prevExpense);

            // Only compute % change if there was actual prior-period activity
            if (prevIncome.compareTo(BigDecimal.ZERO) > 0 || prevExpense.compareTo(BigDecimal.ZERO) > 0) {
                if (prevSavings.compareTo(BigDecimal.ZERO) != 0) {
                    double change = currentSavings.subtract(prevSavings)
                            .divide(prevSavings.abs(), 4, RoundingMode.HALF_UP)
                            .doubleValue() * 100.0;
                    percentChange = Math.round(change * 10.0) / 10.0;
                } else {
                    // Previous savings was exactly 0 — we can't divide, so omit %
                    percentChange = null;
                }
            }
        }

        return SavingsDTO.builder()
                .period(period)
                .totalIncome(currentIncome)
                .totalExpense(currentExpense)
                .savings(currentSavings)
                .previousPeriodSavings(prevSavings)
                .percentChange(percentChange)
                .build();
    }

    /**
     * Returns [start, end] for the requested period offset.
     * offset=0 → current period, offset=-1 → previous period.
     * Returns null for "total".
     */
    private LocalDate[] dateRange(String period, LocalDate anchor, int offset) {
        return switch (period.toLowerCase()) {
            case "monthly" -> {
                LocalDate base = anchor.plusMonths(offset);
                yield new LocalDate[]{
                        base.withDayOfMonth(1),
                        base.withDayOfMonth(base.lengthOfMonth())
                };
            }
            case "quarterly" -> {
                LocalDate base = anchor.plusMonths((long) offset * 3);
                int q = base.get(IsoFields.QUARTER_OF_YEAR);
                int year = base.getYear();
                LocalDate start = LocalDate.of(year, (q - 1) * 3 + 1, 1);
                LocalDate end = start.plusMonths(3).minusDays(1);
                yield new LocalDate[]{start, end};
            }
            case "yearly" -> {
                LocalDate base = anchor.plusYears(offset);
                yield new LocalDate[]{
                        base.withDayOfYear(1),
                        base.withDayOfYear(base.lengthOfYear())
                };
            }
            default -> null; // "total"
        };
    }
}
