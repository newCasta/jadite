import { readFile, writeFile } from 'fs/promises'
import { JADDatabaseData } from '../types/Database.js'
import JADCollection from './Collection.js'

export default class JADDatabase {
    #filePath: string

    static async #getData(filePath: string) {
        const fileData = await readFile(filePath, { encoding: 'utf-8' })
        const DBData: JADDatabaseData = JSON.parse(fileData)

        return DBData
    }

    constructor(filePath: string) {
        this.#filePath = filePath
    }

    async collection(name: string) {
        const data = await JADDatabase.#getData(this.#filePath)

        if (!!data[name]) return new JADCollection(this.#filePath, name)

        data[name] = []

        await writeFile(this.#filePath, JSON.stringify(data))

        return new JADCollection(this.#filePath, name)
    }
}
