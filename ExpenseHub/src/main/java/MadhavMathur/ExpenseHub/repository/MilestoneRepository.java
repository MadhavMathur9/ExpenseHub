package MadhavMathur.ExpenseHub.repository;

import MadhavMathur.ExpenseHub.entity.MilestoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<MilestoneEntity, Long> {

    List<MilestoneEntity> findByProfileIdOrderByCreatedAtAsc(Long profileId);

    Optional<MilestoneEntity> findByIdAndProfileId(Long id, Long profileId);
}
