package MadhavMathur.ExpenseHub.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SavingsDTO {
    private String period;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal savings;
    private BigDecimal previousPeriodSavings; // null if no prior data
    private Double percentChange;             // null if no prior data
}
