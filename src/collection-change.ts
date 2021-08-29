import { CollectionItemKey } from './collection-item-key'

export interface CollectionChange<T> {
    addedCount: number
    added?: Record<CollectionItemKey, T>

    updatedCount: number
    updated?: Record<CollectionItemKey, T>

    removedCount: number
    removed?: Record<CollectionItemKey, T>

    ordered?: boolean
}

export function collectionChange<T>(options: Partial<CollectionChange<T>>): CollectionChange<T> {
    return {
        ...options,
        ...{
            addedCount: options.added ? Object.keys(options.added).length : 0,
            updatedCount: options.updated ? Object.keys(options.updated).length : 0,
            removedCount: options.removed ? Object.keys(options.removed).length : 0,
        },
    }
}
