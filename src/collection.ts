import { CollectionChange } from './collection-change'
import { CollectionItemKey } from './collection-item-key'
import { ReadOnlyCollection } from './readonly-collection'

export interface ICollection<T> {
    readonly getKey: (item: Readonly<T>) => CollectionItemKey
    on(event: 'change', listener: (changeEvent: CollectionChange<T>) => void): void
    addListener(event: 'change', listener: (changeEvent: CollectionChange<T>) => void): void
    removeListener(event: 'change', listener: (changeEvent: CollectionChange<T>) => void): void
    dispose(): void
    readonly count: number
    items(start?: number, end?: number): ReadonlyArray<Readonly<T>>
}

export class Collection<T> extends ReadOnlyCollection<T> {
    public override insert(item: Readonly<T> | ReadonlyArray<Readonly<T>>): void {
        return super.insert(item)
    }

    public override removeKey(key: CollectionItemKey): void {
        return super.removeKey(key)
    }

    public override removeKeys(keys: CollectionItemKey[]): void {
        return super.removeKeys(keys)
    }

    public override clear(): void {
        return super.clear()
    }

    public override pauseEvents(): void {
        return super.pauseEvents()
    }

    public override resumeEvents(): void {
        return super.resumeEvents()
    }
}
