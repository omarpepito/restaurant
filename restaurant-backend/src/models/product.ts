export interface Modifier {
    id: string;
    name: string;
    options: string[];
    required: boolean;
    maxSelect?: number;
}

export interface Product {
    id: string;
    name: string;
    price: number; // in cents
    modifiers?: Modifier[];
}