export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
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
  { id: "food", name: "Food & Drinks", emoji: "🍔", description: "Campus meals, snacks, smoothies & drinks" },
  { id: "fashion", name: "Fashion & Wears", emoji: "👟", description: "Clothing, thrift shoes, watches & bags" },
  { id: "electronics", name: "Tech & Gadgets", emoji: "💻", description: "Laptops, phones, chargers, power banks" },
  { id: "beauty", name: "Beauty & Grooming", emoji: "💄", description: "Hair care, skincare, perfumes, barbering" },
  { id: "academic-services", name: "Academic & Books", emoji: "📚", description: "Textbooks, medical notes, lab coats" },
  { id: "printing", name: "Printing & Design", emoji: "00", description: "Photocopying, flyers, graphic design" },
  { id: "photography", name: "Photography & Media", emoji: "📷", description: "Event coverage, portraits, editing" },
  { id: "other", name: "Other Services", emoji: "✨", description: "Room accessories, delivery & errands" },
];

export interface SampleBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  owner: string;
  productsCount: number;
  location: string;
}

export const sampleBusinesses: SampleBusiness[] = [
  {
    id: "1",
    name: "UHAS Bites & Grill",
    category: "food",
    rating: 4.9,
    description: "Crispy fried rice, jollof, grilled chicken, and fresh fruit juices delivered right to your hostel door.",
    owner: "Kofi Asante",
    productsCount: 8,
    location: "Sokode Main Campus",
  },
  {
    id: "2",
    name: "Campus Thrift & Kicks",
    category: "fashion",
    rating: 4.8,
    description: "Affordable sneakers, vintage tees, and quality campus hoodies tailored for medical & science students.",
    owner: "Ama Serwaa",
    productsCount: 14,
    location: "Trafalgar Campus",
  },
  {
    id: "3",
    name: "DocTech Gadgets",
    category: "electronics",
    rating: 5.0,
    description: "Reliable iPhone chargers, laptop repairs, flash drives, OTG adapters, and power banks on campus.",
    owner: "David Selorm",
    productsCount: 19,
    location: "Dave Campus",
  },
];
