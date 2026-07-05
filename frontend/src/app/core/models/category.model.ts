export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryCreateDto {
  name: string;
  description: string;
}
