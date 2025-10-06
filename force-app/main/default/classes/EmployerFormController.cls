public without sharing class EmployerFormController {

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

        ContentVersion insertedCv = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :cv.Id 
            LIMIT 1
        ];
        return insertedCv.ContentDocumentId;
    }

    @AuraEnabled
    public static void saveEmployerAndExperiences(
        String name, 
        String email, 
        Integer experienceYears, 
        List<Map<String,Object>> experiences
    ) {
        if (String.isBlank(name) || String.isBlank(email) || experiences == null || experiences.isEmpty()) {
            throw new AuraHandledException('Invalid input.');
        }

        // find Lead by email
        Lead leadRecord = [
            SELECT Id, Name 
            FROM Lead 
            WHERE Email = :email 
            LIMIT 1
        ];

        // find Documents_Submitted__c record(s) by email
        Documents_Submitted__c docSub = null;
        List<Documents_Submitted__c> docs = [
            SELECT Id, Name, Email__c 
            FROM Documents_Submitted__c 
            WHERE Email__c = :email
            LIMIT 1
        ];
        if (!docs.isEmpty()) {
            docSub = docs[0];
        }

        List<Employer__c> empList = new List<Employer__c>();
        List<ContentDocumentLink> links = new List<ContentDocumentLink>();

        for (Integer i = 0; i < experiences.size(); i++) {
            Map<String,Object> exp = experiences[i];
            if (exp == null) continue;

            Employer__c emp = new Employer__c();
            emp.Candidate_Name__c = name;
            emp.Email__c = email;

            // Name = CandidateName - CompanyName
            String companyName = (String)(exp.get('companyName') != null ? exp.get('companyName') : '');
            emp.Name = !String.isBlank(companyName) ? name + ' - ' + companyName : name + ' - Unknown Company';

            // Lookup to Lead
            if (leadRecord != null) {
                emp.Candidate_Details__c = leadRecord.Id;
            }

            // Lookup to Documents_Submitted__c
            if (docSub != null) {
                emp.Documents_Submitted_Details__c = docSub.Id;
            }

            // Store overall experience (years)
            emp.Experience__c = experienceYears;

            emp.Job_Role__c = (String)(exp.get('jobRole') != null ? exp.get('jobRole') : '');
            emp.Key_Resposibilities__c = (String)(exp.get('keyResponsibilities') != null ? exp.get('keyResponsibilities') : '');

            String startDateStr = (String)exp.get('startDate');
            if (!String.isBlank(startDateStr)) emp.Start_Date__c = Date.valueOf(startDateStr);

            String endDateStr = (String)exp.get('endDate');
            if (!String.isBlank(endDateStr)) emp.End_Date__c = Date.valueOf(endDateStr);

            emp.Reason_of_Gap__c = (String)(exp.get('reasonOfGap') != null ? exp.get('reasonOfGap') : '');

            // ✅ New optional Reference + Notice Period fields
            emp.Reference_Name__c = (String)(exp.get('referenceName') != null ? exp.get('referenceName') : '');
            emp.Reference_Email__c = (String)(exp.get('referenceEmail') != null ? exp.get('referenceEmail') : '');
            emp.Reference_Phone__c = (String)(exp.get('referencePhone') != null ? exp.get('referencePhone') : '');

            // Parse notice period safely
            Object noticeObj = exp.get('noticePeriodDays');
            if (noticeObj != null && String.valueOf(noticeObj).isNumeric()) {
                emp.Notice_Period_Days__c = Integer.valueOf(String.valueOf(noticeObj));
            }

            empList.add(emp);
        }

        if (!empList.isEmpty()) {
            insert empList;

            // Link uploaded files
            for (Integer i = 0; i < experiences.size(); i++) {
                Map<String,Object> exp = experiences[i];
                if (exp == null) continue;

                Employer__c empRecord = empList[i];

                // Experience Letter
                String fileId = (String)(exp.get('fileId') != null ? exp.get('fileId') : '');
                if (!String.isBlank(fileId)) {
                    links.add(new ContentDocumentLink(
                        ContentDocumentId = fileId,
                        LinkedEntityId = empRecord.Id,
                        ShareType = 'V'
                    ));
                }

                // Reference Letter
                String refFileId = (String)(exp.get('referenceFileId') != null ? exp.get('referenceFileId') : '');
                if (!String.isBlank(refFileId)) {
                    links.add(new ContentDocumentLink(
                        ContentDocumentId = refFileId,
                        LinkedEntityId = empRecord.Id,
                        ShareType = 'V'
                    ));
                }
            }

            if (!links.isEmpty()) insert links;
        }
    }
}