
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(account: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
}

export async function fetchIngredients(batchNumber?: string) {
    const url = batchNumber
        ? `${API_URL}/ingredients/${batchNumber}`
        : `${API_URL}/ingredients`;

    const res = await fetch(url, {
        cache: 'no-store',
        headers: { ...getAuthHeaders() }
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch data');
    }
    const json = await res.json();
    return batchNumber ? json.data : json.data;
}

export async function createIngredient(data: any) {
    const res = await fetch(`${API_URL}/ingredients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create ingredient');
    return res.json();
}

export async function deleteIngredient(id: string) {
    const res = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete ingredient');
    return res.json();
}
