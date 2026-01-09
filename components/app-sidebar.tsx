"use client";

import * as React from "react";
import { Package, SquareTerminal, Users, FolderOpen, ListTree, BadgeCheckIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { authClient } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  const data = {
    user: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      avatar: session?.user?.image || "",
    },
    navMainAdmin: [
      {
        title: "Bảng điều khiển",
        url: "/admin/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Danh mục sản phẩm",
        url: "/admin/categories",
        icon: ListTree,
        isActive: true,
      },
      {
        title: "Thương hiệu",
        url: "/admin/brands",
        icon: BadgeCheckIcon,
        isActive: true,
      },

      {
        title: "Sản phẩm",
        url: "#",
        icon: Package,
        isActive: true,
        items: [
          {
            title: "Danh sách",
            url: "/admin/products",
          },
          {
            title: "Thêm mới",
            url: "/admin/products/new",
          },
        ],
      },
      {
        title: "Mã khuyến mãi",
        url: "#",
        icon: FolderOpen,
        isActive: true,
        items: [
          {
            title: "Danh sách",
            url: "/admin/coupons",
          },
          {
            title: "Thêm mới",
            url: "/admin/coupons/new",
          },
        ],
      },
      {
        title: "Cửa hàng",
        url: "#",
        icon: FolderOpen,
        isActive: true,
        items: [
          { title: "Danh sách", url: "/admin/stores" },
          { title: "Thêm mới", url: "/admin/stores/new" },
        ],
      },
      {
        title: "Tài khoản",
        url: "#",
        icon: Users,
        isActive: true,
        items: [
          {
            title: "Danh sách",
            url: "/admin/users",
          },
          {
            title: "Thêm mới",
            url: "/admin/users/new",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="items-start">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={150}
          height={150}
          className="w-28"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMainAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
