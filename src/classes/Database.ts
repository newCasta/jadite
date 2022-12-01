import { readFile, writeFile } from 'fs/promises'
import { JADDocument } from '../types/Collection.js'
import { JADDatabaseData } from '../types/Database.js'
import JADCollection from './Collection.js'

export default class JADDatabase {
    #filePath: string

    async #getData<T extends JADDocument>(filePath: string) {
        const fileData = await readFile(filePath, { encoding: 'utf-8' })
        const DBData: JADDatabaseData<T> = JSON.parse(fileData)

        return DBData
    }

    constructor(filePath: string) {
        this.#filePath = filePath
    }

    async collection<TSchema extends JADDocument = JADDocument>(name: string) {
        const data = await this.#getData<TSchema>(this.#filePath)
        if (!data[name]) {
            data[name] = []

            await writeFile(this.#filePath, JSON.stringify(data, null, 4), {
                encoding: 'utf-8'
            })
        }

        return new JADCollection<TSchema>(this.#filePath, name)
    }
}
