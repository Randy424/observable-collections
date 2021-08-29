import { Collection, collectionChange, CollectionChange, FilteredCollection } from '../src'
import { TestItem, testItem1, testItem1a, testItem2 } from './test-item'

describe('filtered collection', () => {
    test('filter', () => {
        const keyFn = (item: TestItem) => item.id
        const source = new Collection<TestItem>(keyFn)

        const filterFn = (item: TestItem) => item.name !== testItem2.name
        const filtered = new FilteredCollection(source, filterFn)

        const changeFn = jest.fn<void, [CollectionChange<TestItem>]>()
        filtered.on('change', changeFn)

        source.pauseEvents()
        source.insert(testItem1)
        source.insert(testItem2)
        source.resumeEvents()

        expect(filtered.count).toEqual(1)
        expect(filtered.items()).toEqual([testItem1])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { [testItem1.id]: testItem1 } }))
        changeFn.mockReset()

        source.insert(testItem1a)
        expect(filtered.items()).toEqual([testItem1a])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { [testItem1.id]: testItem1a } }))
        changeFn.mockReset()

        filtered.setFilter()
        filtered.setFilter()
        expect(filtered.count).toEqual(2)
        expect(filtered.items()).toEqual([testItem1a, testItem2])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { [testItem2.id]: testItem2 } }))
        changeFn.mockReset()

        filtered.setFilter(filterFn)
        expect(filtered.count).toEqual(1)
        expect(filtered.items()).toEqual([testItem1a])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { [testItem2.id]: testItem2 } }))
        changeFn.mockReset()

        const filterOutTestItem1a = (item: TestItem) => item.name !== testItem1a.name
        filtered.setFilter(filterOutTestItem1a)
        expect(filtered.count).toEqual(1)
        expect(filtered.items()).toEqual([testItem2])
        expect(changeFn).toHaveBeenCalledWith(
            collectionChange({ added: { [testItem2.id]: testItem2 }, removed: { [testItem1a.id]: testItem1a } })
        )
        changeFn.mockReset()

        filtered.dispose()
    })

    test('passthough', () => {
        const keyFn = (item: TestItem) => item.id
        const source = new Collection<TestItem>(keyFn)

        const filtered = new FilteredCollection(source)
        const changeFn = jest.fn<void, [CollectionChange<TestItem>]>()
        filtered.on('change', changeFn)

        source.insert(testItem1)
        expect(changeFn).toBeCalledWith(collectionChange({ added: { [testItem1.id]: testItem1 } }))
        changeFn.mockReset()

        source.insert(testItem1a)
        expect(changeFn).toBeCalledWith(collectionChange({ updated: { [testItem1.id]: testItem1a } }))
        changeFn.mockReset()

        source.removeKey(testItem1.id)
        expect(changeFn).toBeCalledWith(collectionChange({ removed: { [testItem1.id]: testItem1a } }))
        changeFn.mockReset()

        filtered.dispose()
    })
})
