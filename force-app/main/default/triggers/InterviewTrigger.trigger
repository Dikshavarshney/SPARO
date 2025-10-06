trigger InterviewTrigger on Interview__c (before insert, before update) {
    if (Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)) {
        InterviewTriggerHandler.populateFieldsFromLead(Trigger.new);
    }
}