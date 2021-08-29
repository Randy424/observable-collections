import { ICollection } from './collection'
import { CollectionChange } from './collection-change'
import { CollectionEmitter } from './collection-emitter'
import { CollectionItemKey } from './collection-item-key'

export type SortFn<T> = (lhs: Readonly<T>, rhs: Readonly<T>) => number

export class SortedCollection<T> extends CollectionEmitter<T> implements ICollection<T> {
    private sortedItems?: T[]

    public readonly getKey: (item: Readonly<T>) => CollectionItemKey

    constructor(private readonly source: ICollection<T>, private sortFn?: SortFn<T>, debounce?: number) {
        super(debounce)
        this.getKey = source.getKey
        this.handleChange = this.handleChange.bind(this)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        source.addListener('change', this.handleChange)
        if (sortFn) {
            this.sortedItems = [...this.source.items()]
            this.sortedItems.sort(this.sortFn)
        }
    }

    public override dispose(): void {
        super.dispose()
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.source.removeListener('change', this.handleChange)
    }

    public override get count(): number {
        if (this.sortedItems) {
            return this.sortedItems.length
        } else {
            return this.source.count
        }
    }

    public items(start?: number, end?: number): ReadonlyArray<Readonly<T>> {
        if (this.sortedItems) {
            if (start !== undefined) {
                return this.sortedItems.slice(start, end)
            } else {
                return this.sortedItems
            }
        } else {
            return this.source.items(start, end)
        }
    }

    public setSort(sortFn?: SortFn<T>): void {
        if (this.sortFn === sortFn) return
        this.sortFn = sortFn
        if (this.sortFn) {
            if (!this.sortedItems) this.sortedItems = [...this.source.items()]
            this.sortedItems.sort(this.sortFn)
            this.orderedEvent()
        } else {
            this.sortedItems = undefined
            this.orderedEvent()
        }
    }

    private handleChange(change: CollectionChange<T>): void {
        const sourceItems = this.source.items()
        if (this.sortedItems) {
            this.sortedItems = Object.values(sourceItems)
            this.sortedItems.sort(this.sortFn)
        }
        this.emit('change', { ...change, ordered: true })
    }
}
