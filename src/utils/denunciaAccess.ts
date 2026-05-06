import { db } from '@/src/config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'denuncia_access';
const COOKIE_EXPIRES = 7; // dias

export interface DenunciaFormData {
    nome: string;
    whatsapp: string;
    email: string;
    cep: string;
    bairro: string;
    estado: string;
    cidade: string;
    termos: boolean;
}

/**
 * Verifica se o usuário já tem acesso (via cookie ou Firebase)
 */
export async function checkDenunciaAccess(): Promise<{ hasAccess: boolean; userData?: any }> {
    // Primeiro verificar cookie
    const cookieData = Cookies.get(COOKIE_NAME);
    if (cookieData) {
        try {
            const userData = JSON.parse(cookieData);
            return { hasAccess: true, userData };
        } catch (error) {
            console.error('Erro ao ler cookie:', error);
        }
    }

    // Se não tiver cookie, verificar no sessionStorage (para mesma sessão)
    const sessionData = sessionStorage.getItem('denunciaUserData');
    if (sessionData) {
        try {
            const userData = JSON.parse(sessionData);
            return { hasAccess: true, userData };
        } catch (error) {
            console.error('Erro ao ler sessionStorage:', error);
        }
    }

    return { hasAccess: false };
}

/**
 * Registra o acesso do usuário ao preencher o formulário
 */
export async function registerDenunciaAccess(formData: DenunciaFormData): Promise<void> {
    const userData = {
        nome: formData.nome,
        email: formData.email,
        timestamp: new Date().toISOString()
    };

    // Salvar cookie (persiste por X dias)
    Cookies.set(COOKIE_NAME, JSON.stringify(userData), { expires: COOKIE_EXPIRES });

    // Salvar no sessionStorage (para mesma sessão)
    sessionStorage.setItem('denunciaFormCompleted', 'true');
    sessionStorage.setItem('denunciaUserData', JSON.stringify(userData));
}

/**
 * Salva os dados da denúncia no Firebase
 */
export async function saveDenunciaToFirebase(formData: DenunciaFormData): Promise<string> {
    try {
        const denunciaRef = collection(db, 'denuncias');

        const docRef = await addDoc(denunciaRef, {
            ...formData,
            tipo: 'denuncia',
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
            ip: await getUserIP()
        });

        return docRef.id;
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        throw error;
    }
}

/**
 * Verifica se o email já foi usado anteriormente
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    try {
        const denunciaRef = collection(db, 'denuncias');
        const q = query(denunciaRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return false;
    }
}

/**
 * Obtém o IP do usuário (aproximado)
 */
async function getUserIP(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Limpa o acesso (logout)
 */
export function clearDenunciaAccess(): void {
    Cookies.remove(COOKIE_NAME);
    sessionStorage.removeItem('denunciaFormCompleted');
    sessionStorage.removeItem('denunciaUserData');
}

/**
 * Envia dados para Google Sheets via API
 */
export async function sendToGoogleSheets(formData: DenunciaFormData): Promise<void> {
    try {
        console.log('📤 Enviando para Google Sheets...', { email: formData.email });

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, tipo: 'denuncia' }),
        });

        console.log('📨 Resposta da API:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', response.status, errorText);
            throw new Error(`Erro ao enviar para Google Sheets: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Resposta JSON:', data);

        if (!data.success) {
            console.error('❌ API retornou erro:', data.error);
            throw new Error(data.error || 'Erro ao enviar para Google Sheets');
        }

        console.log('✅ Enviado para Google Sheets com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao enviar para Google Sheets:', error);
        throw error;
    }
}
