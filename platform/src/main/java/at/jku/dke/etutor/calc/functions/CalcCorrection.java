package at.jku.dke.etutor.calc.functions;

import at.jku.dke.etutor.calc.models.CorrectnessRule;
import at.jku.dke.etutor.calc.models.Feedback;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.hibernate.internal.CoordinatingEntityNameResolver;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Objects;

public class CalcCorrection {

//    /**
//     * Corrects a calc submission and returns feedback
//     *
//     * @param instruction workbook of the instruction
//     * @param solution workbook of the solution
//     * @param submission workbook of the submission
//     * @return a string containing the feedback
//     */
//    public static String correctTaskOldImplementation(XSSFWorkbook instruction, XSSFWorkbook solution, XSSFWorkbook submission) throws Exception {
//
//        try {
//            List<XSSFWorkbook> xssfWorkbookList = RandomInstructionCreation.overrideWorkbooks(instruction,solution,submission);
//            Sheet sheet_solution = xssfWorkbookList.get(0).getSheetAt(1);
//            Sheet sheet_submission = xssfWorkbookList.get(1).getSheetAt(1);
//
//            if (!FillColorHex.isSheetUnchanged(sheet_solution, sheet_submission)) {
//                return  "Your submission has syntax errors. Please do not change the colors of the cells!";
//            }
//            if (!Objects.equals(DropDownCorrection.correctDropDown(xssfWorkbookList.get(0), xssfWorkbookList.get(1), sheet_solution, sheet_submission),"Your Dropdown and the Values are correct !")) {
//                return DropDownCorrection.correctDropDown(xssfWorkbookList.get(0), xssfWorkbookList.get(1), sheet_solution, sheet_submission);
//            }
//            if (!CalculationCorrection.isCorrectCalculated(xssfWorkbookList.get(0), xssfWorkbookList.get(1),sheet_solution, sheet_submission )) {
//                return "Your calculated Values are not correct !";
//            }
////            if (!DataValidation.checkDataValidation(sheet_solution, sheet_submission)) {
////                return "Please check your Data Validation";
////            }
////            if (!ProtectionCheck.correctProtected(sheet_solution, sheet_submission)) {
////                return "Your Sheet is not correct protected";
////            }
////            if (!SheetFormatCorrection.isCorrectHidden(sheet_solution, sheet_submission)) {
////                return "Your Row / Columns are not correct hidden";
////            }
////            if (!SheetFormatCorrection.isCorrectFormatted(sheet_solution, sheet_submission)) {
////                return "Your Cells are not correct formatted";
////            }
////            return "Congratulation! Your Submission is correct";
////
////
////        }catch (Exception e) {
////            return "Your submission has Syntax Errors, please Contact the Admin of your Program!";
////        }
//        try {
//            List<XSSFWorkbook> xssfWorkbookList = RandomInstructionCreation.overrideWorkbooks(instruction,solution,submission);
//            XSSFWorkbook workbookSolution = xssfWorkbookList.get(0);
//            XSSFWorkbook workbookSubmission = xssfWorkbookList.get(1);
//
//            //generisch
//
//            FillColorHex fillColorHex = new FillColorHex(workbookSolution, workbookSubmission);
//            DropDownCorrection correctDropDown = new DropDownCorrection(workbookSolution, workbookSubmission);
//            CalculationCorrection correctCalculations = new CalculationCorrection(workbookSolution, workbookSubmission);
//            DataValidation dataValidation = new DataValidation(workbookSolution, workbookSubmission);
//            ProtectionCheck protectionCheck = new ProtectionCheck(workbookSolution, workbookSubmission);
//            SheetFormatCorrection correctSheetFormat = new SheetFormatCorrection(workbookSolution, workbookSubmission);
//
//            if (!fillColorHex.checkCorrectness().isCorrect()) {
//                return fillColorHex.checkCorrectness().getTextualFeedback();
//            }
//            if (!correctDropDown.checkCorrectness().isCorrect()) {
//                return correctDropDown.checkCorrectness().getTextualFeedback();
//            }
//            if (!correctCalculations.checkCorrectness().isCorrect()) {
//                return correctCalculations.checkCorrectness().getTextualFeedback();
//            }
//            if(!dataValidation.checkCorrectness().isCorrect()) {
//                return dataValidation.checkCorrectness().getTextualFeedback();
//            }
//            if (!protectionCheck.checkCorrectness().isCorrect()) {
//                return protectionCheck.checkCorrectness().getTextualFeedback();
//            }
//            if (!correctSheetFormat.checkCorrectness().isCorrect()) {
//                return correctCalculations.checkCorrectness().getTextualFeedback();
//            }
//            return "Congratulation! Your Submission is correct";
//
//
//        }catch (Exception e) {
//            return "Your submission has Syntax Errors, please Contact the Admin of your Program!";
//        }
//    }

    public static String correctTask (XWPFDocument instructionWriter, XSSFWorkbook solutionCalc, XSSFWorkbook submissionCalc) throws Exception {

        try {

            if (!AdditionalFunctions.checkCryptoCode(instructionWriter, submissionCalc)) {
                return "Please use the instruction which was generated for you to solve the task!";
            }
            if (!FillColorHex.areSheetsUnchanged(solutionCalc, submissionCalc)) {
                return  "Your submission has syntax errors. Please do not change the colors of the cells!";
            }
            if (!Objects.equals(DropDownCorrection.correctDropDown(solutionCalc, submissionCalc ),"Your Dropdown and the Values are correct !")) {
                return DropDownCorrection.correctDropDown(solutionCalc, submissionCalc);
            }

            if (!CalculationCorrection.isCorrectCalculated(solutionCalc, submissionCalc)) {
                return "Your calculated Values are not correct!";
            }

            if (!CalculationCorrection.correctFormulasUse(solutionCalc, submissionCalc)) {
                return "Your use of one of the following functions is not correct: VLOOKUP, HLOOKUP, LOOKUP!";
            }

            if (!DataValidationOptions.correctDataValidationOptions(solutionCalc, submissionCalc)) {
                return "Your Data Validations are not correct!";
            }

            if (!CellFormatCorrection.checkCorrectCellFormat(solutionCalc, submissionCalc)) {
                return "Your cells are not in the correct Format, are not correct hidden or not correct locked!";
            }

            if (!ConditionalFormattingOptions.correctConditionalFormattingOptions(solutionCalc, submissionCalc)) {
                return "Your Conditional Formatting of your submission is not correct!";
            }

            if (!ChartOptions.correctChartOptions(solutionCalc, submissionCalc)) {
                return "The settings of your Charts are not correct!";
            }

            if (!HeaderFooterOptions.correctHeaderFooterOptions(solutionCalc, submissionCalc)) {
                return "The settings of your header or footer are not correct!";
            }

            if (!PivotTableOptions.correctPivotTableOptions(solutionCalc, submissionCalc)) {
                return "The settings of your Pivot Tables are not correct!";
            }

            if (!PrintOptions.correctPrintOptions(solutionCalc, submissionCalc)) {
                return "The Print Options of your submission is are not correct!";
            }

            return "Congratulation! Your Submission is correct";

        } catch (Exception e) {
            return "Your submission has Syntax Errors, please Contact the Admin of your Program!";
        }

//        Class<?> clazz = Class.forName("at.jku.dke.etutor.calc.functions.ChartOptions");
//        Constructor<?> ctor = Class.forName("at.jku.dke.etutor.calc.functions.ChartOptions").getConstructor(XSSFWorkbook.class);
//Object object = ctor.newInstance(solutionCalc, submissionCalc);


    }



}
