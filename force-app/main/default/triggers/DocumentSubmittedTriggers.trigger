trigger DocumentSubmittedTriggers on Documents_Submitted__c (after insert) {
    if (Trigger.isAfter && Trigger.isInsert) {
        DocumentSubmittedTriggerHandler.afterInsert(Trigger.new);
    }
}