
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');

    if (!token || token === 'undefined') return {};
    return { 'Authorization': `Bearer ${token}` };
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

export async function updateIngredient(id: string, data: any) {
    const res = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ingredient');
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

export function formatDate(dateInput: string | Date): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}/${mm}/${dd}`;
}


export async function chatWithAI(message: string, history: { role: string; content: string }[] = []) {
    const response = await fetch(`${API_URL}/llm/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, conversation_history: history }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message?.[0] || 'AI 服務暫時無法連線');
    }

    const json = await response.json();
    return json.data;
}
