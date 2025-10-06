public class DeleteFilesBatch implements Database.Batchable<SObject>, Database.Stateful {
 
    public Database.QueryLocator start(Database.BatchableContext bc) {
        // Query all ContentDocument records (i.e., Files)
        return Database.getQueryLocator([
            SELECT Id FROM ContentDocument
        ]);
    }
 
    public void execute(Database.BatchableContext bc, List<ContentDocument> scope) {
        try {
            delete scope;
        } catch (Exception e) {
            System.debug('Error deleting files: ' + e.getMessage());
        }
    }
 
    public void finish(Database.BatchableContext bc) {
        System.debug('File deletion batch completed.');
    }
}