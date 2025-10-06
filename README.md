🌟 SPARO - End-to-End Recruitment Management and Onboarding System (Salesforce Project)

SPARO is a complete Recruitment Lifecycle Management solution built on Salesforce.
It automates the entire process — from Job Posting → Candidate Management → Interviews → Onboarding → Employee Creation — using Flows, Approval Processes, Custom Objects, Apex, LWC, and Automation tools.

🚀 Project Overview

This project manages the entire hiring process in a single Salesforce application.
It’s built using both declarative (flows, validation rules, approvals) and programmatic (Apex, LWC) components to streamline HR and recruitment operations.

🧩 Objects and Functionality
#	Object	Purpose	Key Features
1️⃣	Job Application	Manage job postings	Title, Location, Department, Deadline, Portal Publishing
2️⃣	Candidate(lead)	Capture candidate info	Personal details, Resume upload, Job association
3️⃣	Interview	Manage interview process	Schedule, Feedback, Status tracking
4️⃣	Document Submission	Collect required docs	Upload ID proofs, Degrees, Mark submission as complete
5️⃣	Background Verification	Verify authenticity	Create BGV after document approval, Update verification status
6️⃣	Onboarding Journey	Start onboarding	Assign tasks (HR, IT, Manager), Track onboarding status
7️⃣	Employee(person account)	Convert candidate to employee	Store Employee ID, Joining Date, Department info
🔄 Process Flow

Job Posting → Candidate → Interview → Document Submission → Background Verification → Onboarding → Employee Creation

Brief:
👉🏻HR creates a Job Application record.
👉🏻Only jobs with a deadline date ≥ today() appear on the portal.
👉🏻Candidates apply via the portal (form integrated with Candidate object).
👉🏻Notification emails are sent to both HR and the Candidate.
👉🏻If profile matching passes → schedule interview → send email.
👉🏻If passed → ask candidate to submit documents.
👉🏻Once approved → create Background Verification record.
👉🏻If verified → start Onboarding Journey.
👉🏻On completion → Candidate is converted to Employee.

⚙️ Components Used
Type	Examples
Automation	Flows, Approval Processes, Validation Rules
UI	Lightning Pages, Flexipages, LWC Components
Code	Apex Classes, Triggers, LWC Bundles
Security	Profiles, Permission Sets, Object-Level Access
Integration	Portal Integration, Email Alerts
Reports & Dashboards	Candidate Status, BGV Reports, Onboarded Employees (Planned)

👩🏻‍💻 How to Use This Repository
🔹 Step 1: Clone the Project
git clone https://github.com/Dikshavarshney/SPARO.git
cd SPARO

🔹 Step 2: Authorize Your Salesforce Org
Connect your Salesforce org using:
sfdx auth:web:login -a MyOrgAlias

🔹 Step 3: Deploy the Project
Deploy all metadata to your org:
sfdx force:source:deploy -p force-app/main/default

🔹 Step 4: Assign Permissions
Assign SPARO Permission Set (if exists) to your test user.
Make sure the required custom objects are visible to the profiles.

🔹 Step 5: Test the Flow
Create a Job Application record.
Apply as a Candidate (via portal).

Go through the entire process — Interview → Documents → BGV → Onboarding → Employee Creation.

🧰 Folder Structure
SPARO/
│
├── force-app/main/default/       # All Salesforce metadata (objects, LWC, Apex, etc.)
├── manifest/                     # package.xml file for retrieval/deployment
├── config/                       # Project config files
├── scripts/                      # Optional automation scripts
├── .gitignore                    # Files to ignore for Git
├── sfdx-project.json             # Salesforce DX configuration
└── README.md                     # Project Documentation

👥 Collaboration Guidelines

Fork this repository to your own GitHub account.

Create a new branch for your changes.

Make your updates and submit a pull request.

All team members can review and merge changes without org sharing.

📧 Contact

Created & Maintained by Diksha Varshney
📩 Email: abc@xyz.com

---------------------------------------------------------------------------------------------------------------------------
# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
