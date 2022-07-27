
export function btoa(str: string): string {
  return Buffer.from(str).toString("base64");
}
