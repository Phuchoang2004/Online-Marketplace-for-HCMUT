import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
    Upload, X, CheckCircle, AlertCircle, Loader2,
    DollarSign, Tag, Package, ArrowLeft, ChevronDown
} from 'lucide-react';
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.tsx";
import {toast} from "sonner";

// 1. Define interface for Category data from API
interface CategoryItem {
    _id: string;
    name: string;
    // add other fields if necessary
}

interface ProductFormData {
    name: string;
    category: string;
    description: string;
    price: string;
    stock: string;
}

interface StatusMessage {
    type: 'success' | 'error';
    text: string;
}

interface ApiError {
    msg?: string;
    [key: string]: unknown;
}

export default function AddProduct() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    // State for form fields
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: ''
    });

    // 2. New State for Categories list
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<StatusMessage | null>(null);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    // 3. Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                // Adjust URL if your router is mounted differently (e.g., /api/v1/categories)
                const response = await fetch('http://localhost:5000/api/categories', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setCategories(result.data);
                } else {
                    console.error("Failed to fetch categories:", result);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsCategoriesLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchCategories();
        }
    }, [user]);

    // Handle Inputs (Works for Select and Text)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ... (File handling logic remains the same) ...
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            setMessage({ type: 'error', text: 'You can only upload a maximum of 5 images.' });
            return;
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setSelectedFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);
        setMessage(null);
    };

    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category); // This will now send the Category ID
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);

        selectedFiles.forEach((file) => {
            data.append('images', file);
        });

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = Array.isArray(result.errors)
                    ? result.errors.map((err: ApiError | string) => (typeof err === 'string' ? err : err.msg || 'Error')).join(', ')
                    : result.errors || 'Failed to create product';
                throw new Error(errorMsg);
            }
            navigate('/vendor/products');
            toast.success('Product submitted successfully!');
            setMessage({ type: 'success', text: 'Product submitted successfully!' });
            setFormData({ name: '', category: '', description: '', price: '', stock: '' });
            setSelectedFiles([]);
            setPreviews([]);

        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "VENDOR") return <Navigate to="/unauthorized" replace />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">

                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 group">
                    <div className="bg-white p-2 rounded-full shadow-sm mr-2 group-hover:shadow-md transition-all border border-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="mt-2 text-gray-600">Fill in the details below to submit your product for approval.</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                                <p>{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="e.g. Wireless Headphones"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        disabled={isCategoriesLoading}
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none bg-white"
                                    >
                                        <option value="" disabled>
                                            {isCategoriesLoading ? "Loading categories..." : "Select a Category"}
                                        </option>

                                        {!isCategoriesLoading && categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Describe your product details..."
                                />
                            </div>

                            {/* Image Upload Area (Same as before) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 5)</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={selectedFiles.length >= 5}
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 group-hover:text-blue-500">
                                        <div className="bg-gray-100 p-3 rounded-full group-hover:bg-blue-50 transition-colors">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                        <span className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 5MB)</span>
                                    </div>
                                </div>
                                {previews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-500 text-right">{selectedFiles.length} / 5 images selected</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                                    {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />Uploading...</> : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}