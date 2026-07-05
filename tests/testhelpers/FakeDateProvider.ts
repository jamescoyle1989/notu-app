export class FakeDateProvider {
    nowReturnValue: Date = new Date();
    
    now(): Date {
        return this.nowReturnValue;
    }
}