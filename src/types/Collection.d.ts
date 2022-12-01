export interface JADCollectionItem {
    id: string
    createdAt: Date
    updatedAt: Date
}

export type InsertItem<I> = Omit<I, 'id' | 'createdAt' | 'updatedAt'>
