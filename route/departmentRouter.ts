import express, { Request, Response } from "express";
import { Department, User } from "../models";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email", "initials", "role", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Error fetching departments" });
  }
});

router.post("/new-department", async (req: Request, res: Response) => {
  const { name, branch_location, branchLocation, manager_id, managerId } = req.body;

  if (!name) {
    res.status(400).json({ error: "Department name is required" });
    return;
  }

  const requestedManagerId = manager_id ?? managerId;
  const normalizedManagerId =
    requestedManagerId === undefined || requestedManagerId === null || requestedManagerId === ""
      ? null
      : Number(requestedManagerId);

  if (
    normalizedManagerId !== null &&
    (!Number.isInteger(normalizedManagerId) || normalizedManagerId < 1)
  ) {
    res.status(400).json({ error: "manager_id must be a valid user id" });
    return;
  }

  try {
    if (normalizedManagerId !== null) {
      const manager = await User.findByPk(normalizedManagerId);

      if (!manager) {
        res.status(400).json({ error: "Manager not found" });
        return;
      }
    }

    const newDepartment = await Department.create({
      name: String(name).trim(),
      branch_location: branch_location ?? branchLocation ?? null,
      manager_id: normalizedManagerId,
    });

    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error: any) {
    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid department data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid manager_id" });
      return;
    }

    console.error("Error creating department:", error);
    res.status(500).json({ error: "Error creating department" });
  }
});

export default router;
