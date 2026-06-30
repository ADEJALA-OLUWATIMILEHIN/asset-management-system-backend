import express, { Request, Response } from "express";
import { Asset, Department, User } from "../models";

const router = express.Router();

const allowedCategories = [
  "VEHICLES",
  "EQUIPMENT",
  "REAL_ESTATE",
  "IT_INFRASTRUCTURE",
  "HEAVY_MACHINERY",
  "CORPORATE_FLEET",
];

const allowedStatuses = [
  "ACTIVE",
  "EXPIRED",
  "EXPIRING_SOON",
  "DECOMMISSIONED",
  "PENDING_APPROVAL",
];

const allowedConditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
const allowedRiskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const normalizeEnum = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

const optionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : NaN;
};

const parseId = (value: unknown) => {
  if (Array.isArray(value)) return NaN;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
};

const assetIncludes = [
  {
    model: Department,
    as: "department",
    attributes: ["id", "name", "branch_location"],
  },
  {
    model: User,
    as: "custodian",
    attributes: ["id", "name", "email", "initials", "role", "status"],
  },
];

function buildAssetPayload(body: Record<string, any>, partial = false) {
  const payload: Record<string, any> = {};
  const hasAny = (...keys: string[]) =>
    keys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
  const getAny = (...keys: string[]) => {
    const key = keys.find((item) => Object.prototype.hasOwnProperty.call(body, item));
    return key ? body[key] : undefined;
  };
  const assign = (key: string, value: unknown) => {
    if (!partial || value !== undefined) {
      payload[key] = value;
    }
  };

  assign("assetCode", getAny("assetCode", "asset_code"));
  assign("name", getAny("name", "asset_name"));
  assign("category", normalizeEnum(getAny("category", "asset_class")));
  assign("status", hasAny("status") ? normalizeEnum(body.status) : partial ? undefined : "ACTIVE");
  assign("manufacturer", hasAny("manufacturer") ? body.manufacturer : partial ? undefined : null);
  assign("modelYear", hasAny("modelYear", "model_year") ? optionalNumber(getAny("modelYear", "model_year")) : partial ? undefined : null);
  assign("color", hasAny("color") ? body.color : partial ? undefined : null);
  assign("serialNumber", hasAny("serialNumber", "serial_number") ? getAny("serialNumber", "serial_number") : partial ? undefined : null);
  assign("purchaseDate", hasAny("purchaseDate", "purchase_date") ? getAny("purchaseDate", "purchase_date") : partial ? undefined : null);
  assign("purchasePrice", hasAny("purchasePrice", "purchase_price") ? optionalNumber(getAny("purchasePrice", "purchase_price")) : partial ? undefined : null);
  assign("warrantyExpiry", hasAny("warrantyExpiry", "warranty_expiry") ? getAny("warrantyExpiry", "warranty_expiry") : partial ? undefined : null);
  assign("vendorId", hasAny("vendorId", "vendor_id") ? optionalNumber(getAny("vendorId", "vendor_id")) : partial ? undefined : null);
  assign("custodianId", hasAny("custodianId", "custodian_id") ? optionalNumber(getAny("custodianId", "custodian_id")) : partial ? undefined : null);
  assign("location", hasAny("location", "branch") ? getAny("location", "branch") : partial ? undefined : null);
  assign("departmentId", hasAny("departmentId", "department_id") ? optionalNumber(getAny("departmentId", "department_id")) : partial ? undefined : null);
  assign("condition", hasAny("condition") ? normalizeEnum(body.condition) : partial ? undefined : null);
  assign("conditionScore", hasAny("conditionScore", "condition_score") ? optionalNumber(getAny("conditionScore", "condition_score")) : partial ? undefined : null);
  assign("insurancePolicyId", hasAny("insurancePolicyId", "insurance_policy_id") ? optionalNumber(getAny("insurancePolicyId", "insurance_policy_id")) : partial ? undefined : null);
  assign("valuation", hasAny("valuation") ? optionalNumber(body.valuation) : partial ? undefined : null);
  assign("lastScannedAt", hasAny("lastScannedAt", "last_scanned_at") ? getAny("lastScannedAt", "last_scanned_at") : partial ? undefined : null);
  assign("imageUrls", hasAny("imageUrls", "image_urls") ? getAny("imageUrls", "image_urls") : partial ? undefined : null);
  assign("mapCoordinates", hasAny("mapCoordinates", "map_coordinates") ? getAny("mapCoordinates", "map_coordinates") : partial ? undefined : null);
  assign("riskLevel", hasAny("riskLevel", "risk_level") ? normalizeEnum(getAny("riskLevel", "risk_level")) : partial ? undefined : null);

  return payload;
}

function validateAssetPayload(payload: Record<string, any>, isCreate = false) {
  if (isCreate && (!payload.assetCode || !payload.name || !payload.category)) {
    return "assetCode, name, and category are required";
  }

  if (payload.category && !allowedCategories.includes(String(payload.category))) {
    return `Invalid category. Allowed: ${allowedCategories.join(", ")}`;
  }

  if (payload.status && !allowedStatuses.includes(String(payload.status))) {
    return `Invalid status. Allowed: ${allowedStatuses.join(", ")}`;
  }

  if (payload.condition && !allowedConditions.includes(String(payload.condition))) {
    return `Invalid condition. Allowed: ${allowedConditions.join(", ")}`;
  }

  if (payload.riskLevel && !allowedRiskLevels.includes(String(payload.riskLevel))) {
    return `Invalid riskLevel. Allowed: ${allowedRiskLevels.join(", ")}`;
  }

  const numericFields = [
    ["modelYear", payload.modelYear],
    ["purchasePrice", payload.purchasePrice],
    ["vendorId", payload.vendorId],
    ["custodianId", payload.custodianId],
    ["departmentId", payload.departmentId],
    ["conditionScore", payload.conditionScore],
    ["insurancePolicyId", payload.insurancePolicyId],
    ["valuation", payload.valuation],
  ];

  for (const [field, value] of numericFields) {
    if (Number.isNaN(value)) {
      return `${field} must be a valid number`;
    }
  }

  return null;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const assets = await Asset.findAll({
      include: assetIncludes,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Error fetching assets" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Asset id must be a valid number" });
    return;
  }

  try {
    const asset = await Asset.findByPk(id, {
      include: assetIncludes,
    });

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    res.status(200).json({ asset });
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).json({ error: "Error fetching asset" });
  }
});

router.post("/new-asset", async (req: Request, res: Response) => {
  const payload = buildAssetPayload(req.body);
  const validationError = validateAssetPayload(payload, true);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const newAsset = await Asset.create(payload);

    res.status(201).json({
      message: "Asset created successfully",
      asset: newAsset,
    });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "An asset with this assetCode or serialNumber already exists" });
      return;
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid related record id" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid asset data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Error creating asset" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Asset id must be a valid number" });
    return;
  }

  const payload = buildAssetPayload(req.body, true);
  const validationError = validateAssetPayload(payload);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const asset = await Asset.findByPk(id);

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    await asset.update(payload);

    res.status(200).json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "An asset with this assetCode or serialNumber already exists" });
      return;
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid related record id" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid asset data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Error updating asset" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Asset id must be a valid number" });
    return;
  }

  try {
    const asset = await Asset.findByPk(id);

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    await asset.destroy();

    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Error deleting asset" });
  }
});

export default router;
