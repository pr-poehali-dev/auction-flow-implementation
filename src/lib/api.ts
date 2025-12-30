const API_BASE = {
  auth: 'https://functions.poehali.dev/ab224e6c-c5c1-41ea-9664-ebfe4c57f903',
  auctions: 'https://functions.poehali.dev/3583e8bf-46a9-416e-a018-493d90a93432',
  wallet: 'https://functions.poehali.dev/3238db40-1120-4713-b327-760e83821f90'
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  balance: number;
  loyalty_level: string;
  total_deposit: number;
}

export interface Auction {
  id: number;
  title: string;
  image: string;
  currentPrice: number;
  totalBids: number;
  timeLeft: number;
  retail: number;
  minPrice: number;
  status: string;
  winnerId: number | null;
  buyItNowDeadline: string | null;
  botBidsCount: number;
  category: string;
  supplier: string;
}

const getAuthToken = () => localStorage.getItem('auth_token');

export const api = {
  auth: {
    register: async (email: string, password: string, full_name: string) => {
      const response = await fetch(`${API_BASE.auth}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem('auth_token', data.token);
      return data;
    },
    
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE.auth}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem('auth_token', data.token);
      return data;
    },
    
    me: async () => {
      const token = getAuthToken();
      if (!token) throw new Error('Не авторизован');
      
      const response = await fetch(`${API_BASE.auth}?action=me`, {
        headers: { 'X-Auth-Token': token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    },
    
    logout: () => {
      localStorage.removeItem('auth_token');
    }
  },
  
  auctions: {
    list: async (category_id?: number) => {
      const params = new URLSearchParams({ action: 'list' });
      if (category_id) params.append('category_id', category_id.toString());
      
      const response = await fetch(`${API_BASE.auctions}?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.auctions as Auction[];
    },
    
    details: async (id: number) => {
      const response = await fetch(`${API_BASE.auctions}?action=details&id=${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data as Auction;
    },
    
    bid: async (auction_id: number) => {
      const token = getAuthToken();
      if (!token) throw new Error('Требуется авторизация');
      
      const response = await fetch(`${API_BASE.auctions}?action=bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ auction_id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    }
  },
  
  wallet: {
    balance: async () => {
      const token = getAuthToken();
      if (!token) throw new Error('Требуется авторизация');
      
      const response = await fetch(`${API_BASE.wallet}?action=balance`, {
        headers: { 'X-Auth-Token': token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    },
    
    transactions: async (limit = 50) => {
      const token = getAuthToken();
      if (!token) throw new Error('Требуется авторизация');
      
      const response = await fetch(`${API_BASE.wallet}?action=transactions&limit=${limit}`, {
        headers: { 'X-Auth-Token': token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.transactions;
    },
    
    topup: async (amount: number) => {
      const token = getAuthToken();
      if (!token) throw new Error('Требуется авторизация');
      
      const response = await fetch(`${API_BASE.wallet}?action=topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    }
  }
};
