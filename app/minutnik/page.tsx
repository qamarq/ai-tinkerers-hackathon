import type { Metadata } from "next";
import { MinutnikApp } from "./_components/MinutnikApp";

export const metadata: Metadata = {
  title: "Minutnik - AR Cooking Timer",
  description: "Place cooking timers on your live camera feed with AR tracking",
};

export default function MinutnikPage() {
  return <MinutnikApp />;
}
