import toast from "react-hot-toast";

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
  });
}
