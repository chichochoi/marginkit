import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORIES,
  getDefaultValues,
  loadAllTools
} from "../src/lib.mjs";

const VALID_TONES = new Set(["good", "warn", "bad"]);
const VALID_FORMATS = new Set(["currency", "percent", "number"]);
const VALID_COLOR_KEYS = new Set(["net", "fee", "processing", "cost", "tax"]);
const VALID_INPUT_TYPES = new Set(["number", "select", "checkbox"]);

function assertFiniteResult(res, label, errors) {
  if (!res || typeof res !== "object") {
    errors.push(`${label}: compute() did not return an object`);
    return;
  }
  if (!Array.isArray(res.kpis) || res.kpis.length < 2) {
    errors.push(`${label}: compute() must return at least 2 kpis`);
  } else {
    for (const kpi of res.kpis) {
      if (!kpi.id || !kpi.label) {
        errors.push(`${label}: every KPI must have id and label`);
      }
      if (!VALID_FORMATS.has(kpi.format)) {
        errors.push(`${label}: KPI "${kpi.id}" has invalid format "${kpi.format}"`);
      }
      if (!Number.isFinite(kpi.value)) {
        errors.push(`${label}: KPI "${kpi.id}" has non-finite value: ${kpi.value}`);
      }
    }
  }

  if (!Array.isArray(res.breakdown) || res.breakdown.length < 2) {
    errors.push(`${label}: compute() must return at least 2 breakdown items`);
  } else {
    for (const item of res.breakdown) {
      if (!item.label) {
        errors.push(`${label}: breakdown item missing label`);
      }
      if (!Number.isFinite(item.amount) || !Number.isFinite(item.share)) {
        errors.push(`${label}: breakdown "${item.label}" has non-finite amount/share`);
      }
      if (!VALID_COLOR_KEYS.has(item.colorKey)) {
        errors.push(`${label}: breakdown "${item.label}" has invalid colorKey "${item.colorKey}"`);
      }
    }
  }

  if (!res.verdict || !VALID_TONES.has(res.verdict.tone) || !res.verdict.title || !res.verdict.detail) {
    errors.push(`${label}: verdict must include valid tone (good|warn|bad), title, and detail`);
  }
}

export async function verifyAllTools() {
  const { published, staged } = await loadAllTools();
  const all = [
    ...published.map((t) => ({ ...t, bucket: "published" })),
    ...staged.map((t) => ({ ...t, bucket: "staged" }))
  ];
  const errors = [];
  const seenSlugs = new Set();

  for (const tool of all) {
    const tag = `[${tool.bucket}/${tool.fileName}]`;
    const m = tool.meta;
    if (!m || typeof m !== "object") {
      errors.push(`${tag}: missing meta export`);
      continue;
    }

    if (!m.slug || !/^[a-z0-9-]+$/.test(m.slug)) {
      errors.push(`${tag}: slug "${m.slug}" must match ^[a-z0-9-]+$`);
    }
    if (m.slug !== tool.slugFromFile) {
      errors.push(`${tag}: meta.slug "${m.slug}" must match filename "${tool.slugFromFile}"`);
    }
    if (seenSlugs.has(m.slug)) {
      errors.push(`${tag}: duplicate slug "${m.slug}"`);
    }
    seenSlugs.add(m.slug);

    if (!m.title || m.title.length < 35 || m.title.length > 70) {
      errors.push(`${tag}: meta.title length (${m.title?.length ?? 0}) must be 35-70 chars`);
    }
    if (!m.metaDescription || m.metaDescription.length < 110 || m.metaDescription.length > 165) {
      errors.push(
        `${tag}: meta.metaDescription length (${m.metaDescription?.length ?? 0}) must be 110-165 chars`
      );
    }
    if (!m.shortTitle) {
      errors.push(`${tag}: missing meta.shortTitle`);
    }
    if (!CATEGORIES[m.category]) {
      errors.push(`${tag}: invalid category "${m.category}"`);
    }
    if (!m.updatedAt || !/^\d{4}-\d{2}-\d{2}$/.test(m.updatedAt)) {
      errors.push(`${tag}: updatedAt "${m.updatedAt}" must be YYYY-MM-DD`);
    }
    if (!Array.isArray(m.inputs) || m.inputs.length < 2) {
      errors.push(`${tag}: inputs must have at least 2 fields`);
    } else {
      for (const inp of m.inputs) {
        if (!inp.id || !inp.label || !VALID_INPUT_TYPES.has(inp.type)) {
          errors.push(`${tag}: invalid input definition for "${inp?.id}"`);
        }
        if (inp.defaultValue === undefined) {
          errors.push(`${tag}: input "${inp.id}" missing defaultValue`);
        }
      }
    }

    if (!m.howItWorks?.summary || !Array.isArray(m.howItWorks?.formulaSteps) || m.howItWorks.formulaSteps.length < 3) {
      errors.push(`${tag}: howItWorks.formulaSteps must have at least 3 steps`);
    }
    if (!Array.isArray(m.tips) || m.tips.length < 3) {
      errors.push(`${tag}: tips must have at least 3 items`);
    }
    if (!Array.isArray(m.faqs) || m.faqs.length < 4) {
      errors.push(`${tag}: faqs must have at least 4 items`);
    }
    if (!Array.isArray(m.testCases) || m.testCases.length < 2) {
      errors.push(`${tag}: testCases must have at least 2 items`);
    }

    if (typeof tool.compute !== "function") {
      errors.push(`${tag}: missing compute(values) export`);
      continue;
    }

    const fnSource = tool.compute.toString().trim();
    if (!fnSource.startsWith("function")) {
      errors.push(`${tag}: compute must be a regular function declaration (startsWith("function"))`);
      continue;
    }

    let serializedFn;
    try {
      serializedFn = new Function(`return (${fnSource});`)();
    } catch (err) {
      errors.push(`${tag}: compute failed browser serialization: ${err.message}`);
      continue;
    }

    const defaultValues = getDefaultValues(m);
    try {
      const defaultRes = serializedFn(defaultValues);
      assertFiniteResult(defaultRes, `${tag} defaultValues`, errors);
    } catch (err) {
      errors.push(`${tag}: serialized compute threw on defaultValues: ${err.message}`);
      continue;
    }

    for (const tc of m.testCases || []) {
      const merged = { ...defaultValues, ...(tc.inputs || {}) };
      for (const [runnerName, fn] of [
        ["node", tool.compute],
        ["browser", serializedFn]
      ]) {
        try {
          const res = fn(merged);
          assertFiniteResult(res, `${tag} testCase "${tc.name}" (${runnerName})`, errors);
          const target = (res.kpis || []).find((k) => k.id === tc.expected?.kpiId);
          if (!target) {
            errors.push(`${tag} testCase "${tc.name}": KPI id "${tc.expected?.kpiId}" not found`);
            continue;
          }
          const diff = Math.abs(target.value - tc.expected.approx);
          if (diff > tc.expected.tolerance) {
            errors.push(
              `${tag} testCase "${tc.name}" (${runnerName}): KPI "${tc.expected.kpiId}" = ${target.value}, expected ${tc.expected.approx} ± ${tc.expected.tolerance}`
            );
          }
        } catch (err) {
          errors.push(`${tag} testCase "${tc.name}" (${runnerName}) threw: ${err.message}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Verification failed with ${errors.length} error(s):\n - ${errors.join("\n - ")}`);
  }

  return { published, staged };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const { published, staged } = await verifyAllTools();
    console.log(`VERIFIED: ${published.length} published, ${staged.length} staged calculators passed all checks.`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
