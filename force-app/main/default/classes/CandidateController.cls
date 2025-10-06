public without sharing class CandidateController {

    // Upload file and return ContentDocumentId
    @AuraEnabled
    public static Id uploadFile(String fileName, String base64Data) {
        if (String.isBlank(fileName) || String.isBlank(base64Data)) {
            throw new AuraHandledException('Invalid file data.');
        }

        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        insert cv;

        return [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :cv.Id 
            LIMIT 1
        ].ContentDocumentId;
    }
    
    // Return the Documents Submitted record (or null)
    @AuraEnabled(cacheable=true)
    public static Documents_Submitted__c checkExistingDocuments(String email) {
        if (String.isBlank(email)) {
            return null;
        }

        List<Documents_Submitted__c> docs = [
            SELECT Id, Email__c, Phone_Number__c,
                   Twefth_Marksheet__c, Tenth_Marksheet__c, Graduation_Marksheet__c, 
                   Post_Graduation_Marksheet__c, Adhaar_Card__c, PAN__c, Candidate_Details__c
            FROM Documents_Submitted__c
            WHERE Email__c = :email
            LIMIT 1
        ];
        return docs.isEmpty() ? null : docs[0];
    }

    // Save Documents_Submitted__c record and link uploaded files
    @AuraEnabled
    public static Id saveDocuments(
        String name,
        String email,
        String phone,
        String twelfthId,
        String tenthId,
        String GraduationId,
        String PostGraduationId,
        String adhaarId,
        String panId
    ) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('Email is required.');
        }

        // ✅ Step 1: Find matching Lead by Email
        Lead matchedLead = [
            SELECT Id, Name 
            FROM Lead 
            WHERE Email = :email 
            LIMIT 1
        ];

        // ✅ Step 2: Check if record exists for this Email
        Documents_Submitted__c doc;
        List<Documents_Submitted__c> existingDoc = [
            SELECT Id, Email__c, Phone_Number__c,
                   Twefth_Marksheet__c, Tenth_Marksheet__c, Graduation_Marksheet__c, 
                   Post_Graduation_Marksheet__c, Adhaar_Card__c, PAN__c, Candidate_Details__c
            FROM Documents_Submitted__c
            WHERE Email__c = :email
            LIMIT 1
        ];
        
        if (!existingDoc.isEmpty()) {
            doc = existingDoc[0];
            doc.Phone_Number__c = phone;

            // ✅ Assign Lead lookup
            if (matchedLead != null) {
                doc.Candidate_Details__c = matchedLead.Id;
            }

            if (String.isNotBlank(twelfthId)) doc.Twefth_Marksheet__c = twelfthId;
            if (String.isNotBlank(tenthId)) doc.Tenth_Marksheet__c = tenthId;
            if (String.isNotBlank(GraduationId)) doc.Graduation_Marksheet__c = GraduationId;
            if (String.isNotBlank(PostGraduationId)) doc.Post_Graduation_Marksheet__c = PostGraduationId;
            if (String.isNotBlank(adhaarId)) doc.Adhaar_Card__c = adhaarId;
            if (String.isNotBlank(panId)) doc.PAN__c = panId;

            update doc;
        } else {
            doc = new Documents_Submitted__c(
                Name = name,
                Email__c = email,
                Phone_Number__c = phone,
                Candidate_Details__c = (matchedLead != null ? matchedLead.Id : null), // ✅ Lookup to Lead
                Twefth_Marksheet__c = twelfthId,
                Tenth_Marksheet__c = tenthId,
                Graduation_Marksheet__c = GraduationId,
                Post_Graduation_Marksheet__c = PostGraduationId,
                Adhaar_Card__c = adhaarId,
                PAN__c = panId
            );
            insert doc;
        }

        // ✅ Step 3: Link uploaded files
        List<ContentDocumentLink> links = new List<ContentDocumentLink>();
        for (String fileId : new List<String>{ twelfthId, tenthId, GraduationId, PostGraduationId, adhaarId, panId }) {
            if (String.isNotBlank(fileId)) {
                links.add(new ContentDocumentLink(
                    ContentDocumentId = fileId,
                    LinkedEntityId = doc.Id,
                    ShareType = 'V'
                ));
            }
        }
        if (!links.isEmpty()) {
            insert links;
        }

        return doc.Id;
    }
}