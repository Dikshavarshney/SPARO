import { LightningElement, api, track } from 'lwc';
import createLeadWithAttachment from '@salesforce/apex/LeadFormController.createLeadWithAttachment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class LeadForm extends LightningElement {
    @api jobName;
    @api jobId;
    @track selectedJobId;
    @track selectedJobName;
    @track fileName = '';
    @track file;
    @track hasSubmitted = false;
    @track emailError = '';

    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track skills = '';
    @track experience = '';
    @track qualification = '';
    @track location = '';

    fileName = '';
    base64File = '';

    qualificationOptions = [
        { label: 'BBA', value: 'BBA' },
        { label: 'MBA', value: 'MBA' },
        { label: 'BCA', value: 'BCA' },
        { label: 'MCA', value: 'MCA' },
        { label: 'B.Tech', value: 'B.Tech' },
        { label: 'M.Tech', value: 'M.Tech' },
        { label: 'Others', value: 'Others' }
    ];

    handleChange(event) {
        this[event.target.name] = event.target.value;
    }

    get emailInputClass() {
    return this.hasSubmitted && this.emailError ? 'slds-has-error' : '';
}

    // handleApply(event) {
    //     this.selectedJobId = event.currentTarget.dataset.id;
    //     this.selectedJobName = event.currentTarget.dataset.name;
    //     this.showModal = true;
    // }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            this.file = file; //new
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                this.base64File = base64;
            };
            reader.readAsDataURL(file);
        }
    }
 

    //   handleFileUpload(event) {
    //     const uploadedFile = event.target.files[0];
    //     if (uploadedFile) {
    //         this.fileName = uploadedFile.name;
    //         this.file = uploadedFile;

    //     }}

    handleEmailChange(event) {
    this.email = event.target.value?.trim().toLowerCase();
    this.emailError = '';
}


    handleApply(event) {
    const jobId = event.target.dataset.id;
    const jobName = event.target.dataset.name;
    this.selectedJobId = jobId;
    this.selectedJobName = jobName;
    this.showModal = true;
}


async handleSubmit() {
            this.hasSubmitted = true;
            const jobIdToUse = this.selectedJobId || this.jobId;
            const jobNameToUse = this.selectedJobName || this.jobName;

    try {
        this.emailError = ''; // Reset before submit

        const result = await createLeadWithAttachment({
            jobName: jobNameToUse,
            jobId: jobIdToUse,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            skills: this.skills,
            experience: this.experience,
            qualification: this.qualification,
            location: this.location,
            fileName: this.fileName,
            base64Data: this.base64File
        });


        console.log("job id is " + this.selectedJobId + " job name is " + this.selectedJobName);

        this.isSubmitted = true;


        this.dispatchEvent(new CustomEvent('leadcreated', { detail: result }));

        // this.dispatchEvent(new ShowToastEvent({
        //     title: 'Success',
        //     message: `Lead Created Successfully! ID: ${result}`,
        //     variant: 'success'
        // }));
        
        // Wait 3 seconds, then reload the page
        setTimeout(() => {
             window.location.reload();
                                        }, 3000);
        

        this.resetForm();

    } catch (error) {
        console.log("the error is >>>>"+createLeadWithAttachment);
        const errorMessage = error.body?.message || 'Something went wrong';

        if (errorMessage.includes('already applied')) {
            this.emailError = errorMessage; // ✅ Show below email field
        } else {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: errorMessage,
                variant: 'error'
            }));
        }
    }
}



    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.skills = '';
        this.experience = '';
        this.qualification = '';
        this.location = '';
        this.fileName = '';
        this.base64File = '';
         this.hasSubmitted = false; // reset submit state
         this.emailError = '';
    }
}