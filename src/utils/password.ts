import bcrypt from "bcrypt";

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h);

export const generateOrderTrackingNumber = () => {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `ORD-${timestamp}${randomDigits}`;
};
