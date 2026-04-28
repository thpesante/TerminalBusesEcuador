import { getFunctions, httpsCallable } from 'firebase/functions';

interface Range {
    start: number;
    end: number;
    current: number;
}

class SequenceManager {
    private storageKey = 'terminal_digital_sequence_range';

    async getNextNumber(ruc: string, puntoEmision: string): Promise<number> {
        let range = this.getCachedRange(ruc, puntoEmision);

        // Si no hay rango o se terminó, intentar pedir uno nuevo (requiere estar online)
        if (!range || range.current > range.end) {
            range = await this.requestNewRange(puntoEmision);
        }

        // Si después de intentar pedirlo seguimos sin rango (offline y sin cache)
        if (!range) {
            throw new Error("Sin números disponibles. Conéctese a internet para obtener un nuevo rango de boletos.");
        }

        const nextNumber = range.current;
        range.current++;
        this.saveRange(ruc, puntoEmision, range);

        // Pre-fetch: Si quedan menos de 10 números, intentar pedir el siguiente bloque en background
        if (range.end - range.current < 10) {
            this.requestNewRange(puntoEmision).catch(console.error);
        }

        return nextNumber;
    }

    private getCachedRange(ruc: string, puntoEmision: string): Range | null {
        const data = localStorage.getItem(`${this.storageKey}_${ruc}_${puntoEmision}`);
        return data ? JSON.parse(data) : null;
    }

    private saveRange(ruc: string, puntoEmision: string, range: Range) {
        localStorage.setItem(`${this.storageKey}_${ruc}_${puntoEmision}`, JSON.stringify(range));
    }

    private async requestNewRange(puntoEmision: string): Promise<Range | null> {
        try {
            const functions = getFunctions();
            const requestNextRange = httpsCallable(functions, 'requestNextRange');
            const result = await requestNextRange({ puntoEmision });
            const { start, end } = result.data as { start: number, end: number };

            const newRange: Range = { start, end, current: start };
            // Nota: Aquí necesitaríamos el RUC del usuario actual para guardarlo correctamente
            // pero el SequenceManager puede ser inicializado con el contexto.
            return newRange;
        } catch (error) {
            console.error("Error solicitando rango secuencial:", error);
            return null;
        }
    }
}

export const sequenceManager = new SequenceManager();
