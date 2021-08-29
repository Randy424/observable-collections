import { Collection, collectionChange, CollectionChange, PagedCollection } from '../src'

describe('paged collection', () => {
    test('pages items', () => {
        const source = new Collection<number>((n) => n.toString())
        for (let i = 1; i <= 9; i++) source.insert(i)

        const paged = new PagedCollection(source, 1, 3)
        expect(paged.count).toEqual(3)
        expect(paged.items()).toEqual([1, 2, 3])

        const pagedChange = jest.fn<void, [CollectionChange<number>]>()
        paged.on('change', pagedChange)

        paged.setPage(2, 3)
        expect(paged.count).toEqual(3)
        expect(paged.items()).toEqual([4, 5, 6])
        expect(pagedChange).toHaveBeenCalledWith(collectionChange({ ordered: true }))
        pagedChange.mockReset()

        paged.setPage(3, 2)
        expect(paged.count).toEqual(2)
        expect(paged.items()).toEqual([5, 6])
        expect(pagedChange).toHaveBeenCalledWith(collectionChange({ ordered: true }))
        pagedChange.mockReset()

        paged.setPage(5, 2)
        expect(paged.count).toEqual(1)
        expect(paged.items()).toEqual([9])
        expect(pagedChange).toHaveBeenCalledWith(collectionChange({ ordered: true }))
        pagedChange.mockReset()

        paged.setPage(5, 2)
        expect(paged.count).toEqual(1)
        expect(paged.items()).toEqual([9])
        expect(pagedChange).not.toHaveBeenCalled()

        paged.dispose()
    })
})
