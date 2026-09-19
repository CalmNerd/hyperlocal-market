"use client";

import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import {
  useCreateProduct,
  useDeleteProduct,
  useMyProducts,
  useMyShop,
  useUpdateProduct,
} from "@/features/shop/client";

export function ProductsPanel() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const shopQuery = useMyShop();
  const productsQuery = useMyProducts();
  const create = useCreateProduct();
  const patch = useUpdateProduct();
  const remove = useDeleteProduct();

  if (shopQuery.isPending || productsQuery.isPending) return <PageSkeleton />;
  if (shopQuery.isError) {
    return <ErrorState message={getErrorMessage(shopQuery.error)} onRetry={() => shopQuery.refetch()} />;
  }
  if (productsQuery.isError) {
    return (
      <ErrorState message={getErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />
    );
  }

  const locked = shopQuery.data.status !== "APPROVED";
  const products = productsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Catalogue</h1>
        <p className="text-sm text-muted-foreground">Add / edit items for your shop.</p>
      </div>

      {locked && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Shop status is {shopQuery.data.status}. Product edits unlock after approval.
        </p>
      )}

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          create.mutate(
            {
              title,
              price: Number(price),
              imageUrl: imageUrl || null,
              availability: "AVAILABLE",
            },
            {
              onSuccess: () => {
                setTitle("");
                setPrice("");
                setImageUrl("");
                setFormError(null);
              },
              onError: (err) => setFormError(getErrorMessage(err)),
            },
          );
        }}
        className="grid gap-3 rounded-3xl border bg-background p-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={locked} />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} required disabled={locked} />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            disabled={locked}
          />
        </div>
        {formError && <p className="text-sm text-destructive sm:col-span-2">{formError}</p>}
        <Button type="submit" className="sm:col-span-2" disabled={locked || create.isPending}>
          {create.isPending ? "Adding…" : "Add product"}
        </Button>
      </form>

      {products.length === 0 ? (
        <EmptyState title="No products" description="Add your first item above." />
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li key={product.id} className="rounded-3xl border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{product.title}</h2>
                    <Badge variant={product.availability === "AVAILABLE" ? "success" : "muted"}>
                      {product.availability}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={locked || patch.isPending}
                    onClick={() =>
                      patch.mutate({
                        id: product.id,
                        data: {
                          availability:
                            product.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
                        },
                      })
                    }
                  >
                    Toggle availability
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={locked || remove.isPending}
                    onClick={() => remove.mutate(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
