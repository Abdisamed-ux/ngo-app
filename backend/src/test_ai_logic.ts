import { analyzeAidRequest } from './shared/services/ai.service.js';

async function runTests() {
  const testCases = [
    {
      name: "Critical Case",
      description: "This is a medical emergency, I am starving and homeless."
    },
    {
      name: "High Case",
      description: "I am feeling very sick and have no food at home."
    },
    {
      name: "Medium Case",
      description: "I need help paying my rent and electricity bills."
    },
    {
      name: "Low Case",
      description: "I want to start a new business selling shoes."
    }
  ];

  console.log("🚀 Starting AI Analysis Tests...\n");

  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);
    console.log(`Description: "${test.description}"`);
    
    const start = Date.now();
    const result = await analyzeAidRequest(test.description);
    const duration = Date.now() - start;

    console.log(`Result Urgency: ${result.suggestedUrgency}`);
    console.log(`Urgency Score: ${result.urgencyScore}%`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Analysis took ${duration}ms\n`);
    console.log("-".repeat(50));
  }
}

runTests().catch(console.error);
