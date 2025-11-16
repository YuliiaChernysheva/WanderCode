import axios from "axios";
import type { Category } from "@/types/story";

export async function getCategories(): Promise<Category[]> {
  const { data } = await axios.get("/api/categories");
  return data;
}
