import { Preference, Payment } from "mercadopago"
import mpClient from "../config/mercagopago"

class PaymentService{
    async createPaymentPreference(reservaId: number, totalAmount: number){
        const senia = totalAmount * 0.10;

        const preference = new Preference(mpClient);
        console.log("Token usado:", mpClient.accessToken);

        try{
            const response = await preference.create({
                body:{
                    items:[
                        {
                            id: reservaId.toString(),
                            title: `Seña Reserva Valpa Club #${reservaId}`,
                            quantity: 1,
                            unit_price: senia,
                            currency_id: 'ARS',
                        },
                    ],
                    external_reference: reservaId.toString(),
                back_urls: {
                    // Apuntamos al BACKEND vía Ngrok
                    success: 'https://pericemental-unstudied-felicitas.ngrok-free.dev/api/v1/payments/success',
                    failure: 'https://pericemental-unstudied-felicitas.ngrok-free.dev/api/v1/payments/failure',
                    pending: 'https://pericemental-unstudied-felicitas.ngrok-free.dev/api/v1/payments/pending'
                },
                auto_return: 'approved',
                    notification_url: "https://pericemental-unstudied-felicitas.ngrok-free.dev/api/v1/payments/webhook",
                    expires: true,
                    date_of_expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expira en 15 minutos, corregir segun preferencia
                }
            });

            return{
                preferenceId: response.id,
                initPoint: response.init_point!, // URL para redirigir al usuario
            }
        }catch(error){
            console.error('Error al crear la preferencia de pago:', error);
            throw new Error('Error al crear la preferencia de pago');
        }
    }

    async receiveWebHook(query: any){
        const payment = new Payment(mpClient);

        try{
            if(query.type === 'payment'){
                const paymentId = query.data?.id || query.id;

                console.log("Intentando buscar pago con ID:", paymentId);

                if(!paymentId){
                    console.error("No se encontró ID de pago en el webhook");
                    return null;
                }

                const paymentData = await payment.get({id: paymentId});

                console.log("Estado del pago:", paymentData.status);
                console.log("Referencia (ID de reserva):", paymentData.external_reference);

                if (paymentData.status === 'approved'){
                    return{
                        status: 'approved',
                        reservaId: parseInt(paymentData.external_reference!)
                    }
                }
            }
            return null;
        } catch(error){
            console.error('Error al procesar el webhook de pago:', error);
            return null;
        }
    }
}

export default new PaymentService();