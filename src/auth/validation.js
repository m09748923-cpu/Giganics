import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters."),

    email: z
      .string()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain one uppercase letter.")
      .regex(/[a-z]/, "Password must contain one lowercase letter.")
      .regex(/[0-9]/, "Password must contain one number."),

    confirmPassword: z.string(),

    role: z.enum(["student", "teacher"], {
      errorMap: () => ({
        message: "Please choose your role.",
      }),
    }),

    terms: z.literal(true, {
      errorMap: () => ({
        message: "Please accept Terms & Privacy Policy.",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });