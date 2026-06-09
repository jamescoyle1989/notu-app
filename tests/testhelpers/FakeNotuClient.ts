import { Note, Space } from "notu";

export class FakeNotuClient {

    login(username: string, password: string): Promise<string> {
        throw Error('Not implemented');
    }

    async setup(): Promise<void> {
    }

    async saveSpace(space: Space): Promise<any> {
    }
    
    async getNotes(query: string, space?: number | Space): Promise<Array<any>> {
        return [];
    }
    
    async getNoteCount(query: string, space: number | Space): Promise<number> {
        return 0;
    }
    
    async saveNotes(notes: Array<Note>): Promise<Array<any>> {
        return [];
    }
    
    async customJob(name: string, data: any): Promise<any> {
    }
}