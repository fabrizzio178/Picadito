import {MercadoPagoConfig} from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    options: { timeout: 10000 }

})



export default mpClient;