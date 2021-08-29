import { Collection, FilteredCollection, PagedCollection, SortedCollection } from '../src'

describe('e2e', () => {
    test('insert item should should propagate through pipeline', () => {
        interface ItemT {
            id: number
            name: string
        }

        const keyFn = (item: ItemT) => item.id.toString()
        const source = new Collection<ItemT>(keyFn)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const filterFn = (_item: ItemT) => true
        const filtered = new FilteredCollection(source, filterFn)

        const sortFn = (lhs: ItemT, rhs: ItemT) => lhs.name.localeCompare(rhs.name)
        const sorted = new SortedCollection(filtered, sortFn)

        const page = 1
        const pageSize = 10
        const paged = new PagedCollection(sorted, page, pageSize)

        source.insert({ id: 1, name: 'One' })
        expect(paged.items()).toEqual([{ id: 1, name: 'One' }])
    })
})
