import { isFidarException } from "fidar-web-sdk";
import { toast } from "@/hooks/use-toast";

export function handleFidarError(error, t) {
  console.error("[FIDAR-UI-ERROR]", error);

  // Not Fidar error → generic toast
  if (!isFidarException(error)) {
    toast({
      variant: "destructive",
      title: t("errors.genericTitle"),
      description: t("errors.genericMessage"),
    });
    return;
  }

  const payload = error.payload;
  const code = payload.code;
  const message = payload.message;
  const details = payload.details;

  switch (code) {
    case "network_error":
      toast({
        variant: "destructive",
        title: t("errors.networkTitle"),
        description: t("errors.networkMessage"),
      });
      break;

    case "invalid_request":
      toast({
        variant: "destructive",
        title: t("errors.invalidRequestTitle"),
        description: details?.[0]?.issue || message,
      });
      break;

    case "auth_error":
      toast({
        variant: "destructive",
        title: t("errors.authTitle"),
        description: t("errors.authMessage"),
      });
      break;

    case "not_found":
      toast({
        variant: "destructive",
        title: t("errors.notFoundTitle"),
        description: t("errors.notFoundMessage"),
      });
      break;

    case "expired":
      toast({
        variant: "destructive",
        title: t("errors.expiredTitle"),
        description: t("errors.expiredMessage"),
      });
      break;

    case "server_error":
      toast({
        variant: "destructive",
        title: t("errors.serverTitle"),
        description: t("errors.serverMessage"),
      });
      break;

    default:
      toast({
        variant: "destructive",
        title: t("errors.unknownTitle"),
        description: message,
      });
  }
}
