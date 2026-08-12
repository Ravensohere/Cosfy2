import { callGeminiJSON, callGeminiTextJSON } from "@/lib/gemini";
import { INSURANCE_TYPES } from "@/lib/constants";

export type InsuranceDocSummary = {
  roomRentLimit: string | null;
  coPayPercent: number | null;
  subLimits: string[];
  waitingPeriodMonths: number | null;
  keyExclusions: string[];
  proportionateDeductionApplies: boolean;
  note: string;
};

export type InsuranceDocExtraction = {
  type: (typeof INSURANCE_TYPES)[number];
  subType: string | null;
  provider: string | null;
  policyName: string | null;
  sumInsured: number | null;
  premiumAmount: number | null;
  frequency: string | null;
  summary: InsuranceDocSummary;
};

const EMPTY: InsuranceDocExtraction = {
  type: "Other",
  subType: null,
  provider: null,
  policyName: null,
  sumInsured: null,
  premiumAmount: null,
  frequency: null,
  summary: {
    roomRentLimit: null,
    coPayPercent: null,
    subLimits: [],
    waitingPeriodMonths: null,
    keyExclusions: [],
    proportionateDeductionApplies: false,
    note: "",
  },
};

const INSURANCE_PROMPT = `Extract the key terms from this insurance policy document (schedule, policy wording, or certificate of insurance). Respond with strict JSON only, matching exactly this shape:
{
  "type": "Life" | "Health" | "Vehicle" | "Other",
  "subType": string | null,
  "provider": string | null,
  "policyName": string | null,
  "sumInsured": number | null,
  "premiumAmount": number | null,
  "frequency": "Monthly" | "Quarterly" | "HalfYearly" | "Yearly" | null,
  "summary": {
    "roomRentLimit": string | null,
    "coPayPercent": number | null,
    "subLimits": string[],
    "waitingPeriodMonths": number | null,
    "keyExclusions": string[],
    "proportionateDeductionApplies": boolean,
    "note": string
  }
}

"type" is the coarse category. "subType" is the specific product name if the document states one (e.g. "Term Life", "Comprehensive Health", "Two-wheeler Third-Party"), else null.
"roomRentLimit" describes any cap on hospital room rent exactly as it applies: a flat per-day amount, a percentage of sum insured, or "No capping" if the policy explicitly has none — null if not a health policy or not stated.
"coPayPercent" is the co-payment percentage the policyholder bears, null if none or not applicable.
"subLimits" lists any per-illness or per-procedure caps stated (e.g. "Cataract surgery capped at ₹40,000 per eye"), empty array if none.
"waitingPeriodMonths" is the longest waiting period stated for pre-existing conditions or specific illnesses, null if not stated.
"keyExclusions" lists the most important exclusions, empty array if none found.
"proportionateDeductionApplies" is true only if the document states that choosing a room category above the entitled limit reduces reimbursement proportionately across all associated hospitalization expenses, not just the room rent.
"note" is one or two sentences flagging the single most important thing a policyholder should know about this document's coverage or limitations, empty string if nothing notable.
If a field isn't stated in the document, use null (or an empty array/string as appropriate), don't guess.`;

function coerce(parsed: unknown): InsuranceDocExtraction {
  if (typeof parsed !== "object" || parsed === null) return EMPTY;
  const p = parsed as Record<string, unknown>;
  const s = typeof p.summary === "object" && p.summary !== null ? (p.summary as Record<string, unknown>) : {};

  const type = INSURANCE_TYPES.includes(p.type as (typeof INSURANCE_TYPES)[number])
    ? (p.type as (typeof INSURANCE_TYPES)[number])
    : "Other";

  return {
    type,
    subType: typeof p.subType === "string" && p.subType.trim() ? p.subType.trim() : null,
    provider: typeof p.provider === "string" && p.provider.trim() ? p.provider.trim() : null,
    policyName: typeof p.policyName === "string" && p.policyName.trim() ? p.policyName.trim() : null,
    sumInsured: typeof p.sumInsured === "number" ? p.sumInsured : null,
    premiumAmount: typeof p.premiumAmount === "number" ? p.premiumAmount : null,
    frequency: typeof p.frequency === "string" ? p.frequency : null,
    summary: {
      roomRentLimit: typeof s.roomRentLimit === "string" ? s.roomRentLimit : null,
      coPayPercent: typeof s.coPayPercent === "number" ? s.coPayPercent : null,
      subLimits: Array.isArray(s.subLimits) ? s.subLimits.filter((x): x is string => typeof x === "string") : [],
      waitingPeriodMonths: typeof s.waitingPeriodMonths === "number" ? s.waitingPeriodMonths : null,
      keyExclusions: Array.isArray(s.keyExclusions) ? s.keyExclusions.filter((x): x is string => typeof x === "string") : [],
      proportionateDeductionApplies: Boolean(s.proportionateDeductionApplies),
      note: typeof s.note === "string" ? s.note : "",
    },
  };
}

export async function extractInsuranceDocFromText(apiKey: string, text: string): Promise<InsuranceDocExtraction> {
  const content = await callGeminiTextJSON({ apiKey, prompt: INSURANCE_PROMPT, document: text.slice(0, 30000) });
  try {
    return coerce(JSON.parse(content));
  } catch {
    return EMPTY;
  }
}

export async function extractInsuranceDocFromImage(apiKey: string, dataUrl: string): Promise<InsuranceDocExtraction> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return EMPTY;
  const [, mimeType, base64Data] = match;

  const content = await callGeminiJSON({ apiKey, prompt: INSURANCE_PROMPT, mimeType, base64Data });
  try {
    return coerce(JSON.parse(content));
  } catch {
    return EMPTY;
  }
}
