import {
  Utensils,
  Shirt,
  Laptop,
  Sparkles,
  BookOpen,
  Printer,
  Camera,
  Layers,
  LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface CampusLocation {
  id: string;
  name: string;
}

export const campusLocations: CampusLocation[] = [
  { id: "sokode", name: "Sokode Main Campus" },
  { id: "trafalgar", name: "Trafalgar Campus / Hospital" },
  { id: "dave", name: "Dave Campus" },
  { id: "adaklu", name: "Adaklu / Surrounding Hostels" },
  { id: "ho-town", name: "Ho Central / Town Hostels" },
];

export const categories: Category[] = [
  {
    id: "food",
    name: "Food & Drinks",
    description: "Campus meals, snacks, smoothies & drinks",
    icon: Utensils,
  },
  {
    id: "fashion",
    name: "Fashion & Wears",
    description: "Clothing, thrift shoes, watches & bags",
    icon: Shirt,
  },
  {
    id: "electronics",
    name: "Tech & Gadgets",
    description: "Laptops, phones, chargers, power banks",
    icon: Laptop,
  },
  {
    id: "beauty",
    name: "Beauty & Grooming",
    description: "Hair care, skincare, perfumes, barbering",
    icon: Sparkles,
  },
  {
    id: "academic-services",
    name: "Academic & Books",
    description: "Textbooks, medical notes, lab coats",
    icon: BookOpen,
  },
  {
    id: "printing",
    name: "Printing & Design",
    description: "Photocopying, flyers, graphic design",
    icon: Printer,
  },
  {
    id: "photography",
    name: "Photography & Media",
    description: "Event coverage, portraits, editing",
    icon: Camera,
  },
  {
    id: "other",
    name: "Other Services",
    description: "Room accessories, delivery & errands",
    icon: Layers,
  },
];

export function getCategoryIcon(categoryId: string): LucideIcon {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.icon : Layers;
}
