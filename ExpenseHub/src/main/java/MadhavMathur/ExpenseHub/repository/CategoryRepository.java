package MadhavMathur.ExpenseHub.repository;

import MadhavMathur.ExpenseHub.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    List<CategoryEntity> findByProfileId(Long profileId);
    Optional<CategoryEntity> findByNameAndProfileId(String name, Long profileId);
    void deleteByProfileId(Long profileId);
}
