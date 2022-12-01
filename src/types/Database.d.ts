import { JADCollectionItem } from './Collection.js'

export interface JADDatabaseData<T extends JADCollectionItem> {
    [k: string]: Array<T>
}
