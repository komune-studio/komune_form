'use strict'

import crypto from 'crypto'
//const {v4: generateV4UUID} = require("uuid");

const hashSHA1 = (str: string) => {
    return crypto.createHash('sha1').update(str).digest('hex')
}

const hashSHA512 = (str: string) =>{
    return crypto.createHash('sha512').update(str).digest('hex')
}

export default {

    generateSalt: () => {
        return crypto.randomBytes(20).toString('hex')
    },
    generatePassword: (password : string, salt: string) => {
        return hashSHA1(salt + password)
    },

    generateRandomStringWithLength : (length:number) => {
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const s = Array.from({length:length}, _ => c[Math.floor(Math.random()*c.length)]).join('')
        return s;
    },
    hashSHA1 : hashSHA1,
    hashSHA512 : hashSHA512,

    // generateGUID: () => {
    //     return generateV4UUID()
    // }
}
