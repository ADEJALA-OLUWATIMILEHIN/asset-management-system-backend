import express, { Request, Response } from "express";
import { CalendarEvent, Asset, Document } from "../models";
import { Op } from "sequelize";
import { runScheduleAutomation } from "../services/scheduleAutomation";

const router = express.Router();

const parseId = (value: unknown) => {
  if (Array.isArray(value)) return NaN;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
};

// Get all calendar events
router.get("/", async (req: Request, res: Response) => {
  try {
    await runScheduleAutomation();

    const events = await CalendarEvent.findAll({
      include: [
        {
          model: Asset,
          as: "asset",
          attributes: ["id", "assetCode", "name"],
          required: false,
        },
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "docType"],
          required: false,
        },
      ],
      order: [["eventDate", "ASC"]],
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Error fetching calendar events" });
  }
});

// Get events for a specific month
router.get("/month/:year/:month", async (req: Request, res: Response) => {
  const year = parseId(req.params.year);
  const month = parseId(req.params.month);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    res.status(400).json({ error: "Invalid year or month" });
    return;
  }

  try {
    await runScheduleAutomation();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await CalendarEvent.findAll({
      where: {
        eventDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Asset,
          as: "asset",
          attributes: ["id", "assetCode", "name"],
          required: false,
        },
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "docType"],
          required: false,
        },
      ],
      order: [["eventDate", "ASC"]],
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Error fetching calendar events" });
  }
});

// Get statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    await runScheduleAutomation();

    const total = await CalendarEvent.count();
    const renewals = await CalendarEvent.count({
      where: { eventType: "INSURANCE_RENEWAL" },
    });
    const maintenance = await CalendarEvent.count({
      where: { eventType: "MAINTENANCE_DUE" },
    });
    const expiry = await CalendarEvent.count({
      where: { eventType: "LICENSE_EXPIRY" },
    });
    const audit = await CalendarEvent.count({
      where: { eventType: "AUDIT_SCHEDULE" },
    });
    const critical = await CalendarEvent.count({
      where: { isCritical: true, isResolved: false },
    });

    res.status(200).json({
      total,
      renewals,
      maintenance,
      expiry,
      audit,
      critical,
    });
  } catch (error) {
    console.error("Error fetching calendar stats:", error);
    res.status(500).json({ error: "Error fetching calendar stats" });
  }
});

// Get single event
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Event ID must be a valid number" });
    return;
  }

  try {
    const event = await CalendarEvent.findByPk(id, {
      include: [
        {
          model: Asset,
          as: "asset",
          attributes: ["id", "assetCode", "name"],
          required: false,
        },
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "docType"],
          required: false,
        },
      ],
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Error fetching event" });
  }
});

// Create new event
router.post("/new-event", async (req: Request, res: Response) => {
  const { title, eventType, eventDate, linkedAssetId, linkedDocId, isCritical = false } = req.body;

  // Validate required fields
  if (!title || !eventType || !eventDate) {
    res.status(400).json({ error: "title, eventType, and eventDate are required" });
    return;
  }

  // Validate event type
  const validTypes = ["INSURANCE_RENEWAL", "MAINTENANCE_DUE", "LICENSE_EXPIRY", "AUDIT_SCHEDULE", "LEASE_PAYMENT"];
  if (!validTypes.includes(eventType)) {
    res.status(400).json({ error: `Invalid eventType. Allowed: ${validTypes.join(", ")}` });
    return;
  }

  try {
    const event = await CalendarEvent.create({
      title: String(title).trim(),
      eventType,
      eventDate: new Date(eventDate),
      linkedAssetId: linkedAssetId ? parseId(linkedAssetId) : null,
      linkedDocId: linkedDocId ? parseId(linkedDocId) : null,
      isCritical: Boolean(isCritical),
      isResolved: false,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid asset ID or document ID" });
      return;
    }

    res.status(500).json({ error: "Error creating event" });
  }
});

// Update event
router.patch("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Event ID must be a valid number" });
    return;
  }

  const { title, eventType, eventDate, linkedAssetId, linkedDocId, isCritical, isResolved } = req.body;

  // Validate event type if provided
  if (eventType) {
    const validTypes = ["INSURANCE_RENEWAL", "MAINTENANCE_DUE", "LICENSE_EXPIRY", "AUDIT_SCHEDULE", "LEASE_PAYMENT"];
    if (!validTypes.includes(eventType)) {
      res.status(400).json({ error: `Invalid eventType. Allowed: ${validTypes.join(", ")}` });
      return;
    }
  }

  try {
    const event = await CalendarEvent.findByPk(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    await event.update({
      ...(title && { title: String(title).trim() }),
      ...(eventType && { eventType }),
      ...(eventDate && { eventDate: new Date(eventDate) }),
      ...(linkedAssetId !== undefined && { linkedAssetId: linkedAssetId ? parseId(linkedAssetId) : null }),
      ...(linkedDocId !== undefined && { linkedDocId: linkedDocId ? parseId(linkedDocId) : null }),
      ...(isCritical !== undefined && { isCritical: Boolean(isCritical) }),
      ...(isResolved !== undefined && { isResolved: Boolean(isResolved) }),
    });

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error: any) {
    console.error("Error updating event:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid asset ID or document ID" });
      return;
    }

    res.status(500).json({ error: "Error updating event" });
  }
});

// Delete event
router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Event ID must be a valid number" });
    return;
  }

  try {
    const event = await CalendarEvent.findByPk(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    await event.destroy();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Error deleting event" });
  }
});

export default router;
