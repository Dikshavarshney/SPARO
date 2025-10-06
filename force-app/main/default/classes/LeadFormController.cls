public without sharing class LeadFormController {
    @AuraEnabled
    public static Id createLeadWithAttachment(
        String firstName,
        String lastName,
        String email,
        String phone,
        String skills,
        String experience,
        String qualification,
        String location,
        String fileName,
        String jobName,  // For display, not used in backend
        String jobId,    // lookup to Job__c
        String base64Data
    ) {
        
        if (String.isBlank(email)) {
        throw new AuraHandledException('Email is required.');
    }

        // ✅ Prevent duplicate leads with same Email + Job
        List<Lead> duplicateLeads = [
            SELECT Id FROM Lead
            WHERE Email = :email 
            AND Applied_for__c = :jobId
            LIMIT 1
        ];

        if (!duplicateLeads.isEmpty()) {
            throw new AuraHandledException('You have already applied for ' +jobName+ ' before please apply after 6 months!!');
        }

        // ✅ Parse Experience safely
        Decimal experienceVal = 0;
        try {
            experienceVal = Decimal.valueOf(experience);
        } catch (Exception e) {
            throw new AuraHandledException('Invalid experience value, Please enter a valid number.');
        }

       
        // ✅ Create the Lead record
        Lead newLead = new Lead(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Skills__c = skills,
            Experience__c = experienceVal,
            Highest_Qualification__c = qualification,
            Current_Location__c = location,
            Applied_for__c = jobId,
            Status = 'Open - Not Contacted'
        );

        insert newLead;

        // ✅ Upload Resume as ContentVersion
        try {
            if (String.isNotBlank(base64Data) && String.isNotBlank(fileName)) {
                ContentVersion cv = new ContentVersion();
                cv.Title = fileName;
                cv.PathOnClient = fileName;
                cv.VersionData = EncodingUtil.base64Decode(base64Data);
                cv.FirstPublishLocationId = newLead.Id; // Associate with Lead
                insert cv;
            }
        } catch (Exception e) {
            // Resume upload failed — don't block lead creation
            System.debug('Resume upload failed: ' + e.getMessage());
        }

        return newLead.Id;
    }
}