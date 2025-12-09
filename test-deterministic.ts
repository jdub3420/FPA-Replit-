/**
 * Deterministic Orchestration Test
 * 
 * This script tests that the 3-phase orchestration architecture produces
 * deterministic outputs for identical inputs.
 */

import { orchestrateMultiLLMWorkflow } from "./server/orchestration";
import { storage } from "./server/storage";

const SAMPLE_FINANCIAL_DATA = `
SUNRISE MANOR SENIOR LIVING - VARIANCE ANALYSIS REPORT

ACTUAL VS BUDGET - October 2025

CENSUS DATA:
- Budgeted Census: 113 residents
- Actual Census: 108 residents (-5 residents, -4.4%)
- Move-Ins: 3 (budgeted: 5)
- Move-Outs: 7 (budgeted: 4)

REVENUE PERFORMANCE:
- Total Revenue Budget: $2,800,000
- Total Revenue Actual: $2,570,000
- Variance: -$230,000 (-8.2%)

REVENUE BREAKDOWN:
Medicare:
  - Budget: $850,000
  - Actual: $723,000
  - Variance: -$127,000 (-15.0%)
  
Medicaid:
  - Budget: $1,100,000
  - Actual: $1,150,000
  - Variance: +$50,000 (+4.5%)

Private Pay:
  - Budget: $850,000
  - Actual: $697,000
  - Variance: -$153,000 (-18.0%)

KEY METRICS:
- Average Daily Rate (ADR): $799 (budget: $799) - on target
- Occupancy Rate: 90.0% (budget: 94.2%)
- Medicare Mix: 28.1% (budget: 30.4%)
- Medicaid Mix: 44.7% (budget: 39.3%)

OPERATIONAL DATA:
- Agency Labor: $125,000 vs budget $75,000 (+$50,000)
- Staff Call-Outs: 15 instances (flu season impact)
- SNF Transfers Out: 3 (higher acuity needs)
- Sales Pipeline: 8 tours scheduled
`;

const TEST_INPUT = {
  team: "Variance Analysis",
  complexity: "higher-order",
  context: SAMPLE_FINANCIAL_DATA,
  facilityContext: "Sunrise Manor is a 120-bed skilled nursing facility in suburban Denver. The facility specializes in post-acute care with 40% Medicare, 35% Medicaid, and 25% private pay mix.",
  useRag: false, // Disable RAG for deterministic testing
};

async function runTest() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🧪 DETERMINISTIC BEHAVIOR TEST");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("Test Scenario: Run same analysis twice and compare outputs\n");

  try {
    // Run 1
    console.log("🔄 RUN 1: Starting first analysis...");
    const run1Start = Date.now();
    const offerId1 = await orchestrateMultiLLMWorkflow(TEST_INPUT);
    const run1Duration = Date.now() - run1Start;
    console.log(`✅ Run 1 completed in ${run1Duration}ms`);
    console.log(`   Offer ID: ${offerId1}\n`);

    // Wait 2 seconds before Run 2
    console.log("⏳ Waiting 2 seconds before Run 2...\n");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run 2
    console.log("🔄 RUN 2: Starting second analysis...");
    const run2Start = Date.now();
    const offerId2 = await orchestrateMultiLLMWorkflow(TEST_INPUT);
    const run2Duration = Date.now() - run2Start;
    console.log(`✅ Run 2 completed in ${run2Duration}ms`);
    console.log(`   Offer ID: ${offerId2}\n`);

    // Fetch both offers
    const offer1 = await storage.getGeneratedOffer(offerId1);
    const offer2 = await storage.getGeneratedOffer(offerId2);

    if (!offer1 || !offer2) {
      throw new Error("Failed to fetch offers from database");
    }

    // Parse model outputs
    const outputs1 = JSON.parse(offer1.modelOutputs);
    const outputs2 = JSON.parse(offer2.modelOutputs);

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📊 COMPARISON RESULTS");
    console.log("═══════════════════════════════════════════════════════════\n");

    // 1. Processing Order Verification
    console.log("1️⃣  PROCESSING ORDER:");
    console.log(`   Run 1: ${JSON.stringify(offer1.processingOrder)}`);
    console.log(`   Run 2: ${JSON.stringify(offer2.processingOrder)}`);
    const orderMatch = JSON.stringify(offer1.processingOrder) === JSON.stringify(offer2.processingOrder);
    console.log(`   ${orderMatch ? "✅ MATCH" : "❌ MISMATCH"}\n`);

    // 2. Deterministic Flag
    console.log("2️⃣  DETERMINISTIC FLAG:");
    console.log(`   Run 1: ${offer1.deterministic}`);
    console.log(`   Run 2: ${offer2.deterministic}`);
    console.log(`   ${offer1.deterministic && offer2.deterministic ? "✅ BOTH TRUE" : "❌ NOT BOTH TRUE"}\n`);

    // 3. Phase Timings
    console.log("3️⃣  PHASE TIMINGS:");
    console.log(`   Run 1: Phase1=${offer1.phase1Duration}ms, Phase2=${offer1.phase2Duration}ms, Phase3=${offer1.phase3Duration}ms, Total=${offer1.totalDuration}ms`);
    console.log(`   Run 2: Phase1=${offer2.phase1Duration}ms, Phase2=${offer2.phase2Duration}ms, Phase3=${offer2.phase3Duration}ms, Total=${offer2.totalDuration}ms`);
    console.log(`   ℹ️  Timings will vary (API latency), but structure should be consistent\n`);

    // 4. Model Response Structure
    console.log("4️⃣  MODEL RESPONSE STRUCTURE:");
    console.log(`   Run 1: ${outputs1.length} models`);
    console.log(`   Run 2: ${outputs2.length} models`);
    const sameModelCount = outputs1.length === outputs2.length;
    console.log(`   ${sameModelCount ? "✅ SAME COUNT" : "❌ DIFFERENT COUNT"}`);
    
    if (sameModelCount) {
      console.log("\n   Model Order:");
      for (let i = 0; i < outputs1.length; i++) {
        const match = outputs1[i].model === outputs2[i].model;
        console.log(`   Position ${i + 1}: ${outputs1[i].model} vs ${outputs2[i].model} ${match ? "✅" : "❌"}`);
      }
    }
    console.log();

    // 5. Content Similarity Analysis
    console.log("5️⃣  CONTENT ANALYSIS:");
    
    for (let i = 0; i < Math.min(outputs1.length, outputs2.length); i++) {
      const model = outputs1[i].model;
      const content1 = outputs1[i].content;
      const content2 = outputs2[i].content;
      
      const lengthDiff = Math.abs(content1.length - content2.length);
      const lengthDiffPercent = (lengthDiff / Math.max(content1.length, content2.length) * 100).toFixed(1);
      
      console.log(`   ${model}:`);
      console.log(`     Run 1: ${content1.length} chars`);
      console.log(`     Run 2: ${content2.length} chars`);
      console.log(`     Length diff: ${lengthDiff} chars (${lengthDiffPercent}%)`);
      
      // Check for identical content (unlikely with LLMs)
      if (content1 === content2) {
        console.log(`     🎯 IDENTICAL CONTENT (extremely deterministic!)`);
      } else {
        console.log(`     ℹ️  Content differs (expected due to LLM variability)`);
      }
      console.log();
    }

    // 6. Consensus Score
    console.log("6️⃣  CONSENSUS SCORE:");
    console.log(`   Run 1: ${(offer1.consensusScore * 100).toFixed(0)}%`);
    console.log(`   Run 2: ${(offer2.consensusScore * 100).toFixed(0)}%`);
    const consensusMatch = offer1.consensusScore === offer2.consensusScore;
    console.log(`   ${consensusMatch ? "✅ MATCH" : "❌ MISMATCH"}\n`);

    // 7. Python Validation
    console.log("7️⃣  PYTHON VALIDATION:");
    console.log(`   Run 1: ${offer1.pythonValidation ? offer1.pythonValidation.length : 0} chars`);
    console.log(`   Run 2: ${offer2.pythonValidation ? offer2.pythonValidation.length : 0} chars`);
    const bothHaveValidation = offer1.pythonValidation && offer2.pythonValidation;
    console.log(`   ${bothHaveValidation ? "✅ BOTH HAVE VALIDATION" : "⚠️  VALIDATION MISSING"}\n`);

    // Final Summary
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📋 TEST SUMMARY");
    console.log("═══════════════════════════════════════════════════════════\n");

    const allPassed = orderMatch && offer1.deterministic && offer2.deterministic && sameModelCount && consensusMatch;

    if (allPassed) {
      console.log("✅ ALL STRUCTURAL CHECKS PASSED");
      console.log("\n✨ The 3-phase architecture is working correctly:");
      console.log("   - Fixed processing order maintained");
      console.log("   - Deterministic flag set correctly");
      console.log("   - Same models used in same order");
      console.log("   - Consistent consensus scoring");
      console.log("\n⚠️  Note: LLM output content will vary between runs");
      console.log("   (this is expected - the STRUCTURE is deterministic, not the exact text)");
    } else {
      console.log("❌ SOME CHECKS FAILED");
      console.log("\nIssues detected:");
      if (!orderMatch) console.log("   - Processing order mismatch");
      if (!offer1.deterministic || !offer2.deterministic) console.log("   - Deterministic flag not set");
      if (!sameModelCount) console.log("   - Different model counts");
      if (!consensusMatch) console.log("   - Consensus score mismatch");
    }

    console.log("\n═══════════════════════════════════════════════════════════\n");

  } catch (error: any) {
    console.error("\n❌ TEST FAILED WITH ERROR:");
    console.error(error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest().then(() => {
  console.log("✅ Test completed successfully");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
