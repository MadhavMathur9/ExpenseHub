package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.entity.ExpenseEntity;
import MadhavMathur.ExpenseHub.entity.IncomeEntity;
import MadhavMathur.ExpenseHub.repository.ExpenseRepository;
import MadhavMathur.ExpenseHub.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public byte[] exportFinancialData(Long profileId) throws IOException {
        List<ExpenseEntity> expenses = expenseRepository.findByProfileId(profileId);
        List<IncomeEntity> incomes = incomeRepository.findByProfileId(profileId);

        // Combine transactions into an internal list
        List<TransactionRow> rows = new ArrayList<>();
        for (ExpenseEntity e : expenses) {
            String catName = e.getCategory() != null ? e.getCategory().getName() : "General";
            rows.add(new TransactionRow(e.getDate().toString(), e.getName(), catName, "EXPENSE", e.getAmount()));
        }
        for (IncomeEntity i : incomes) {
            String catName = i.getCategory() != null ? i.getCategory().getName() : "General";
            rows.add(new TransactionRow(i.getDate().toString(), i.getName(), catName, "INCOME", i.getAmount()));
        }

        // Sort by Date descending
        rows.sort((r1, r2) -> r2.date.compareTo(r1.date));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Financial Transactions");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 12);

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Date Format Cell Style
            CellStyle expenseStyle = workbook.createCellStyle();
            Font redFont = workbook.createFont();
            redFont.setColor(IndexedColors.RED.getIndex());
            expenseStyle.setFont(redFont);

            CellStyle incomeStyle = workbook.createCellStyle();
            Font greenFont = workbook.createFont();
            greenFont.setColor(IndexedColors.GREEN.getIndex());
            incomeStyle.setFont(greenFont);

            // Row 0 - Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Date", "Transaction Name", "Category", "Type", "Amount"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;

            for (TransactionRow row : rows) {
                Row excelRow = sheet.createRow(rowIdx++);
                excelRow.createCell(0).setCellValue(row.date);
                excelRow.createCell(1).setCellValue(row.name);
                excelRow.createCell(2).setCellValue(row.category);
                
                Cell typeCell = excelRow.createCell(3);
                typeCell.setCellValue(row.type);
                
                Cell amountCell = excelRow.createCell(4);
                amountCell.setCellValue(row.amount.doubleValue());

                if ("EXPENSE".equals(row.type)) {
                    typeCell.setCellStyle(expenseStyle);
                    amountCell.setCellStyle(expenseStyle);
                    totalExpense = totalExpense.add(row.amount);
                } else {
                    typeCell.setCellStyle(incomeStyle);
                    amountCell.setCellStyle(incomeStyle);
                    totalIncome = totalIncome.add(row.amount);
                }
            }

            // Empty row
            rowIdx++;

            // Summary Rows
            Row totalIncomeRow = sheet.createRow(rowIdx++);
            totalIncomeRow.createCell(3).setCellValue("Total Income:");
            totalIncomeRow.createCell(4).setCellValue(totalIncome.doubleValue());
            totalIncomeRow.getCell(3).setCellStyle(incomeStyle);
            totalIncomeRow.getCell(4).setCellStyle(incomeStyle);

            Row totalExpenseRow = sheet.createRow(rowIdx++);
            totalExpenseRow.createCell(3).setCellValue("Total Expense:");
            totalExpenseRow.createCell(4).setCellValue(totalExpense.doubleValue());
            totalExpenseRow.getCell(3).setCellStyle(expenseStyle);
            totalExpenseRow.getCell(4).setCellStyle(expenseStyle);

            Row netBalanceRow = sheet.createRow(rowIdx++);
            netBalanceRow.createCell(3).setCellValue("Net Balance:");
            BigDecimal balance = totalIncome.subtract(totalExpense);
            netBalanceRow.createCell(4).setCellValue(balance.doubleValue());
            CellStyle balanceStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            balanceStyle.setFont(boldFont);
            netBalanceRow.getCell(3).setCellStyle(balanceStyle);
            netBalanceRow.getCell(4).setCellStyle(balanceStyle);

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private static class TransactionRow {
        String date;
        String name;
        String category;
        String type;
        BigDecimal amount;

        TransactionRow(String date, String name, String category, String type, BigDecimal amount) {
            this.date = date;
            this.name = name;
            this.category = category;
            this.type = type;
            this.amount = amount;
        }
    }
}
