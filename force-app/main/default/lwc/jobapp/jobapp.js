import { LightningElement, wire, track } from 'lwc';
import getJobApplications from '@salesforce/apex/JobApplicationController.getJobApplications';
import { refreshApex } from '@salesforce/apex';

export default class JobApplications extends LightningElement {
    @track jobList = [];
    @track error;

    @track showModal = false;
    @track showSuccess = false;
    @track selectedJobId;
    @track selectedJobName;

    wiredResult;

    @wire(getJobApplications)
    wiredJobs(result) {
        this.wiredResult = result;
        const { data, error } = result || {};
        if (data) {
            this.jobList = data.map(j => ({
                ...j,
                isJDExpanded: false,
                className: 'jd-text',
                readMoreLabel: 'Read More'
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.jobList = [];
        }
    }

    toggleJD(event) {
        const id = event.currentTarget.dataset.id;
        this.jobList = this.jobList.map(j => {
            if (j.Id === id) {
                const expanded = !j.isJDExpanded;
                return {
                    ...j,
                    isJDExpanded: expanded,
                    className: expanded ? 'jd-text expanded' : 'jd-text',
                    readMoreLabel: expanded ? 'Read Less' : 'Read More'
                };
            }
            return j;
        });
    }

    handleApply(event) {
        this.selectedJobId = event.currentTarget.dataset.id;
        this.selectedJobName = event.currentTarget.dataset.name;
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
        this.selectedJobId = null;
        this.selectedJobName = '';
    }

    async handleFormSubmitted() {
        this.showModal = false;
        this.showSuccess = true;
        await refreshApex(this.wiredResult);
        setTimeout(() => (this.showSuccess = false), 2000);
    }
}