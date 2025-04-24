import toast from "react-hot-toast";

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
  });
}
