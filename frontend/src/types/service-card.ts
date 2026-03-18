export type ServiceCard = {
  id: string
  title: string
  type: "image" | "chart" | "options" | "text"
  desc?: string
  imageSrc?: string
  options?: string[]
  color: string
  border: string
}