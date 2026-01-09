# Quản lý Bộ sưu tập (Collection Management)

Hệ thống quản lý bộ sưu tập sản phẩm với relationship đến Category và SEO fields.

## ✨ Tính năng

- ✅ **CRUD Operations** - Tạo, đọc, cập nhật, xóa bộ sưu tập
- ✅ **Auto-generate Slug** - Tự động tạo slug từ tên (locale: vi)
- ✅ **Category Relationship** - Liên kết với danh mục
- ✅ **Image Upload** - Upload ảnh local
- ✅ **SEO Fields** - Meta title, description, keywords
- ✅ **Status Management** - Active/Inactive
- ✅ **Featured Collections** - Đánh dấu nổi bật
- ✅ **Sort Order** - Thứ tự hiển thị
- ✅ **Bulk Actions** - 5 actions (delete, featured, status)
- ✅ **Search & Filter** - Tìm kiếm và lọc theo status/featured
- ✅ **Type-safe** - Zero `any` types

## 📁 Cấu trúc

```
features/admin/collections/
├── actions.ts                          # 9 server actions
├── types.ts                            # TypeScript types
├── components/
│   ├── collection-form.tsx            # Form 3 tabs
│   ├── collection-dialog.tsx          # Dialog wrapper
│   └── collection-columns.tsx         # Table columns
└── README.md                           # File này

app/admin/collections/
└── page.tsx                            # Page chính
```

## 🗄️ Schema

```prisma
model Collection {
  id          String       @id @default(uuid())
  name        String
  slug        String       @unique
  description String?      @db.Text
  image       String?      @db.Text
  featured    Boolean      @default(false)
  status      ActiveStatus @default(ACTIVE)
  sortOrder   Int          @default(0)
  
  // SEO
  metaTitle       String? @db.Text
  metaDescription String? @db.Text
  metaKeywords    String? @db.Text
  
  // Relationship
  categoryId String?
  category   Category? @relation(fields: [categoryId])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Usage

### Truy cập
```
http://localhost:3000/admin/collections
```

### Thêm bộ sưu tập
```typescript
{
  name: "Bộ sưu tập Xuân 2024",
  slug: "bo-suu-tap-xuan-2024",  // Auto
  categoryId: "category-uuid",     // Optional
  description: "...",
  image: "/uploads/xxx.jpg",
  status: "ACTIVE",
  featured: true,
  // SEO fields...
}
```

## 🔧 Server Actions

### getCollections()
Lấy tất cả collections với category info

```typescript
const collections = await getCollections()
// Returns: CollectionWithCategory[]
```

### createCollection(data)
```typescript
const result = await createCollection({
  name: "Summer 2024",
  categoryId: "category-id",
  featured: true,
})
```

### updateCollection(id, data)
```typescript
const result = await updateCollection("uuid", {
  name: "Spring Collection",
  status: ActiveStatus.INACTIVE,
})
```

### deleteCollection(id)
```typescript
const result = await deleteCollection("uuid")
```

### deleteCollections(ids)
```typescript
const result = await deleteCollections(["id1", "id2"])
```

### updateCollectionsStatus(ids, status)
```typescript
const result = await updateCollectionsStatus(
  ["id1", "id2"],
  ActiveStatus.ACTIVE
)
```

### updateCollectionsFeatured(ids, featured)
```typescript
const result = await updateCollectionsFeatured(
  ["id1", "id2"],
  true
)
```

### updateCollectionsCategory(ids, categoryId)
```typescript
const result = await updateCollectionsCategory(
  ["id1", "id2"],
  "category-uuid"
)
```

## 📝 Components

### CollectionForm
Form với 3 tabs:
1. **Thông tin chung** - Name, slug, category, description, status, sort order, featured
2. **Hình ảnh** - Image upload
3. **SEO** - Meta title, description, keywords

### CollectionDialog
Dialog wrapper cho form

### CollectionColumns
Table columns:
- Select checkbox
- Name + Image
- Category badge
- Status badge
- Featured badge
- Sort order
- Created date
- Actions dropdown

## 🎯 Bulk Actions (5)

1. **Xóa** - Delete multiple collections
2. **Đặt nổi bật** - Set featured = true
3. **Bỏ nổi bật** - Set featured = false
4. **Kích hoạt** - Set status = ACTIVE
5. **Vô hiệu hóa** - Set status = INACTIVE

## 📊 Comparison

| Feature | Category | Brand | Collection |
|---------|----------|-------|------------|
| Structure | Tree | Flat | Flat |
| Parent | ✅ Self | ❌ | ❌ |
| Category | - | ❌ | ✅ BelongsTo |
| Image | ✅ | ✅ Logo | ✅ |
| Website | ❌ | ✅ | ❌ |
| Status | ✅ | ✅ | ✅ |
| Featured | ✅ | ✅ | ✅ |
| SEO | ✅ | ❌ | ✅ |
| Bulk Actions | 3 | 5 | 5 |

## 💡 Use Cases

### Fashion
- Bộ sưu tập Xuân/Hè
- Bộ sưu tập Thu/Đông
- Limited Edition
- Designer Collections

### E-commerce
- Best Sellers
- New Arrivals
- Sale Collections
- Trending Products

### Seasonal
- Tết Collection
- Summer Sale
- Black Friday
- Christmas Deals

## 🔒 Type Safety

```typescript
// Zero `any` types
const bulkActions = useBulkActions<CollectionWithCategory, CollectionBulkUpdate>()

bulkActions.createBulkAction({
  onClick: async (items: CollectionWithCategory[]) => {  // ✅ Typed
    const result = await deleteCollections(items.map(i => i.id))
  }
})
```

## 🚀 Quick Start

```typescript
// 1. Load data
const collections = await getCollections()
const categories = await getCategories()  // For category selector

// 2. Create collection
await createCollection({
  name: "Summer 2024",
  categoryId: "cat-id",
  featured: true,
  status: ActiveStatus.ACTIVE,
})

// 3. Bulk update
await updateCollectionsStatus(["id1", "id2"], ActiveStatus.INACTIVE)
```

---

**Version:** 1.0.0  
**Type-Safe:** ✅ Zero `any`  
**Ready for Production:** ✅


