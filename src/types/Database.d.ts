import { JADDocument } from './Collection.js'

export interface JADDatabaseData<T extends JADDocument> {
    [k: string]: Array<T>
}
