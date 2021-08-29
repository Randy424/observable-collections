import { ICollection } from './collection'
import { CollectionEmitter } from './collection-emitter'
import { CollectionItemKey } from './collection-item-key'

export class PagedCollection<T> extends CollectionEmitter<T> implements ICollection<T> {
    private pagedItems: ReadonlyArray<Readonly<T>> = []

    public readonly getKey: (item: Readonly<T>) => CollectionItemKey

    constructor(
        private readonly source: ICollection<T>,
        private page: number,
        private pageSize: number,
        debounce?: number
    ) {
        super(debounce)
        this.getKey = source.getKey
        this.handleChange = this.handleChange.bind(this)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        source.addListener('change', this.handleChange)
        this.paginate()
    }

    public override dispose(): void {
        super.dispose()
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.source.removeListener('change', this.handleChange)
    }

    public override get count(): number {
        return this.pagedItems.length
    }

    public items(start?: number, end?: number): ReadonlyArray<Readonly<T>> {
        return this.pagedItems.slice(start, end)
    }

    public setPage(page: number, pageSize: number): void {
        if (this.page === page && this.pageSize === pageSize) return
        this.page = page
        this.pageSize = pageSize
        this.paginate()
    }

    public paginate(): void {
        const startIndex = (this.page - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize
        this.pagedItems = this.source.items(startIndex, endIndex)
        this.orderedEvent()
    }

    private handleChange() {
        this.paginate()
    }
}
