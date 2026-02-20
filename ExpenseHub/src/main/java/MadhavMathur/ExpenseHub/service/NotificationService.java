package MadhavMathur.ExpenseHub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    public void sendNotification(String title, String message, String email) {
        // Log notification to console
        log.info("🔔 SYSTEM NOTIFICATION sent to [{}]: {} - {}", email, title, message);
    }
}
