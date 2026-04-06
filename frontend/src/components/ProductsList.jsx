import React from "react";
import ProductItem from "./ProductItem";

export default function ProductsList({ products, onBuy, onEdit, onDelete, onDetail, userRole }) {
    if (!products.length) {
        return <div className="empty">Товаров пока нет</div>;
    }

    return (
        <div className="list">
            {products.map((p) => (
                <ProductItem
                    key={p.id}
                    product={p}
                    onBuy={onBuy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDetail={onDetail}
                    userRole={userRole}
                />
            ))}
        </div>
    );
}