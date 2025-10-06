import { LightningElement, track } from 'lwc';
import uploadFile from '@salesforce/apex/CandidateController.uploadFile';
import saveDocuments from '@salesforce/apex/CandidateController.saveDocuments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Docs extends LightningElement {
    @track name = '';
    @track email = '';
    @track phone = '';
    @track isModalOpen = true;
    @track isSubmitted = false;

    @track uploadedFileNames = {
        twelfth: '',
        aadhaar: '',
        Graduation: '',
        PostGraduation: '',
        ExperienceLetter: '',
        pan: ''
    };

    files = {
        twelfth: null,
        aadhaar: null,
        Graduation: null,
        PostGraduation: null,
        ExperienceLetter: null,
        pan: null
    };

    contentDocIds = {
        twelfth: '',
        aadhaar: '',
        Graduation: '',
        PostGraduation: '',
        ExperienceLetter: '',
        pan: ''
    };

    fileInputs = [
        { key: 'twelfth', label: '12th Marksheet' },
        { key: 'aadhaar', label: 'Aadhaar Card' },
        { key: 'Graduation', label: 'Graduation Marksheet' },
        { key: 'PostGraduation', label: 'Post Graduation Marksheet' },
        { key: 'ExperienceLetter', label: 'Experience Letter' },
        { key: 'pan', label: 'PAN Card' }
    ];

    get fileInputListWithNames() {
        return this.fileInputs.map(item => ({
            key: item.key,
            label: item.label,
            fileName: this.uploadedFileNames[item.key] || ''
        }));
    }

    handleChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleFileUpload(event) {
        const docType = event.target.dataset.doc;
        const file = event.target.files[0];
        if (file) {
            this.files[docType] = file;
            this.uploadedFileNames[docType] = file.name;
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    async handleSubmit() {
        try {
            for (let key in this.files) {
                const file = this.files[key];
                if (file) {
                    const base64 = await this.readFileAsBase64(file);
                    const docId = await uploadFile({
                        fileName: file.name,
                        base64Data: base64
                    });
                    this.contentDocIds[key] = docId;
                }
            }

            await saveDocuments({
                name: this.name,
                email: this.email,
                phone: this.phone,
                twelfthId: this.contentDocIds.twelfth,
                adhaarId: this.contentDocIds.aadhaar,
                GraduationId: this.contentDocIds.Graduation,
                PostGraduationId: this.contentDocIds.PostGraduation,
                ExperienceLetterId: this.contentDocIds.ExperienceLetter,
                panId: this.contentDocIds.pan
            });

            this.showToast('Success', 'Documents submitted successfully!', 'success');
            this.isSubmitted = true;

            // Redirect to same page after 3 seconds
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error', error.body?.message || 'Something went wrong.', 'error');
        }
    }

    closeModal() {
        this.isModalOpen = false;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}