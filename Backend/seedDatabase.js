import { fileURLToPath } from "url";
import { db } from "./firebaseAdmin.js";

// Seeds Firestore with starter civic processes for MVP development.
export async function seedDatabase() {
  try {
    const sampleProcesses = [
      {
        title: "Renewing a Driver's License",
        category: "Transportation",
        legalCode: "DMV-101",
        processSteps: [
          {
            id: 1,
            text: "Complete the driver's license renewal application form.",
            requiredDocument: "Existing driver's license",
          },
          {
            id: 2,
            text: "Provide proof of identity and current residential address.",
            requiredDocument: "Government-issued ID and utility bill",
          },
          {
            id: 3,
            text: "Pay the renewal fee at the DMV office or online portal.",
            requiredDocument: "Payment method (card/cash)",
          },
        ],
      },
      {
        title: "Filing a Small Claims Suit",
        category: "Legal",
        legalCode: "CIV-SC-204",
        processSteps: [
          {
            id: 1,
            text: "Prepare a statement of claim with dispute details and amount.",
            requiredDocument: "Completed small claims complaint form",
          },
          {
            id: 2,
            text: "Submit the claim to the local court clerk and pay filing fees.",
            requiredDocument: "Supporting evidence and filing fee receipt",
          },
          {
            id: 3,
            text: "Serve the defendant according to court service rules.",
            requiredDocument: "Proof of service",
          },
        ],
      },
      {
        title: "Registering to Vote",
        category: "Elections",
        legalCode: "ELEC-77",
        processSteps: [
          {
            id: 1,
            text: "Complete the voter registration application online or by mail.",
            requiredDocument: "Voter registration form",
          },
          {
            id: 2,
            text: "Provide proof of citizenship and local residency.",
            requiredDocument: "Passport/birth certificate and proof of address",
          },
          {
            id: 3,
            text: "Submit the application before the voter registration deadline.",
            requiredDocument: "Submission confirmation",
          },
        ],
      },
    ];

    const batch = db.batch();
    const lawsCollection = db.collection("laws");

    sampleProcesses.forEach((process) => {
      const docRef = lawsCollection.doc();
      batch.set(docRef, process);
    });

    await batch.commit();
    console.log("Database seeded successfully with sample civic processes.");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Allows this file to be run directly: `npm run seed`.
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
