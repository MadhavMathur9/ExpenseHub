package MadhavMathur.ExpenseHub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import MadhavMathur.ExpenseHub.entity.ProfileEntity;



public interface ProfileRepository extends JpaRepository<ProfileEntity, Long>
{
    // Select * from tbl_profiles where email = ?
    Optional<ProfileEntity> findByEmail(String email);


    //select * from tbl_profiles where activation_token = ?
    Optional<ProfileEntity> findByActivationToken(String activationToken);

}
