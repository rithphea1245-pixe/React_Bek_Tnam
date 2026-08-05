import { z } from "zod";

export const PASSWORD_RULES = {
  min: 8,
  max: 20,
  pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])[\s\S]{8,20}$/,
  message:
    "Password must be 8-20 characters and include an uppercase letter, a lowercase letter, a number, and a special character",
};

const httpsUrlOrEmpty = z
  .string()
  .optional()
  .refine(
    (value) => !value || /^https:\/\/.*$/.test(value),
    "Must be a valid URL starting with https://",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(PASSWORD_RULES.min, `Password must be at least ${PASSWORD_RULES.min} characters`)
    .max(PASSWORD_RULES.max, `Password must be at most ${PASSWORD_RULES.max} characters`),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(25, "Username must be at most 25 characters")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Username may only contain letters, numbers, dots, dashes and underscores",
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phoneNumber: z.string().optional(),
    address: z
      .object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        road: z.string().optional(),
        linkAddress: httpsUrlOrEmpty,
      })
      .optional(),
    profile: httpsUrlOrEmpty,
    password: z
      .string()
      .min(PASSWORD_RULES.min, `Password must be at least ${PASSWORD_RULES.min} characters`)
      .max(PASSWORD_RULES.max, `Password must be at most ${PASSWORD_RULES.max} characters`)
      .regex(PASSWORD_RULES.pattern, PASSWORD_RULES.message),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const defaultRegisterValues = {
  username: "",
  email: "",
  phoneNumber: "",
  address: {
    addressLine1: "",
    addressLine2: "",
    road: "",
    linkAddress: "",
  },
  profile: "",
  password: "",
  confirmPassword: "",
};
