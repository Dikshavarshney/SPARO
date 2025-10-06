trigger LeadTrigger on Lead (after update) {
    if (Trigger.isUpdate) {
        LeadTriggerHandler.updateRelatedInterviews(Trigger.new, Trigger.oldMap);
    }
}