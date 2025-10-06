import { LightningElement } from 'lwc';
import logo from '@salesforce/resourceUrl/logo'; // Import logo from static resources
import Facebook from '@salesforce/resourceUrl/facebook';
import Instagram from '@salesforce/resourceUrl/Instagram';
import Twitter from '@salesforce/resourceUrl/Twitter';
import Linkdin from '@salesforce/resourceUrl/Linkdin';



export default class Footer extends LightningElement {
    logoUrl = logo;
    facebookUrl = Facebook;
    instagramUrl = Instagram;
    twitterUrl = Twitter;
    linkedinUrl = Linkdin;
}