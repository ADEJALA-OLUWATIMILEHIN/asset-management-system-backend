import { Op } from "sequelize";
import { CalendarEvent, Document, MaintenanceRecord } from "../models";

const EXPIRING_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDocExpiryStatus = (expiryDate?: Date | string | null) => {
  if (!expiryDate) return "PERMANENT";

  const expiry = startOfDay(new Date(expiryDate));
  if (Number.isNaN(expiry.getTime())) return "ACTIVE";

  const today = startOfDay();
  const expiringSoonLimit = new Date(today.getTime() + EXPIRING_SOON_DAYS * DAY_MS);

  if (expiry < today) return "EXPIRED";
  if (expiry <= expiringSoonLimit) return "EXPIRING_SOON";
  return "ACTIVE";
};

const getDocumentEventType = (docType: string) => {
  if (docType === "VEHICLE_INSURANCE") return "INSURANCE_RENEWAL";
  if (docType === "REAL_ESTATE_LEASE") return "LEASE_PAYMENT";
  return "LICENSE_EXPIRY";
};

export const applyDocumentExpiryStatus = (payload: Record<string, any>) => {
  if (payload.expiryDate === null) {
    payload.status = "PERMANENT";
    return payload;
  }

  if (payload.expiryDate) {
    payload.status = getDocExpiryStatus(payload.expiryDate);
  }

  return payload;
};

export const syncDocumentCalendarEvent = async (document: any) => {
  const documentId = document.id;
  const expiryDate = document.expiryDate;

  if (!expiryDate) {
    await CalendarEvent.destroy({ where: { linkedDocId: documentId } });
    return;
  }

  const status = getDocExpiryStatus(expiryDate);
  if (document.status !== status && typeof document.update === "function") {
    await document.update({ status });
  }

  const eventType = getDocumentEventType(document.docType);

  await CalendarEvent.destroy({
    where: {
      linkedDocId: documentId,
      eventType: { [Op.ne]: eventType },
    },
  });

  const titlePrefix = status === "EXPIRED" ? "Expired" : status === "EXPIRING_SOON" ? "Expiring soon" : "Expires";
  const eventPayload = {
    title: `${titlePrefix}: ${document.name}`,
    eventType,
    eventDate: new Date(expiryDate),
    linkedAssetId: document.linkedAssetId ?? null,
    linkedDocId: documentId,
    isCritical: status === "EXPIRING_SOON" || status === "EXPIRED",
    isResolved: false,
  };

  const event = await CalendarEvent.findOne({
    where: {
      linkedDocId: documentId,
      eventType,
    },
  });

  if (event) {
    await event.update(eventPayload);
  } else {
    await CalendarEvent.create(eventPayload);
  }
};

export const syncMaintenanceCalendarEvent = async (record: any) => {
  const recordId = record.id;
  const titleMarker = `#${recordId})`;

  if (!record.nextServiceDate || record.status === "COMPLETED") {
    await CalendarEvent.destroy({
      where: {
        eventType: "MAINTENANCE_DUE",
        title: { [Op.like]: `%${titleMarker}` },
      },
    });
    return;
  }

  const dueDate = startOfDay(new Date(record.nextServiceDate));
  const isOverdue = dueDate < startOfDay() || record.status === "OVERDUE";
  const eventPayload = {
    title: `Maintenance due: ${record.maintenanceType} (#${recordId})`,
    eventType: "MAINTENANCE_DUE",
    eventDate: new Date(record.nextServiceDate),
    linkedAssetId: record.assetId,
    linkedDocId: null,
    isCritical: isOverdue,
    isResolved: record.status === "COMPLETED",
  };

  const event = await CalendarEvent.findOne({
    where: {
      eventType: "MAINTENANCE_DUE",
      title: { [Op.like]: `%${titleMarker}` },
    },
  });

  if (event) {
    await event.update(eventPayload);
  } else {
    await CalendarEvent.create(eventPayload);
  }
};

export const runDocumentExpirySweep = async () => {
  const documents = await Document.findAll();

  await Promise.all(
    documents.map(async (document: any) => {
      const nextStatus = getDocExpiryStatus(document.expiryDate);
      if (document.status !== nextStatus) {
        await document.update({ status: nextStatus });
      }
      await syncDocumentCalendarEvent(document);
    })
  );
};

export const runMaintenanceSweep = async () => {
  const records = await MaintenanceRecord.findAll();
  const today = startOfDay();

  await Promise.all(
    records.map(async (record: any) => {
      if (record.nextServiceDate && record.status !== "COMPLETED") {
        const nextServiceDate = startOfDay(new Date(record.nextServiceDate));
        if (nextServiceDate < today && record.status !== "OVERDUE") {
          await record.update({ status: "OVERDUE" });
        }
      }

      await syncMaintenanceCalendarEvent(record);
    })
  );
};

export const runScheduleAutomation = async () => {
  await runDocumentExpirySweep();
  await runMaintenanceSweep();
};

export const startScheduleAutomation = () => {
  void runScheduleAutomation().catch((error) => {
    console.error("Schedule automation failed:", error);
  });

  setInterval(() => {
    void runScheduleAutomation().catch((error) => {
      console.error("Schedule automation failed:", error);
    });
  }, DAY_MS);
};
