import { readFile, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { InsertItem, JADCollectionItem } from '../types/Collection.js'
import { JADDatabaseData } from '../types/Database.js'

export default class JADCollection<
    I extends JADCollectionItem = JADCollectionItem
> {
    #filePath: string
    #name: string

    static async #getData<I extends JADCollectionItem>(filePath: string) {
        const fileData = await readFile(filePath, { encoding: 'utf-8' })
        const DBData: JADDatabaseData<I> = JSON.parse(fileData)

        return DBData
    }

    static async #setData<I extends JADCollectionItem>(
        filePath: string,
        data: JADDatabaseData<I>
    ) {
        const fileData = JSON.stringify(data, null, 4)

        await writeFile(filePath, fileData)
    }

    static #matches<T, K extends keyof T>(query: Pick<T, K>, data: T) {
        for (const [k, v] of Object.entries(query))
            if (data[k as K] !== v) return false

        return true
    }

    constructor(filePath: string, name: string) {
        this.#filePath = filePath
        this.#name = name
    }

    async find<K extends keyof I>(query?: Pick<I, K>) {
        const data = await JADCollection.#getData<I>(this.#filePath)

        if (!query) return data[this.#name]

        const items = data[this.#name]
            .filter(i => JADCollection.#matches(query, i))
            .map(i => {
                const item: typeof i = {
                    ...i,
                    createdAt: new Date(i.createdAt),
                    updatedAt: new Date(i.updatedAt)
                }

                return item
            })

        return items
    }

    async findOne<K extends keyof I>(query: Pick<I, K>) {
        const data = await this.find()

        if (!query) return undefined

        const item = data.find(i => JADCollection.#matches(query, i))

        return item
    }

    async insertOne(itemData: InsertItem<I>) {
        const data = await JADCollection.#getData<I>(this.#filePath)

        const item = {
            id: randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...itemData
        }

        data[this.#name].push(item as I)

        await JADCollection.#setData(this.#filePath, data)

        return item as I
    }

    async insertMany(itemsData: Array<InsertItem<I>>) {
        const data = await JADCollection.#getData<I>(this.#filePath)

        const items: Array<I> = []

        for (const itemData of itemsData) {
            const item = {
                id: randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                ...itemData
            }

            items.push(item as I)
            data[this.#name].push(item as I)
        }

        await JADCollection.#setData(this.#filePath, data)

        return items
    }

    async updateOne<K extends keyof I, O extends keyof InsertItem<I>>(
        query: Pick<I, K>,
        values: Pick<InsertItem<I>, O>
    ) {
        if (!query) throw Error('Query must be assigned')

        const data = await JADCollection.#getData<I>(this.#filePath)
        const items = await this.find()
        const item = await this.findOne(query)

        if (!!item) {
            const newItem: I = {
                ...item,
                ...values,
                updatedAt: new Date()
            }

            Object.assign(item, newItem)

            data[this.#name] = items.map(i =>
                JADCollection.#matches(query, i) ? newItem : i
            )

            await JADCollection.#setData(this.#filePath, data)

            return newItem
        }
    }

    async updateMany<K extends keyof I, O extends keyof InsertItem<I>>(
        query: Pick<I, K>,
        valuesData: Array<Pick<InsertItem<I>, O>>
    ) {
        if (!query) throw Error('Query must be assigned')

        const data = await JADCollection.#getData<I>(this.#filePath)
        const items = await this.find()
        const newItems: Array<I> = []

        for (const values of valuesData) {
            const item = await this.findOne(query)

            if (!!item) {
                const newItem: I = {
                    ...item,
                    ...values,
                    updatedAt: new Date()
                }

                newItems.push(newItem)
                Object.assign(item, newItem)

                data[this.#name] = items.map(i =>
                    JADCollection.#matches(query, i) ? newItem : i
                )
            }
        }

        await JADCollection.#setData(this.#filePath, data)

        return newItems
    }

    async deleteOne<K extends keyof I>(query: Pick<I, K>) {
        if (!query) throw Error('Query must be assigned')

        const data = await JADCollection.#getData<I>(this.#filePath)
        const items = await this.find()
        const item = await this.findOne(query)

        if (!!item) {
            data[this.#name] = items.filter(i => i.id !== item.id)
        }

        await JADCollection.#setData(this.#filePath, data)
    }

    async deleteMany<K extends keyof I>(query: Pick<I, K>) {
        if (!query) throw Error('Query must be assigned')

        const data = await JADCollection.#getData<I>(this.#filePath)
        const items = await this.find()

        data[this.#name] = items.filter(i => !JADCollection.#matches(query, i))

        await JADCollection.#setData(this.#filePath, data)
    }
}
