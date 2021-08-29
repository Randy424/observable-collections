import { ICollection } from './collection'
import { CollectionEmitter } from './collection-emitter'
import { CollectionItemKey } from './collection-item-key'

export class ReadOnlyCollection<T> extends CollectionEmitter<T> implements ICollection<T> {
    constructor(public readonly getKey: (item: Readonly<T>) => CollectionItemKey, debounce?: number) {
        super(debounce)
    }

    protected itemMap: Record<CollectionItemKey, T> = {}

    private cachedItems: T[] | undefined

    public items(start?: number, end?: number): readonly Readonly<T>[] {
        if (!this.cachedItems) {
            this.cachedItems = Object.values(this.itemMap)
        }

        if (start !== undefined) {
            return this.cachedItems.slice(start, end)
        } else {
            return this.cachedItems
        }
    }

    public includes(item: Readonly<T>): boolean {
        const key = this.getKey(item)
        return this.itemMap[key] !== undefined
    }

    public includesKey(key: CollectionItemKey): boolean {
        return this.itemMap[key] !== undefined
    }

    protected insert(itemOrItems: Readonly<T> | ReadonlyArray<Readonly<T>>): void {
        if (Array.isArray(itemOrItems)) {
            this.pauseEvents()
            const items = itemOrItems
            for (const item of items) {
                this.insert(item)
            }
            this.resumeEvents()
        } else {
            const item = itemOrItems as Readonly<T>
            const key = this.getKey(item)
            const existing = this.itemMap[key]
            if (existing === item) return
            this.itemMap[key] = item
            if (existing) {
                this.cachedItems = undefined
                this.updateEvent(key, item)
            } else {
                this.cachedItems = undefined
                this.addEvent(key, item)
            }
        }
    }

    protected removeKey(key: CollectionItemKey): void {
        const existing = this.itemMap[key]
        if (existing === undefined) return
        delete this.itemMap[key]
        this.cachedItems = undefined
        this.removeEvent(key, existing)
    }

    protected removeKeys(keys: CollectionItemKey[]): void {
        this.pauseEvents()
        for (const key of keys) {
            this.removeKey(key)
        }
        this.resumeEvents()
    }

    protected clear(): void {
        this.removeKeys(Object.keys(this.itemMap))
    }
}
