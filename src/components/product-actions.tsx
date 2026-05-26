"use client";

import { ExternalLink, Pencil, Save, Trash2 } from "lucide-react";

import { deleteProductAction, updateProductAction } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProductActionItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  priceCurrency: string;
  description: string;
  exchangeRate: number | null;
  sourceUrl: string | null;
};

type ProductActionsCopy = {
  cancel: string;
  currency: string;
  delete: string;
  deleteConfirm: string;
  description: string;
  edit: string;
  editDescription: string;
  editTitle: string;
  imageUrl: string;
  name: string;
  openSource: string;
  price: string;
  ronRate: string;
  save: string;
};

export function ProductActions({
  copy,
  product,
}: {
  copy: ProductActionsCopy;
  product: ProductActionItem;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {product.sourceUrl ? (
        <a
          aria-label={`${copy.openSource}: ${product.name}`}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          href={product.sourceUrl}
          rel="noreferrer"
          target="_blank"
          title={copy.openSource}
        >
          <ExternalLink />
        </a>
      ) : null}

      <Dialog>
        <DialogTrigger
          render={
            <Button aria-label={`${copy.edit}: ${product.name}`} size="icon-sm" type="button" variant="outline" />
          }
        >
          <Pencil />
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{copy.editTitle}</DialogTitle>
            <DialogDescription>{copy.editDescription}</DialogDescription>
          </DialogHeader>
          <form action={updateProductAction} className="grid gap-4">
            <input name="id" type="hidden" value={product.id} />

            <div className="grid gap-2">
              <Label htmlFor={`name-${product.id}`}>{copy.name}</Label>
              <Input id={`name-${product.id}`} name="name" required defaultValue={product.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`image-${product.id}`}>{copy.imageUrl}</Label>
              <Input id={`image-${product.id}`} name="imageUrl" required type="url" defaultValue={product.imageUrl} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor={`price-${product.id}`}>{copy.price}</Label>
                <Input
                  id={`price-${product.id}`}
                  min="0"
                  name="price"
                  required
                  step="0.01"
                  type="number"
                  defaultValue={product.price}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`currency-${product.id}`}>{copy.currency}</Label>
                <Input
                  id={`currency-${product.id}`}
                  maxLength={3}
                  minLength={3}
                  name="priceCurrency"
                  required
                  defaultValue={product.priceCurrency}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`rate-${product.id}`}>{copy.ronRate}</Label>
                <Input
                  id={`rate-${product.id}`}
                  min="0"
                  name="exchangeRate"
                  step="0.0001"
                  type="number"
                  defaultValue={product.exchangeRate ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`description-${product.id}`}>{copy.description}</Label>
              <Textarea
                id={`description-${product.id}`}
                name="description"
                required
                rows={5}
                defaultValue={product.description}
              />
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>{copy.cancel}</DialogClose>
              <Button type="submit">
                <Save />
                {copy.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <form
        action={deleteProductAction}
        onSubmit={(event) => {
          if (!window.confirm(`${copy.deleteConfirm} "${product.name}"?`)) {
            event.preventDefault();
          }
        }}
      >
        <input name="id" type="hidden" value={product.id} />
        <Button aria-label={`${copy.delete}: ${product.name}`} size="icon-sm" type="submit" variant="destructive">
          <Trash2 />
        </Button>
      </form>
    </div>
  );
}
