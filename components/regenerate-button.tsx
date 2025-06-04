import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
type RegenerateProps = {
  isPending: boolean;
  disabled: boolean;
  isResendClicked: boolean;
  resendCode: () => Promise<void>;
  countdown: number;
};
export const RegenerateButton: FC<RegenerateProps> = ({
  isPending,
  isResendClicked,
  resendCode,
  countdown,
  disabled,
}) => {
  return (
    <Button
      disabled={disabled || isResendClicked}
      className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      variant={"outline"}
      onClick={resendCode}
    >
      {isPending && (
        <>
          <Loader className="mr-1 h-4 w-4 animate-spin" /> Loading...
        </>
      )}
      {!isPending && isResendClicked && (
        <>{countdown < 10 ? `00:0${countdown}` : `00:${countdown}`}</>
      )}

      {!isPending && !isResendClicked && "Resend Code"}
    </Button>
  );
};
