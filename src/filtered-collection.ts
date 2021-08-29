/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventEmitter } from 'stream'
import { Collection, ICollection } from './collection'
import { CollectionChange } from './collection-change'
import { CollectionItemKey } from './collection-item-key'

export type FilterFn<T> = (item: T) => boolean

export class FilteredCollection<T> extends EventEmitter implements ICollection<T> {
    private filteredCollection: Collection<T> | undefined

    public readonly getKey: (item: Readonly<T>) => CollectionItemKey
    private filterFn?: (item: T) => boolean

    constructor(private source: ICollection<T>, filterFn?: (item: T) => boolean, private readonly debounce?: number) {
        super()
        this.getKey = source.getKey
        this.handleChange = this.handleChange.bind(this)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        source.addListener('change', this.handleChange)
        this.filteredCollectionChange = this.filteredCollectionChange.bind(this)
        this.setFilter(filterFn)
    }

    public dispose(): void {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.source.removeListener('change', this.handleChange)
    }

    public get count(): number {
        if (this.filteredCollection) {
            return this.filteredCollection.count
        } else {
            return this.source.count
        }
    }

    public items(start?: number, end?: number): ReadonlyArray<Readonly<T>> {
        if (this.filteredCollection) {
            return this.filteredCollection.items(start, end)
        } else {
            return this.source.items(start, end)
        }
    }

    public setFilter(filterFn?: (item: T) => boolean): void {
        if (this.filterFn === filterFn) return
        this.filterFn = filterFn
        if (filterFn) {
            if (!this.filteredCollection) {
                this.filteredCollection = new Collection<T>(this.getKey, this.debounce)
                const sourceItems = this.source.items()
                this.filteredCollection.insert(sourceItems)
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.filteredCollection.addListener('change', this.filteredCollectionChange)
            }
            this.filteredCollection.pauseEvents()
            for (const item of this.source.items()) {
                if (filterFn(item)) {
                    this.filteredCollection.insert(item)
                } else {
                    this.filteredCollection.removeKey(this.getKey(item))
                }
            }
            this.filteredCollection.resumeEvents()
        } else {
            /* istanbul ignore else */
            if (this.filteredCollection) {
                /* istanbul ignore else */
                if (this.source.count !== this.filteredCollection.count) {
                    const change: CollectionChange<T> = {
                        addedCount: 0,
                        updatedCount: 0,
                        removedCount: 0,
                        added: {},
                    }
                    const sourceItems = this.source.items()
                    for (const item of sourceItems) {
                        const key = this.getKey(item)
                        if (!this.filteredCollection.includesKey(key)) {
                            change.addedCount++
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            change.added![key] = item
                        }
                    }
                    this.emit('change', change)
                }
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.filteredCollection.removeListener('change', this.filteredCollectionChange)
                this.filteredCollection = undefined
            }
        }
    }

    private handleChange(change: CollectionChange<T>) {
        if (!this.filteredCollection || !this.filterFn) {
            this.emit('change', change)
        } else {
            this.filteredCollection.pauseEvents()

            for (const key in change.added) {
                const item = change.added[key]
                if (this.filterFn(item!)) {
                    this.filteredCollection.insert(item!)
                } else {
                    this.filteredCollection.removeKey(key)
                }
            }

            for (const key in change.updated) {
                const item = change.updated[key]
                if (this.filterFn(item!)) {
                    this.filteredCollection.insert(item!)
                } else {
                    this.filteredCollection.removeKey(key)
                }
            }

            if (change.removed) {
                this.filteredCollection.removeKeys(Object.keys(change.removed))
            }

            this.filteredCollection.resumeEvents()
        }
    }

    private filteredCollectionChange(change: CollectionChange<T>) {
        this.emit('change', change)
    }
}
