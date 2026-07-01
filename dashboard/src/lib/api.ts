export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(endpoint, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        throw new Error('Unauthorized');
    }

    return response;
}
