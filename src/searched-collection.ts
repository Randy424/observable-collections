/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICollection } from './collection'
import { CollectionChange } from './collection-change'
import { CollectionEmitter } from './collection-emitter'
import { CollectionItemKey } from './collection-item-key'

export type SearchFn<T> = (item: T, searchString: string) => number

export class SearchedCollection<T> extends CollectionEmitter<T> implements ICollection<T> {
    private resultMap?: Record<CollectionItemKey, { score: number; item: T }>
    private results?: T[]

    public readonly getKey: (item: Readonly<T>) => CollectionItemKey

    constructor(
        private readonly source: ICollection<T>,
        private searchFn?: SearchFn<T>,
        private searchString?: string,
        debounce?: number
    ) {
        super(debounce)
        this.getKey = source.getKey
        this.handleChange = this.handleChange.bind(this)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        source.addListener('change', this.handleChange)
        this.search()
    }

    public override dispose(): void {
        super.dispose()
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.source.removeListener('change', this.handleChange)
    }

    public override get count(): number {
        if (this.resultMap !== undefined) {
            /* istanbul ignore else */
            if (!this.results)
                this.results = Object.values(this.resultMap)
                    .sort((l, r) => l.score - r.score)
                    .map((result) => result.item)
            return this.results.length
        } else {
            return this.source.count
        }
    }

    public items(start?: number, end?: number): ReadonlyArray<Readonly<T>> {
        if (this.resultMap !== undefined) {
            /* istanbul ignore else */
            if (!this.results)
                this.results = Object.values(this.resultMap)
                    .sort((l, r) => l.score - r.score)
                    .map((result) => result.item)
            if (start !== undefined) {
                return this.results.slice(start, end)
            } else {
                return this.results
            }
        } else {
            return this.source.items(start, end)
        }
    }

    public setSearch(searchString?: string): void {
        if (this.searchString === searchString) return
        this.searchString = searchString
        this.search()
    }

    public setSearchFn(searchFn?: SearchFn<T>): void {
        if (this.searchFn === searchFn) return
        this.searchFn = searchFn
        this.search()
    }

    private search() {
        if (this.searchString && this.searchFn) {
            this.results = undefined
            if (!this.resultMap) {
                this.resultMap = {}
            }
            this.pauseEvents()
            const sourceItems = this.source.items()
            for (const item of sourceItems) {
                const key = this.getKey(item)
                const score = this.searchFn(item, this.searchString)
                if (this.resultMap[key]) {
                    this.updateEvent(key, item)
                } else {
                    this.addEvent(key, item)
                }
                this.resultMap[key] = { score, item: item }
            }
            this.orderedEvent()
            this.resumeEvents()
        } else {
            this.pauseEvents()
            if (this.resultMap) {
                const sourceItems = this.source.items()
                for (const item of sourceItems) {
                    const key = this.getKey(item)
                    if (!this.resultMap[key]) {
                        this.addEvent(key, item)
                    }
                }
            }
            this.results = undefined
            this.resultMap = undefined
            this.orderedEvent()
            this.resumeEvents()
        }
    }

    private handleChange(change: CollectionChange<T>) {
        if (!this.searchString || !this.searchFn) {
            this.emit('change', { ...change, ordered: true })
        } else {
            this.pauseEvents()

            this.results = []

            for (const key in change.added) {
                const item = change.added[key]
                const score = this.searchFn(item!, this.searchString)
                if (this.resultMap![key]) {
                    this.updateEvent(key, item!)
                } else {
                    this.addEvent(key, item!)
                }
                this.resultMap![key] = { score, item: item! }
            }

            for (const key in change.updated) {
                const item = change.updated[key]
                const score = this.searchFn(item!, this.searchString)
                if (this.resultMap![key]) {
                    this.updateEvent(key, item!)
                } else {
                    this.addEvent(key, item!)
                }
                this.resultMap![key] = { score, item: item! }
            }

            for (const key in change.removed) {
                if (this.resultMap![key]) {
                    const item = change.removed[key]
                    this.removeEvent(key, item!)
                }
            }

            this.orderedEvent()

            this.resumeEvents()
        }
    }
}
