// Collection registry — maps a URL-safe slug to its Mongo collection name
// and display metadata. Add new sections here.
export interface CollectionMeta {
  slug: string;          // URL segment, e.g. "tasks"
  collection: string;    // Mongo collection name, e.g. "tasks"
  label: string;         // Sidebar label
  icon: string;          // lucide icon name (used in sidebar)
  // Field definitions drive the auto-generated table + form.
  fields: FieldDef[];
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    slug: "tasks",
    collection: "tasks",
    label: "Tasks",
    icon: "check-square",
    fields: [
      { key: "task", label: "Task", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Done", "Blocked"] },
      { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "completed", label: "Completed", type: "date" },
      { key: "dependsOn", label: "Depends On", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "weight",
    collection: "weightbudget",
    label: "Weight Budget",
    icon: "scale",
    fields: [
      { key: "component", label: "Component", type: "text", required: true },
      { key: "target", label: "Target (kg)", type: "number" },
      { key: "est", label: "Est (kg)", type: "number" },
      { key: "actual", label: "Actual (kg)", type: "number" },
      { key: "location", label: "Location", type: "text" },
      { key: "cgZ", label: "CG Z", type: "number" },
      { key: "contingency", label: "Contingency", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "cost",
    collection: "costtracker",
    label: "Cost Tracker",
    icon: "banknote",
    fields: [
      { key: "partName", label: "Part Name", type: "text", required: true },
      { key: "partNum", label: "Part #", type: "text" },
      { key: "makeBuy", label: "Make/Buy", type: "select", options: ["Make", "Buy"] },
      { key: "material", label: "Material", type: "number" },
      { key: "process", label: "Process", type: "number" },
      { key: "fastener", label: "Fastener", type: "number" },
      { key: "tooling", label: "Tooling", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "risk",
    collection: "riskregister",
    label: "Risk Register",
    icon: "alert-triangle",
    fields: [
      { key: "risk_desc", label: "Description", type: "textarea", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "probability", label: "Probability (1-5)", type: "number" },
      { key: "impact", label: "Impact (1-5)", type: "number" },
      { key: "mitigation", label: "Mitigation", type: "textarea" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Open", "Mitigated", "Closed"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "tradeoff",
    collection: "tradeofflog",
    label: "Tradeoff Log",
    icon: "git-compare",
    fields: [
      { key: "decision", label: "Decision", type: "text", required: true },
      { key: "date", label: "Date", type: "date" },
      { key: "criteria", label: "Criteria", type: "text" },
      { key: "weightPct", label: "Weight % (a/b/c)", type: "text" },
      { key: "optionA", label: "Option A", type: "text" },
      { key: "optionB", label: "Option B", type: "text" },
      { key: "optionC", label: "Option C", type: "text" },
      { key: "bestOption", label: "Best Option", type: "text" },
      { key: "reason", label: "Reason", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Under Review", "Approved", "Rejected"] },
    ],
  },
  {
    slug: "design",
    collection: "designlog",
    label: "Design Log",
    icon: "file-text",
    fields: [
      { key: "date", label: "Date", type: "date" },
      { key: "type", label: "Type", type: "select", options: ["FEA", "Test", "Review", "Sim"] },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "bp16bData", label: "BP16b Data", type: "text" },
      { key: "bp18Sim", label: "BP18 Sim", type: "text" },
      { key: "bp18Test", label: "BP18 Test", type: "text" },
      { key: "action", label: "Action", type: "textarea" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Logged", "Pending", "Review"] },
      { key: "justification", label: "Justification", type: "textarea" },
    ],
  },
  {
    slug: "checklist",
    collection: "checklist",
    label: "Checklist",
    icon: "list-checks",
    fields: [
      { key: "phase", label: "Phase", type: "text" },
      { key: "task", label: "Task", type: "text", required: true },
      { key: "owner", label: "Owner", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Done", "N/A"] },
      { key: "doneDate", label: "Done Date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "cad",
    collection: "cadtracker",
    label: "CAD/DRW Tracker",
    icon: "pen-tool",
    fields: [
      { key: "partNum", label: "Part #", type: "text" },
      { key: "partName", label: "Part Name", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "cadLink", label: "CAD Link", type: "text" },
      { key: "drwLink", label: "DRW Link", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Not Started", "Pending", "In Progress", "Complete", "Released", "Archived"] },
      { key: "owner", label: "Owner", type: "text" },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "photoUrl", label: "Photo URL", type: "text" },
    ],
  },
  {
    slug: "dashboard",
    collection: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    fields: [
      { key: "metric", label: "Metric", type: "text", required: true },
      { key: "value", label: "Value", type: "text" },
      { key: "target", label: "Target", type: "text" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "consumables",
    collection: "consumables",
    label: "Consumables",
    icon: "package",
    fields: [
      { key: "item", label: "Item", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "qty", label: "Qty", type: "text" },
      { key: "opened", label: "Opened", type: "date" },
      { key: "expiry", label: "Expiry", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["In Stock", "Low", "Out"] },
      { key: "owner", label: "Owner", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "torsion",
    collection: "torsion",
    label: "Torsion",
    icon: "rotate-cw",
    fields: [
      { key: "config", label: "Config", type: "text", required: true },
      { key: "measured", label: "Measured", type: "number" },
      { key: "target", label: "Target", type: "number" },
      { key: "method", label: "Method", type: "select", options: ["FEA", "Test", "Calc"] },
      { key: "owner", label: "Owner", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    slug: "lessons",
    collection: "lessons",
    label: "Lessons",
    icon: "lightbulb",
    fields: [
      { key: "source", label: "Source", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "lesson", label: "Lesson", type: "textarea", required: true },
      { key: "type", label: "Type", type: "select", options: ["Do", "Don't", "Improve"] },
      { key: "owner", label: "Owner", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High"] },
    ],
  },
  {
    slug: "jigdrift",
    collection: "jigdrift",
    label: "Jig Drift",
    icon: "ruler",
    fields: [
      { key: "jig", label: "Jig", type: "text", required: true },
      { key: "dim", label: "Dim", type: "text" },
      { key: "before", label: "Before", type: "number" },
      { key: "after", label: "After", type: "number" },
      { key: "tol", label: "Tol", type: "number" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "date", label: "Date", type: "date" },
    ],
  },
  {
    slug: "torquemark",
    collection: "torquemark",
    label: "Torque Mark",
    icon: "wrench",
    fields: [
      { key: "joint", label: "Joint", type: "text", required: true },
      { key: "spec", label: "Spec", type: "number" },
      { key: "recheck", label: "Recheck", type: "number" },
      { key: "result", label: "Result", type: "select", options: ["Not Checked", "Pass", "Fail"] },
      { key: "loc", label: "Loc", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "date", label: "Date", type: "date" },
    ],
  },
  {
    slug: "rawstore",
    collection: "rawstore",
    label: "Raw Materials",
    icon: "box",
    fields: [
      { key: "material", label: "Material", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "spec", label: "Spec", type: "text" },
      { key: "supplier", label: "Supplier", type: "text" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "unit_cost", label: "Unit Cost", type: "number" },
      { key: "min_stock", label: "Min Stock", type: "number" },
      { key: "current_stock", label: "Current Stock", type: "number" },
      { key: "location", label: "Location", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
];

export function getCollectionMeta(slug: string): CollectionMeta | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
