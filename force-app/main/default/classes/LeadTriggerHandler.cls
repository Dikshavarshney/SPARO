public class LeadTriggerHandler {
    public static void updateRelatedInterviews(List<Lead> newLeads, Map<Id, Lead> oldLeadMap) {
        List<Interview__c> interviewsToUpdate = new List<Interview__c>();

        for (Lead newLead : newLeads) {
            Lead oldLead = oldLeadMap.get(newLead.Id);

            // Only process if key fields changed
            if (newLead.Applied_for__c != oldLead.Applied_for__c ||
                newLead.Email != oldLead.Email ||
                newLead.Name != oldLead.Name) {

                // Get related Interviews
                List<Interview__c> relatedInterviews = [
                    SELECT Id, Position__c, Email__c, Name
                    FROM Interview__c
                    WHERE Candidate__c = :newLead.Id
                ];

                for (Interview__c interview : relatedInterviews) {
                    interview.Position__c = newLead.Applied_for__c;
                    interview.Email__c = newLead.Email;

                    if (newLead.Applied_for__r != null) {
                        interview.Name = newLead.Name + ' - ' + newLead.Applied_for__r.Name;
                    }
                    interviewsToUpdate.add(interview);
                }
            }
        }

        if (!interviewsToUpdate.isEmpty()) {
            update interviewsToUpdate;
        }
    }
}