package MadhavMathur.ExpenseHub.repository;

import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {
    List<IncomeEntity> findByProfileId(Long profileId);
    List<IncomeEntity> findByProfileIdOrderByDateDesc(Long profileId);
    List<IncomeEntity> findByProfileIdAndDateBetweenOrderByDateDesc(Long profileId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM IncomeEntity i WHERE i.profile.id = :profileId")
    BigDecimal sumAmountByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM IncomeEntity i WHERE i.profile.id = :profileId AND i.date BETWEEN :start AND :end")
    BigDecimal sumAmountByProfileIdAndDateBetween(@Param("profileId") Long profileId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
