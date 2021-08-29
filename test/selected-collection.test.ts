import { Collection, SelectedCollection } from '../src'
import { TestItem, testItem1, testItem1a, testItem2 } from './test-item'

describe('selected collection', () => {
    test('selected', () => {
        const source = new Collection<TestItem>((item) => item.id)
        const selected = new SelectedCollection(source)

        source.insert([testItem1, testItem2])
        expect(selected.items()).toEqual([])

        selected.insert(testItem1)
        expect(selected.items()).toEqual([testItem1])

        source.insert(testItem1a)
        expect(selected.items()).toEqual([testItem1a])

        source.removeKey(testItem1.id)
        expect(selected.items()).toEqual([])

        selected.selectAll()
        expect(selected.items()).toEqual([testItem2])

        source.insert(testItem1)
        source.insert(testItem1a)
        expect(selected.items()).toEqual([testItem2])

        selected.dispose()
    })
})
