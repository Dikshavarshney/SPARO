import { LightningElement, track } from 'lwc';
import uploadFile from '@salesforce/apex/CandidateController.uploadFile';
import checkExistingDocuments from '@salesforce/apex/CandidateController.checkExistingDocuments';
import saveDocuments from '@salesforce/apex/CandidateController.saveDocuments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CandidateDocumentUpload extends LightningElement {
    // Step 1 fields (match your HTML)
    @track name = '';
    @track email = '';
    @track phone = '';

    // UI flags
    @track showFileSection = false;
    @track isSubmitted = false;

    // The items that will render in template: { key, label, fileName }
    @track missingUploadItems = [];

    @track isLoading = false;




    // Hold selected File objects by key (actual File objects)
    files = {
        tenth: null,
        twelfth: null,
        Graduation: null,
        PostGraduation: null,
        //ExperienceLetter: null,
        aadhaar: null,
        pan: null
    };

    // After upload, store returned ContentDocumentIds here
    contentDocIds = {
        tenth: '',
        twelfth: '',
        Graduation: '',
        PostGraduation: '',
        //ExperienceLetter: '',
        aadhaar: '',
        pan: ''
    };

    // Labels for UI
    LABELS = {
        tenth: '10th Marksheet',
        twelfth: '12th Marksheet',
        Graduation: 'Graduation Marksheet',
        PostGraduation: 'Post Graduation Marksheet (If Any)',
        //ExperienceLetter: 'Experience Letter',
        aadhaar: 'Aadhaar Card',
        pan: 'PAN Card'
    };

    // All possible docs (keys must match fields used in Apex saveDocuments)
    ALL_DOCS = [
        { key: 'tenth', label: this.LABELS.tenth },
        { key: 'twelfth', label: this.LABELS.twelfth },
        { key: 'Graduation', label: this.LABELS.Graduation },
        { key: 'PostGraduation', label: this.LABELS.PostGraduation },
        //{ key: 'ExperienceLetter', label: this.LABELS.ExperienceLetter },
        { key: 'aadhaar', label: this.LABELS.aadhaar },
        { key: 'pan', label: this.LABELS.pan }
    ];

    /* ----------------------------
       generic handler for name/email/phone in HTML
    ---------------------------- */
    handleChange(event) {
        // inputs in HTML must have name="name" / name="email" / name="phone"
        const field = event.target.name;
        if (field) {
            this[field] = event.target.value;
        }
    }

    /* ----------------------------
       Step 1: check existing record and build missingUploadItems
    ---------------------------- */
    async handleFirstSubmit() {
        if (!this.name || !this.email || !this.phone) {
            this.showToast('Error', 'Please enter Name, Email and Phone.', 'error');
            return;
        }

        try {
            const rec = await checkExistingDocuments({ email: this.email }); // returns record or null

            let items = [];

            if (rec) {
                // Build list of only-missing document inputs (note field names as in your object)
                if (!rec.Twefth_Marksheet__c) items.push({ key: 'twelfth', label: this.LABELS.twelfth, fileName: '' });
                if (!rec.Tenth_Marksheet__c) items.push({ key: 'tenth', label: this.LABELS.tenth, fileName: '' });
                if (!rec.Graduation_Marksheet__c) items.push({ key: 'Graduation', label: this.LABELS.Graduation, fileName: '' });
                if (!rec.Post_Graduation_Marksheet__c) items.push({ key: 'PostGraduation', label: this.LABELS.PostGraduation, fileName: '' });
                if (!rec.Adhaar_Card__c) items.push({ key: 'aadhaar', label: this.LABELS.aadhaar, fileName: '' });
                if (!rec.PAN__c) items.push({ key: 'pan', label: this.LABELS.pan, fileName: '' });

                if (items.length === 0) {
                    this.showToast('Info', 'All documents already submitted for this email.', 'info');
                    return;
                }
            } else {
                // No existing record — show all
                items = this.ALL_DOCS.map(d => ({ key: d.key, label: d.label, fileName: '' }));
            }

            this.missingUploadItems = items;
            this.showFileSection = true;
        } catch (error) {
            console.error('checkExistingDocuments error', error);
            this.showToast('Error', error?.body?.message || 'Failed to check existing record', 'error');
        }
    }

    /* ----------------------------
       When user picks a file for one of the items
    ---------------------------- */
    handleFileUpload(event) {
        const docKey = event.target.dataset.doc;
        const file = event.target.files && event.target.files[0];

        if (!docKey) return;



        if (file) {
            // Store the File object for later upload
            this.files[docKey] = file;

            // Update display fileName in the missingUploadItems array (so template shows it)
            this.missingUploadItems = this.missingUploadItems.map(item =>
                item.key === docKey ? { ...item, fileName: file.name } : item
            );
        }
    }

    /* Helper: convert File -> base64 */
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    /* ----------------------------
       Final submit: upload chosen files then save record
    ---------------------------- */
async handleSubmit() {
    const anySelected = this.missingUploadItems.some(item => this.files[item.key]);
    if (!anySelected) {
        this.showToast('Error', 'Please upload at least one document before submitting.', 'error');
        return;
    }

    this.isLoading = true; // ⬅️ Show loader

    try {
        Object.keys(this.contentDocIds).forEach(k => { this.contentDocIds[k] = ''; });

        for (const item of this.missingUploadItems) {
            const key = item.key;
            const file = this.files[key];
            if (file) {
                const base64 = await this.readFileAsBase64(file);
                const extension = (file.name && file.name.split('.').pop()) || 'pdf';
                const safeName = `${item.label}.${extension}`;
                const contentDocumentId = await uploadFile({ fileName: safeName, base64Data: base64 });
                this.contentDocIds[key] = contentDocumentId;
            }
        }

        await saveDocuments({
            name: this.name,
            email: this.email,
            phone: this.phone,
            twelfthId: this.contentDocIds.twelfth,
            tenthId: this.contentDocIds.tenth,
            GraduationId: this.contentDocIds.Graduation,
            PostGraduationId: this.contentDocIds.PostGraduation,
            adhaarId: this.contentDocIds.aadhaar,
            panId: this.contentDocIds.pan
        });

        this.showToast('Success', 'Documents submitted successfully.', 'success');
        this.isSubmitted = true;
        this.resetForm();
    } catch (error) {
        console.error('submit error', error);
        this.showToast('Error', error?.body?.message || 'Failed to submit documents', 'error');
    } finally {
        this.isLoading = false; // ⬅️ Hide loader
    }
}

    resetForm() {
        this.name = '';
        this.email = '';
        this.phone = '';
        this.showFileSection = false;
        this.missingUploadItems = [];
        this.isSubmitted = false;

        // clear in-memory maps
        Object.keys(this.files).forEach(k => this.files[k] = null);
        Object.keys(this.fileNames || {}).forEach(k => this.fileNames[k] = '');
        Object.keys(this.contentDocIds).forEach(k => this.contentDocIds[k] = '');

        // clear file input elements visually
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => {
            if (input.type === 'file') input.value = null;
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}