public class InterviewTriggerHandler {
    public static void populateFieldsFromLead(List<Interview__c> interviewList) {
        Set<Id> leadIds = new Set<Id>();

        // Collect related Lead IDs from Candidate__c
        for (Interview__c interview : interviewList) {
            if (interview.Candidate__c != null) {
                leadIds.add(interview.Candidate__c);
            }
        }

        if (leadIds.isEmpty()) return;

        // Query Lead fields including lookup Name
        Map<Id, Lead> leadMap = new Map<Id, Lead>(
            [SELECT Id, Name, Applied_for__c, Applied_for__r.Name, Email
             FROM Lead
             WHERE Id IN :leadIds]
        );

        // Populate Interview fields
        for (Interview__c interview : interviewList) {
            if (interview.Candidate__c != null && leadMap.containsKey(interview.Candidate__c)) {
                Lead relatedLead = leadMap.get(interview.Candidate__c);

                interview.Position__c = relatedLead.Applied_for__c;
                interview.Email__c = relatedLead.Email;

                if (relatedLead.Applied_for__r != null) {
                    interview.Name = relatedLead.Name + ' - ' + relatedLead.Applied_for__r.Name;
                }
            }
        }
    }
}