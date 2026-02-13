package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.MilestoneDTO;
import MadhavMathur.ExpenseHub.entity.MilestoneEntity;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import MadhavMathur.ExpenseHub.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    // ── List ──────────────────────────────────────────────────────────────────

    public List<MilestoneDTO> getMilestones(Long profileId) {
        // Shared savings pool: totalSavings = all income − all expenses for this profile
        BigDecimal totalSavings = computeTotalSavings(profileId);

        // Average monthly savings over the last 3 months (for pacing estimate)
        Double avgMonthlySavings = computeAvgMonthlySavings(profileId);

        return milestoneRepository.findByProfileIdOrderByCreatedAtAsc(profileId)
                .stream()
                .map(m -> toDTO(m, totalSavings, avgMonthlySavings))
                .collect(Collectors.toList());
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public MilestoneDTO create(MilestoneDTO dto, ProfileEntity profile) {
        MilestoneEntity entity = MilestoneEntity.builder()
                .profile(profile)
                .title(dto.getTitle())
                .icon(dto.getIcon() != null ? dto.getIcon() : "target")
                .targetAmount(dto.getTargetAmount())
                .targetDate(dto.getTargetDate())
                .build();
        entity = milestoneRepository.save(entity);

        BigDecimal totalSavings = computeTotalSavings(profile.getId());
        Double avg = computeAvgMonthlySavings(profile.getId());
        return toDTO(entity, totalSavings, avg);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public MilestoneDTO update(Long id, MilestoneDTO dto, Long profileId) {
        MilestoneEntity entity = milestoneRepository.findByIdAndProfileId(id, profileId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));

        entity.setTitle(dto.getTitle());
        entity.setIcon(dto.getIcon() != null ? dto.getIcon() : entity.getIcon());
        entity.setTargetAmount(dto.getTargetAmount());
        entity.setTargetDate(dto.getTargetDate());
        entity = milestoneRepository.save(entity);

        BigDecimal totalSavings = computeTotalSavings(profileId);
        Double avg = computeAvgMonthlySavings(profileId);
        return toDTO(entity, totalSavings, avg);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(Long id, Long profileId) {
        MilestoneEntity entity = milestoneRepository.findByIdAndProfileId(id, profileId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
        milestoneRepository.delete(entity);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /**
     * Shared savings pool: total income − total expenses across all time.
     */
    private BigDecimal computeTotalSavings(Long profileId) {
        BigDecimal income = incomeRepository.sumAmountByProfileId(profileId);
        BigDecimal expense = expenseRepository.sumAmountByProfileId(profileId);
        return income.subtract(expense);
    }

    /**
     * Average monthly net savings over the most recent 3 calendar months.
     * Returns null if the average is <= 0 (so the frontend can omit pacing).
     */
    private Double computeAvgMonthlySavings(Long profileId) {
        LocalDate today = LocalDate.now();
        double totalNet = 0.0;
        int months = 3;

        for (int i = 1; i <= months; i++) {
            LocalDate base = today.minusMonths(i);
            LocalDate start = base.withDayOfMonth(1);
            LocalDate end = base.withDayOfMonth(base.lengthOfMonth());

            BigDecimal inc = incomeRepository.sumAmountByProfileIdAndDateBetween(profileId, start, end);
            BigDecimal exp = expenseRepository.sumAmountByProfileIdAndDateBetween(profileId, start, end);
            totalNet += inc.subtract(exp).doubleValue();
        }

        double avg = totalNet / months;
        return avg > 0 ? Math.round(avg * 100.0) / 100.0 : null;
    }

    private MilestoneDTO toDTO(MilestoneEntity entity, BigDecimal totalSavings, Double avgMonthlySavings) {
        BigDecimal target = entity.getTargetAmount();
        double pct = Math.min(100.0,
                totalSavings.max(BigDecimal.ZERO)
                        .divide(target, 4, RoundingMode.HALF_UP)
                        .doubleValue() * 100.0);
        pct = Math.round(pct * 10.0) / 10.0;

        Double monthsRemaining = null;
        if (avgMonthlySavings != null && avgMonthlySavings > 0) {
            double remaining = target.subtract(totalSavings.max(BigDecimal.ZERO)).doubleValue();
            if (remaining > 0) {
                monthsRemaining = Math.round((remaining / avgMonthlySavings) * 10.0) / 10.0;
            } else {
                monthsRemaining = 0.0; // already hit target
            }
        }

        return MilestoneDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .icon(entity.getIcon())
                .targetAmount(entity.getTargetAmount())
                .targetDate(entity.getTargetDate())
                .currentAmount(totalSavings.max(BigDecimal.ZERO))
                .percentComplete(pct)
                .monthsRemainingAtCurrentPace(monthsRemaining)
                .build();
    }
}
