import express, { Request, Response } from "express";
import { Department, User } from "../models";

const router = express.Router();

const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "VIEWER"];
const allowedStatuses = ["ACTIVE", "PENDING", "DEACTIVATED"];

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "branch_location"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.post("/new-user", async (req: Request, res: Response) => {
  const {
    name,
    email,
    avatar_url,
    initials,
    role,
    department_id,
    departmentId,
    status,
    two_fa_enabled,
    security_clearance,
    last_login_at
  } = req.body;

  if (!name || !email || !initials) {
    res.status(400).json({ error: "Name, email, and initials are required" });
    return;
  }

  const normalizedRole = typeof role === "string" ? role.toUpperCase() : role;
  const normalizedStatus =
    typeof status === "string" ? status.toUpperCase() : status;

  if (normalizedRole && !allowedRoles.includes(normalizedRole)) {
    res.status(400).json({
      error: "Invalid role",
      allowed: allowedRoles.map((item) => item.toLowerCase()),
    });
    return;
  }

  if (normalizedStatus && !allowedStatuses.includes(normalizedStatus)) {
    res.status(400).json({
      error: "Invalid status",
      allowed: allowedStatuses.map((item) => item.toLowerCase()),
    });
    return;
  }

  const requestedDepartmentId = department_id ?? departmentId;
  const normalizedDepartmentId =
    requestedDepartmentId === undefined ||
    requestedDepartmentId === null ||
    requestedDepartmentId === ""
      ? null
      : Number(requestedDepartmentId);

  if (
    normalizedDepartmentId !== null &&
    (!Number.isInteger(normalizedDepartmentId) || normalizedDepartmentId < 1)
  ) {
    res.status(400).json({ error: "department_id must be a valid department id" });
    return;
  }

  try {
    if (normalizedDepartmentId !== null) {
      const department = await Department.findByPk(normalizedDepartmentId);

      if (!department) {
        res.status(400).json({
          error: "Department not found",
          message: "Create the department first, then use its id as department_id.",
        });
        return;
      }
    }

    const newUser = await User.create({
      name,
      email,
      avatar_url,
      initials,
      role: normalizedRole,
      department_id: normalizedDepartmentId,
      status: normalizedStatus,
      two_fa_enabled,            
      security_clearance,
      last_login_at
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        error: "Invalid user data",
        details: error.errors?.map((item: any) => item.message),
      });
      return;
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({ error: "Invalid department_id" });
      return;
    }

    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

export default router;
