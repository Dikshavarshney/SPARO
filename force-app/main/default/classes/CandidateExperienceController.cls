public with sharing class CandidateExperienceController {

    @AuraEnabled(cacheable=true)
    public static Integer getExperienceByEmail(String email) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('Email is required.');
        }
        List<Lead> leads = [
            SELECT Id, Experience__c 
            FROM Lead 
            WHERE Email = :email 
            LIMIT 1
        ];
        if (leads.isEmpty() || leads[0].Experience__c == null) {
            throw new AuraHandledException('No matching Lead found or no experience value.');
        }
        return Integer.valueOf(leads[0].Experience__c);
    }

    @AuraEnabled
    public static void saveEmployerRecords(String name, String email, List<ExperienceWrapper> experiences) {
        if (String.isBlank(name) || String.isBlank(email)) {
            throw new AuraHandledException('Name and Email are required.');
        }
        if (experiences == null || experiences.isEmpty()) {
            throw new AuraHandledException('At least one experience record is required.');
        }

        List<Employer__c> empList = new List<Employer__c>();

        for (ExperienceWrapper exp : experiences) {
            Employer__c emp = new Employer__c();
            emp.Name = name;
            emp.Email__c = email;
            if (String.isNotBlank(exp.StartDate)) {
                emp.Start_Date__c = Date.valueOf(exp.StartDate);
            }
            if (String.isNotBlank(exp.EndDate)) {
                emp.End_Date__c = Date.valueOf(exp.EndDate);
            }
            emp.FileName__c = exp.FileName; 
            empList.add(emp);
        }

        insert empList;
    }

    public class ExperienceWrapper {
        @AuraEnabled public String StartDate { get; set; }
        @AuraEnabled public String EndDate { get; set; }
        @AuraEnabled public String FileName { get; set; }
        @AuraEnabled public String FileBody { get; set; }
    }
}