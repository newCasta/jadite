import { readFile, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { InsertItem, JADDocument, JADFilter } from '../types/Collection.js'
import { JADDatabaseData } from '../types/Database.js'

export default class JADCollection<TSchema extends JADDocument = JADDocument> {
    #filePath: string
    #name: string

    async #getData() {
        const fileData = await readFile(this.#filePath, { encoding: 'utf-8' })
        const DBData: JADDatabaseData<TSchema> = JSON.parse(fileData)

        return DBData
    }

    async #setData(data: JADDatabaseData<TSchema>) {
        const fileData = JSON.stringify(data, null, 4)

        await writeFile(this.#filePath, fileData, { encoding: 'utf-8' })
    }

    static #matches<T, K extends keyof T>(query: JADFilter<T>, data: T) {
        for (const [k, v] of Object.entries(query))
            if (data[k as K] !== v) return false

        return true
    }

    constructor(filePath: string, name: string) {
        this.#filePath = filePath
        this.#name = name
    }

    async find(query?: JADFilter<TSchema>) {
        const data = await this.#getData()

        if (!query) return data[this.#name]

        const items = data[this.#name]
            .filter(i => JADCollection.#matches(query, i))
            .map(i => {
                const item = {
                    ...i,
                    createdAt: new Date(i.createdAt),
                    updatedAt: new Date(i.updatedAt)
                }

                return item
            })

        return items
    }

    async findOne(query: JADFilter<TSchema>) {
        const data = await this.find()

        if (!query) return undefined

        const item = data.find(i => JADCollection.#matches(query, i))

        if (!item) return undefined

        item.createdAt = new Date(item?.createdAt)
        item.updatedAt = new Date(item?.updatedAt)

        return item
    }

    async insertOne(itemData: InsertItem<TSchema>) {
        const data = await this.#getData()

        const item = {
            id: randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...itemData
        }

        data[this.#name].push(item as unknown as TSchema)

        await this.#setData(data)

        return item as unknown as TSchema
    }

    async insertMany(itemsData: Array<InsertItem<TSchema>>) {
        const data = await this.#getData()

        const items: Array<TSchema> = []

        for (const itemData of itemsData) {
            const item = {
                id: randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                ...itemData
            }

            items.push(item as unknown as TSchema)
            data[this.#name].push(item as unknown as TSchema)
        }

        await this.#setData(data)

        return items
    }

    async updateOne<O extends keyof InsertItem<TSchema>>(
        query: JADFilter<TSchema>,
        values: Pick<InsertItem<TSchema>, O>
    ) {
        if (!query) throw Error('Query must be assigned')

        const data = await this.#getData()
        const items = await this.find()
        const item = await this.findOne(query)

        if (!!item) {
            const newItem: TSchema = {
                ...item,
                ...values,
                updatedAt: new Date()
            }

            Object.assign(item, newItem)

            data[this.#name] = items.map(i =>
                JADCollection.#matches(query, i) ? newItem : i
            )

            await this.#setData(data)

            return newItem
        }
    }

    async updateMany<O extends keyof InsertItem<TSchema>>(
        query: JADFilter<TSchema>,
        valuesData: Array<Pick<InsertItem<TSchema>, O>>
    ) {
        if (!query) throw Error('Query must be assigned')

        const data = await this.#getData()
        const items = await this.find()
        const newItems: Array<TSchema> = []

        for (const values of valuesData) {
            const item = await this.findOne(query)

            if (!!item) {
                const newItem: TSchema = {
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

        await this.#setData(data)

        return newItems
    }

    async deleteOne(query: JADFilter<TSchema>) {
        if (!query) throw Error('Query must be assigned')

        const data = await this.#getData()
        const items = await this.find()
        const item = await this.findOne(query)

        if (!!item) {
            data[this.#name] = items.filter(i => i.id !== item.id)
        }

        await this.#setData(data)
    }

    async deleteMany(query: JADFilter<TSchema>) {
        if (!query) throw Error('Query must be assigned')

        const data = await this.#getData()
        const items = await this.find()

        data[this.#name] = items.filter(i => !JADCollection.#matches(query, i))

        await this.#setData(data)
    }
}
