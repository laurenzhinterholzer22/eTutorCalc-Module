package at.jku.dke.etutor.calc.applications;

import liquibase.pro.packaged.T;

import java.sql.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Example {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        try{
            Class.forName("com.mysql.jdbc.Driver");
            Connection con= DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/etutor","root","Georg221099");

            String sql = " insert into calc_task_points (matriculationNo, courseInstance, exerciseSheet, taskNumber, maxPoints, achievedPoints, currentTime, submitType)"
                + " values (?, ?, ?, ?, ?, ?, ?, ?)";


        PreparedStatement preparedStmt = con.prepareStatement(sql);
        preparedStmt.setString(1, "K11827238");
        preparedStmt.setString(2, "asdf");
        preparedStmt.setString(3, "asdf");
        preparedStmt.setInt(4, 1);
        preparedStmt.setDouble(5, 5.0);
        preparedStmt.setDouble(6, 5.0);
        preparedStmt.setTimestamp(7, new Timestamp(System.currentTimeMillis()));
        preparedStmt.setString(8, "diagnose");



            preparedStmt.execute();

            con.close();
        }catch(Exception e){ System.out.println(e);}
    }
}

