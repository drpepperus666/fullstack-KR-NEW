import React, { useState, useEffect } from "react";

export default function ProductFormModal({ onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        rating: 0,
        photoUrl: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                category: initialData.category || "",
                description: initialData.description || "",
                price: initialData.price || "",
                stock: initialData.stock || "",
                rating: initialData.rating || 0,
                photoUrl: initialData.photoUrl || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="backdrop">
            <div className="modal">
                <div className="modal__header">
                    <h2 className="modal__title">
                        {initialData ? "Изменить товар" : "Создать товар"}
                    </h2>
                    <button className="iconBtn" onClick={onClose}>✕</button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input className="input" required name="name" value={formData.name} onChange={handleChange} />
                    </label>
                    <label className="label">
                        Категория
                        <input className="input" required name="category" value={formData.category} onChange={handleChange} />
                    </label>
                    <label className="label">
                        Описание
                        <textarea className="textarea" name="description" value={formData.description} onChange={handleChange} />
                    </label>
                    <label className="label">
                        Цена
                        <input className="input" type="number" step="0.01" required name="price" value={formData.price} onChange={handleChange} />
                    </label>
                    <label className="label">
                        Остаток
                        <input className="input" type="number" required name="stock" value={formData.stock} onChange={handleChange} />
                    </label>
                    <label className="label">
                        Рейтинг
                        <input className="input" type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} />
                    </label>
                    <label className="label">
                        URL фото
                        <input className="input" name="photoUrl" value={formData.photoUrl} onChange={handleChange} />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn--primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
