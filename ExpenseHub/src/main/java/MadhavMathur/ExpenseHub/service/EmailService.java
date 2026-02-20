package MadhavMathur.ExpenseHub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${server.port:8082}")
    private String serverPort;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendActivationEmail(String toEmail, String activationToken) {
        String activationLink = "http://localhost:" + serverPort + "/activate?token=" + activationToken;
        String subject = "Activate Your ExpenseHub Account";
        String body = "Thank you for registering at ExpenseHub!\n\n"
                    + "Please click the link below to activate your account:\n"
                    + activationLink + "\n\n"
                    + "If you did not request this, please ignore this email.";

        // Also log to console so users can copy-paste activation links in development mode
        log.info("--------------------------------------------------------------------------------");
        log.info("ACTIVATION LINK FOR {}: {}", toEmail, activationLink);
        log.info("--------------------------------------------------------------------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Activation email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendResetPasswordEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/login?resetToken=" + resetToken;
        String subject = "Reset Your ExpenseHub Password";
        String body = "We received a request to reset your password for ExpenseHub.\n\n"
                    + "Please click the link below to set a new password:\n"
                    + resetLink + "\n\n"
                    + "If you did not request a password reset, please ignore this email.";

        log.info("--------------------------------------------------------------------------------");
        log.info("PASSWORD RESET LINK FOR {}: {}", toEmail, resetLink);
        log.info("--------------------------------------------------------------------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Reset password email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
