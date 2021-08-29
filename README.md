# Event Collections

Collections of items that emit change events.

Collections work together to create a pipeline which can efficiently filter, search, sort, and page the collection.

## Collection Types

- **Collection**: A writeable collection that is used as the source for other collections.
- **FilteredCollection**: Used to filter a source collection.
- **SearchedCollection**: Used to search a source collection.
- **SortedCollection**: Used to sort a source collection.
- **SelectedCollection**: Used to manage the selected items of a source collection.
- **PagedCollection**: Used to page a source collection.

## Code Example

```typescript
interface ItemT {
    id: number
    name: string
}

const keyFn = (item: ItemT) => item.id.toString()
const source = new Collection<ItemT>(keyFn)

sconst filterFn = (_item: ItemT) => true
const filtered = new FilteredCollection(source, filterFn)

const sortFn = (lhs: ItemT, rhs: ItemT) => lhs.name.localeCompare(rhs.name)
const sorted = new SortedCollection(filtered, sortFn)

const page = 1
const pageSize = 10
const paged = new PagedCollection(sorted, page, pageSize)

const selected = new SelectedCollection(source)

source.insert({ id: 1, name: 'One' })

expect(paged.items()).toEqual([{ id: 1, name: 'One' }])
```

## Events

### Added Event

```json
{
    "addedCount": 1,
    "added": { "1": { "id": 1 }},
}
```

### Updated Event

```json
{
    "updatedCount": 1,
    "updated": { "1": { "id": 1 }},
}
```

### Removed Event

```json
{
    "revmovedCount": 1,
    "removed": { "1": { "id": 1 }},
}
```

### Ordered Event

```json
{
    "ordered": true
}
```
