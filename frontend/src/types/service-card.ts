export type CardType = "text" | "image" | "chart" | "options";

export type ServiceCard = {
  id: string;
  title: string;

  type: CardType;

  // content (optional based on type)
  desc?: string;
  imageSrc?: string;
  chartData?: unknown;
  options?: string[];

  // styling
  color: string;
  border: string;
};
