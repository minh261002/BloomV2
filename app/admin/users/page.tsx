"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DataTable,
    DataTableColumnHeader,
    useConfirmDialog,
    useBulkActions,
} from "@/components/data-table"
import { toast } from "sonner"

export type User = {
    id: string
    name: string
    email: string
    role: "admin" | "user" | "moderator"
    status: "active" | "inactive" | "pending"
    avatar?: string
    createdAt: string
}

// Dữ liệu mẫu
const generateMockData = (): User[] => {
    const roles: User["role"][] = ["admin", "user", "moderator"]
    const statuses: User["status"][] = ["active", "inactive", "pending"]
    const names = [
        "Nguyễn Văn A",
        "Trần Thị B",
        "Lê Văn C",
        "Phạm Thị D",
        "Hoàng Văn E",
        "Vũ Thị F",
        "Đặng Văn G",
        "Bùi Thị H",
        "Đỗ Văn I",
        "Ngô Thị J",
        "Dương Văn K",
        "Lý Thị L",
        "Mai Văn M",
        "Trịnh Thị N",
        "Võ Văn O",
    ]

    return Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: names[i % names.length] + ` ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 10000000000)
        ).toISOString(),
    }))
}

export default function UsersPage() {
    const [data, setData] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(true)
    const { confirm, ConfirmDialog } = useConfirmDialog()

    const bulkActions = useBulkActions<User>({
        onDelete: async (users) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))
            const userIds = users.map((u) => u.id)
            setData((prev) => prev.filter((item) => !userIds.includes(item.id)))
            toast.success(`Đã xóa ${users.length} người dùng thành công`)
        },
        onUpdate: async (users, updates) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const userIds = users.map((u) => u.id)
            setData((prev) =>
                prev.map((item) =>
                    userIds.includes(item.id) ? { ...item, ...updates } : item
                )
            )
            toast.success(`Đã cập nhật ${users.length} người dùng`)
        },
        deleteConfirmation: {
            title: "Xóa nhiều người dùng",
            description: (count) =>
                `Bạn có chắc chắn muốn xóa ${count} người dùng đã chọn? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa tất cả",
        },
    })

    React.useEffect(() => {
        // Simulate API call with loading
        setLoading(true)
        setTimeout(() => {
            setData(generateMockData())
            setLoading(false)
        }, 2000) // Simulate 2s loading time
    }, [])

    const handleDelete = async (user: User) => {
        confirm({
            title: "Xóa người dùng",
            description: `Bạn có chắc chắn muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            cancelText: "Hủy",
            variant: "destructive",
            onConfirm: async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setData((prev) => prev.filter((item) => item.id !== user.id))
                toast.success("Đã xóa người dùng thành công")
            },
        })
    }

    const handleEdit = (user: User) => {
        toast.info(`Chỉnh sửa người dùng: ${user.name}`)
    }


    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Chọn tất cả"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Chọn dòng"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tên người dùng" />
            ),
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Vai trò" />
            ),
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                const roleConfig = {
                    admin: { label: "Quản trị viên", variant: "default" as const },
                    user: { label: "Người dùng", variant: "secondary" as const },
                    moderator: { label: "Điều hành viên", variant: "outline" as const },
                }
                const config = roleConfig[role as keyof typeof roleConfig]
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Trạng thái" />
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const statusConfig = {
                    active: {
                        label: "Hoạt động",
                        icon: CheckCircle2,
                        color: "text-green-600",
                    },
                    inactive: {
                        label: "Không hoạt động",
                        icon: XCircle,
                        color: "text-gray-600",
                    },
                    pending: {
                        label: "Chờ xác nhận",
                        icon: XCircle,
                        color: "text-yellow-600",
                    },
                }
                const config = statusConfig[status as keyof typeof statusConfig]
                const Icon = config.icon
                return (
                    <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span>{config.label}</span>
                    </div>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Ngày tạo" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"))
                return <span>{date.toLocaleDateString("vi-VN")}</span>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.id)}
                            >
                                Sao chép ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground">
                    Quản lý và theo dõi người dùng trong hệ thống
                </p>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                skeletonRowCount={10}
                searchKey="name"
                searchPlaceholder="Tìm kiếm theo tên hoặc email..."
                filterableColumns={[
                    {
                        id: "role",
                        title: "Vai trò",
                        options: [
                            { label: "Quản trị viên", value: "admin" },
                            { label: "Người dùng", value: "user" },
                            { label: "Điều hành viên", value: "moderator" },
                        ],
                    },
                    {
                        id: "status",
                        title: "Trạng thái",
                        options: [
                            { label: "Hoạt động", value: "active" },
                            { label: "Không hoạt động", value: "inactive" },
                            { label: "Chờ xác nhận", value: "pending" },
                        ],
                    },
                ]}
                bulkActions={[
                    bulkActions.createBulkAction({
                        label: "Xóa",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: bulkActions.handleBulkDelete,
                        confirmBefore: {
                            title: "Xóa người dùng đã chọn",
                            description: (count) =>
                                `Bạn có chắc chắn muốn xóa ${count} người dùng? Hành động này không thể hoàn tác.`,
                            confirmText: "Xóa",
                        },
                    }),
                    bulkActions.createBulkAction({
                        label: "Kích hoạt",
                        icon: CheckCircle2,
                        variant: "default",
                        onClick: (users) => bulkActions.handleBulkUpdate(users, { status: "active" }),
                    }),
                    bulkActions.createBulkAction({
                        label: "Vô hiệu hóa",
                        icon: XCircle,
                        variant: "outline",
                        onClick: (users) => bulkActions.handleBulkUpdate(users, { status: "inactive" }),
                    }),
                ]}
                toolbarActions={
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => toast.info("Thêm người dùng mới")}
                        disabled={loading}
                    >
                        Thêm người dùng
                    </Button>
                }
            />

            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

