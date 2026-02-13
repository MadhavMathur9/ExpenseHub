package MadhavMathur.ExpenseHub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MilestoneDTO {
    private Long id;
    private String title;
    private String icon;
    private BigDecimal targetAmount;
    private LocalDate targetDate;

    // Computed fields
    private BigDecimal currentAmount;
    private Double percentComplete;
    private Double monthsRemainingAtCurrentPace; // null when avgMonthlySavings <= 0
}
