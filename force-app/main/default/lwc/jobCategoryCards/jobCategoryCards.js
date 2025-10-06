import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import webicon from '@salesforce/resourceUrl/webicon';
import hospitalityicon from '@salesforce/resourceUrl/hospitalityicon';
import marketingIcon from '@salesforce/resourceUrl/marketingIcon';
import salesforceIcon from '@salesforce/resourceUrl/salesforceIcon';
import HumanResourcesIcon from '@salesforce/resourceUrl/HumanResourcesIcon';



export default class JobCategoryCards extends NavigationMixin(LightningElement) {
    jobCategories = [
        { id: 1, label: 'Web Development', icon: webicon, category: 'web-development', url: '/web-development' },
        { id: 2, label: 'Hospitality', icon: hospitalityicon, category: 'hospitality', url: '/hospitality' },
        { id: 3, label: 'Marketing', icon: marketingIcon, category: 'marketing', url: '/marketing' },
        { id: 4, label: 'Salesforce', icon: salesforceIcon, category: 'salesforce', url: '/salesforce' },
        { id: 6, label: 'Human Resource', icon: HumanResourcesIcon, category: 'Human-resource',url: '/human-resources' }
    ];

    handleCardClick(event) {
        const url = event.currentTarget.dataset.url;

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}