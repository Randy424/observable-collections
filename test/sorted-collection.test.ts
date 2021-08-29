import { Collection, collectionChange, CollectionChange, SortedCollection } from '../src'
import { TestItem, testItem1, testItem1a } from './test-item'

describe('sorted collection', () => {
    test('sorts items', () => {
        const source = new Collection<number>((n) => n.toString())
        for (let i = 1; i <= 9; i++) source.insert(i)

        const sorted = new SortedCollection(source)
        expect(sorted.count).toEqual(9)
        expect(sorted.items()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])

        const sortedChange = jest.fn<void, [CollectionChange<number>]>()
        sorted.on('change', sortedChange)

        const sortFn = (a: number, b: number) => a - b

        sorted.setSort(sortFn)
        expect(sorted.items()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
        expect(sortedChange).toBeCalledWith(collectionChange({ ordered: true }))
        sortedChange.mockReset()

        sorted.setSort(sortFn)
        expect(sortedChange).not.toHaveBeenCalled()

        sorted.setSort((a, b) => b - a)
        expect(sorted.items()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
        expect(sortedChange).toBeCalledWith(collectionChange({ ordered: true }))
        sortedChange.mockReset()

        source.removeKey('5')
        expect(sorted.count).toEqual(8)
        expect(sorted.items()).toEqual([9, 8, 7, 6, 4, 3, 2, 1])
        expect(sortedChange).toBeCalledWith(collectionChange({ ordered: true, removed: { '5': 5 } }))
        sortedChange.mockReset()

        source.insert(5)
        expect(sorted.items()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
        expect(sortedChange).toBeCalledWith(collectionChange({ ordered: true, added: { '5': 5 } }))
        sortedChange.mockReset()

        sorted.setSort(undefined)
        expect(sorted.items()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
        expect(sortedChange).toBeCalledWith(collectionChange({ ordered: true }))
        sortedChange.mockReset()

        sorted.dispose()
        source.dispose()
    })

    test('passthough', () => {
        const source = new Collection<TestItem>((item) => item.id)

        const sorted = new SortedCollection(source)
        const changeFn = jest.fn<void, [CollectionChange<TestItem>]>()
        sorted.on('change', changeFn)

        source.insert(testItem1)
        expect(changeFn).toBeCalledWith(collectionChange({ added: { [testItem1.id]: testItem1 }, ordered: true }))
        changeFn.mockReset()

        source.insert(testItem1a)
        expect(changeFn).toBeCalledWith(collectionChange({ updated: { [testItem1a.id]: testItem1a }, ordered: true }))
        changeFn.mockReset()

        source.removeKey('1')
        expect(changeFn).toBeCalledWith(collectionChange({ removed: { [testItem1a.id]: testItem1a }, ordered: true }))
        changeFn.mockReset()

        sorted.dispose()
        source.dispose()
    })
})
