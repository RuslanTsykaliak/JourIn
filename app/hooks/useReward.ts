import { toast } from "sonner";

export const useReward = () => {
  const showReward = (message: string) => {
    toast.success(message);
  };

  return { showReward };
};