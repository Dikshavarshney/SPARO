public without sharing class JobApplicationController {
    @AuraEnabled(cacheable=true)
    public static List<Job_Application__c> getJobApplications() {
        return [
            SELECT Id, Name, Job_Type__c, JD__c, Location__c,
                   Openings__c, Application_Deadline__c, Required_Skills__c
            FROM Job_Application__c
            WHERE Application_Deadline__c >= TODAY
        ];
    }
}