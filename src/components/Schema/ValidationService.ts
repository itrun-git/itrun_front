import * as yup from "yup";

// Валидация логина
export const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "At least 8 characters").required("Password is required")
});

// Валидация email
export const emailSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email required"),
});

// Валидация пароля
export const passwordSchema = yup.object({
  fullName: yup.string().required("Name required"),
  password: yup
    .string()
    .required("Password required")
    .min(8, "The password must be at least 8 characters long."),
});
