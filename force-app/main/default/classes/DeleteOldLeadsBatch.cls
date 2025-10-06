global class DeleteOldLeadsBatch implements Database.Batchable<SObject>, Database.Stateful {

    // Query all leads older than today (based on CreatedDate)
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id FROM Lead WHERE CreatedDate < TODAY'
        );
    }

    // Delete in chunks
    global void execute(Database.BatchableContext bc, List<Lead> scope) {
        try {
            delete scope;
        } catch (DmlException e) {
            System.debug('Error deleting leads: ' + e.getMessage());
        }
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('Batch finished. Old Leads deleted.');
    }
}


//DeleteOldLeadsBatch job = new DeleteOldLeadsBatch();
//Database.executeBatch(job, 200);