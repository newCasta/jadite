export interface JADDocument {
    [k: string]: any
    id: string
    createdAt: Date
    updatedAt: Date
}

export type InsertItem<I> = Omit<I, 'id' | 'createdAt' | 'updatedAt'>

type JADFilter<T> = {
    [P in keyof T]?: T[P]
}
