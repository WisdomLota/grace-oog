import type { Metadata } from "next";
import { OutputScreen } from "@/components/output/OutputScreen";

export const metadata: Metadata = { title: "Grace — Output" };

export default function OutputPage() {
  return <OutputScreen />;
}
