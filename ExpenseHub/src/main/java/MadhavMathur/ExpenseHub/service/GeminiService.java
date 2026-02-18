package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import MadhavMathur.ExpenseHub.entity.MilestoneEntity;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import MadhavMathur.ExpenseHub.repository.MilestoneRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final MilestoneRepository milestoneRepository;

    // Base URL for the Gemini REST API (v1beta supports all current models)
    private static final String GEMINI_BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    /**
     * Ordered list of candidate models to try on each request.
     *
     * Priority rationale (as of July 2026):
     *  1. gemini-3.5-flash       – Stable GA; Google's recommended replacement for all
     *                              2.x Flash models. Best price-performance for text tasks.
     *  2. gemini-3.1-flash-lite  – Stable GA; fastest / cheapest 3.x model, good fallback.
     *  3. gemini-2.5-flash       – Deprecated (shutdown Oct 16 2026); kept as last resort
     *                              until migration is complete.
     *
     * REMOVED (already shut down / no longer reachable):
     *  ✗ gemini-2.0-flash   – Shut down June 1 2026
     *  ✗ gemini-1.5-flash   – Shut down (removed from Google docs)
     *  ✗ gemini-1.5-pro     – Shut down (removed from Google docs)
     */
    private static final String[] CANDIDATE_MODELS = {
            "gemini-3.5-flash",        // Stable – primary model
            "gemini-3.1-flash-lite",   // Stable – fast / cost-efficient fallback
            "gemini-2.5-flash"         // Deprecated but alive until Oct 2026 – last resort
    };

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String getFinancialInsights(Long profileId) {
        return getFinancialInsights(profileId, null);
    }

    public String getFinancialInsights(Long profileId, String context) {
        BigDecimal totalIncome = incomeRepository.sumAmountByProfileId(profileId);
        BigDecimal totalExpense = expenseRepository.sumAmountByProfileId(profileId);
        List<ExpenseEntity> expenses = expenseRepository.findByProfileId(profileId);
        List<IncomeEntity> incomes = incomeRepository.findByProfileId(profileId);
        List<MilestoneEntity> milestones = milestoneRepository.findByProfileIdOrderByCreatedAtAsc(profileId);

        if ("goals".equalsIgnoreCase(context)) {
            return generateGoalInsights(profileId, totalIncome, totalExpense, milestones);
        }

        // Build the prompt containing transaction logs
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert personal finance AI advisor for ExpenseHub. ")
                .append("Analyze my financial transactions and provide actionable insights.\n\n")
                .append("### Summary:\n")
                .append("- Total Income: $").append(totalIncome).append("\n")
                .append("- Total Expenses: $").append(totalExpense).append("\n")
                .append("- Current Net Balance: $").append(totalIncome.subtract(totalExpense)).append("\n\n")
                .append("### Incomes List:\n");

        if (incomes.isEmpty()) {
            prompt.append("No incomes recorded yet.\n");
        } else {
            for (IncomeEntity i : incomes) {
                prompt.append("- Date: ").append(i.getDate())
                        .append(", Description: ").append(i.getName())
                        .append(", Category: ").append(i.getCategory().getName())
                        .append(", Amount: $").append(i.getAmount()).append("\n");
            }
        }

        prompt.append("\n### Expenses List:\n");
        if (expenses.isEmpty()) {
            prompt.append("No expenses recorded yet.\n");
        } else {
            for (ExpenseEntity e : expenses) {
                prompt.append("- Date: ").append(e.getDate())
                        .append(", Description: ").append(e.getName())
                        .append(", Category: ").append(e.getCategory().getName())
                        .append(", Amount: $").append(e.getAmount()).append("\n");
            }
        }

        prompt.append("\n### Instructions:\n")
                .append("1. Provide a quick summary of my current financial health.\n")
                .append("2. Identify positive and negative spending habits (e.g. overspending in specific categories relative to income).\n")
                .append("3. Give 3 actionable, highly specific tips to improve savings and reduce waste.\n")
                .append("4. Keep the response encouraging, professional, and formatted in clean Markdown. Avoid using introductory or concluding meta-commentary (like 'Sure! Here is the analysis:'). Start directly with headers.");

        String aiResponse = queryGeminiModel(prompt.toString());
        if (aiResponse != null) {
            return aiResponse;
        }

        return generateMockInsights(totalIncome, totalExpense, expenses);
    }

    private String generateGoalInsights(Long profileId, BigDecimal totalIncome, BigDecimal totalExpense, List<MilestoneEntity> milestones) {
        BigDecimal totalSavings = totalIncome.subtract(totalExpense);
        LocalDate today = LocalDate.now();

        // Calculate 3-month avg monthly savings
        double totalNet = 0.0;
        for (int i = 1; i <= 3; i++) {
            LocalDate base = today.minusMonths(i);
            LocalDate start = base.withDayOfMonth(1);
            LocalDate end = base.withDayOfMonth(base.lengthOfMonth());
            BigDecimal inc = incomeRepository.sumAmountByProfileIdAndDateBetween(profileId, start, end);
            BigDecimal exp = expenseRepository.sumAmountByProfileIdAndDateBetween(profileId, start, end);
            totalNet += inc.subtract(exp).doubleValue();
        }
        double avgMonthlySavings = totalNet / 3.0;

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert personal finance AI advisor for ExpenseHub. ")
                .append("Analyze my savings goals and milestone progress.\n\n")
                .append("### Financial Overview:\n")
                .append("- Total Net Savings Pool: $").append(totalSavings).append("\n")
                .append("- 3-Month Average Monthly Savings Rate: $").append(String.format("%.2f", Math.max(0, avgMonthlySavings))).append("\n\n")
                .append("### Active Milestones:\n");

        if (milestones.isEmpty()) {
            prompt.append("No active milestones set yet.\n");
        } else {
            for (MilestoneEntity m : milestones) {
                prompt.append("- Goal: ").append(m.getTitle())
                        .append(", Target: $").append(m.getTargetAmount())
                        .append(m.getTargetDate() != null ? ", Target Date: " + m.getTargetDate() : "")
                        .append("\n");
            }
        }

        prompt.append("\n### Instructions:\n")
                .append("1. Provide a quick pacing summary for the primary milestone (e.g. 'At your current pace, you'll hit your house down payment goal in about 7 months.').\n")
                .append("2. Analyze milestone progress and pacing at the current net savings rate.\n")
                .append("3. Give 2-3 actionable, high-leverage recommendations to accelerate achieving these goals.\n")
                .append("4. Keep the response encouraging, professional, concise, and formatted in clean Markdown. Start directly with key headings.");

        String aiResponse = queryGeminiModel(prompt.toString());
        if (aiResponse != null) {
            return aiResponse;
        }

        return generateMockGoalInsights(totalSavings, avgMonthlySavings, milestones);
    }

    private String queryGeminiModel(String promptText) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("GEMINI_API_KEY")) {
            log.warn("Gemini API Key is not set or contains default placeholder.");
            return null;
        }

        // Configure simple timeouts to avoid hanging threads
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 seconds
        factory.setReadTimeout(15000);    // 15 seconds
        RestTemplate restTemplate = new RestTemplate(factory);

        ObjectMapper mapper = new ObjectMapper();

        for (String model : CANDIDATE_MODELS) {
            String endpointUrl = GEMINI_BASE_URL + model + ":generateContent";
            try {
                String url = endpointUrl + "?key=" + geminiApiKey.trim();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                ObjectNode requestBody = mapper.createObjectNode();
                ArrayNode contentsArray = requestBody.putArray("contents");
                ObjectNode contentObj = contentsArray.addObject();
                ArrayNode partsArray = contentObj.putArray("parts");
                ObjectNode textObj = partsArray.addObject();
                textObj.put("text", promptText);

                String jsonPayload = mapper.writeValueAsString(requestBody);
                HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode root = mapper.readTree(response.getBody());
                    String responseText = root.path("candidates")
                            .path(0)
                            .path("content")
                            .path("parts")
                            .path(0)
                            .path("text")
                            .asText();

                    if (responseText != null && !responseText.trim().isEmpty()) {
                        log.info("Successfully received insights from Gemini model: {}", model);
                        return responseText;
                    }
                } else {
                    log.warn("Model {} returned unexpected status: {}", model, response.getStatusCode());
                }
            } catch (HttpStatusCodeException e) {
                // Log the exact API error response (e.g., 400 Bad Request, 403 Forbidden, 429 Quota Exceeded)
                log.warn("Gemini HTTP error on model {}: Status {} - Body: {}",
                        model, e.getStatusCode(), e.getResponseBodyAsString());
            } catch (Exception e) {
                log.warn("Gemini model {} failed: {}", model, e.getMessage());
            }
        }

        log.error("All Gemini candidate models failed to generate content.");
        return null;
    }

    private String generateMockGoalInsights(BigDecimal totalSavings, double avgMonthlySavings, List<MilestoneEntity> milestones) {
        if (milestones.isEmpty()) {
            return "Set your first savings goal below to track milestone progress and unlock personalized AI pacing advice!";
        }

        MilestoneEntity primary = milestones.get(0);
        BigDecimal target = primary.getTargetAmount();
        BigDecimal remaining = target.subtract(totalSavings.max(BigDecimal.ZERO));

        StringBuilder advice = new StringBuilder();

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            advice.append("🎉 **Congratulations!** You've reached your savings target of $")
                    .append(target).append(" for **").append(primary.getTitle()).append("**!\n\n");
        } else if (avgMonthlySavings > 0) {
            double months = Math.round((remaining.doubleValue() / avgMonthlySavings) * 10.0) / 10.0;
            advice.append("At your current pace of $").append(String.format("%.2f", avgMonthlySavings))
                    .append("/month, you'll hit your **").append(primary.getTitle())
                    .append("** goal in about **").append(months).append(" months**.\n\n");
        } else {
            advice.append("Boost your monthly savings rate to stay on track for **").append(primary.getTitle()).append("**.\n\n");
        }

        advice.append("### 🎯 Milestone Breakdown\n");
        for (MilestoneEntity m : milestones) {
            BigDecimal rem = m.getTargetAmount().subtract(totalSavings.max(BigDecimal.ZERO));
            double pct = Math.min(100.0, totalSavings.max(BigDecimal.ZERO).doubleValue() / m.getTargetAmount().doubleValue() * 100.0);
            advice.append("- **").append(m.getTitle()).append("**: Target $").append(m.getTargetAmount())
                    .append(" (").append(String.format("%.1f", pct)).append("% complete");
            if (rem.compareTo(BigDecimal.ZERO) > 0 && avgMonthlySavings > 0) {
                double mPace = Math.round((rem.doubleValue() / avgMonthlySavings) * 10.0) / 10.0;
                advice.append(" · ~").append(mPace).append(" months remaining");
            }
            advice.append(")\n");
        }

        advice.append("\n### 💡 Pacing Recommendations\n")
                .append("1. **Automate Savings Transfers**: Set up automatic recurring transfers to savings right on payday.\n")
                .append("2. **Micro-Savings Boost**: Redirect non-essential category cuts straight toward your top milestone.\n")
                .append("3. **Review Progress Monthly**: Adjust target dates as your net savings rate grows.");

        return advice.toString();
    }

    private String generateMockInsights(BigDecimal totalIncome, BigDecimal totalExpense, List<ExpenseEntity> expenses) {
        StringBuilder advice = new StringBuilder();
        advice.append("## 📊 Financial Health Analysis\n\n");
        advice.append("Based on your recorded transactions and financial history:\n\n");

        if (totalIncome.compareTo(BigDecimal.ZERO) == 0 && totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            advice.append("### 🌟 Getting Started\n")
                    .append("It looks like you haven't logged any transactions yet. To generate insights, start by logging your monthly salaries under Incomes and regular purchases under Expenses!\n");
            return advice.toString();
        }

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savings = totalIncome.subtract(totalExpense);
            savingsRate = savings.multiply(BigDecimal.valueOf(100)).divide(totalIncome, 2, java.math.RoundingMode.HALF_UP);
        }

        advice.append("### 📈 Health Overview\n")
                .append("- **Savings Rate:** ").append(savingsRate).append("%\n");

        if (savingsRate.compareTo(BigDecimal.ZERO) < 0) {
            advice.append("- **Warning:** You are spending more than you earn! Your net balance is negative. Action is required to trim non-essential categories.\n");
        } else if (savingsRate.compareTo(BigDecimal.valueOf(20)) < 0) {
            advice.append("- **Note:** You are saving money, but you're below the recommended 20% savings threshold. Let's find ways to boost your savings.\n");
        } else {
            advice.append("- **Excellent Work:** You have a healthy savings rate above 20%. Keep setting money aside into investments!\n");
        }

        advice.append("\n### 🔍 Habit Highlights\n");
        if (!expenses.isEmpty()) {
            // Find highest expense
            ExpenseEntity highest = expenses.stream()
                    .max(Comparator.comparing(ExpenseEntity::getAmount))
                    .orElse(null);
            if (highest != null) {
                advice.append("- **Largest Expense Item:** \"").append(highest.getName())
                        .append("\" in the **").append(highest.getCategory().getName())
                        .append("** category, costing $").append(highest.getAmount()).append(".\n");
            }

            // Find category with most spending
            Map<String, BigDecimal> categorySums = expenses.stream()
                    .collect(Collectors.groupingBy(
                            e -> e.getCategory().getName(),
                            Collectors.reducing(BigDecimal.ZERO, ExpenseEntity::getAmount, BigDecimal::add)
                    ));
            String topCategory = categorySums.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("None");

            if (!"None".equals(topCategory)) {
                advice.append("- **Top Category Spending:** You spend the most in the **").append(topCategory)
                        .append("** category ($").append(categorySums.get(topCategory)).append("). Look into capping monthly spend here.\n");
            }
        } else {
            advice.append("- No expense habits to highlight yet. Add expense logs to analyze patterns.\n");
        }

        advice.append("\n### 💡 Key Recommendations\n")
                .append("1. **Set Up a 50/30/20 Budget**: Direct 50% of income to Needs, 30% to Wants, and 20% directly into Savings/Investments.\n")
                .append("2. **Create Category Limits**: Set a hard ceiling for your highest category and audit transactions weekly.\n")
                .append("3. **Build an Emergency Fund**: Ensure you have 3 to 6 months of expenses stored in a liquid high-yield savings account.");

        return advice.toString();
    }
}