import { isAxiosError } from "axios";
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    return (
      data?.response?.message ||
      data?.message ||
      data?.error ||
      "Request failed. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}
