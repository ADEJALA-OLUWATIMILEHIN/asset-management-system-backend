import express, { Request, Response } from "express";
import { User, Vendor } from "../models";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const staff = await Vendor.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "initials", "role", "status"],
          required: false,
        },
      ],
      order: [["fullName", "ASC"]],
    });

    res.status(200).json({ staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Error fetching staff" });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const total = await Vendor.count();
    res.status(200).json({ total });
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    res.status(500).json({ error: "Error fetching staff stats" });
  }
});

router.post("/new-staff", async (req: Request, res: Response) => {
  const { fullName, full_name, name, email,  } = req.body;
  const staffName = fullName ?? full_name ?? name;


  if (!staffName || !email) {
    res.status(400).json({ error: "fullName and email are required" });
    return;
  }

  try {
    // const user = normalizedUserId ? await User.findByPk(Number(normalizedUserId)) : null;

    // if (normalizedUserId && !user) {
    //   res.status(404).json({ error: "User not found" });
    //   return;
    // }

    const staff = await Vendor.create({
      fullName: String(staffName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: req.body.phone ?? null,
      userId: null,
    });

    res.status(201).json({
      message: "Staff/vendor created successfully",
      staff,
    });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "A staff/vendor with this email already exists" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid staff/vendor data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    console.error("Error creating staff:", error);
    res.status(500).json({ error: "Error creating staff/vendor" });
  }
});

export default router;
