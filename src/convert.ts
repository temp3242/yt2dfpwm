import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { MPEGDecoder } from "mpg123-decoder";
import ytdl from "ytdl-core";

class DFPWM {
    private RPrec = 10;

    private response = 0;
    private level = 0;
    private prevbit = false;

    private update = (currentBit: boolean) => {
        let target = (currentBit ? 127 : -128);
        let nlevel = (this.level + ((this.response * (target - this.level) + (1 << (this.RPrec - 1))) >> this.RPrec));

        if (nlevel == this.level && this.level != target) {
            nlevel += (currentBit ? 1 : -1);
        }
        let rtarget;

        if (currentBit == this.prevbit) rtarget = (1 << this.RPrec) - 1;
        else rtarget = 0;

        let nresponse = this.response;
        if (nresponse == this.response && this.response != rtarget) nresponse += (currentBit == this.prevbit ? 1 : -1);

        if (this.RPrec > 8 && (nresponse < (2 << (this.RPrec - 8)))) nresponse = (2 << (this.RPrec - 8));

        this.response = nresponse;
        this.prevbit = currentBit;
        this.level = nlevel;
    }

    compress = (src: Int8Array, _destoffs: number, srcoffs: number, len: number): Int8Array => {

        let dest = new Int8Array(len);
        for (let i = 0; i < len; i++) {
            let d = 0;
            for (let j = 0; j < 8; j++) {
                let inlevel = src[srcoffs++];
                let currentbit = (inlevel > this.level || (inlevel == this.level && this.level == 127));
                d = (currentbit ? (d >> 1) + 128 : d >> 1);
                this.update(currentbit);
            }
            dest[i] = d;
        }
        return dest;
    }
}

const decode = async (data: Uint8Array): Promise<Int8Array> => {
    const decoder = new MPEGDecoder();
    await decoder.ready;
    const { channelData } = decoder.decode(data);
    decoder.free();
    const channA = channelData[0];
    const channB = channelData[1];
    let output = new Int8Array(channA.length)

    for (let i = 0; i < channA.length; i++) {
        output[i] = (channA[i] * 127) / 2 + (channB[i] * 127) / 2;
    }

    return output;
};

const main = async (id: string): Promise<Uint8Array> => {

    return new Promise((resolve, reject) => {
        const path = process.cwd().concat("/audio/");
        
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        const stream = ytdl(`https://youtube.com/watch?v=${id}`, { quality: "highestaudio" });


        ffmpeg(stream)
            .audioBitrate(128)
            .save(`${path}${id}.mp3`)
            .on('end', async () => {
                const incodec = new DFPWM();
                const data = await decode(fs.readFileSync(path.concat(id, ".mp3")));
                const data2 = incodec.compress(data, 0, 0, data.length / 8);
                resolve(Uint8Array.from(data2));
                fs.unlinkSync(path.concat(id, ".mp3"));
            }).on('error', (err) => {
                reject(err);
            });
    })
};

export function checkUrl(id: string) {
    return ytdl.validateID(id)
}

export default main;
