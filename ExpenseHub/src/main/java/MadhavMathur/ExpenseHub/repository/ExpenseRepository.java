package MadhavMathur.ExpenseHub.repository;

import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {
    List<ExpenseEntity> findByProfileId(Long profileId);
    List<ExpenseEntity> findByProfileIdOrderByDateDesc(Long profileId);
    List<ExpenseEntity> findByProfileIdAndDateBetweenOrderByDateDesc(Long profileId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpenseEntity e WHERE e.profile.id = :profileId")
    BigDecimal sumAmountByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpenseEntity e WHERE e.profile.id = :profileId AND e.date BETWEEN :start AND :end")
    BigDecimal sumAmountByProfileIdAndDateBetween(@Param("profileId") Long profileId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
