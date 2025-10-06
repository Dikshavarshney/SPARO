public without sharing class DocumentSubmittedTriggerHandler {
    public static void afterInsert(List<Documents_Submitted__c> newDocs) {
        Set<String> emails = new Set<String>();

        // Collect candidate emails
        for (Documents_Submitted__c doc : newDocs) {
            if (String.isNotBlank(doc.Email__c)) {
                emails.add(doc.Email__c.trim().toLowerCase());
            }
        }
        if (emails.isEmpty()) return;

        // Query matching Interviews (safe list query)
        Map<String, Id> emailToInterviewId = new Map<String, Id>();
        List<Interview__c> interviews = [
            SELECT Id, Email__c
            FROM Interview__c
            WHERE Email__c IN :emails
        ];

        for (Interview__c interview : interviews) {
            if (String.isNotBlank(interview.Email__c)) {
                emailToInterviewId.put(interview.Email__c.trim().toLowerCase(), interview.Id);
            }
        }

        // Link new Docs to Interviews
        List<Documents_Submitted__c> toUpdate = new List<Documents_Submitted__c>();
        for (Documents_Submitted__c doc : newDocs) {
            if (String.isNotBlank(doc.Email__c)) {
                Id matchId = emailToInterviewId.get(doc.Email__c.trim().toLowerCase());
                if (matchId != null) {
                    toUpdate.add(new Documents_Submitted__c(
                        Id = doc.Id,
                        Name__c = matchId   // lookup to Interview
                    ));
                }
            }
        }

        if (!toUpdate.isEmpty()) {
            update toUpdate;
        }
    }
}