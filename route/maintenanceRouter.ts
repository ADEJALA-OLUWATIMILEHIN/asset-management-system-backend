import express, { Request, Response } from "express";
import { MaintenanceRecord, Asset } from "../models";
import {
  runMaintenanceSweep,
  syncMaintenanceCalendarEvent,
} from "../services/scheduleAutomation";

const router = express.Router();

const parseId = (value: unknown) => {
  if (Array.isArray(value)) return NaN;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
};

// Get all maintenance records with asset details
router.get("/", async (req: Request, res: Response) => {
  try {
    await runMaintenanceSweep();

    const maintenanceRecords = await MaintenanceRecord.findAll({
      include: [
        {
          model: Asset,
          as: "asset",
          attributes: ["id", "assetCode", "name"],
        },
      ],
      order: [["nextServiceDate", "ASC"]],
    });

    res.status(200).json({ maintenanceRecords });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    res.status(500).json({ error: "Error fetching maintenance records" });
  }
});

// Get maintenance statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    await runMaintenanceSweep();

    const stats = await MaintenanceRecord.findAll({
      attributes: ["status"],
      raw: true,
    });

    const counts = {
      pending: stats.filter((s) => s.status === "PENDING").length,
      scheduled: stats.filter((s) => s.status === "SCHEDULED").length,
      completed: stats.filter((s) => s.status === "COMPLETED").length,
      overdue: stats.filter((s) => s.status === "OVERDUE").length,
    };

    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching maintenance stats:", error);
    res.status(500).json({ error: "Error fetching maintenance stats" });
  }
});

// Get single maintenance record
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Maintenance ID must be a valid number" });
    return;
  }

  try {
    const maintenanceRecord = await MaintenanceRecord.findByPk(id, {
      include: [
        {
          model: Asset,
          as: "asset",
          attributes: ["id", "assetCode", "name"],
        },
      ],
    });

    if (!maintenanceRecord) {
      res.status(404).json({ error: "Maintenance record not found" });
      return;
    }

    await syncMaintenanceCalendarEvent(maintenanceRecord);

    res.status(200).json({ maintenanceRecord });
  } catch (error) {
    console.error("Error fetching maintenance record:", error);
    res.status(500).json({ error: "Error fetching maintenance record" });
  }
});

// Create new maintenance record
router.post("/new-maintenance", async (req: Request, res: Response) => {
  const {
    assetId,
    maintenanceType,
    vendorId,
    cost,
    lastServiceDate,
    nextServiceDate,
    status = "PENDING",
    notes,
    createdBy,
  } = req.body;

  // Validate required fields
  if (!assetId || !maintenanceType || !createdBy) {
    res.status(400).json({ error: "assetId, maintenanceType, and createdBy are required" });
    return;
  }

  // Validate numeric IDs
  const assetIdNum = parseId(assetId);
  const vendorIdNum = vendorId ? parseId(vendorId) : null;
  const createdByNum = parseId(createdBy);

  if (Number.isNaN(assetIdNum) || Number.isNaN(createdByNum)) {
    res.status(400).json({ error: "assetId and createdBy must be valid numbers" });
    return;
  }

  if (vendorId && Number.isNaN(vendorIdNum)) {
    res.status(400).json({ error: "vendorId must be a valid number" });
    return;
  }

  // Validate status
  const validStatuses = ["SCHEDULED", "PENDING", "OVERDUE", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    return;
  }

  try {
    const maintenanceRecord = await MaintenanceRecord.create({
      assetId: assetIdNum,
      maintenanceType: String(maintenanceType).trim(),
      vendorId: vendorIdNum,
      cost: cost ? Number(cost) : null,
      lastServiceDate: lastServiceDate || null,
      nextServiceDate: nextServiceDate || null,
      status,
      notes: notes ? String(notes).trim() : null,
      createdBy: createdByNum,
    });
    await syncMaintenanceCalendarEvent(maintenanceRecord);

    res.status(201).json({
      message: "Maintenance record created successfully",
      maintenanceRecord,
    });
  } catch (error: any) {
    console.error("Error creating maintenance record:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid asset ID, vendor ID, or user ID" });
      return;
    }

    res.status(500).json({ error: "Error creating maintenance record" });
  }
});

// Update maintenance record
router.patch("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Maintenance ID must be a valid number" });
    return;
  }

  const {
    assetId,
    maintenanceType,
    vendorId,
    cost,
    lastServiceDate,
    nextServiceDate,
    status,
    notes,
  } = req.body;

  // Validate status if provided
  if (status) {
    const validStatuses = ["SCHEDULED", "PENDING", "OVERDUE", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
      return;
    }
  }

  try {
    const maintenanceRecord = await MaintenanceRecord.findByPk(id);

    if (!maintenanceRecord) {
      res.status(404).json({ error: "Maintenance record not found" });
      return;
    }

    await maintenanceRecord.update({
      ...(assetId && { assetId: parseId(assetId) }),
      ...(maintenanceType && { maintenanceType: String(maintenanceType).trim() }),
      ...(vendorId && { vendorId: parseId(vendorId) }),
      ...(cost !== undefined && { cost: cost ? Number(cost) : null }),
      ...(lastServiceDate !== undefined && { lastServiceDate }),
      ...(nextServiceDate !== undefined && { nextServiceDate }),
      ...(status && { status }),
      ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
    });
    await syncMaintenanceCalendarEvent(maintenanceRecord);

    res.status(200).json({
      message: "Maintenance record updated successfully",
      maintenanceRecord,
    });
  } catch (error: any) {
    console.error("Error updating maintenance record:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid asset ID, vendor ID, or user ID" });
      return;
    }

    res.status(500).json({ error: "Error updating maintenance record" });
  }
});

export default router;
