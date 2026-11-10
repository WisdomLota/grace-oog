import type { Metadata } from "next";
import { OperatorApp } from "@/components/operator/OperatorApp";

export const metadata: Metadata = { title: "Grace — Operator" };

export default function OperatorPage() {
  return <OperatorApp />;
}
