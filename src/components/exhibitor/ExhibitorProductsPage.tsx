"use client";

import { AddProductModal } from "@/components/exhibitor/AddProductModal";
import { exhibitorH1, exhibitorMuted, exhibitorPageWrap } from "@/components/exhibitor/exhibitor-ui";
import { ProductCard } from "@/components/exhibitor/ProductCard";
import type { ProductApiRow, ProductFormPayload } from "@/types/product-api";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ExhibitorProductsPageProps {
  companyId: string;
  companyName: string;
}

export function ExhibitorProductsPage({ companyId, companyName }: ExhibitorProductsPageProps) {
  const [products, setProducts] = useState<ProductApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductApiRow | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products?companyId=${encodeURIComponent(companyId)}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("load");
      }
      const data = (await response.json()) as { products?: ProductApiRow[] };
      setProducts(data.products ?? []);
    } catch {
      setError("Не удалось загрузить список новинок.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductApiRow) {
    setEditing(product);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(payload: ProductFormPayload) {
    if (editing) {
      const response = await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Не удалось сохранить");
        return;
      }
    } else {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Не удалось добавить");
        return;
      }
    }
    await loadProducts();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error ?? "Не удалось удалить");
      return;
    }
    await loadProducts();
  }

  return (
    <div className="min-h-screen bg-exhibitorBg">
      <div className={exhibitorPageWrap}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={exhibitorH1}>Новинки</h1>
            <p className={`${exhibitorMuted} mt-1`}>
              Компания: <span className="font-semibold text-slate-700">{companyName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-expoOrange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
            Добавить новинку
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-[12px] border border-red-100 bg-red-50/80 p-4 text-sm text-red-700 shadow-exhibitor">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-500">Загрузка…</p>
        ) : (
          <ul className="mt-8 flex max-w-4xl flex-col gap-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} onEdit={openEdit} onDelete={handleDelete} />
              </li>
            ))}
          </ul>
        )}

        {!loading && products.length === 0 && !error ? (
          <p className="mt-8 rounded-[12px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600 shadow-exhibitor">
            Пока нет новинок. Нажмите «Добавить новинку».
          </p>
        ) : null}

        <AddProductModal
          open={modalOpen}
          onClose={closeModal}
          initialProduct={editing}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
