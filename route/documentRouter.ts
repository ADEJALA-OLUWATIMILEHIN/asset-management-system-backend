import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Asset, Document, User } from "../models";
import {
  applyDocumentExpiryStatus,
  runDocumentExpirySweep,
  syncDocumentCalendarEvent,
} from "../services/scheduleAutomation";

const router = express.Router();
const uploadDir = path.resolve(__dirname, "../uploads/documents");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const allowedDocTypes = [
  "VEHICLE_INSURANCE",
  "MAINTENANCE_AGREEMENT",
  "COMPLIANCE_CERT",
  "REAL_ESTATE_LEASE",
  "PURCHASE_ORDER",
];

const allowedStatuses = ["ACTIVE", "EXPIRING_SOON", "EXPIRED", "PERMANENT"];

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

const documentIncludes = [
  {
    model: Asset,
    as: "asset",
    attributes: ["id", "assetCode", "name", "category", "status"],
  },
  {
    model: User,
    as: "uploader",
    attributes: ["id", "name", "email", "initials", "role", "status"],
  },
];

function buildDocumentPayload(body: Record<string, any>, partial = false) {
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

  assign("name", body.name);
  assign("fileUrl", getAny("fileUrl", "file_url"));
  assign("fileSizeBytes", hasAny("fileSizeBytes", "file_size_bytes") ? optionalNumber(getAny("fileSizeBytes", "file_size_bytes")) : partial ? undefined : null);
  assign("mimeType", hasAny("mimeType", "mime_type") ? getAny("mimeType", "mime_type") : partial ? undefined : null);
  assign("docType", normalizeEnum(getAny("docType", "doc_type")));
  assign("linkedAssetId", hasAny("linkedAssetId", "linked_asset_id", "assetId", "asset_id") ? optionalNumber(getAny("linkedAssetId", "linked_asset_id", "assetId", "asset_id")) : partial ? undefined : null);
  assign("expiryDate", hasAny("expiryDate", "expiry_date") ? getAny("expiryDate", "expiry_date") : partial ? undefined : null);
  assign("status", hasAny("status") ? normalizeEnum(body.status) : partial ? undefined : "ACTIVE");
  assign("isVerified", hasAny("isVerified", "is_verified") ? getAny("isVerified", "is_verified") : partial ? undefined : false);
  assign("uploadedBy", hasAny("uploadedBy", "uploaded_by") ? optionalNumber(getAny("uploadedBy", "uploaded_by")) : undefined);

  return payload;
}

function validateDocumentPayload(payload: Record<string, any>, isCreate = false) {
  if (isCreate && (!payload.name || !payload.fileUrl || !payload.docType || !payload.uploadedBy)) {
    return "name, fileUrl, docType, and uploadedBy are required";
  }

  if (payload.docType && !allowedDocTypes.includes(String(payload.docType))) {
    return `Invalid docType. Allowed: ${allowedDocTypes.join(", ")}`;
  }

  if (payload.status && !allowedStatuses.includes(String(payload.status))) {
    return `Invalid status. Allowed: ${allowedStatuses.join(", ")}`;
  }

  const numericFields = [
    ["fileSizeBytes", payload.fileSizeBytes],
    ["linkedAssetId", payload.linkedAssetId],
    ["uploadedBy", payload.uploadedBy],
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
    await runDocumentExpirySweep();

    const documents = await Document.findAll({
      include: documentIncludes,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Error fetching documents" });
  }
});

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "file is required" });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.status(201).json({
    fileUrl: `${baseUrl}/uploads/documents/${req.file.filename}`,
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype || null,
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Document id must be a valid number" });
    return;
  }

  try {
    const document = await Document.findByPk(id, {
      include: documentIncludes,
    });

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    await syncDocumentCalendarEvent(document);

    res.status(200).json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Error fetching document" });
  }
});

router.post("/new-document", async (req: Request, res: Response) => {
  const payload = applyDocumentExpiryStatus(buildDocumentPayload(req.body));
  const validationError = validateDocumentPayload(payload, true);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const newDocument = await Document.create(payload);
    await syncDocumentCalendarEvent(newDocument);

    res.status(201).json({
      message: "Document created successfully",
      document: newDocument,
    });
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid linkedAssetId or uploadedBy" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid document data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    console.error("Error creating document:", error);
    res.status(500).json({ error: "Error creating document" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Document id must be a valid number" });
    return;
  }

  const payload = applyDocumentExpiryStatus(buildDocumentPayload(req.body, true));
  const validationError = validateDocumentPayload(payload);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const document = await Document.findByPk(id);

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    await document.update(payload);
    await syncDocumentCalendarEvent(document);

    res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid linkedAssetId or uploadedBy" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid document data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    console.error("Error updating document:", error);
    res.status(500).json({ error: "Error updating document" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Document id must be a valid number" });
    return;
  }

  try {
    const document = await Document.findByPk(id);

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    await syncDocumentCalendarEvent({ id: document.id, expiryDate: null });
    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Error deleting document" });
  }
});

export default router;
