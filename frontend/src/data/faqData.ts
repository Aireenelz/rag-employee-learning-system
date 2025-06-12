export interface FAQItem {
    question: string;
    answer: string;
    tags: string[];
    category: string;
}

export const faqData: FAQItem[] = [
    {
        question: "What is our company’s policy on remote work?",
        answer: "Our company follows a hybrid work model. Employees are required to be in the office at least 2 days per week, with the specific days determined by team managers. Remote work equipment can be requested through the IT portal.",
        tags: ["HR", "Policies"],
        category: "Onboarding"
    },
    {
        question: "What is the expense reimbursement process?",
        answer: "Submit all business expenses through the Finance portal within 30 days of purchase. Receipts are required for all expenses over $25. Travel expenses must be pre-approved by your department head.",
        tags: ["Finance", "Expenses"],
        category: "Training & Operational"
    },
    {
        question: "How do I reset my password?",
        answer: "To reset your password, go to Settings > Account. Password must be changed every 180 days and include at least one uppercase letter, one digit, and one special character.",
        tags: ["IT", "Security"],
        category: "Onboarding"
    },
    {
        question: "What should I do if I encounter an error during a training module testing?",
        answer: "Take a screenshot of the error, note the module name, and inform your department lead.",
        tags: ["Module"],
        category: "Training & Operational"
    },
    {
        question: "What are the key features of ThinkCodex's falgship product?",
        answer: "Our flagship product offers advanced analytics, real-time reporting, and customisable dashbaords. Refer to the Product Details document in the system for a full feature list.",
        tags: ["Products"],
        category: "Products & Services"
    },
    {
        question: "How does ThinkCodex ensure product compliance with industry standards?",
        answer: "Our products undergo regular audits and adhere to ISO 9001 standards. Compliance reports are available in the Product Compliance section the system.",
        tags: ["Compliance"],
        category: "Products & Services"
    },
];