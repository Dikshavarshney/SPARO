import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveEmployerAndExperiences from '@salesforce/apex/EmployerFormController.saveEmployerAndExperiences';
import uploadFile from '@salesforce/apex/EmployerFormController.uploadFile';

export default class EmployerForm extends LightningElement {
    @track name = '';
    @track email = '';
    @track experience = 0;
    @track showExperienceForm = false;
    @track experiences = [];
    @track isLoading = false;  // spinner

    handleChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleSubmit() {
        const count = parseInt(this.experience, 10);
        if (!count || count <= 0) return;

        this.experiences = Array.from({ length: count }, (_, i) => ({
            index: i,
            title: `Employer ${i + 1}`,
            companyName: '',
            jobRole: '',
            keyResponsibilities: '',
            startDate: '',
            endDate: '',
            showGap: false,
            reasonOfGap: '',
            fileId: '',
            fileName: '',

            // Reference fields (last card only)
            referenceName: '',
            referenceEmail: '',
            referencePhone: '',
            noticePeriodDays: '',
            referenceFileId: '',
            referenceFileName: '',

            isLast: i === count - 1
        }));
        this.showExperienceForm = true;
    }

    handleExpChange(event) {
        const idx = Number(event.target.dataset.index);
        const field = event.target.name;
        const value = event.target.value;
        const clone = [...this.experiences];
        clone[idx] = { ...clone[idx], [field]: value };
        this.experiences = clone;
        if (field === 'startDate' || field === 'endDate') this.calculateGaps();
    }

    handleReferenceFileUpload(event) {
        const idx = Number(event.target.dataset.index);
        const file = event.target.files[0];
        if (!file) return;

        this.isLoading = true;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            uploadFile({ fileName: file.name, base64Data: base64 })
                .then(fileId => {
                    const clone = [...this.experiences];
                    clone[idx] = {
                        ...clone[idx],
                        referenceFileId: fileId,
                        referenceFileName: file.name
                    };
                    this.experiences = clone;
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: `Reference File ${file.name} uploaded`,
                            variant: 'success'
                        })
                    );
                })
                .catch(err => {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: err.body?.message || err.message,
                            variant: 'error'
                        })
                    );
                });
        };
        reader.readAsDataURL(file);
    }

    calculateGaps() {
        const clone = this.experiences.map(e => ({ ...e, showGap: false, reasonOfGap: '' }));
        for (let i = 1; i < clone.length; i++) {
            if (clone[i-1].endDate && clone[i].startDate && new Date(clone[i].startDate) > new Date(clone[i-1].endDate)) {
                clone[i].showGap = true;
            }
        }
        this.experiences = clone;
    }

    handleFileUpload(event) {
        const idx = Number(event.target.dataset.index);
        const file = event.target.files[0];
        if (!file) return;

        this.isLoading = true;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            uploadFile({ fileName: file.name, base64Data: base64 })
                .then(fileId => {
                    const clone = [...this.experiences];
                    clone[idx] = { ...clone[idx], fileId, fileName: file.name };
                    this.experiences = clone;
                    this.isLoading = false;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: `File ${file.name} uploaded`,
                        variant: 'success'
                    }));
                })
                .catch(err => {
                    this.isLoading = false;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: err.body?.message || err.message,
                        variant: 'error'
                    }));
                });
        };
        reader.readAsDataURL(file);
    }

    handleFinalSubmit() {
        if (this.isLoading) return; // prevent save while files are uploading
        this.isLoading = true;

        saveEmployerAndExperiences({
            name: this.name,
            email: this.email,
            experienceYears: this.experience,
            experiences: this.experiences
        })
        .then(() => {
            this.isLoading = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'All experiences and files saved.',
                variant: 'success'
            }));
            // reset form
            this.name = '';
            this.email = '';
            this.experience = 0;
            this.showExperienceForm = false;
            this.experiences = [];
        })
        .catch(err => {
            this.isLoading = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: err.body?.message || err.message,
                variant: 'error'
            }));
        });
    }
}