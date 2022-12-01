import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import JADDatabase from './Database.js'

export default class JADClient {
    #path: string

    static async #createDB(path: string, name: string) {
        if (!existsSync(path)) {
            await mkdir(path)

            const pathFile = join(path, name)

            await writeFile(pathFile, '{}')
        }
    }

    constructor(path: string) {
        this.#path = path
    }

    async database(name: string) {
        const path = join(process.cwd(), this.#path)
        const filename = `${name}.db.json`
        const filePath = join(path, filename)

        await JADClient.#createDB(path, filename)

        return new JADDatabase(filePath)
    }
}
