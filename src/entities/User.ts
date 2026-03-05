export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  business_id: string;
  createdAt: Date;
}
