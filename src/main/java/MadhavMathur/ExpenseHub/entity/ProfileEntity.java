package MadhavMathur.ExpenseHub.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ProfileEntity 
{
    private Long id;
    private String fullName;
    private String email;
    private String password;
    private String profieImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private String activationToken;
    private LocalDateTime activationTokenExpiry;


    public void prePersist() {

       if (this.createdAt = null) {
        this.createdAt = LocalDateTime.now();

        }
        this.updatedAt = LocalDateTime.now();
    }
}
