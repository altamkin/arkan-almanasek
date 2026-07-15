import { z } from "zod";

type TranslationFn = (key: string) => string;

export function luhnCheck(digits: string) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidExpiryMMYY(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const year = 2000 + Number(match[2]);
  const month = Number(match[1]);
  const now = new Date();
  const expiry = new Date(year, month, 0, 23, 59, 59);
  return expiry >= now;
}

export function isValidISODate(value: string) {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value.trim());
  if (!match) return false;
  const [year, month, day] = value.split("-").map(Number);
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}

export function createCardPaymentSchema(t: TranslationFn) {
  return z.object({
    method: z.literal("card"),
    cardholder: z
      .string()
      .trim()
      .min(2, t("validation.cardholderRequired")),
    cardNumber: z
      .string()
      .trim()
      .min(12, t("validation.cardNumberInvalid"))
      .transform((v) => v.replace(/\s+/g, ""))
      .refine((digits) => /^\d{12,19}$/.test(digits), t("validation.cardNumberInvalid"))
      .refine((digits) => luhnCheck(digits), t("validation.cardNumberLuhnInvalid")),
    expiry: z
      .string()
      .trim()
      .min(1, t("validation.expiryRequired"))
      .refine((v) => isValidExpiryMMYY(v), t("validation.expiryInvalid")),
    cvc: z
      .string()
      .trim()
      .min(3, t("validation.cvcInvalid"))
      .refine((v) => /^\d{3,4}$/.test(v), t("validation.cvcInvalid")),
  });
}

export function createBankPaymentSchema(t: TranslationFn) {
  const receiptSchema = z
    .instanceof(File, { message: t("validation.receiptRequired") })
    .refine(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        f.type === "",
      t("validation.receiptTypeInvalid"),
    )
    .refine((f) => f.size <= 10 * 1024 * 1024, t("validation.receiptSizeTooLarge"));

  return z.object({
    method: z.literal("bank"),
    receipt: receiptSchema,
  });
}

export function createPaymentSchema(t: TranslationFn) {
  return z.discriminatedUnion("method", [
    createCardPaymentSchema(t),
    createBankPaymentSchema(t),
  ]);
}

export function createPhoneCountrySchema(
  t: TranslationFn,
  allowedValues: readonly string[],
) {
  return z
    .string()
    .trim()
    .min(1, t("validation.phoneCountryRequired"))
    .refine(
      (v) => allowedValues.includes(v),
      t("validation.phoneCountryRequired"),
    );
}

export function createCountrySchema(
  t: TranslationFn,
  allowedValues: readonly string[],
) {
  return z
    .string()
    .trim()
    .min(1, t("validation.countryRequired"))
    .refine((v) => allowedValues.includes(v), t("validation.countryRequired"));
}

export function createOptionalEmailSchema(t: TranslationFn) {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => v == null || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      t("validation.emailInvalid"),
    );
}

export function createBirthDateSchema(t: TranslationFn) {
  return z
    .string()
    .trim()
    .min(1, t("validation.birthDateRequired"))
    .refine((v) => isValidISODate(v), t("validation.birthDateInvalid"));
}
