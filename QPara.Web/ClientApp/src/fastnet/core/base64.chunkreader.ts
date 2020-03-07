export type ChunkHandler = (cn: number, offset: number, data: string, isLastChunk: boolean) => Promise<void>;
export class Base64ChunkReader {
    private finished: boolean = false;
    private chunkNumber = 0;
    private offset = 0;
    private bytesSoFar = 0;
    private onChunk: ChunkHandler;// (cn: number, offset: number, data: Uint8Array) => Promise<void>;
    constructor(private file: File, public chunkSize = 1024 * 8 * 8) {
    }
    public async ReadAll(onChunk: ChunkHandler) : Promise<void> {
        this.onChunk = onChunk;
        return this.readNextChunk();
    }
    private async onReadComplete(evt: any): Promise<string> {
        return new Promise<string>(async resolve => {
            if (evt.target && evt.target.error === null) {
                let text64 = evt.target.result;//new Uint8Array(evt.target.result);
                if (typeof text64 === "string") {                    
                    resolve(text64);
                } else {
                    throw `file reader exception unexpected result type ${typeof text64}`;
                }           
            } else {
                throw `file reader exception ${evt.target ? evt.target.error : "event target missing"}`;
            }
        });
    }

    private async readNextChunk(): Promise<void> {
        //console.log(`File: ${this.file.name}, chunk ${this.chunkNumber}, offset ${this.offset}`);
        return new Promise<void>(resolve => {
            let r = new FileReader();
            let blob = this.file.slice(this.offset, this.offset + this.chunkSize);
            r.onload = async (e) => {
                let text = await this.onReadComplete(e);
                let textBase64 = text.substr(text.indexOf('base64') + 7);
                this.offset += this.chunkSize;// bytes.byteLength;
                this.finished = this.offset >= this.file.size;
                //console.log(`beforeOnChunk: length ${textBase64.length}`);
                await this.onChunk(this.chunkNumber, this.offset, textBase64, this.finished);
                this.chunkNumber++;
                if (!this.finished) {
                    await this.readNextChunk();
                }
                resolve();
            };
            //r.readAsArrayBuffer(blob);
            r.readAsDataURL(blob);
        });
    }
}