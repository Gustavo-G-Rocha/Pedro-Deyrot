import { denuncias as denunciasApi } from '@/src/lib/api';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'denuncia_access';
const COOKIE_EXPIRES = 7; // dias

export interface DenunciaUserData {
    nome: string;
    email: string;
    timestamp: string;
}

export interface DenunciaFormData {
    nome: string;
    whatsapp: string;
    email: string;
    cidade: string;
    termos: boolean;
}

/**
 * Verifica se o usuário já tem acesso (via cookie ou sessão)
 */
export async function checkDenunciaAccess(): Promise<{ hasAccess: boolean; userData?: DenunciaUserData }> {
    // Primeiro verificar cookie
    const cookieData = Cookies.get(COOKIE_NAME);
    if (cookieData) {
        try {
            const userData = JSON.parse(cookieData) as DenunciaUserData;
            return { hasAccess: true, userData };
        } catch (error) {
            console.error('Erro ao ler cookie:', error);
        }
    }

    // Se não tiver cookie, verificar no sessionStorage (para mesma sessão)
    const sessionData = sessionStorage.getItem('denunciaUserData');
    if (sessionData) {
        try {
            const userData = JSON.parse(sessionData) as DenunciaUserData;
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
 * Salva os dados do formulário de acesso no banco
 */
export async function salvarAcessoDenuncia(formData: DenunciaFormData): Promise<string> {
    try {
        // O IP é resolvido no servidor, a partir do próprio request.
        const { id } = await denunciasApi.registrarAcesso(formData);
        return id;
    } catch (error) {
        console.error('Erro ao salvar no banco:', error);
        throw error;
    }
}

/**
 * Verifica se o email já foi usado anteriormente
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    try {
        const { existe } = await denunciasApi.emailJaCadastrado(email);
        return existe;
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        // Retornar false em caso de erro para não bloquear o usuário
        return false;
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
