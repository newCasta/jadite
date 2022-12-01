import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import JADDatabase from './Database.js'

export default class JADClient {
    #path: string

    async #createDB(path: string, name: string) {
        const pathFile = join(path, name)

        if (!existsSync(path)) await mkdir(path)

        const data = await readFile(pathFile, { encoding: 'utf-8' })

        if (!data) await writeFile(pathFile, '{}', { encoding: 'utf-8' })
    }

    constructor(path: string) {
        this.#path = path
    }

    async database(name: string) {
        const path = join(process.cwd(), this.#path)
        const filename = `${name}.db.json`
        const filePath = join(path, filename)

        await this.#createDB(path, filename)

        return new JADDatabase(filePath)
    }
}
