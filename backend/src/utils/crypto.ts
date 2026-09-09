import crypto from 'crypto';
export type Algorithm='RSA-PSS'|'DSA'|'ECDSA'|'Ed25519';
export const algorithms:Record<Algorithm,{name:string;keySize:string;description:string}>= {
 'RSA-PSS':{name:'RSA-PSS',keySize:'2048 bits',description:'RSA probabilistic signature scheme'},
 'DSA':{name:'DSA',keySize:'2048 bits',description:'Digital Signature Algorithm'},
 'ECDSA':{name:'ECDSA',keySize:'P-256',description:'Elliptic Curve Digital Signature Algorithm'},
 'Ed25519':{name:'Ed25519',keySize:'256 bits',description:'Edwards-curve deterministic signatures'}
};
export function hashDocument(data:Buffer){return crypto.createHash('sha256').update(data).digest('hex');}
function generate(algorithm:Algorithm){
 if(algorithm==='RSA-PSS') return crypto.generateKeyPairSync('rsa',{modulusLength:2048,publicExponent:0x10001});
 if(algorithm==='DSA') return crypto.generateKeyPairSync('dsa',{modulusLength:2048,divisorLength:256});
 if(algorithm==='ECDSA') return crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 return crypto.generateKeyPairSync('ed25519');
}
export function sign(data:Buffer,algorithm:Algorithm){const started=process.hrtime.bigint();const keys=generate(algorithm);const sig=algorithm==='Ed25519'?crypto.sign(null,data,keys.privateKey):(()=>{const signer=crypto.createSign('sha256'); signer.update(data); signer.end(); return algorithm==='RSA-PSS'?signer.sign({key:keys.privateKey,padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:crypto.constants.RSA_PSS_SALTLEN_DIGEST}):signer.sign(keys.privateKey)})(); const ms=Number(process.hrtime.bigint()-started)/1e6; const publicKey=keys.publicKey.export({type:algorithm==='ECDSA'?'spki':'spki',format:'pem'}).toString(); const privateExport=keys.privateKey; return {signature:sig,publicKey,signingTime:ms,keySize:Buffer.byteLength(publicKey),privateKey:privateExport};}
export function verify(data:Buffer,algorithm:Algorithm,signature:Buffer,publicKey:string){const started=process.hrtime.bigint();try{const ok=algorithm==='Ed25519'?crypto.verify(null,data,publicKey,signature):(()=>{const verifier=crypto.createVerify('sha256'); verifier.update(data); verifier.end(); return algorithm==='RSA-PSS'?verifier.verify({key:publicKey,padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:crypto.constants.RSA_PSS_SALTLEN_DIGEST},signature):verifier.verify(publicKey,signature)})(); return {valid:ok,verificationTime:Number(process.hrtime.bigint()-started)/1e6};}catch{ return {valid:false,verificationTime:Number(process.hrtime.bigint()-started)/1e6};}}
