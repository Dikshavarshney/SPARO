import { LightningElement, track } from 'lwc';
import getExperienceByEmail from '@salesforce/apex/CandidateExperienceController.getExperienceByEmail';
import saveEmployerRecords from '@salesforce/apex/CandidateExperienceController.saveEmployerRecords';
import attachContentDocumentToEmployer from '@salesforce/apex/CandidateExperienceController.attachContentDocumentToEmployer';
import getFilesForEmployer from '@salesforce/apex/CandidateExperienceController.getFilesForEmployer';
import deleteContentDocument from '@salesforce/apex/CandidateExperienceController.deleteContentDocument';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CandidateExperienceForm extends LightningElement {
    @track candidateName = '';
    @track candidateEmail = '';
    @track experiences = [];
    @track showCandidateForm = true;
    @track showExperienceForm = false;

    acceptedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];

    // ---------------- Candidate handlers ----------------
    handleNameChange(event) {
        this.candidateName = event.target.value;
    }
    handleEmailChange(event) {
        this.candidateEmail = event.target.value;
    }

    // ---------------- Build experience rows ----------------
    handleCandidateSubmit() {
        if (!this.candidateEmail) {
            this.showToast('Please enter an email', 'error');
            return;
        }
        getExperienceByEmail({ email: this.candidateEmail })
            .then(count => {
                this.experiences = Array.from({ length: count }, (_, i) => ({
                    clientIndex: i,
                    label: 'Experience ' + (i + 1),
                    EmployerName: '',
                    JobRole: '',
                    KeyResponsibilities: '',
                    StartDate: '',
                    EndDate: '',
                    ReasonOfGap: '',
                    showGapReason: false,
                    recordId: null, // filled after save
                    files: []
                }));
                this.showCandidateForm = false;
                this.showExperienceForm = true;
            })
            .catch(err => {
                this.showToast(this.getErrorMessage(err), 'error');
            });
    }

    // ---------------- Input change handler ----------------
    handleExperienceChange(event) {
        const clientIndexStr = event.target.dataset.clientindex;
        if (!clientIndexStr) return;
        const clientIndex = parseInt(clientIndexStr, 10);
        const field = event.target.name; // name set in template
        if (!Number.isFinite(clientIndex) || !field) return;

        // Map incoming names to properties used in JS (they match wrapper names)
        const value = event.target.value;
        if (this.experiences[clientIndex]) {
            this.experiences[clientIndex][field] = value;
        }

        // If dates changed, re-check gaps
        if (field === 'StartDate' || field === 'EndDate') {
            this.checkForGaps();
        }

        // refresh reactive array
        this.experiences = [...this.experiences];
    }

    // ---------------- Gap detection ----------------
    checkForGaps() {
        this.experiences.forEach(exp => exp.showGapReason = false);

        for (let i = 0; i < this.experiences.length - 1; i++) {
            const cur = this.experiences[i];
            const next = this.experiences[i + 1];

            if (cur.EndDate && next.StartDate) {
                const endDate = new Date(cur.EndDate);
                const startDate = new Date(next.StartDate);

                // gap if next.start > cur.end + 1 day
                if (startDate.getTime() > endDate.getTime() + (24 * 60 * 60 * 1000)) {
                    this.experiences[i + 1].showGapReason = true;
                } else {
                    this.experiences[i + 1].showGapReason = false;
                    this.experiences[i + 1].ReasonOfGap = '';
                }
            }
        }
        this.experiences = [...this.experiences];
    }

    // ---------------- Save experiences ----------------
    handleSaveExperiences() {
        // No blocking validation for missing dates — Apex will skip incomplete rows.
        const payload = this.experiences.map(exp => ({
            clientIndex: exp.clientIndex,
            EmployerName: exp.EmployerName,
            JobRole: exp.JobRole,
            KeyResponsibilities: exp.KeyResponsibilities,
            StartDate: exp.StartDate,
            EndDate: exp.EndDate,
            ReasonOfGap: exp.ReasonOfGap
        }));

        saveEmployerRecords({
            name: this.candidateName,
            email: this.candidateEmail,
            experiences: payload
        })
        .then(result => {
            // result is list of SaveResult { clientIndex, recordId, status }
            if (Array.isArray(result) && result.length > 0) {
                // Map recordIds to experiences by clientIndex
                result.forEach(r => {
                    const idx = r.clientIndex;
                    if (typeof idx === 'number' && this.experiences[idx]) {
                        this.experiences[idx].recordId = r.recordId;
                        // load files (if any) for saved employer
                        this.loadFilesForEmployer(idx, r.recordId);
                    }
                });
                this.showToast('Saved', 'Saved ' + result.length + ' experience(s). You can now upload files for saved rows.', 'success');
            } else {
                this.showToast('Warning', 'No valid experiences were saved (rows missing Start or End date were skipped).', 'warning');
            }
            this.experiences = [...this.experiences];
        })
        .catch(err => {
            this.showToast('Error saving records: ' + this.getErrorMessage(err), 'error');
        });
    }

    // ---------------- Load files for a saved employer ----------------
    loadFilesForEmployer(localIndex, employerId) {
        if (!employerId) return;
        getFilesForEmployer({ employerId: employerId })
            .then(files => {
                // files are FileResult { contentDocumentId, title, downloadUrl }
                if (this.experiences[localIndex]) {
                    this.experiences[localIndex].files = files;
                    this.experiences = [...this.experiences];
                }
            })
            .catch(err => {
                // non-fatal
                console.error('loadFilesForEmployer error', err);
            });
    }

    // ---------------- Handle file upload finished ----------------
    handleUploadFinished(event) {
        const clientIndexStr = event.target.dataset.clientindex;
        if (!clientIndexStr) return;
        const clientIndex = parseInt(clientIndexStr, 10);
        const uploadedFiles = event.detail.files; // array of { name, documentId }
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        const exp = this.experiences.find(e => e.clientIndex === clientIndex);
        if (!exp || !exp.recordId) {
            this.showToast('Save the experience first before attaching files.', 'error');
            return;
        }

        // Collect ContentDocumentIds and call Apex attach for each
        const docIds = uploadedFiles.map(f => f.documentId);

        // Using Promise.all to attach multiple docs
        const attachPromises = docIds.map(docId =>
            attachContentDocumentToEmployer({ employerId: exp.recordId, contentDocumentId: docId })
        );

        Promise.all(attachPromises)
            .then(() => {
                // reload file list for this employer
                const idx = this.experiences.indexOf(exp);
                this.loadFilesForEmployer(idx, exp.recordId);
                this.showToast('Success', 'File(s) linked to experience.', 'success');
            })
            .catch(err => {
                this.showToast('Error linking files: ' + this.getErrorMessage(err), 'error');
            });
    }

    // ---------------- Delete uploaded file ----------------
    handleFileDelete(event) {
        const clientIndexStr = event.target.dataset.clientindex;
        const docId = event.target.dataset.docid;
        if (!clientIndexStr || !docId) return;
        const clientIndex = parseInt(clientIndexStr, 10);

        const exp = this.experiences.find(e => e.clientIndex === clientIndex);
        const employerId = exp ? exp.recordId : null;

        deleteContentDocument({ contentDocumentId: docId, employerId: employerId })
            .then(() => {
                // update UI
                if (exp) {
                    exp.files = (exp.files || []).filter(f => f.contentDocumentId !== docId);
                    this.experiences = [...this.experiences];
                }
                this.showToast('Deleted', 'File removed successfully', 'success');
            })
            .catch(err => {
                this.showToast('Error deleting file: ' + this.getErrorMessage(err), 'error');
            });
    }

    // ---------------- Helpers ----------------
    showToast(message, variant = 'info') {
        this.dispatchEvent(new ShowToastEvent({ title: '', message, variant }));
    }

    getErrorMessage(err) {
        if (!err) return 'Unknown error';
        if (err.body && err.body.message) return err.body.message;
        if (err.message) return err.message;
        return JSON.stringify(err);
    }
}